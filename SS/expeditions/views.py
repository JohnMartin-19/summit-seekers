# expeditions/views.py (Replace existing content or add to it)
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token # For TokenAuthentication
from django.contrib.auth import authenticate, login, logout # For user login/logout

from .models import Expedition, ExpeditionDate, Booking, Participant
from .serializers import (
    ExpeditionSerializer, ExpeditionDateSerializer,
    BookingSerializer, BookingDetailSerializer, ParticipantSerializer,
    UserRegistrationSerializer
)
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend # If using filters

# --- API Endpoints ---

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

# --- User Authentication API Views ---

class UserRegistrationAPIView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny] # Anyone can register

class UserLoginAPIView(APIView):
    """
    API endpoint for user login. Returns authentication token.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user) # This logs in the user for session authentication too
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "user_id": user.id,
                "username": user.username,
                "token": token.key
            }, status=status.HTTP_200_OK)
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class UserLogoutAPIView(APIView):
    """
    API endpoint for user logout. Invalidates authentication token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete() # Delete the token
        except (AttributeError, Token.DoesNotExist):
            pass # No token to delete, or user not authenticated by token

        logout(request) # For session authentication
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class UserProfileAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve logged-in user's profile.
    """
    serializer_class = UserRegistrationSerializer # Or a dedicated UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user