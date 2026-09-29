from django.contrib.auth.models import User
from django.db import models


class Event(models.Model):
    CATEGORY_CHOICES = [
        ("Technical", "Technical"),
        ("Cultural", "Cultural"),
        ("Sports", "Sports"),
        ("Workshop", "Workshop"),
        ("Academic", "Academic"),
        ("Social", "Social"),
        ("Seminar", "Seminar"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    organizer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="organized_events",
    )
    venue = models.ForeignKey(
        "Venue",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["start_date"]
        indexes = [
            models.Index(fields=["start_date"], name="event_start_idx"),
            models.Index(fields=["category"], name="event_category_idx"),
            models.Index(fields=["title"], name="event_title_idx"),
        ]

    def __str__(self):
        return self.title


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=20, blank=True)
    interests = models.JSONField(default=list, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Registration(models.Model):
    STATUS_CHOICES = [
        ("registered", "Registered"),
        ("waitlisted", "Waitlisted"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="registered",
    )
    checked_in = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-registered_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "event"],
                name="unique_user_event_registration",
            )
        ]
        indexes = [
            models.Index(fields=["event", "status"], name="reg_event_status_idx"),
            models.Index(fields=["user", "status"], name="reg_user_status_idx"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.event.title}"


class Feedback(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="feedbacks",
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="feedbacks",
    )
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "event"],
                name="unique_user_event_feedback",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.event.title} - {self.rating}/5"


class Venue(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=300)
    capacity = models.PositiveIntegerField()
    amenities = models.JSONField(default=list, blank=True)
    image = models.URLField(blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"], name="venue_name_idx"),
            models.Index(fields=["is_available"], name="venue_available_idx"),
        ]

    def __str__(self):
        return self.name
