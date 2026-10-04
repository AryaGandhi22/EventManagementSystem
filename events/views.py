from django.contrib.auth.models import User
from django.db.models import Avg, Count, Q, Case, When, Value, IntegerField
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from django.http import HttpResponse
import csv

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Event, Feedback, Registration, UserProfile, Venue, Notification, PlatformFeedback

from .serializers import (
    EventSerializer,
    FeedbackSerializer,
    MeSerializer,
    RegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSummarySerializer,
    VenueSerializer,
    NotificationSerializer,
    PlatformFeedbackSerializer,
)


# ============================================================
# EVENTS
# ============================================================

def is_admin_user(user):
    return (
        user.is_staff
        or user.groups.filter(name__iexact="Admin").exists()
    )


def is_organizer_user(user):
    return user.groups.filter(name__iexact="Organizer").exists()


def is_student_user(user):
    return user.groups.filter(name__iexact="Student").exists()

class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Event.objects.select_related(
            "organizer",
            "venue",
        ).prefetch_related(
            "registrations"
        ).all()

        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        upcoming = self.request.query_params.get("upcoming")
        venue = self.request.query_params.get("venue")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
            )

        if category and category.lower() != "all":
            queryset = queryset.filter(
                category__iexact=category
            )

        if upcoming in {"1", "true", "yes"}:
            queryset = queryset.filter(
                start_date__gte=timezone.now()
            )

        if venue:
            queryset = queryset.filter(
                venue_id=venue
            )

        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        interests = profile.interests if profile.interests else []
        
        if interests:
            queryset = queryset.annotate(
                is_recommended=Case(
                    When(category__in=interests, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField()
                )
            )

        recommended = self.request.query_params.get("recommended")
        if recommended in {"1", "true", "yes"}:
            # Filter out events the user is already registered for
            registered_event_ids = Registration.objects.filter(
                user=self.request.user,
                status__in=["registered", "waitlisted", "checked-in"]
            ).values_list("event_id", flat=True)
            
            queryset = queryset.exclude(id__in=registered_event_ids)
            
            if interests:
                queryset = queryset.order_by("-is_recommended", "start_date")
            else:
                queryset = queryset.order_by("start_date")

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        if not (
            user.is_staff
            or user.groups.filter(name__iexact="Admin").exists()
            or user.groups.filter(name__iexact="Organizer").exists()
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Only organizers and admins can create events."
            )

        serializer.save()
class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.select_related(
            "organizer",
            "venue",
        ).all()

    def perform_update(self, serializer):
        event = self.get_object()

        if (
            event.organizer != self.request.user
            and not self.request.user.is_staff
        ):
            self.permission_denied(self.request)

        serializer.save()

    def perform_destroy(self, instance):
        if (
            instance.organizer != self.request.user
            and not self.request.user.is_staff
        ):
            self.permission_denied(self.request)

        instance.delete()


# ============================================================
# USER PROFILE
# ============================================================

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        requested_user_id = self.kwargs.get("pk")

        if (
            str(requested_user_id) != str(self.request.user.pk)
            and not self.request.user.is_staff
        ):
            self.permission_denied(self.request)

        profile, _ = UserProfile.objects.get_or_create(
            user=self.request.user
        )

        return profile


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        UserProfile.objects.get_or_create(
            user=self.request.user
        )

        return self.request.user


# ============================================================
# REGISTRATIONS
# ============================================================
class RegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Registration.objects.select_related(
            "user",
            "event",
            "event__organizer",
            "event__venue",
        ).prefetch_related(
            "event__registrations"
        )

        is_admin = (
            self.request.user.is_staff
            or self.request.user.groups.filter(
                name__iexact="Admin"
            ).exists()
        )

        # Admin can view all registrations
        if (
            is_admin
            and self.request.query_params.get("all")
            in {"1", "true", "yes"}
        ):
            return queryset.all()

        # Normal users can only view their own registrations
        queryset = queryset.filter(
            user=self.request.user
        )

        event = self.request.query_params.get("event")
        registration_status = self.request.query_params.get("status")

        if event:
            queryset = queryset.filter(
                event_id=event
            )

        if (
            registration_status
            and registration_status != "all"
        ):
            queryset = queryset.filter(
                status=registration_status
            )

        return queryset

class EventAttendeeListView(generics.ListAPIView):
    serializer_class = UserSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs.get("event_id")
        user = self.request.user
        
        is_admin = (
            user.is_staff
            or user.groups.filter(name__iexact="Admin").exists()
        )
        
        is_organizer = Event.objects.filter(id=event_id, organizer=user).exists()
        
        if not (is_admin or is_organizer):
            try:
                my_reg = Registration.objects.get(event_id=event_id, user=user)
                if not my_reg.connect_opt_in:
                    return User.objects.none()
            except Registration.DoesNotExist:
                return User.objects.none()
        
        queryset = User.objects.filter(
            registrations__event_id=event_id,
            registrations__connect_opt_in=True,
            registrations__status__in=["registered", "checked-in"]
        ).exclude(
            id=user.id
        ).distinct().select_related("profile").prefetch_related("registrations")
        
        return queryset
class RegistrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Registration.objects.select_related(
            "user",
            "event",
        )

        is_admin = (
            self.request.user.is_staff
            or self.request.user.groups.filter(
                name__iexact="Admin"
            ).exists()
        )

        if is_admin:
            return queryset

        return queryset.filter(
            user=self.request.user
        )

    def get_object(self):
        queryset = self.get_queryset()
        registration_id = self.kwargs.get("pk")

        try:
            registration = queryset.get(pk=registration_id)
        except Registration.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Registration not found.")

        return registration

    def perform_destroy(self, instance):
        instance.status = "cancelled"
        instance.checked_in = False
        instance.save(
            update_fields=["status", "checked_in"]
        )

class CheckInView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    queryset = Registration.objects.select_related(
        "event",
        "user",
    )

    def post(self, request, pk):
        registration = self.get_object()

        if (
            registration.user != request.user
            and registration.event.organizer != request.user
            and not request.user.is_staff
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to check in this registration."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if registration.status != "registered":
            return Response(
                {
                    "detail": (
                        "Only registered participants "
                        "can check in."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if registration.event.start_date > timezone.now():
            return Response(
                {
                    "detail": (
                        "Check-in opens when the event starts."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration.checked_in = True

        registration.save(
            update_fields=["checked_in"]
        )

        return Response(
            RegistrationSerializer(
                registration,
                context={"request": request},
            ).data
        )


# ============================================================
# FEEDBACK
# ============================================================

class FeedbackListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Feedback.objects.select_related(
            "user",
            "event",
            "event__organizer",
            "event__venue",
        ).prefetch_related(
            "event__registrations",
        )

        if (
            self.request.user.is_staff
            and self.request.query_params.get("all")
            in {"1", "true", "yes"}
        ):
            return queryset

        return queryset.filter(
            user=self.request.user
        )


class FeedbackDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Feedback.objects.select_related(
            "user",
            "event",
            "event__organizer",
            "event__venue",
        ).prefetch_related(
            "event__registrations",
        )

        if self.request.user.is_staff:
            return queryset

        return queryset.filter(
            user=self.request.user
        )


class PlatformFeedbackListCreateView(generics.ListCreateAPIView):
    serializer_class = PlatformFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PlatformFeedback.objects.select_related("user")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

class PlatformFeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlatformFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PlatformFeedback.objects.select_related("user")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)


# ============================================================
# VENUES
# ============================================================

class VenueListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Venue.objects.all()

        search = self.request.query_params.get("search")
        availability = self.request.query_params.get(
            "availability"
        )

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(location__icontains=search)
            )

        if availability == "available":
            queryset = queryset.filter(
                is_available=True
            )

        elif availability == "booked":
            queryset = queryset.filter(
                is_available=False
            )

        return queryset


class VenueDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# AUTHENTICATION
# ============================================================

class UserRegistrationView(
    generics.CreateAPIView
):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class UserLoginView(
    generics.GenericAPIView
):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        UserProfile.objects.get_or_create(
            user=user
        )

        return Response(
            {
                "message": "Login successful.",
                "user": UserSummarySerializer(
                    user
                ).data,
                "role": serializer.validated_data.get(
                    "role",
                    "",
                ),
                "access": str(
                    refresh.access_token
                ),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# PARTICIPANTS
# ============================================================

class ParticipantListView(
    generics.ListAPIView
):
    serializer_class = UserSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        is_admin = (
            user.is_staff
            or user.groups.filter(name__iexact="Admin").exists()
        )
        
        if is_admin:
            queryset = User.objects.filter(
                registrations__isnull=False
            ).distinct().select_related("profile").prefetch_related("registrations")
        else:
            queryset = User.objects.filter(
                registrations__event__organizer=user
            ).distinct().select_related("profile").prefetch_related("registrations")

        search = self.request.query_params.get(
            "search"
        )

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        return queryset


# ============================================================
# ADMIN - USERS
# ============================================================

class AdminUserListView(
    generics.ListAPIView
):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        is_admin = (
            request.user.is_staff
            or request.user.groups.filter(
                name__iexact="Admin"
            ).exists()
        )

        if not is_admin:
            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        users = User.objects.all().prefetch_related(
            "groups"
        ).order_by(
            "username"
        )

        search = request.query_params.get(
            "search",
            "",
        ).strip()

        if search:
            users = users.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        data = []

        for user in users:
            groups = {
                name.strip().lower()
                for name in user.groups.values_list(
                    "name",
                    flat=True,
                )
            }

            if user.is_staff or "admin" in groups:
                role = "Admin"

            elif "organizer" in groups:
                role = "Organizer"

            elif "student" in groups:
                role = "Student"

            else:
                role = "User"

            data.append(
                {
                    "id": str(user.pk),
                    "username": user.username,
                    "name": (
                        user.get_full_name().strip()
                        or user.username
                    ),
                    "email": user.email,
                    "role": role,
                    "status": (
                        "Active"
                        if user.is_active
                        else "Inactive"
                    ),
                    "date_joined": user.date_joined,
                }
            )

        return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_user_status_view(request, pk):
    """
    Admin-only endpoint to activate/deactivate a user.
    PATCH /api/events/admin/users/<pk>/status/
    Body: { "is_active": boolean }
    """
    is_admin = (
        request.user.is_staff
        or request.user.groups.filter(name__iexact="Admin").exists()
    )

    if not is_admin:
        return Response(
            {"detail": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Don't allow admins to deactivate themselves
    if user == request.user:
        return Response(
            {"detail": "You cannot deactivate your own account."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    is_active = request.data.get("is_active")
    if is_active is not None:
        user.is_active = bool(is_active)
        user.save(update_fields=["is_active"])

    return Response(
        {
            "id": str(user.pk),
            "username": user.username,
            "status": "Active" if user.is_active else "Inactive",
            "detail": f"User {'activated' if user.is_active else 'deactivated'} successfully.",
        }
    )


# ============================================================
# ADMIN - EVENTS
# ============================================================

class AdminEventListView(
    generics.ListAPIView
):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        is_admin = (
            request.user.is_staff
            or request.user.groups.filter(
                name__iexact="Admin"
            ).exists()
        )

        if not is_admin:
            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        events = (
            Event.objects
            .select_related(
                "organizer",
                "venue",
            )
            .prefetch_related(
                "registrations"
            )
            .all()
        )

        search = request.query_params.get(
            "search",
            "",
        ).strip()

        if search:
            events = events.filter(
                Q(title__icontains=search)
                | Q(category__icontains=search)
                | Q(
                    organizer__username__icontains=search
                )
                | Q(
                    organizer__first_name__icontains=search
                )
                | Q(
                    organizer__last_name__icontains=search
                )
            )

        now = timezone.now()

        data = []

        for event in events:
            registrations = sum(1 for r in event.registrations.all() if r.status == "registered")

            if event.end_date < now:
                event_status = "Completed"

            elif event.start_date <= now:
                event_status = "Ongoing"

            else:
                event_status = "Upcoming"

            organizer_name = (
                event.organizer
                .get_full_name()
                .strip()
                or event.organizer.username
            )

            data.append(
                {
                    "id": str(event.pk),
                    "title": event.title,
                    "category": event.category,
                    "organizer": organizer_name,
                    "start_date": event.start_date,
                    "end_date": event.end_date,
                    "registrations": registrations,
                    "capacity": event.capacity,
                    "status": event_status,
                }
            )

        return Response(data)


# ============================================================
# DASHBOARD
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    now = timezone.now()

    # Overall system statistics
    total_users = User.objects.count()

    total_events = Event.objects.count()

    upcoming_events_count = Event.objects.filter(
        start_date__gte=now
    ).count()

    total_venues = Venue.objects.count()

    active_venues = Venue.objects.filter(
        is_available=True
    ).count()

    total_registrations = Registration.objects.count()

    # Current logged-in user's registrations
    my_registrations = Registration.objects.filter(
        user=request.user,
        status__in=[
            "registered",
            "waitlisted",
        ],
    ).count()

    # Upcoming events for dashboard
    upcoming = (
        Event.objects
        .filter(
            start_date__gte=now
        )
        .select_related("venue", "organizer")
        .prefetch_related("registrations")
        .order_by("start_date")[:5]
    )

    # Events grouped by category
    category_counts = {
        item["category"]: item["count"]
        for item in (
            Event.objects
            .values("category")
            .annotate(
                count=Count("id")
            )
        )
    }

    return Response(
        {
            "statistics": {
                "total_users": total_users,
                "total_events": total_events,
                "upcoming_events": upcoming_events_count,
                "total_venues": total_venues,
                "active_venues": active_venues,
                "total_registrations": total_registrations,
                "my_registrations": my_registrations,
            },

            "category_counts": category_counts,

            "upcoming_events": EventSerializer(
                upcoming,
                many=True,
                context={
                    "request": request
                },
            ).data,
        }
    )
    
# ============================================================
# STUDENT DASHBOARD
# ============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_dashboard_view(request):
    user = request.user
    now = timezone.now()

    registrations = Registration.objects.filter(
        user=user
    )

    registered = registrations.filter(
        status="registered"
    ).count()

    waitlisted = registrations.filter(
        status="waitlisted"
    ).count()

    cancelled = registrations.filter(
        status="cancelled"
    ).count()

    checked_in = registrations.filter(
        status="registered",
        checked_in=True,
    ).count()

    upcoming_events = Event.objects.filter(
        registrations__user=user,
        registrations__status__in=[
            "registered",
            "waitlisted",
        ],
        start_date__gte=now,
    ).select_related(
        "organizer",
        "venue",
    ).prefetch_related(
        "registrations"
    ).distinct().order_by(
        "start_date"
    )[:5]

    recommended_events = Event.objects.filter(
        start_date__gte=now
    ).exclude(
        registrations__user=user
    ).select_related(
        "organizer",
        "venue",
    ).prefetch_related(
        "registrations"
    ).order_by(
        "start_date"
    )[:5]

    return Response({
        "statistics": {
            "registered": registered,
            "waitlisted": waitlisted,
            "cancelled": cancelled,
            "checked_in": checked_in,
        },
        "upcoming_events": EventSerializer(
            upcoming_events,
            many=True,
            context={"request": request},
        ).data,
        "recommended_events": EventSerializer(
            recommended_events,
            many=True,
            context={"request": request},
        ).data,
    })


# ============================================================
# REPORTS
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reports_view(request):
    user = request.user
    is_admin = (
        user.is_staff
        or user.groups.filter(name__iexact="Admin").exists()
    )

    if is_admin:
        events = Event.objects.all()
        registrations = Registration.objects.all()
        feedbacks = Feedback.objects.all()
    else:
        events = Event.objects.filter(organizer=user)
        registrations = Registration.objects.filter(event__organizer=user)
        feedbacks = Feedback.objects.filter(event__organizer=user)

    total_registrations = registrations.count()

    registered = registrations.filter(
        status="registered"
    ).count()

    waitlisted = registrations.filter(
        status="waitlisted"
    ).count()

    cancelled = registrations.filter(
        status="cancelled"
    ).count()

    checked_in = registrations.filter(
        status="registered",
        checked_in=True,
    ).count()

    no_shows = registrations.filter(
        status="no-show"
    ).count()

    feedback_stats = feedbacks.aggregate(
        average_rating=Avg("rating"),
        review_count=Count("id"),
    )

    event_rows = []

    for event in events.select_related(
        "venue"
    ).prefetch_related(
        "registrations"
    ):

        registrations_list = event.registrations.all()
        reg_count = sum(1 for r in registrations_list if r.status == "registered")
        attendance = sum(1 for r in registrations_list if r.status == "registered" and r.checked_in)
        no_show = sum(1 for r in registrations_list if r.status == "no-show")

        total_expected = reg_count + no_show

        event_rows.append(
            {
                "event_id": str(event.pk),
                "event": event.title,
                "category": event.category,
                "registrations": reg_count,
                "attendance": attendance,
                "no_shows": no_show,
                "attendance_rate": round(
                    (
                        attendance
                        / total_expected
                        * 100
                    )
                    if total_expected
                    else 0,
                    1,
                ),
                "no_show_rate": round(
                    (
                        no_show
                        / total_expected
                        * 100
                    )
                    if total_expected
                    else 0,
                    1,
                ),
            }
        )

    return Response(
        {
            "total_events": events.count(),

            "total_registrations": total_registrations,

            "registered": registered,

            "waitlisted": waitlisted,

            "cancelled": cancelled,
            
            "no_shows": no_shows,

            "total_attendance": checked_in,

            "attendance_rate": round(
                (
                    checked_in
                    / registered
                    * 100
                )
                if registered
                else 0,
                1,
            ),

            "average_rating": round(
                feedback_stats[
                    "average_rating"
                ] or 0,
                2,
            ),

            "review_count": feedback_stats[
                "review_count"
            ],

            "event_performance": event_rows,
        }
    )
    
# ============================================================
# STUDENT REPORTS
# ============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_reports_view(request):
    user = request.user

    registrations = Registration.objects.filter(
        user=user
    )

    total_registrations = registrations.count()

    registered = registrations.filter(
        status="registered"
    ).count()

    waitlisted = registrations.filter(
        status="waitlisted"
    ).count()

    cancelled = registrations.filter(
        status="cancelled"
    ).count()

    checked_in = registrations.filter(
        status="registered",
        checked_in=True,
    ).count()

    feedback_given = Feedback.objects.filter(
        user=user
    ).count()

    return Response({
        "total_registrations": total_registrations,
        "registered": registered,
        "waitlisted": waitlisted,
        "cancelled": cancelled,
        "checked_in": checked_in,
        "feedback_given": feedback_given,
    })


# ============================================================
# ADMIN — EVENT STATUS CHANGE
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_event_status_view(request, pk):
    """
    Admin-only endpoint to change an event's status.
    PATCH /api/events/admin/events/<pk>/status/
    Body: { "status": "published" | "cancelled" | "draft" | "completed" }
    """
    is_admin = (
        request.user.is_staff
        or request.user.groups.filter(name__iexact="Admin").exists()
    )

    if not is_admin:
        return Response(
            {"detail": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response(
            {"detail": "Event not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get("status", "").lower()
    valid_statuses = [s[0] for s in Event.STATUS_CHOICES]

    if new_status not in valid_statuses:
        return Response(
            {
                "detail": (
                    f"Invalid status '{new_status}'. "
                    f"Choose from: {', '.join(valid_statuses)}."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    event.status = new_status
    event.save(update_fields=["status"])

    return Response(
        {
            "id": str(event.pk),
            "title": event.title,
            "status": event.status,
            "detail": f"Event status updated to '{new_status}'.",
        }
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_export_events_csv(request):
    """
    Admin-only endpoint to export events as CSV.
    """
    is_admin = (
        request.user.is_staff
        or request.user.groups.filter(name__iexact="Admin").exists()
    )

    if not is_admin:
        return Response(
            {"detail": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="events_export.csv"'

    writer = csv.writer(response)
    writer.writerow([
        "Event ID", "Title", "Category", "Status",
        "Start Date", "End Date", "Capacity",
        "Total Registered", "Organizer"
    ])

    events = Event.objects.all().prefetch_related("registrations")
    for event in events:
        registered_count = event.registrations.filter(status="registered").count()
        writer.writerow([
            str(event.pk),
            event.title,
            event.category,
            event.status,
            event.start_date.strftime("%Y-%m-%d %H:%M:%S") if event.start_date else "",
            event.end_date.strftime("%Y-%m-%d %H:%M:%S") if event.end_date else "",
            event.capacity,
            registered_count,
            event.organizer.username if event.organizer else ""
        ])

    return response


# ============================================================
# HEALTH CHECK
# ============================================================

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_view(request):
    return Response(
        {
            "status": "ok",
            "service": "college-event-management-api",
            "database": "mongodb",
        }
    )


# ============================================================
# NOTIFICATIONS
# ============================================================

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )

    def delete(self, request, *args, **kwargs):
        """Clear all notifications for the user."""
        Notification.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationDetailView(generics.UpdateAPIView, generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):
        # We only support marking as read
        serializer.save(is_read=True)