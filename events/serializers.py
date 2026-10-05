from bson import ObjectId

from django.contrib.auth.models import Group

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import RegexValidator

from rest_framework import serializers

from .models import Event, Feedback, Registration, UserProfile, Venue, Notification, PlatformFeedback


# International phone: optional +, then 7–15 digits (spaces/dashes allowed)
_phone_validator = RegexValidator(
    regex=r'^\+?[0-9][\d\s\-]{6,17}$',
    message=(
        "Enter a valid phone number (7–15 digits, "
        "optional leading +). Example: +91 98765 43210"
    ),
)


def validate_phone_number(value):
    """Strip whitespace/dashes, check 7–15 digit length."""
    if not value:
        return value
    digits = ''.join(c for c in value if c.isdigit())
    if len(digits) < 7 or len(digits) > 15:
        raise serializers.ValidationError(
            "Phone number must contain 7 to 15 digits."
        )
    _phone_validator(value)
    return value


def stringify_object_ids(value):
    """
    Convert MongoDB ObjectId values to strings so they can
    safely be returned as JSON.
    """
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, dict):
        return {
            key: stringify_object_ids(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [
            stringify_object_ids(item)
            for item in value
        ]

    return value


class SimpleUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "name", "email"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class UserSummarySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    events_attended = serializers.SerializerMethodField()
    registered_events = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "name",
            "email",
            "phone",
            "interests",
            "registered_events",
            "events_attended",
            "last_activity",
            "status",
        ]

    def _profile(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_phone(self, obj):
        return self._profile(obj).phone

    def get_interests(self, obj):
        return self._profile(obj).interests

    def get_registered_events(self, obj):
        res = []
        for r in obj.registrations.all():
            res.append({
                "id": str(r.event.id if hasattr(r.event, 'id') else r.event.pk),
                "title": getattr(r.event, 'title', 'Untitled Event'),
                "status": r.status,
                "checked_in": r.checked_in,
            })
        return res

    def get_events_attended(self, obj):
        return sum(
            1 for r in obj.registrations.all()
            if r.status == "registered" and r.checked_in
        )

    def get_last_activity(self, obj):
        registrations = sorted(
            obj.registrations.all(),
            key=lambda r: r.registered_at,
            reverse=True
        )
        return registrations[0].registered_at if registrations else None

    def get_status(self, obj):
        return "active" if obj.is_active else "inactive"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class VenueSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id",
            "name",
            "description",
            "location",
            "capacity",
            "amenities",
            "image",
            "is_available",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Capacity must be greater than zero."
            )
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class EventSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    organizer = SimpleUserSerializer(read_only=True)

    organizer_id = serializers.CharField(
        source="organizer.pk",
        read_only=True,
    )

    venue = VenueSerializer(read_only=True)

    venue_id = serializers.PrimaryKeyRelatedField(
        source="venue",
        queryset=Venue.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    registration_count = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()
    registration_status = serializers.SerializerMethodField()

    is_recommended = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "category",
            "status",
            "organizer",
            "organizer_id",
            "venue",
            "venue_id",
            "start_date",
            "end_date",
            "capacity",
            "image",
            "is_recommended",
            "registration_count",
            "available_seats",
            "registration_status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "organizer",
            "organizer_id",
            "venue",
            "is_recommended",
            "registration_count",
            "available_seats",
            "registration_status",
            "created_at",
        ]

    def validate(self, attrs):
        from django.utils import timezone
        from datetime import timedelta

        start = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None),
        )

        end = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None),
        )

        capacity = attrs.get(
            "capacity",
            getattr(self.instance, "capacity", None),
        )

        # Future dates only (only enforce on creation, not updates)
        if not self.instance and start and start <= timezone.now():
            raise serializers.ValidationError(
                {
                    "start_date":
                    "Event start date must be in the future."
                }
            )

        if start and end and end <= start:
            raise serializers.ValidationError(
                {
                    "end_date":
                    "End date/time must be after start date/time."
                }
            )

        # Minimum 1-hour duration
        if start and end and (end - start) < timedelta(hours=1):
            raise serializers.ValidationError(
                {
                    "end_date":
                    "Event duration must be at least 1 hour."
                }
            )

        if capacity is not None and capacity <= 0:
            raise serializers.ValidationError(
                {
                    "capacity":
                    "Capacity must be greater than zero."
                }
            )

        venue = attrs.get(
            "venue",
            getattr(self.instance, "venue", None),
        )

        if venue and start and end:
            conflicts = Event.objects.filter(
                venue=venue,
                start_date__lt=end,
                end_date__gt=start,
            )

            if self.instance:
                conflicts = conflicts.exclude(
                    pk=self.instance.pk
                )

            if conflicts.exists():
                raise serializers.ValidationError(
                    {
                        "venue_id":
                        "This venue is already booked during the selected time."
                    }
                )

            if capacity is not None and venue.capacity < capacity:
                raise serializers.ValidationError(
                    {
                        "venue_id":
                        "Venue capacity is smaller than event capacity."
                    }
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["organizer"] = request.user
        return super().create(validated_data)

    def get_registration_count(self, obj):
        # Use Python to count so prefetch_related is respected
        return sum(
            1 for r in obj.registrations.all()
            if r.status in ["registered"]
        )

    def get_available_seats(self, obj):
        return max(
            obj.capacity - self.get_registration_count(obj),
            0,
        )

    def get_registration_status(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return None

        # Iterate in Python to avoid N+1 query if prefetch_related is used
        for r in obj.registrations.all():
            if r.user_id == request.user.id:
                return r.status

        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class RegistrationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    user = SimpleUserSerializer(read_only=True)

    user_id = serializers.CharField(
        source="user.pk",
        read_only=True,
    )

    event = serializers.CharField(
        source="event.pk",
        read_only=True,
    )

    event_id = serializers.PrimaryKeyRelatedField(
        source="event",
        queryset=Event.objects.all(),
        write_only=True,
    )

    event_details = EventSerializer(
        source="event",
        read_only=True,
    )

    class Meta:
        model = Registration

        fields = [
            "id",
            "user",
            "user_id",
            "event",
            "event_id",
            "event_details",
            "status",
            "checked_in",
            "connect_opt_in",
            "registered_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "user_id",
            "event",
            "status",
            "checked_in",
            "registered_at",
        ]

    def validate_event_id(self, event):
        request = self.context["request"]

        existing = Registration.objects.filter(
            user=request.user,
            event=event,
        ).first()

        if existing and existing.status != "cancelled":
            raise serializers.ValidationError(
                "You are already registered for this event."
            )

        if event.end_date <= timezone.now():
            raise serializers.ValidationError(
                "Registration is closed because the event has ended."
            )

        return event

    def create(self, validated_data):
        request = self.context["request"]
        event = validated_data["event"]

        registered_count = Registration.objects.filter(
            event=event,
            status="registered",
        ).count()

        status_value = (
            "registered"
            if registered_count < event.capacity
            else "waitlisted"
        )

        registration = Registration.objects.filter(
            user=request.user,
            event=event,
        ).first()

        if registration:
            registration.status = status_value
            registration.save()
        else:
            registration = Registration.objects.create(
                user=request.user,
                event=event,
                status=status_value,
            )

        Notification.objects.create(
            user=request.user,
            title="Registration Confirmed" if status_value == "registered" else "Event Waitlist",
            message=f"Your registration for {event.title} has been confirmed." if status_value == "registered" else f"You are currently waitlisted for {event.title}.",
            type="registration" if status_value == "registered" else "warning",
            related_event=event,
        )

        return registration

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    user = UserSummarySerializer(read_only=True)

    phone = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    interests = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )

    class Meta:
        model = UserProfile

        fields = [
            "id",
            "user",
            "phone",
            "registration_number",
            "is_verified_organizer",
            "interests",
            "preferences",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]

    def validate_phone(self, value):
        return validate_phone_number(value)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class MeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(
        source="pk",
        read_only=True,
    )

    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    registration_number = serializers.SerializerMethodField()
    is_verified_organizer = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    preferences = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "phone",
            "registration_number",
            "is_verified_organizer",
            "interests",
            "preferences",
        ]

        # Username is now editable.
        read_only_fields = [
            "id",
        ]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def _profile(self, obj):
        profile, _ = UserProfile.objects.get_or_create(
            user=obj
        )
        return profile

    def get_phone(self, obj):
        return self._profile(obj).phone

    def get_registration_number(self, obj):
        return self._profile(obj).registration_number

    def get_is_verified_organizer(self, obj):
        return self._profile(obj).is_verified_organizer

    def get_interests(self, obj):
        return self._profile(obj).interests

    def get_preferences(self, obj):
        return self._profile(obj).preferences

    def validate_username(self, value):
        """
        Make sure the new username is not already used
        by another account.
        """
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        existing = User.objects.filter(
            username__iexact=value
        ).exclude(
            pk=self.instance.pk
        ).first()

        if existing:
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def update(self, instance, validated_data):
        profile = self._profile(instance)
        request_data = self.context["request"].data

        # Update User fields.
        for field in (
            "username",
            "first_name",
            "last_name",
            "email",
        ):
            if field in request_data:
                value = request_data[field]

                if field == "username":
                    value = value.strip()

                setattr(
                    instance,
                    field,
                    value,
                )

        instance.save()

        # Update UserProfile fields.
        if "phone" in request_data:
            profile.phone = request_data["phone"]

        if "interests" in request_data:
            profile.interests = request_data["interests"]

        if "preferences" in request_data:
            profile.preferences = request_data["preferences"]

        if "registration_number" in request_data:
            profile.registration_number = request_data["registration_number"]

        profile.save()

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    user = UserSummarySerializer(read_only=True)

    user_id = serializers.CharField(
        source="user.pk",
        read_only=True,
    )

    event_details = EventSerializer(
        source="event",
        read_only=True,
    )

    class Meta:
        model = Feedback

        fields = [
            "id",
            "user",
            "user_id",
            "event",
            "event_details",
            "rating",
            "rating_content",
            "rating_venue",
            "rating_value",
            "rating_organization",
            "comment",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "user_id",
            "created_at",
        ]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value

    def validate_comment(self, value):
        if len(value) > 1000:
            raise serializers.ValidationError(
                "Feedback comment cannot exceed 1000 characters."
            )
        return value

    def validate_event(self, event):
        request = self.context["request"]

        attended = Registration.objects.filter(
            user=request.user,
            event=event,
            status="registered",
        ).first()

        if not attended:
            raise serializers.ValidationError(
                "Feedback can be submitted only for a registered event."
            )

        return event

    def validate(self, attrs):
        request = self.context["request"]
        event = attrs.get("event")

        if (
            event
            and Feedback.objects.filter(
                user=request.user,
                event=event,
            )
            .exclude(
                pk=self.instance.pk
                if self.instance
                else None
            )
            .exists()
        ):
            raise serializers.ValidationError(
                {
                    "event":
                    "You have already submitted feedback for this event."
                }
            )

        return attrs

    def create(self, validated_data):
        return Feedback.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)

class PlatformFeedbackSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user = UserSummarySerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        read_only=True,
    )
    
    class Meta:
        model = PlatformFeedback
        fields = [
            "id",
            "user",
            "user_id",
            "type",
            "status",
            "title",
            "description",
            "screenshot",
            "admin_notes",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "user_id",
            "status",
            "admin_notes",
            "created_at",
            "resolved_at",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        return PlatformFeedback.objects.create(
            user=request.user,
            **validated_data
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    first_name = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    phone = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    interests = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )

    # "student" or "organizer" — admin accounts cannot be self-registered
    role = serializers.ChoiceField(
        choices=["student", "organizer"],
        required=False,
        default="student",
        write_only=True,
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "interests",
            "role",
        ]

    def validate_username(self, value):
        if User.objects.filter(
            username=value
        ).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_phone(self, value):
        return validate_phone_number(value)

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        interests = validated_data.pop("interests", [])
        password = validated_data.pop("password")
        role = validated_data.pop("role", "student")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        UserProfile.objects.create(
            user=user,
            phone=phone,
            interests=interests,
        )

        # Auto-assign to the matching group so login works immediately
        group_name = role.capitalize()   # "Student" or "Organizer"
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)

        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):
        user = authenticate(
            username=attrs["username"],
            password=attrs["password"],
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        groups = {
            name.strip().lower()
            for name in user.groups.values_list(
                "name",
                flat=True,
            )
        }

        if user.is_staff or "admin" in groups:
            role = "admin"

        elif "organizer" in groups:
            role = "organizer"

        elif "student" in groups:
            role = "student"

        else:
            role = ""

        attrs["user"] = user
        attrs["role"] = role

        return attrs
    
class StudentReportSerializer(serializers.Serializer):
    total_registrations = serializers.IntegerField()
    registered = serializers.IntegerField()
    waitlisted = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    checked_in = serializers.IntegerField()
    feedback_given = serializers.IntegerField()


class NotificationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "type",
            "related_event",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "title",
            "message",
            "type",
            "related_event",
            "created_at",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return stringify_object_ids(data)