# Django Packages
from django.shortcuts import get_object_or_404, redirect, render
from django.http import JsonResponse, HttpResponseNotFound, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.db import transaction
from django.urls import reverse
from django.conf import settings


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
from store.serializers import CancelledOrderSerializer, NotificationSerializer, CartSerializer, CartOrderItemSerializer, CouponUsersSerializer, ProductSerializer, TagSerializer ,CategorySerializer, DeliveryCouriersSerializer, CartOrderSerializer, GallerySerializer, BrandSerializer, ProductFaqSerializer, ReviewSerializer,  SpecificationSerializer, CouponSerializer, ColorSerializer, SizeSerializer, AddressSerializer, WishlistSerializer, ConfigSettingsSerializer

# Models
from userauths.models import Profile, User 
from store.models import CancelledOrder, Notification, CartOrderItem, CouponUsers, Cart, Product, Tag ,Category, DeliveryCouriers, CartOrder, Gallery, Brand, ProductFaq, Review,  Specification, Coupon, Color, Size, Address, Wishlist
from addon.models import ConfigSettings, Tax
from vendor.models import Vendor

# Others Packages
import json
from decimal import Decimal
import stripe
import requests
from datetime import timedelta
from django.utils import timezone

class OrdersAPIView(generics.ListAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        orders = CartOrder.objects.filter(buyer=user, payment_status="paid")
        return orders
    

class OrdersDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = (AllowAny,)
    lookup_field = 'user_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        order_oid = self.kwargs['order_oid']

        user = User.objects.get(id=user_id)

        order = CartOrder.objects.get(buyer=user, payment_status="paid", oid=order_oid)
        return order
    
class WishlistCreateAPIView(generics.CreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (AllowAny, )

    def create(self, request):
        payload = request.data 

        product_id = payload['product_id']
        user_id = payload['user_id']

        product = Product.objects.get(id=product_id)
        user = User.objects.get(id=user_id)

        wishlist = Wishlist.objects.filter(product=product,user=user)
        if wishlist:
            wishlist.delete()
            return Response( {"message": "Removed From Wishlist"}, status=status.HTTP_200_OK)
        else:
            wishlist = Wishlist.objects.create(
                product=product,
                user=user,
            )
            return Response( {"message": "Added To Wishlist"}, status=status.HTTP_201_CREATED)

    

class WishlistAPIView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (AllowAny, )

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        wishlist = Wishlist.objects.filter(user=user,)
        return wishlist
    

class CustomerNotificationView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (AllowAny, )

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Notification.objects.filter(user=user)


class CustomerUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        user_id = self.kwargs["pk"]
        return Profile.objects.get(user_id=user_id)


class TrackOrderAPIView(APIView):
    """
    Public / customer endpoint to fetch comprehensive, realistic tracking
    milestones, carrier details, and shipment progress for an order.
    """
    permission_classes = (AllowAny,)

    def get(self, request, order_oid):
        order = CartOrder.objects.filter(oid=order_oid).first()
        if not order:
            return Response(
                {"message": "Order not found with provided Order ID"},
                status=status.HTTP_404_NOT_FOUND
            )

        items = CartOrderItem.objects.filter(order=order)
        order_items_data = []

        for item in items:
            courier = item.delivery_couriers
            courier_name = courier.name if courier else "Standard Express"
            carrier_url = ""
            if courier and courier.tracking_website and item.tracking_id:
                param_name = courier.url_parameter or "tracking_id"
                carrier_url = f"{courier.tracking_website}?{param_name}={item.tracking_id}"

            order_date = order.date or timezone.now()
            has_tracking = bool(item.tracking_id and str(item.tracking_id).strip() and str(item.tracking_id).lower() != "undefined")

            # Determine stage & status
            if item.product_delivered:
                status_text = "Delivered"
                step_idx = 4
            elif item.product_arrived:
                status_text = "Out for Delivery"
                step_idx = 3
            elif item.product_shipped or has_tracking:
                status_text = "In Transit"
                step_idx = 2
            elif item.processing_order or item.quality_check:
                status_text = "Processing"
                step_idx = 1
            else:
                status_text = "Order Placed"
                step_idx = 0

            # Realistic simulated timeline checkpoints
            checkpoints = [
                {
                    "title": "Order Placed & Confirmed",
                    "description": f"Order #{order.oid} confirmed and sent to seller.",
                    "time": order_date.strftime("%b %d, %Y - %I:%M %p"),
                    "completed": True,
                    "location": "Online System"
                },
                {
                    "title": "Item Packed & Manifested",
                    "description": f"Verified and packed at {item.vendor.name if item.vendor else 'Seller'} warehouse.",
                    "time": (order_date + timedelta(hours=4)).strftime("%b %d, %Y - %I:%M %p"),
                    "completed": step_idx >= 1 or has_tracking,
                    "location": f"{item.vendor.name if item.vendor else 'Seller'} Hub"
                },
                {
                    "title": f"Handed Over to {courier_name}",
                    "description": f"Package received by {courier_name} with Tracking ID: {item.tracking_id or 'Pending'}",
                    "time": (order_date + timedelta(hours=14)).strftime("%b %d, %Y - %I:%M %p"),
                    "completed": step_idx >= 2 or has_tracking,
                    "location": "Origin Sort Center"
                },
                {
                    "title": "In Transit - Out for Delivery",
                    "description": f"Shipment arrived at destination hub ({order.city or 'Local Hub'}). Assigned to courier executive.",
                    "time": (order_date + timedelta(days=2, hours=5)).strftime("%b %d, %Y - %I:%M %p"),
                    "completed": step_idx >= 3,
                    "location": f"{order.city or 'Local'} Logistics Facility"
                },
                {
                    "title": "Delivered",
                    "description": f"Package delivered safely to {order.full_name or 'Recipient'}.",
                    "time": (order_date + timedelta(days=3)).strftime("%b %d, %Y - %I:%M %p"),
                    "completed": step_idx >= 4,
                    "location": f"{order.city or 'Destination'}, {order.country or ''}"
                }
            ]

            expected_delivery = (order_date + timedelta(days=3)).strftime("%A, %b %d, %Y")
            product_img = ""
            if item.product and item.product.image:
                try:
                    raw_img_url = item.product.image.url
                    if raw_img_url.startswith("http://") or raw_img_url.startswith("https://"):
                        product_img = raw_img_url
                    else:
                        product_img = request.build_absolute_uri(raw_img_url)
                except Exception:
                    product_img = ""

            order_items_data.append({
                "id": item.id,
                "product_title": item.product.title if item.product else "Product",
                "product_image": product_img,
                "product_slug": item.product.slug if item.product else "",
                "price": str(item.price),
                "qty": item.qty,
                "sub_total": str(item.sub_total),
                "tracking_id": item.tracking_id or "",
                "has_tracking": has_tracking,
                "courier_name": courier_name,
                "carrier_url": carrier_url,
                "status_text": status_text,
                "step_index": step_idx,
                "expected_delivery": expected_delivery,
                "vendor_name": item.vendor.name if item.vendor else "Merchant",
                "checkpoints": checkpoints,
            })

        response_data = {
            "order_oid": order.oid,
            "order_date": order.date.strftime("%b %d, %Y") if order.date else "",
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "customer_name": order.full_name,
            "email": order.email,
            "mobile": order.mobile,
            "address": order.address,
            "city": order.city,
            "state": order.state,
            "country": order.country,
            "total": str(order.total),
            "items": order_items_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)