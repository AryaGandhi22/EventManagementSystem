from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import Event, Feedback, Registration, UserProfile, Venue


class UserSummarySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    events_attended = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "name", "email", "phone", "interests",
            "events_attended", "last_activity", "status",
        ]

    def _profile(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_phone(self, obj):
        return self._profile(obj).phone

    def get_interests(self, obj):
        return self._profile(obj).interests

    def get_events_attended(self, obj):
        return obj.registrations.filter(status="registered", checked_in=True).count()

    def get_last_activity(self, obj):
        registration = obj.registrations.order_by("-registered_at").first()
        return registration.registered_at if registration else None

    def get_status(self, obj):
        return "active" if obj.is_active else "inactive"


class VenueSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id", "name", "description", "location", "capacity",
            "amenities", "image", "is_available", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Capacity must be greater than zero.")
        return value


class EventSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    organizer = UserSummarySerializer(read_only=True)
    organizer_id = serializers.CharField(source="organizer.pk", read_only=True)
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

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "category", "organizer",
            "organizer_id", "venue", "venue_id", "start_date", "end_date",
            "capacity", "registration_count", "available_seats",
            "registration_status", "created_at",
        ]
        read_only_fields = [
            "id", "organizer", "organizer_id", "venue",
            "registration_count", "available_seats",
            "registration_status", "created_at",
        ]

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        capacity = attrs.get("capacity", getattr(self.instance, "capacity", None))

        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_date": "End date/time must be after start date/time."}
            )
        if capacity is not None and capacity <= 0:
            raise serializers.ValidationError(
                {"capacity": "Capacity must be greater than zero."}
            )

        venue = attrs.get("venue", getattr(self.instance, "venue", None))
        if venue and start and end:
            conflicts = Event.objects.filter(
                venue=venue,
                start_date__lt=end,
                end_date__gt=start,
            )
            if self.instance:
                conflicts = conflicts.exclude(pk=self.instance.pk)
            if conflicts.exists():
                raise serializers.ValidationError(
                    {"venue_id": "This venue is already booked during the selected time."}
                )
            if venue.capacity < capacity:
                raise serializers.ValidationError(
                    {"venue_id": "Venue capacity is smaller than event capacity."}
                )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["organizer"] = request.user
        return super().create(validated_data)

    def get_registration_count(self, obj):
        return obj.registrations.filter(status__in=["registered"]).count()

    def get_available_seats(self, obj):
        return max(obj.capacity - self.get_registration_count(obj), 0)

    def get_registration_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        registration = obj.registrations.filter(user=request.user).first()
        return registration.status if registration else None


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user = UserSummarySerializer(read_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.ListField(
        child=serializers.CharField(), required=False
    )

    class Meta:
        model = UserProfile
        fields = [
            "id", "user", "phone", "interests",
            "preferences", "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]


class MeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    preferences = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "name", "phone", "interests", "preferences",
        ]
        read_only_fields = ["id", "username"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def _profile(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile

    def get_phone(self, obj):
        return self._profile(obj).phone

    def get_interests(self, obj):
        return self._profile(obj).interests

    def get_preferences(self, obj):
        return self._profile(obj).preferences

    def update(self, instance, validated_data):
        profile = self._profile(instance)
        request_data = self.context["request"].data

        for field in ("first_name", "last_name", "email"):
            if field in request_data:
                setattr(instance, field, request_data[field])
        instance.save()

        if "phone" in request_data:
            profile.phone = request_data["phone"]
        if "interests" in request_data:
            profile.interests = request_data["interests"]
        if "preferences" in request_data:
            profile.preferences = request_data["preferences"]
        profile.save()
        return instance


class RegistrationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user = UserSummarySerializer(read_only=True)
    user_id = serializers.CharField(source="user.pk", read_only=True)
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())
    event_details = EventSerializer(source="event", read_only=True)

    class Meta:
        model = Registration
        fields = [
            "id", "user", "user_id", "event", "event_details",
            "status", "checked_in", "registered_at",
        ]
        read_only_fields = [
            "id", "user", "user_id", "status", "checked_in", "registered_at"
        ]

    def validate_event(self, event):
        request = self.context["request"]
        existing = Registration.objects.filter(
            user=request.user, event=event
        ).first()
        if existing:
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
            event=event, status="registered"
        ).count()
        status_value = (
            "registered" if registered_count < event.capacity else "waitlisted"
        )
        return Registration.objects.create(
            user=request.user,
            event=event,
            status=status_value,
        )


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user = UserSummarySerializer(read_only=True)
    user_id = serializers.CharField(source="user.pk", read_only=True)
    event_details = EventSerializer(source="event", read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id", "user", "user_id", "event",
            "event_details", "rating", "comment", "created_at",
        ]
        read_only_fields = ["id", "user", "user_id", "created_at"]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
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
        if event and Feedback.objects.filter(user=request.user, event=event).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError(
                {"event": "You have already submitted feedback for this event."}
            )
        return attrs

    def create(self, validated_data):
        return Feedback.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.ListField(
        child=serializers.CharField(), required=False
    )

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "first_name",
            "last_name", "phone", "interests",
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        interests = validated_data.pop("interests", [])
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        UserProfile.objects.create(
            user=user,
            phone=phone,
            interests=interests,
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs["username"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        groups = list(user.groups.values_list("name", flat=True))

        if "Admin" in groups:
            role = "admin"
        elif "Organizer" in groups:
            role = "organizer"
        elif "Student" in groups:
            role = "student"
        else:
            role = ""

        attrs["user"] = user
        attrs["role"] = role
        return attrs