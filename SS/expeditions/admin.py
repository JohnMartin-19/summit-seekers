from django.contrib import admin
from .models import Expedition, ExpeditionDate, Booking, Participant

#inline for Participants within a Booking
class ParticipantInline(admin.TabularInline):
    model = Participant
    extra = 1

# Customize Booking Admin
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'expedition_date', 'user', 'num_participants', 'total_price', 'payment_status', 'booking_date')
    list_filter = ('payment_status', 'expedition_date__expedition', 'booking_date')
    search_fields = ('booking_id', 'user__username', 'user__email', 'participants__first_name', 'participants__last_name')
    inlines = [ParticipantInline]
    readonly_fields = ('booking_id', 'total_price', 'booking_date', 'payment_transaction_id', 'payment_gateway_response') 

    # action to mark bookings as completed (if payment is confirmed externally)
    def mark_as_completed(self, request, queryset):
        queryset.update(payment_status='completed')
    mark_as_completed.short_description = "Mark selected bookings as completed"

    actions = [mark_as_completed]


# customize expeditionDate Admin
class ExpeditionDateAdmin(admin.ModelAdmin):
    list_display = ('expedition', 'start_date', 'end_date', 'current_bookings', 'is_fully_booked', 'is_active')
    list_filter = ('expedition', 'is_fully_booked', 'is_active')
    search_fields = ('expedition__name', 'start_date')
    actions = ['update_booking_counts']

    def update_booking_counts(self, request, queryset):
        for expedition_date in queryset:
            expedition_date.current_bookings = sum(booking.num_participants for booking in expedition_date.bookings.filter(payment_status='completed'))
            expedition_date.save()
        self.message_user(request, "Booking counts updated successfully.")
    update_booking_counts.short_description = "Update current booking counts for selected dates"


admin.site.register(Expedition)
admin.site.register(ExpeditionDate, ExpeditionDateAdmin)
admin.site.register(Booking, BookingAdmin)
admin.site.register(Participant)