from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

from .views import (
    AdminEventListView,
    AdminUserListView,
    AdminVerifyOrganizerView,
    CheckInView,
    EventDetailView,
    EventListCreateView,
    EventAttendeeListView,
    FeedbackListCreateView,
    PlatformFeedbackListCreateView,
    PlatformFeedbackDetailView,
    AdminVerifyOrganizerView,
    PlatformFeedbackListCreateView,
    PlatformFeedbackDetailView,
    MeView,
    ParticipantListView,
    RegistrationDetailView,
    RegistrationListCreateView,
    UserLoginView,
    UserProfileDetailView,
    UserRegistrationView,
    VenueDetailView,
    VenueListCreateView,
    admin_event_status_view,
    admin_user_status_view,
    admin_export_events_csv,
    dashboard_view,
    health_view,
    reports_view,
    student_dashboard_view,
    student_reports_view,
    NotificationListView,
    NotificationDetailView,
)


urlpatterns = [
    # ========================================================
    # AUTHENTICATION
    # ========================================================

    path(
        "auth/register/",
        UserRegistrationView.as_view(),
        name="user-register",
    ),

    path(
        "auth/login/",
        UserLoginView.as_view(),
        name="user-login",
    ),

    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    path(
        "auth/token/verify/",
        TokenVerifyView.as_view(),
        name="token-verify",
    ),

    path(
        "auth/me/",
        MeView.as_view(),
        name="auth-me",
    ),

    # ========================================================
    # ADMIN
    # ========================================================

    path(
        "admin/users/",
        AdminUserListView.as_view(),
        name="admin-users",
    ),

    path(
        "admin/users/<str:pk>/status/",
        admin_user_status_view,
        name="admin-user-status",
    ),

    path(
        "admin/events/",
        AdminEventListView.as_view(),
        name="admin-events",
    ),

    path(
        "admin/events/<str:pk>/status/",
        admin_event_status_view,
        name="admin-event-status",
    ),

    path(
        "admin/export/events/",
        admin_export_events_csv,
        name="admin-export-events",
    ),

    # ========================================================
    # DASHBOARD / REPORTS / GENERAL
    # ========================================================

    path(
        "health/",
        health_view,
        name="health",
    ),

    path(
        "dashboard/",
        dashboard_view,
        name="dashboard",
    ),

    path(
        "reports/",
        reports_view,
        name="reports",
    ),

    path(
        "participants/",
        ParticipantListView.as_view(),
        name="participants",
    ),
    
    # ========================================================
# STUDENT
# ========================================================

path(
    "student/dashboard/",
    student_dashboard_view,
    name="student-dashboard",
),

path(
    "student/reports/",
    student_reports_view,
    name="student-reports",
),

    # ========================================================
    # REGISTRATIONS
    # ========================================================

    path(
        "registrations/",
        RegistrationListCreateView.as_view(),
        name="registration-list-create",
    ),

    path(
        "registrations/<str:pk>/check-in/",
        CheckInView.as_view(),
        name="registration-check-in",
    ),

    path(
        "registrations/<str:pk>/",
        RegistrationDetailView.as_view(),
        name="registration-detail",
    ),

    # ========================================================
    # FEEDBACK
    # ========================================================

    path(
        "feedback/",
        FeedbackListCreateView.as_view(),
        name="feedback-list-create",
    ),

    path(
        "feedback/<str:pk>/",
        FeedbackDetailView.as_view(),
        name="feedback-detail",
    ),

    path(
        "platform-feedback/",
        PlatformFeedbackListCreateView.as_view(),
        name="platform-feedback-list-create",
    ),

    path(
        "platform-feedback/<str:pk>/",
        PlatformFeedbackDetailView.as_view(),
        name="platform-feedback-detail",
    ),

    # ========================================================
    # VENUES
    # ========================================================

    path(
        "venues/",
        VenueListCreateView.as_view(),
        name="venue-list-create",
    ),

    path(
        "venues/<str:pk>/",
        VenueDetailView.as_view(),
        name="venue-detail",
    ),

    # ========================================================
    # USER PROFILES
    # ========================================================

    path(
        "profile/<str:pk>/",
        UserProfileDetailView.as_view(),
        name="profile-detail",
    ),

    # ========================================================
    # NOTIFICATIONS
    # ========================================================

    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notification-list",
    ),

    path(
        "notifications/<str:pk>/",
        NotificationDetailView.as_view(),
        name="notification-detail",
    ),

    path(
        "admin/verify-organizer/<str:pk>/",
        AdminVerifyOrganizerView.as_view(),
        name="admin-verify-organizer",
    ),

    # ========================================================
    # EVENTS
    # ========================================================

    # Keep the dynamic event route LAST.
    path(
        "<str:event_id>/attendees/",
        EventAttendeeListView.as_view(),
        name="event-attendees",
    ),

    path(
        "",
        EventListCreateView.as_view(),
        name="event-list-create",
    ),

    path(
        "<str:pk>/",
        EventDetailView.as_view(),
        name="event-detail",
    ),
]