from django.shortcuts import render
from django.http import JsonResponse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from api.mail import send_email_async
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound

# Restframework
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import NotFound

# Others
import json
import random

# Serializers
from userauths.serializer import MyTokenObtainPairSerializer, ProfileSerializer, RegisterSerializer, UserSerializer


# Models
from userauths.models import Profile, User
class AuthenticatedPasswordChangeView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        user = request.user

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password:
            return Response(
                {"message": "Current password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(current_password):
            return Response(
                {"message": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password:
            return Response(
                {"message": "New password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"message": "New password and confirm password do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {"message": "Password must be at least 8 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password Changed Successfully"},
            status=status.HTTP_200_OK
        )


# This code defines a DRF View class called MyTokenObtainPairView, which inherits from TokenObtainPairView.
class MyTokenObtainPairView(TokenObtainPairView):
    # Here, it specifies the serializer class to be used with this view.
    serializer_class = MyTokenObtainPairSerializer

# This code defines another DRF View class called RegisterView, which inherits from generics.CreateAPIView.
class RegisterView(generics.CreateAPIView):
    # It sets the queryset for this view to retrieve all User objects.
    queryset = User.objects.all()
    # It specifies that the view allows any user (no authentication required).
    permission_classes = (AllowAny,)
    # It sets the serializer class to be used with this view.
    serializer_class = RegisterSerializer



# This is a DRF view defined as a Python function using the @api_view decorator.
@api_view(['GET'])
def getRoutes(request):
    # It defines a list of API routes that can be accessed.
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/',
        '/api/test/'
    ]
    # It returns a DRF Response object containing the list of routes.
    return Response(routes)


# This is another DRF view defined as a Python function using the @api_view decorator.
# It is decorated with the @permission_classes decorator specifying that only authenticated users can access this view.
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    # Check if the HTTP request method is GET.
    if request.method == 'GET':
        # If it is a GET request, it constructs a response message including the username.
        data = f"Congratulations {request.user}, your API just responded to a GET request."
        # It returns a DRF Response object with the response data and an HTTP status code of 200 (OK).
        return Response({'response': data}, status=status.HTTP_200_OK)
    # Check if the HTTP request method is POST.
    elif request.method == 'POST':
        try:
            # If it's a POST request, it attempts to decode the request body from UTF-8 and load it as JSON.
            body = request.body.decode('utf-8')
            data = json.loads(body)
            # Check if the 'text' key exists in the JSON data.
            if 'text' not in data:
                # If 'text' is not present, it returns a response with an error message and an HTTP status of 400 (Bad Request).
                return Response("Invalid JSON data", status=status.HTTP_400_BAD_REQUEST)
            text = data.get('text')
            # If 'text' exists, it constructs a response message including the received text.
            data = f'Congratulations, your API just responded to a POST request with text: {text}'
            # It returns a DRF Response object with the response data and an HTTP status code of 200 (OK).
            return Response({'response': data}, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            # If there's an error decoding the JSON data, it returns a response with an error message and an HTTP status of 400 (Bad Request).
            return Response("Invalid JSON data", status=status.HTTP_400_BAD_REQUEST)
    # If the request method is neither GET nor POST, it returns a response with an error message and an HTTP status of 400 (Bad Request).
    return Response("Invalid JSON data", status=status.HTTP_400_BAD_REQUEST)


# This code defines another DRF View class called ProfileView, which inherits from generics.RetrieveAPIView and used to show user profile view.
class ProfileView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ProfileSerializer

    def get_object(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
        return profile
    

def generate_numeric_otp(length=7):
        # Generate a random 7-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
        return otp
class PasswordEmailVerify(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, email):
        email = email.strip()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"message": "No account found with this email address."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate OTP
        user.otp = generate_numeric_otp()
        user.save(update_fields=["otp"])

        # Debug
        print("PASSWORD RESET OTP:", user.otp)
        print("PASSWORD RESET OTP TO:", user.email)

        subject = "Your Password Reset OTP"

        text_body = f"""
Hello {user.username},

Your password reset OTP is:

{user.otp}

Use this OTP to create your new password.

If you did not request this password reset, please ignore this email.
Regards,
Ansari Store
"""

        html_body = f"""
        <html>
        <body>
            <h2>Password Reset</h2>

            <p>Hello {user.username},</p>

            <p>Your password reset OTP is:</p>

            <h1>{user.otp}</h1>

            <p>Use this OTP to create your new password.</p>

            <p>If you did not request this password reset, please ignore this email.
            Regards,
Ansari Store</p>
        </body>
        </html>
        """

        try:
            send_email_async(
                subject=subject,
                text_body=text_body,
                html_body=html_body,
                to_list=[user.email]
            )

            return Response(
                {
                    "message": "OTP sent successfully to your email.",
                    "email": user.email,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print("PASSWORD RESET OTP DISPATCH ERROR:", repr(e))
            return Response(
                {
                    "message": "Failed to initiate OTP sending.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordChangeView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data

        email = payload.get("email")
        otp = payload.get("otp")
        password = payload.get("password")

        # Check email
        if not email:
            return Response(
                {"message": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check OTP
        if not otp:
            return Response(
                {"message": "OTP is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check password
        if not password:
            return Response(
                {"message": "Password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(
                email__iexact=email.strip(),
                otp=str(otp).strip()
            )

        except User.DoesNotExist:
            return Response(
                {"message": "Invalid OTP or email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(password)

        # Clear OTP after successful password reset
        user.otp = ""

        user.save(update_fields=["password", "otp"])

        return Response(
            {
                "message": "Password Changed Successfully"
            },
            status=status.HTTP_200_OK
        )        