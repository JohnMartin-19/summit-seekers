# expeditions/views.py (Replace existing content or add to it)
from pyexpat.errors import messages
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token # For TokenAuthentication
from django.contrib.auth import authenticate, login, logout # For user login/logout
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
import logging
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from datetime import timedelta,datetime
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
                
from .models import *
from .serializers import *
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend # If using filters
from django.conf import settings
# 👇 Swagger import
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
# --- API Endpoints ---

logger = logging.getLogger(__name__)



# --- User Authentication API Views ---
method_decorator(csrf_exempt)
class RegisterView(APIView):

    permission_classes = (AllowAny,)
    @swagger_auto_schema(request_body=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#AUTHENTICATION VIEWS(LOGIN,LOGOUT,PASSWORD RESET,SOCIAL AUTHENTICATION )

class LoginView(TokenObtainPairView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
            },
            required=['email', 'password']
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'refresh_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'user': openapi.Schema(type=openapi.TYPE_OBJECT, description="User details if JWT_AUTH_RETURN_USER is True in dj-rest-auth settings")
                }
            ),
            400: "Bad Request",
            401: "Unauthorized"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data = request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.error(f"Token validation failed: {e}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        authenticated_user = serializer.user

        if not authenticated_user or not authenticated_user.is_authenticated:
            logger.error('Authenticated user object is invalid or not authenticated after serializer validation')
            return Response({'error': "Authentication failed unexpectedly"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        access_token = str(serializer.validated_data['access'])
        refresh_token = str(serializer.validated_data['refresh'])

        access_token_lifetime = settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=60))
        expires_at_utc = datetime.utcnow() + access_token_lifetime


        response_data = {
            'access_token': access_token,
            'refresh_token': refresh_token,
        }

        if settings.REST_AUTH.get('JWT_AUTH_RETURN_EXPIRATION', False):
             response_data['access_token_expires_at'] = expires_at_utc.isoformat() + 'Z' 

     
        if settings.REST_AUTH.get('JWT_AUTH_RETURN_USER', False):
            from .serializers import UserSerializer 
            user_serializer = UserSerializer(authenticated_user)
            response_data['user'] = user_serializer.data


        return Response(response_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description="The refresh token to blacklist"),
                'access_token': openapi.Schema(type=openapi.TYPE_STRING, description="The access token to blacklist (optional for extra security)")
            },
            required=['refresh_token'] 
        ),
        responses={
            200: "Logged out successfully",
            400: "Bad Request"
        }
    )
    def post(self, request):
        try:
            refresh_token_string = request.data.get('refresh_token')
            access_token_string = request.data.get("access_token") 

            if not refresh_token_string:
                return Response({'error': 'Refresh token is required for logout.'}, status=status.HTTP_400_BAD_REQUEST)

            #blacklist the refresh token
            try:
                refresh_token_obj = RefreshToken(refresh_token_string)
                outstanding_token = OutstandingToken.objects.get(token=refresh_token_obj.token)
                BlacklistedToken.objects.get_or_create(token=outstanding_token)
                logger.info(f"Refresh token blacklisted successfully: {refresh_token_obj.payload.get('user_id')}")

            except OutstandingToken.DoesNotExist:
                logger.warning(f"Attempted to blacklist a refresh token that does not exist as an outstanding token: {refresh_token_string[:10]}...")
            except Exception as e:
                logger.error(f"Failed to blacklist refresh token: {e}", exc_info=True)
                return Response({'error': 'Failed to process refresh token logout.'}, status=status.HTTP_400_BAD_REQUEST)

            if access_token_string:
                try:
                    access_token_obj = AccessToken(access_token_string)
                    access_token_obj.blacklist() 
                    logger.info(f"Access token blacklisted successfully: {access_token_obj.payload.get('user_id')}")
                except Exception as e:
                    logger.warning(f"Failed to blacklist access token during logout: {e}", exc_info=True)

            # proceed to delete cookies if JWT_AUTH_COOKIE is enabled
            response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
            
            # Check for REST_AUTH settings before accessing them
            if hasattr(settings, 'REST_AUTH') and settings.REST_AUTH:
                if settings.REST_AUTH.get('JWT_AUTH_COOKIE'):
                    response.delete_cookie(settings.REST_AUTH['JWT_AUTH_COOKIE'])
                    logger.info("Access token cookie deleted.")
                if settings.REST_AUTH.get('JWT_AUTH_REFRESH_COOKIE'):
                    response.delete_cookie(settings.REST_AUTH['JWT_AUTH_REFRESH_COOKIE'])
                    logger.info("Refresh token cookie deleted.")
            else:
                logger.warning("REST_AUTH settings not found or empty, skipping cookie deletion based on settings.")


            return response
        except Exception as e:
            logger.error(f"Logout failed unexpectedly: {e}", exc_info=True) 
            return Response({'error': 'An unexpected error occurred during logout.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) # Use 500 for unexpected server errors


class UserProfileAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve logged-in user's profile.
    """
    serializer_class = RegisterSerializer # Or a dedicated UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


###################### MAIN BUSINESS LOGIC #############################
class ExpeditionListAPIView(generics.ListAPIView):
    """
    API endpoint to list all active expeditions.
    """
    queryset = Expedition.objects.filter(is_active=True).order_by('name')
    serializer_class = ExpeditionSerializer
    permission_classes = [AllowAny] # Anyone can view expeditions
    filter_backends = [DjangoFilterBackend] # Enable filtering
    filterset_fields = ['difficulty_level', 'duration_days'] # Example filters

class ExpeditionDetailAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve details of a single expedition by slug.
    """
    queryset = Expedition.objects.filter(is_active=True)
    serializer_class = ExpeditionSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

class BookingCreateAPIView(generics.CreateAPIView):
    """
    API endpoint for creating a new booking.
    Requires authentication.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] # User must be logged in to book

    def perform_create(self, serializer):
        # Associate the booking with the logged-in user
        serializer.save(user=self.request.user)

class BookingDetailAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve details of a specific booking.
    Only allows access to the user who made the booking or staff.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer
    lookup_field = 'booking_id' # Use UUID as lookup
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter queryset to only show bookings belonging to the requesting user
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)

# --- Payment Integration API Views ---
# This is where your M-Pesa Daraja integration will live.
# The frontend will hit this endpoint to initiate STK Push.

class InitiatePaymentAPIView(APIView):
    """
    API endpoint to initiate payment (e.g., M-Pesa STK Push).
    """
    permission_classes = [IsAuthenticated] # Only logged-in users can initiate payment

    def post(self, request, booking_id):
        # Fetch the booking
        booking = get_object_or_404(Booking, booking_id=booking_id, payment_status='pending')

        # Ensure the booking belongs to the logged-in user, unless user is admin/staff
        if not (request.user == booking.user or request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "You do not have permission to initiate payment for this booking."},
                            status=status.HTTP_403_FORBIDDEN)

        # Get the phone number for M-Pesa STK Push
        # For simplicity, let's assume it's sent in the request or from user profile
        # For better security, fetch from the user's profile or booking participant details
        phone_number = request.data.get('phone_number') # Frontend sends phone number
        if not phone_number:
            return Response({"detail": "Phone number is required for payment."},
                            status=status.HTTP_400_BAD_REQUEST)

        # --- M-Pesa Daraja STK Push Logic (Integration Point) ---
        # from your_mpesa_module import initiate_stk_push
        # Example using a placeholder function
        try:
            # Replace with your actual M-Pesa integration call
            # This function would call Daraja API
            # response_from_mpesa = initiate_stk_push(
            #     phone_number=phone_number,
            #     amount=booking.total_price,
            #     account_reference=str(booking.booking_id),
            #     transaction_desc=f"Payment for {booking.expedition_date.expedition.name}"
            # )
            # For now, simulate a response
            response_from_mpesa = {
                "ResponseCode": "0", # Success code
                "ResponseDescription": "Success. Request accepted for processing",
                "CheckoutRequestID": "ws_CO_DMZ_xxxxxxxx",
                "CustomerMessage": "Success. Request accepted for processing"
            }

            if response_from_mpesa.get("ResponseCode") == "0":
                booking.payment_status = 'pending_mpesa' # New status for STK push initiated
                booking.payment_transaction_id = response_from_mpesa.get("CheckoutRequestID")
                booking.payment_gateway_response = response_from_mpesa
                booking.save()
                return Response({
                    "message": "M-Pesa STK Push initiated successfully. Check your phone.",
                    "checkout_request_id": booking.payment_transaction_id
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "detail": "Failed to initiate M-Pesa STK Push.",
                    "mpesa_response": response_from_mpesa
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"An error occurred: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- M-Pesa Daraja Callback URL (Handles status updates from Safaricom) ---
# This endpoint is NOT called by your frontend. It's called by Safaricom Daraja API.
# You need to configure this URL in your Daraja app settings.
class MpesaCallbackAPIView(APIView):
    permission_classes = [AllowAny] # Safaricom doesn't authenticate

    def post(self, request):
        data = request.data
        # Safaricom callback data structure depends on the API type (STK Push, C2B)
        # For STK Push, look for 'Body.stkCallback.CheckoutRequestID' and 'ResultCode'
        # Example processing (simplified):
        try:
            checkout_request_id = data['Body']['stkCallback']['CheckoutRequestID']
            result_code = data['Body']['stkCallback']['ResultCode']
            result_desc = data['Body']['stkCallback']['ResultDesc']

            booking = Booking.objects.get(payment_transaction_id=checkout_request_id)

            if result_code == 0: # Successful payment
                booking.payment_status = 'completed'
                # Extract MpesaReceiptNumber, Amount, etc. from data['Body']['stkCallback']['CallbackMetadata']['Item']
                # And save to booking model
                for item in data['Body']['stkCallback']['CallbackMetadata']['Item']:
                    if item['Name'] == 'MpesaReceiptNumber':
                        booking.payment_transaction_id = item['Value'] # Overwrite with actual receipt
                    # Add other fields like Amount, PhoneNumber, TransactionDate if needed
                messages.success(request, 'Payment successful!')
            else: # Failed or cancelled payment
                booking.payment_status = 'failed'
                messages.error(request, f"Payment failed: {result_desc}")

            booking.payment_gateway_response = data # Save the full response
            booking.save()
            return Response({"message": "Callback received and processed"}, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the error and the incoming data for debugging
            print(f"Error processing M-Pesa callback: {e}")
            print(f"Received data: {data}")
            return Response({"message": "Error processing callback"}, status=status.HTTP_400_BAD_REQUEST)

