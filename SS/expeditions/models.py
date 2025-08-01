from django.db import models
from django.contrib.auth.models import User
import uuid
# Create your models here.
class Expedition(models.Model):
    name = models.CharField(max_length=250, help_text='Mt Kenya 3-day')
    slug = models.SlugField(unique=True, help_text="A short label for URLs, mount-kenya-3-day")
    dates = models.DateTimeField(null=True, blank=True)
    duration_days = models.IntegerField(help_text="Number of days for the expedition")
    difficulty_level = models.CharField(
        max_length=50,
        choices=[
            ('easy', 'Easy'),
            ('moderate', 'Moderate'),
            ('challenging', 'Challenging'),
            ('strenuous', 'Strenuous')
        ],
        default='moderate'
    )
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(help_text="Detailed description of the expedition")
    itinerary = models.TextField(help_text="Day-by-day breakdown of the trek")
    included_services = models.TextField(help_text="What's included ( guides, food, park fees)", blank=True, null=True)
    excluded_services = models.TextField(help_text="What's excluded", blank=True, null=True)
    max_participants = models.IntegerField(default=15)
    min_participants = models.IntegerField(default=5) 
    is_active = models.BooleanField(default=True, help_text="Is this expedition currently open for bookings?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='expedition_images/',blank=True,null=True)

    def __str__(self):
        return self.name

    
class ExpeditionDate(models.Model):
    """Specific available dates for an Expedition."""
    expedition = models.ForeignKey(Expedition, on_delete=models.CASCADE, related_name='available_dates')
    start_date = models.DateField()
    end_date = models.DateField()
    current_bookings = models.IntegerField(default=0)
    is_fully_booked = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True) # To open/close specific dates

    class Meta:
        unique_together = ('expedition', 'start_date') # Prevent duplicate dates for same expedition

    def __str__(self):
        return f"{self.expedition.name} - {self.start_date.strftime('%Y-%m-%d')}"

    def save(self, *args, **kwargs):
        self.is_fully_booked = self.current_bookings >= self.expedition.max_participants
        super().save(*args, **kwargs)

class Booking(models.Model):
    """Represents a single booking made by a user."""
    booking_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, help_text="Optional: User who made the booking if logged in")
    expedition_date = models.ForeignKey(ExpeditionDate, on_delete=models.PROTECT, related_name='bookings') # PROTECT to prevent accidental deletion of a booked date
    num_participants = models.IntegerField()
    booking_date = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded')
        ],
        default='pending'
    )
    # Add fields for payment transaction details later (e.g., M-Pesa transaction ID)
    payment_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    payment_gateway_response = models.JSONField(blank=True, null=True) # Store raw JSON response from gateway

    class Meta:
        ordering = ['-booking_date']

    def __str__(self):
        return f"Booking {self.booking_id} for {self.expedition_date.expedition.name} on {self.expedition_date.start_date}"

    def save(self, *args, **kwargs):
        # Calculate total price before saving
        self.total_price = self.num_participants * self.expedition_date.expedition.price_per_person
        super().save(*args, **kwargs)

class Participant(models.Model):
    """Details for each individual participant within a booking."""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='participants')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    dietary_restrictions = models.TextField(blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True) # Be very cautious with sensitive medical data; consider implications.

    def __str__(self):
        return f"{self.first_name} {self.last_name} (Booking: {self.booking.booking_id})"