from django.contrib import admin

from .models import Event, Feedback, Registration, UserProfile, Venue


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title", "category", "organizer", "venue",
        "start_date", "capacity", "registration_total",
    )
    list_filter = ("category", "start_date")
    search_fields = ("title", "description", "organizer__username")

    @admin.display(description="Registrations")
    def registration_total(self, obj):
        return obj.registrations.filter(status="registered").count()


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "capacity", "is_available")
    list_filter = ("is_available",)
    search_fields = ("name", "location")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "user", "event", "status", "checked_in", "registered_at",
    )
    list_filter = ("status", "checked_in")
    search_fields = ("user__username", "event__title")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("user__username", "event__title", "comment")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "created_at")
    search_fields = ("user__username", "user__email", "phone")
