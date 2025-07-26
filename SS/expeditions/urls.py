# expeditions/urls.py
from django.urls import path
from .views import *

app_name = 'expeditions' # Still useful for namespacing

urlpatterns = [
    # Expeditions
    path('expeditions/', ExpeditionListAPIView.as_view(), name='api-expedition-list'),
    path('expeditions/<slug:slug>/', ExpeditionDetailAPIView.as_view(), name='api-expedition-detail'),

    # Bookings
    path('bookings/create/', BookingCreateAPIView.as_view(), name='api-booking-create'),
    path('bookings/<uuid:booking_id>/', BookingDetailAPIView.as_view(), name='api-booking-detail'),

    # Payments (M-Pesa)
    path('payments/initiate/<uuid:booking_id>/', InitiatePaymentAPIView.as_view(), name='api-initiate-payment'),
    path('payments/mpesa-callback/', MpesaCallbackAPIView.as_view(), name='api-mpesa-callback'), # This is your Daraja URL

    # Authentication
    path('auth/register/', RegisterView.as_view(), name='api-register'),
    path('auth/login/', LoginView.as_view(), name='api-login'),
    path('auth/logout/', LogoutView.as_view(), name='api-logout'),
    path('auth/profile/', UserProfileAPIView.as_view(), name='api-profile'),
]