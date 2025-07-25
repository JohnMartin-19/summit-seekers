# expeditions/urls.py
from django.urls import path
from .views import (
    ExpeditionListAPIView, ExpeditionDetailAPIView,
    BookingCreateAPIView, BookingDetailAPIView,
    InitiatePaymentAPIView, MpesaCallbackAPIView,
    UserRegistrationAPIView, UserLoginAPIView, UserLogoutAPIView, UserProfileAPIView
)

app_name = 'expeditions' # Still useful for namespacing

urlpatterns = [
    # Expeditions
    path('api/expeditions/', ExpeditionListAPIView.as_view(), name='api-expedition-list'),
    path('api/expeditions/<slug:slug>/', ExpeditionDetailAPIView.as_view(), name='api-expedition-detail'),

    # Bookings
    path('api/bookings/create/', BookingCreateAPIView.as_view(), name='api-booking-create'),
    path('api/bookings/<uuid:booking_id>/', BookingDetailAPIView.as_view(), name='api-booking-detail'),

    # Payments (M-Pesa)
    path('api/payments/initiate/<uuid:booking_id>/', InitiatePaymentAPIView.as_view(), name='api-initiate-payment'),
    path('api/payments/mpesa-callback/', MpesaCallbackAPIView.as_view(), name='api-mpesa-callback'), # This is your Daraja URL

    # Authentication
    path('api/auth/register/', UserRegistrationAPIView.as_view(), name='api-register'),
    path('api/auth/login/', UserLoginAPIView.as_view(), name='api-login'),
    path('api/auth/logout/', UserLogoutAPIView.as_view(), name='api-logout'),
    path('api/auth/profile/', UserProfileAPIView.as_view(), name='api-profile'),
]