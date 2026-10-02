# Django Packages
from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse, HttpResponseNotFound, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.db import models
from django.db import transaction
from django.urls import reverse
from django.conf import settings
from django.db.models.functions import ExtractMonth
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from api.mail import send_email_async

# Restframework Packages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

# Serializers
from userauths.serializer import MyTokenObtainPairSerializer, ProfileSerializer, RegisterSerializer
from store.serializers import CancelledOrderSerializer, CouponSummarySerializer, EarningSummarySerializer, NotificationSerializer, CartSerializer, NotificationSummarySerializer, SummarySerializer, CartOrderItemSerializer, CouponUsersSerializer,  ProductSerializer, TagSerializer, CategorySerializer, DeliveryCouriersSerializer, CartOrderSerializer, GallerySerializer, BrandSerializer, ProductFaqSerializer, ReviewSerializer,  SpecificationSerializer, CouponSerializer, ColorSerializer, SizeSerializer, AddressSerializer, WishlistSerializer, ConfigSettingsSerializer, VendorSerializer

# Models
from userauths.models import Profile, User
from store.models import CancelledOrder, Notification, CartOrderItem, CouponUsers, Cart, Product, Tag, Category, DeliveryCouriers, CartOrder, Gallery, Brand, ProductFaq, Review,  Specification, Coupon, Color, Size, Address, Wishlist
from addon.models import ConfigSettings, Tax
from vendor.models import Vendor

# Others Packages
import json
from decimal import Decimal
import stripe
import requests
from datetime import datetime, timedelta
import calendar
import urllib
import requests
import stripe
from datetime import datetime as d


