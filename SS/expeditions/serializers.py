# expeditions/serializers.py
from rest_framework import serializers
from .models import Expedition, ExpeditionDate, Booking, Participant
from django.contrib.auth.models import User # For User data

class ExpeditionDateSerializer(serializers.ModelSerializer):
    # This will display the actual start_date instead of just the ID
    class Meta:
        model = ExpeditionDate
        fields = ['id', 'start_date', 'end_date', 'current_bookings', 'is_fully_booked', 'is_active']

class ExpeditionSerializer(serializers.ModelSerializer):
    # Nested serializer to include available dates when fetching an expedition
    available_dates = ExpeditionDateSerializer(many=True, read_only=True)

    class Meta:
        model = Expedition
        fields = [
            'id', 'name', 'slug', 'duration_days', 'difficulty_level',
            'price_per_person', 'description', 'itinerary',
            'included_services', 'excluded_services', 'max_participants',
            'min_participants', 'is_active', 'available_dates',
            'created_at', 'updated_at'
        ]
        lookup_field = 'slug' # Allow detail views by slug
        extra_kwargs = {'url': {'lookup_field': 'slug'}} # For HyperlinkedIdentityField if used

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        # 'booking' field will be set by the view, not by the client
        exclude = ['booking'] # Don't expose the booking foreign key directly in API input

class BookingSerializer(serializers.ModelSerializer):
    # This is for creating a booking
    # Client will send expedition_date_id and num_participants
    expedition_date_id = serializers.PrimaryKeyRelatedField(
        queryset=ExpeditionDate.objects.filter(is_active=True, is_fully_booked=False),
        source='expedition_date'
    )
    participants = ParticipantSerializer(many=True) # Nested participants

    class Meta:
        model = Booking
        fields = [
            'booking_id', 'expedition_date_id', 'num_participants',
            'total_price', 'payment_status', 'booking_date',
            'participants', # For receiving participant data
            # Add fields for payment details if you want client to send them initially
        ]
        read_only_fields = ['booking_id', 'total_price', 'payment_status', 'booking_date']

    def create(self, validated_data):
        # Handle nested creation of participants
        participants_data = validated_data.pop('participants')
        expedition_date = validated_data['expedition_date'] # Access the actual object

        # Validate available slots before creating the booking
        if validated_data['num_participants'] > (expedition_date.expedition.max_participants - expedition_date.current_bookings):
            raise serializers.ValidationError("Not enough available slots for the selected date and number of participants.")

        # Create the booking instance
        booking = Booking.objects.create(**validated_data)

        # Create participants linked to the booking
        for participant_data in participants_data:
            Participant.objects.create(booking=booking, **participant_data)

        # Update current_bookings for the ExpeditionDate
        expedition_date.current_bookings += booking.num_participants
        expedition_date.save() # This will also update is_fully_booked

        return booking

class BookingDetailSerializer(serializers.ModelSerializer):
    # For fetching a specific booking, show more details
    expedition_date = ExpeditionDateSerializer(read_only=True)
    participants = ParticipantSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField() # Show username if associated

    class Meta:
        model = Booking
        fields = [
            'booking_id', 'expedition_date', 'num_participants',
            'total_price', 'payment_status', 'booking_date',
            'payment_transaction_id', 'payment_gateway_response',
            'participants', 'user'
        ]

# Serializer for user registration
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'email': {'required': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2') # Remove password2 before creating user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user