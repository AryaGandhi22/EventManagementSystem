from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    CheckInView,
    EventDetailView,
    EventListCreateView,
    FeedbackDetailView,
    FeedbackListCreateView,
    MeView,
    ParticipantListView,
    RegistrationDetailView,
    RegistrationListCreateView,
    UserLoginView,
    UserProfileDetailView,
    UserRegistrationView,
    VenueDetailView,
    VenueListCreateView,
    dashboard_view,
    health_view,
    reports_view,
)

urlpatterns = [
    path("auth/register/", UserRegistrationView.as_view(), name="user-register"),
    path("auth/login/", UserLoginView.as_view(), name="user-login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token-verify"),
    path("auth/me/", MeView.as_view(), name="auth-me"),

    path("", EventListCreateView.as_view(), name="event-list-create"),
    path("health/", health_view, name="health"),
    path("dashboard/", dashboard_view, name="dashboard"),
    path("reports/", reports_view, name="reports"),
    path("participants/", ParticipantListView.as_view(), name="participants"),

    path("registrations/", RegistrationListCreateView.as_view(), name="registration-list-create"),
    path("registrations/<str:pk>/", RegistrationDetailView.as_view(), name="registration-detail"),
    path("registrations/<str:pk>/check-in/", CheckInView.as_view(), name="registration-check-in"),

    path("feedback/", FeedbackListCreateView.as_view(), name="feedback-list-create"),
    path("feedback/<str:pk>/", FeedbackDetailView.as_view(), name="feedback-detail"),

    path("venues/", VenueListCreateView.as_view(), name="venue-list-create"),
    path("venues/<str:pk>/", VenueDetailView.as_view(), name="venue-detail"),

    path("profile/<str:pk>/", UserProfileDetailView.as_view(), name="profile-detail"),
    path("<str:pk>/", EventDetailView.as_view(), name="event-detail"),
]