class DashboardStatsAPIView(generics.ListAPIView):
    serializer_class = SummarySerializer

    def get_queryset(self):

        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        # Calculate summary values
        product_count = Product.objects.filter(vendor=vendor).count()
        order_count = CartOrder.objects.filter(
            vendor=vendor, payment_status="paid").count()
        revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid").aggregate(
            total_revenue=models.Sum(models.F('sub_total') + models.F('shipping_amount')))['total_revenue'] or 0

        # Return a dummy list as we only need one summary object
        return [{
            'products': product_count,
            'orders': order_count,
            'revenue': revenue
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        products = Product.objects.filter(vendor=vendor).select_related('category', 'vendor').prefetch_related('gallery_set', 'color_set', 'size_set', 'specification_set')
        return products


class OrdersAPIView(generics.ListAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        orders = CartOrder.objects.filter(vendor=vendor, payment_status="paid").select_related('buyer').prefetch_related(
            'vendor',
            'orderitem',
            'orderitem__product',
            'orderitem__delivery_couriers',
            'orderitem__vendor'
        ).order_by('-date')
        return orders


class RevenueAPIView(generics.ListAPIView):
    serializer_class = CartOrderItemSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid").aggregate(
            total_revenue=models.Sum(models.F('sub_total') + models.F('shipping_amount')))['total_revenue'] or 0
        return revenue


class YearlyOrderReportChartAPIView(generics.ListAPIView):
    serializer_class = CartOrderItemSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        # Include the 'product' field in the queryset
        report = CartOrderItem.objects.filter(
            vendor=vendor,
            order__payment_status="paid"
        ).select_related('product').values(
            'order__date', 'product'
        ).annotate(models.Count('id'))

        return report


@api_view(('GET',))
def MonthlyOrderChartAPIFBV(request, vendor_id):
    vendor = Vendor.objects.get(id=vendor_id)
    orders = CartOrder.objects.filter(vendor=vendor)
    orders_by_month = orders.annotate(month=ExtractMonth("date")).values(
        "month").annotate(orders=models.Count("id")).order_by("month")
    return Response(orders_by_month)


@api_view(('GET',))
def MonthlyProductsChartAPIFBV(request, vendor_id):
    vendor = Vendor.objects.get(id=vendor_id)
    products = Product.objects.filter(vendor=vendor)
    products_by_month = products.annotate(month=ExtractMonth("date")).values(
        "month").annotate(orders=models.Count("id")).order_by("month")
    return Response(products_by_month)


class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        print("========== PRODUCT CREATE ==========")
        print("DATA:", request.data)
        print("FILES:", request.FILES)

        vendor_id = kwargs.get("vendor_id")

        try:
            vendor = Vendor.objects.get(id=vendor_id)
        except Vendor.DoesNotExist:
            return Response(
                {"message": "Vendor not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data.copy()

        # Vendor frontend se aaye ya URL se,
        # backend URL wale vendor ko priority dega.
        data["vendor"] = vendor.id

        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            print("PRODUCT VALIDATION ERROR:")
            print(serializer.errors)

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            product = serializer.save()

            specifications_data = []
            colors_data = []
            sizes_data = []
            gallery_data = []

            for key, value in request.data.items():

                # Specifications
                if (
                    key.startswith("specifications")
                    and "[title]" in key
                ):
                    index = key.split("[")[1].split("]")[0]

                    title = value

                    content = request.data.get(
                        f"specifications[{index}][content]"
                    )

                    if title:
                        specifications_data.append({
                            "title": title,
                            "content": content or ""
                        })

                # Colors
                elif (
                    key.startswith("colors")
                    and "[name]" in key
                ):
                    index = key.split("[")[1].split("]")[0]

                    name = value

                    color_code = request.data.get(
                        f"colors[{index}][color_code]"
                    )

                    image = request.FILES.get(
                        f"colors[{index}][image]"
                    )

                    if name:
                        colors_data.append({
                            "name": name,
                            "color_code": color_code or "",
                            "image": image
                        })

                # Sizes
                elif (
                    key.startswith("sizes")
                    and "[name]" in key
                ):
                    index = key.split("[")[1].split("]")[0]

                    name = value

                    price = request.data.get(
                        f"sizes[{index}][price]"
                    )

                    if name:
                        sizes_data.append({
                            "name": name,
                            "price": price or 0
                        })

                # Gallery
                elif (
                    key.startswith("gallery")
                    and "[image]" in key
                ):
                    index = key.split("[")[1].split("]")[0]

                    image = request.FILES.get(
                        f"gallery[{index}][image]"
                    )

                    if image:
                        gallery_data.append({
                            "image": image
                        })

            print("Specifications:", specifications_data)
            print("Colors:", colors_data)
            print("Sizes:", sizes_data)
            print("Gallery:", gallery_data)

            # Save specifications
            for item in specifications_data:
                Specification.objects.create(
                    product=product,
                    title=item["title"],
                    content=item["content"]
                )

            # Save colors
            for item in colors_data:
                Color.objects.create(
                    product=product,
                    name=item["name"],
                    color_code=item["color_code"],
                    image=item["image"]
                )

            # Save sizes
            for item in sizes_data:
                Size.objects.create(
                    product=product,
                    name=item["name"],
                    price=item["price"]
                )

            # Save gallery
            for item in gallery_data:
                Gallery.objects.create(
                    product=product,
                    image=item["image"]
                )

        return Response(
            {
                "message": "Product created successfully",
                "product_id": product.id
            },
            status=status.HTTP_201_CREATED
        )
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

   
    @transaction.atomic
    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        serializer.save()

        product_instance = serializer.instance

        specifications_data = []
        colors_data = []
        sizes_data = []
        gallery_data = []

        for key, value in self.request.data.items():

            if key.startswith("specifications") and "[title]" in key:
                index = key.split("[")[1].split("]")[0]

                specifications_data.append({
                    "title": value,
                    "content": self.request.data.get(
                        f"specifications[{index}][content]"
                    ),
                })

            elif key.startswith("colors") and "[name]" in key:
                index = key.split("[")[1].split("]")[0]

                colors_data.append({
                    "name": value,
                    "color_code": self.request.data.get(
                        f"colors[{index}][color_code]"
                    ),
                    "image": self.request.data.get(
                        f"colors[{index}][image]"
                    ),
                })

            elif key.startswith("sizes") and "[name]" in key:
                index = key.split("[")[1].split("]")[0]

                sizes_data.append({
                    "name": value,
                    "price": self.request.data.get(
                        f"sizes[{index}][price]"
                    ),
                })

            elif key.startswith("gallery") and "[image]" in key:
                gallery_data.append({
                    "image": value
                })

        self.save_nested_data(
            product_instance,
            SpecificationSerializer,
            specifications_data
        )

        self.save_nested_data(
            product_instance,
            ColorSerializer,
            colors_data
        )

        self.save_nested_data(
            product_instance,
            SizeSerializer,
            sizes_data
        )

        self.save_nested_data(
            product_instance,
            GallerySerializer,
            gallery_data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        product_instance = serializer.instance

        specifications_data = []
        colors_data = []
        sizes_data = []
        gallery_data = []
        # Loop through the keys of self.request.data
        for key, value in self.request.data.items():
            # Example key: specifications[0][title]
            if key.startswith('specifications') and '[title]' in key:
                # Extract index from key
                index = key.split('[')[1].split(']')[0]
                title = value
                content_key = f'specifications[{index}][content]'
                content = self.request.data.get(content_key)
                specifications_data.append(
                    {'title': title, 'content': content})

            # Example key: colors[0][name]
            elif key.startswith('colors') and '[name]' in key:
                # Extract index from key
                index = key.split('[')[1].split(']')[0]
                name = value
                color_code_key = f'colors[{index}][color_code]'
                color_code = self.request.data.get(color_code_key)
                image_key = f'colors[{index}][image]'
                image = self.request.data.get(image_key)
                colors_data.append(
                    {'name': name, 'color_code': color_code, 'image': image})

            # Example key: sizes[0][name]
            elif key.startswith('sizes') and '[name]' in key:
                # Extract index from key
                index = key.split('[')[1].split(']')[0]
                name = value
                price_key = f'sizes[{index}][price]'
                price = self.request.data.get(price_key)
                sizes_data.append({'name': name, 'price': price})

            # Example key: gallery[0][image]
            elif key.startswith('gallery') and '[image]' in key:
                # Extract index from key
                index = key.split('[')[1].split(']')[0]
                image = value
                gallery_data.append({'image': image})

        # Log or print the data for debugging
        print('specifications_data:', specifications_data)
        print('colors_data:', colors_data)
        print('sizes_data:', sizes_data)
        print('gallery_data:', gallery_data)

        # Save nested serializers with the product instance
        self.save_nested_data(
            product_instance, SpecificationSerializer, specifications_data)
        self.save_nested_data(product_instance, ColorSerializer, colors_data)
        self.save_nested_data(product_instance, SizeSerializer, sizes_data)
        self.save_nested_data(
            product_instance, GallerySerializer, gallery_data)

    def save_nested_data(self, product_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={
                                      'product_instance': product_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product_instance)


class ProductUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = (AllowAny, )

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        product_pid = self.kwargs['product_pid']

        vendor = Vendor.objects.get(id=vendor_id)
        product = Product.objects.get(vendor=vendor, pid=product_pid)
        return product

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        product = self.get_object()

        # Deserialize and update main product data (partial update)
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Ensure category is explicitly updated if passed
        category_id = request.data.get('category')
        if category_id:
            try:
                category_obj = Category.objects.filter(id=category_id).first()
                if category_obj:
                    product.category = category_obj
                    product.save()
            except Exception as e:
                print("Error updating category:", e)

        # ==========================================
        # 1. SPECIFICATIONS
        # ==========================================
        product.specification().delete()
        specifications_data = []
        for key, value in self.request.data.items():
            if key.startswith('specifications') and '[title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value
                content_key = f'specifications[{index}][content]'
                content = self.request.data.get(content_key, '')
                specifications_data.append({'title': title, 'content': content})
        self.save_nested_data(product, SpecificationSerializer, specifications_data)

        # ==========================================
        # 2. SIZES
        # ==========================================
        product.size().delete()
        sizes_data = []
        for key, value in self.request.data.items():
            if key.startswith('sizes') and '[name]' in key:
                index = key.split('[')[1].split(']')[0]
                name = value
                price_key = f'sizes[{index}][price]'
                price = self.request.data.get(price_key, 0)
                sizes_data.append({'name': name, 'price': price})
        self.save_nested_data(product, SizeSerializer, sizes_data)

        # ==========================================
        # 3. COLORS (Preserve existing images)
        # ==========================================
        color_indices = set()
        for key in self.request.data.keys():
            if key.startswith('colors['):
                idx = key.split('[')[1].split(']')[0]
                color_indices.add(idx)

        if color_indices:
            kept_color_ids = []
            for idx in color_indices:
                name = self.request.data.get(f'colors[{idx}][name]', '')
                color_code = self.request.data.get(f'colors[{idx}][color_code]', '')
                color_id = self.request.data.get(f'colors[{idx}][id]')
                image_file = self.request.FILES.get(f'colors[{idx}][image]') or self.request.data.get(f'colors[{idx}][image]')
                is_file = hasattr(image_file, 'file') or hasattr(image_file, 'read')

                if color_id:
                    try:
                        color_id = int(color_id)
                        color_obj = Color.objects.filter(id=color_id, product=product).first()
                        if color_obj:
                            kept_color_ids.append(color_obj.id)
                            color_obj.name = name
                            color_obj.color_code = color_code
                            if is_file:
                                color_obj.image = image_file
                            color_obj.save()
                            continue
                    except (ValueError, TypeError):
                        pass

                # If it's a new color
                if name or color_code or is_file:
                    new_color = Color.objects.create(
                        product=product,
                        name=name,
                        color_code=color_code,
                        image=image_file if is_file else None
                    )
                    kept_color_ids.append(new_color.id)

            # Delete only colors that the vendor removed
            Color.objects.filter(product=product).exclude(id__in=kept_color_ids).delete()
        elif self.request.data.get('clear_colors') == 'true':
            Color.objects.filter(product=product).delete()

        # ==========================================
        # 4. GALLERY (Preserve existing images)
        # ==========================================
        gallery_indices = set()
        for key in self.request.data.keys():
            if key.startswith('gallery['):
                idx = key.split('[')[1].split(']')[0]
                gallery_indices.add(idx)

        if gallery_indices:
            kept_gallery_ids = []
            new_gallery_files = []

            for idx in gallery_indices:
                item_id = self.request.data.get(f'gallery[{idx}][id]')
                image_file = self.request.FILES.get(f'gallery[{idx}][image]') or self.request.data.get(f'gallery[{idx}][image]')
                is_file = hasattr(image_file, 'file') or hasattr(image_file, 'read')

                if item_id:
                    try:
                        item_id = int(item_id)
                        gallery_obj = Gallery.objects.filter(id=item_id, product=product).first()
                        if gallery_obj:
                            kept_gallery_ids.append(gallery_obj.id)
                            # If vendor uploaded a new replacement image for this existing slot
                            if is_file:
                                gallery_obj.image = image_file
                                gallery_obj.save()
                    except (ValueError, TypeError):
                        pass
                else:
                    if is_file:
                        new_gallery_files.append(image_file)

            # Delete only gallery images that the vendor removed
            Gallery.objects.filter(product=product).exclude(id__in=kept_gallery_ids).delete()

            # Create new gallery records
            for g_file in new_gallery_files:
                Gallery.objects.create(product=product, image=g_file)
        elif self.request.data.get('clear_gallery') == 'true':
            Gallery.objects.filter(product=product).delete()

        return Response({'message': 'Product Updated'}, status=status.HTTP_200_OK)

    def save_nested_data(self, product_instance, serializer_class, data):
        if not data:
            return
        serializer = serializer_class(data=data, many=True, context={
                                      'product_instance': product_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product_instance)


class ProductDeleteAPIView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = (AllowAny, )

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        product_pid = self.kwargs['product_pid']

        vendor = Vendor.objects.get(id=vendor_id)
        product = Product.objects.get(vendor=vendor, pid=product_pid)
        return product


class FilterProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        filter = self.request.GET.get('filter')

        print("filter =======", filter)

        vendor = Vendor.objects.get(id=vendor_id)
        if filter == "published":
            products = Product.objects.filter(
                vendor=vendor, status="published")
        elif filter == "draft":
            products = Product.objects.filter(vendor=vendor, status="draft")
        elif filter == "disabled":
            products = Product.objects.filter(vendor=vendor, status="disabled")
        elif filter == "in-review":
            products = Product.objects.filter(
                vendor=vendor, status="in-review")
        elif filter == "latest":
            products = Product.objects.filter(vendor=vendor).order_by('-id')
        elif filter == "oldest":
            products = Product.objects.filter(vendor=vendor).order_by('id')
        else:
            products = Product.objects.filter(vendor=vendor)
        return products


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = (AllowAny,)

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        order_oid = self.kwargs['order_oid']

        vendor = Vendor.objects.get(id=vendor_id)
        order = CartOrder.objects.select_related('buyer').prefetch_related(
            'vendor',
            'orderitem',
            'orderitem__product',
            'orderitem__delivery_couriers',
            'orderitem__vendor'
        ).get(vendor=vendor, payment_status="paid", oid=order_oid)
        return order


class Earning(generics.ListAPIView):
    serializer_class = EarningSummarySerializer

    def get_queryset(self):

        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        one_month_ago = datetime.today() - timedelta(days=28)
        monthly_revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid", date__gte=one_month_ago).aggregate(
            total_revenue=models.Sum(models.F('sub_total') + models.F('shipping_amount')))['total_revenue'] or 0
        total_revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid").aggregate(
            total_revenue=models.Sum(models.F('sub_total') + models.F('shipping_amount')))['total_revenue'] or 0

        return [{
            'monthly_revenue': monthly_revenue,
            'total_revenue': total_revenue,
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@api_view(('GET',))
def MonthlyEarningTracker(request, vendor_id):
    vendor = Vendor.objects.get(id=vendor_id)
    monthly_earning_tracker = (
        CartOrderItem.objects
        .filter(vendor=vendor, order__payment_status="paid")
        .annotate(
            month=ExtractMonth("date")
        )
        .values("month")
        .annotate(
            sales_count=models.Sum("qty"),
            total_earning=models.Sum(
                models.F('sub_total') + models.F('shipping_amount'))
        )
        .order_by("-month")
    )
    return Response(monthly_earning_tracker)


class ReviewsListAPIView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        reviews = Review.objects.filter(product__vendor=vendor)
        return reviews


class ReviewsDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (AllowAny,)

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        review_id = self.kwargs['review_id']

        vendor = Vendor.objects.get(id=vendor_id)
        review = Review.objects.get(product__vendor=vendor, id=review_id)
        return review



class CouponListAPIView(generics.ListAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = (AllowAny, )

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        coupon = Coupon.objects.filter(vendor=vendor)
        return coupon


class CouponCreateAPIView(generics.CreateAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = (AllowAny, )

    def create(self, request, *args, **kwargs):
        payload = request.data

        vendor_id = payload['vendor_id']
        code = payload['code']
        discount = payload['discount']
        active = payload['active']

        print("vendor_id ======", vendor_id)
        print("code ======", code)
        print("discount ======", discount)
        print("active ======", active)

        vendor = Vendor.objects.get(id=vendor_id)
        coupon = Coupon.objects.create(
            vendor=vendor,
            code=code,
            discount=discount,
            active=(active.lower() == "true")
        )

        return Response({"message": "Coupon Created Successfully."}, status=status.HTTP_201_CREATED)


class CouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouponSerializer
    permission_classes = (AllowAny, )

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        coupon_id = self.kwargs['coupon_id']

        vendor = Vendor.objects.get(id=vendor_id)

        coupon = Coupon.objects.get(vendor=vendor, id=coupon_id)
        return coupon


class CouponStats(generics.ListAPIView):
    serializer_class = CouponSummarySerializer

    def get_queryset(self):

        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        total_coupons = Coupon.objects.filter(vendor=vendor).count()
        active_coupons = Coupon.objects.filter(
            vendor=vendor, active=True).count()

        return [{
            'total_coupons': total_coupons,
            'active_coupons': active_coupons,
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NotificationUnSeenListAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = (AllowAny, )

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        notifications = Notification.objects.select_related('order', 'order_item', 'order_item__product', 'vendor').filter(vendor=vendor, seen=False).order_by('-date')
        return notifications
    
class NotificationSeenListAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = (AllowAny, )

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        notifications = Notification.objects.select_related('order', 'order_item', 'order_item__product', 'vendor').filter(vendor=vendor, seen=True).order_by('-date')
        return notifications
    
class NotificationSummaryAPIView(generics.ListAPIView):
    serializer_class = NotificationSummarySerializer

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        un_read_noti = Notification.objects.filter(vendor=vendor, seen=False).count()
        read_noti = Notification.objects.filter(vendor=vendor, seen=True).count()
        all_noti = Notification.objects.filter(vendor=vendor).count()

        return [{
            'un_read_noti': un_read_noti,
            'read_noti': read_noti,
            'all_noti': all_noti,
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    
class NotificationMarkAsSeen(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (AllowAny, )

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        noti_id = self.kwargs['noti_id']
        vendor = Vendor.objects.get(id=vendor_id)
        notification = Notification.objects.get(vendor=vendor, id=noti_id)
        notification.seen = True
        notification.save()
        return notification
    

############################ Less Redundant Notfication Code ############################
# class NotificationAPIView(generics.ListCreateAPIView, generics.RetrieveUpdateAPIView):
#     serializer_class = NotificationSerializer
#     permission_classes = (AllowAny, )

#     def get_queryset(self):
#         vendor_id = self.kwargs['vendor_id']
#         vendor = Vendor.objects.get(id=vendor_id)
        
#         seen_param = self.request.query_params.get('seen', None)

#         if seen_param == 'true':
#             return Notification.objects.filter(vendor=vendor, seen=True).order_by('seen')
#         elif seen_param == 'false':
#             return Notification.objects.filter(vendor=vendor, seen=False).order_by('seen')
#         else:
#             return Notification.objects.filter(vendor=vendor).order_by('seen')

#     def list(self, request, *args, **kwargs):
#         if 'summary' in request.query_params:
#             return self.get_summary(request, *args, **kwargs)
#         return super().list(request, *args, **kwargs)

#     def get_summary(self, request, *args, **kwargs):
#         vendor_id = kwargs['vendor_id']
#         vendor = Vendor.objects.get(id=vendor_id)

#         un_read_noti = Notification.objects.filter(vendor=vendor, seen=False).count()
#         read_noti = Notification.objects.filter(vendor=vendor, seen=True).count()
#         all_noti = Notification.objects.filter(vendor=vendor).count()

#         return Response({
#             'un_read_noti': un_read_noti,
#             'read_noti': read_noti,
#             'all_noti': all_noti,
#         })

#     def perform_update(self, serializer):
#         serializer.instance.seen = True
#         serializer.save()

# Example URL patterns in urls.py:
# path('notifications/<int:vendor_id>/', NotificationAPIView.as_view(), name='notification-list'),
# path('notifications/<int:vendor_id>/<int:pk>/', NotificationAPIView.as_view(), name='notification-detail'),





class VendorProfileUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        user_id = self.kwargs["pk"]
        return Profile.objects.get(user_id=user_id)


class ShopUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = (AllowAny, )      
    parser_classes = (MultiPartParser, FormParser)


class ShopAPIView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = VendorSerializer
    permission_classes = (AllowAny, )

    def get_object(self):
        vendor_slug = self.kwargs['vendor_slug']

        vendor = Vendor.objects.get(slug=vendor_slug)
        return vendor
    

class ShopProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        vendor_slug = self.kwargs['vendor_slug']
        vendor = Vendor.objects.get(slug=vendor_slug)
        products = Product.objects.filter(vendor=vendor)
        return products
    
class VendorRegister(generics.CreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        payload = request.data

        image = payload['image']
        name = payload['name']
        email = payload['email']
        description = payload['description']
        mobile = payload['mobile']
        user_id = payload['user_id']

        Vendor.objects.create(
            image=image,
            name=name,
            email=email,
            description=description,
            mobile=mobile,
            user_id=user_id,
        )

        return Response({"message":"Created vendor account"})
    

class CourierListAPIView(generics.ListAPIView):
    queryset = DeliveryCouriers.objects.all()
    serializer_class = DeliveryCouriersSerializer
    permission_classes = [AllowAny]

    

class OrderItemDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = CartOrderItemSerializer
    permission_classes = [AllowAny]
    queryset = CartOrderItem.objects.all()

    def get_object(self):
        pk = self.kwargs['pk']
        return CartOrderItem.objects.select_related('product', 'delivery_couriers', 'vendor', 'order', 'order__buyer').get(id=pk)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        tracking_id = request.data.get('tracking_id')
        if tracking_id is not None:
            instance.tracking_id = str(tracking_id).strip()

        delivery_couriers_id = request.data.get('delivery_couriers')
        if delivery_couriers_id:
            delivery_couriers = DeliveryCouriers.objects.filter(id=delivery_couriers_id).first()
            if delivery_couriers:
                instance.delivery_couriers = delivery_couriers

        if instance.tracking_id:
            instance.product_shipped = True
            instance.delivery_status = "Shipping"

        instance.save()

        if instance.tracking_id and instance.order:
            all_items = CartOrderItem.objects.filter(order=instance.order)
            all_shipped = all(bool(item.tracking_id) or item.product_shipped for item in all_items)
            if all_shipped:
                instance.order.order_status = "Fulfilled"
            else:
                instance.order.order_status = "Partially Fulfilled"
            instance.order.save(update_fields=["order_status"])

        notify_buyer = request.data.get('notify_buyer')
        if str(notify_buyer).lower() in ['true', '1']:
            site_url = getattr(settings, 'SITE_URL', None) or "https://ansari-store-indol.vercel.app"
            if not site_url or "localhost" in site_url or "127.0.0.1" in site_url or "onrender.com" in site_url or "ansari-store.vercel.app" in site_url:
                site_url = "https://ansari-store-indol.vercel.app"
            courier_name = instance.delivery_couriers.name if instance.delivery_couriers else "Carrier Partner"
            
            carrier_link = ""
            if instance.delivery_couriers and instance.delivery_couriers.tracking_website:
                carrier_link = f"{instance.delivery_couriers.tracking_website}?{instance.delivery_couriers.url_parameter}={instance.tracking_id}"
            
            app_tracking_link = f"{site_url}/track-order/?order_oid={instance.order.oid}&tracking_id={instance.tracking_id}"
            
            merge_data = {
                'instance': instance, 
                'tracking_id': instance.tracking_id, 
                'delivery_couriers': courier_name, 
                'tracking_link': app_tracking_link,
                'carrier_tracking_link': carrier_link or app_tracking_link,
                'site_url': site_url,
            }
            subject = f"Tracking ID Added for {instance.product.title}"
            text_body = render_to_string("email/tracking_id_added.txt", merge_data)
            html_body = render_to_string("email/tracking_id_added.html", merge_data)
            
            if instance.order and instance.order.email:
                send_email_async(
                    subject=subject,
                    text_body=text_body,
                    html_body=html_body,
                    to_list=[instance.order.email]
                )

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)