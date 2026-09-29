from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event, Registration, Venue


class Command(BaseCommand):
    help = "Create a small demo dataset for the College Event Management project."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username="demo_admin",
            defaults={
                "email": "demo@example.com",
                "first_name": "Demo",
                "last_name": "Administrator",
                "is_staff": True,
            },
        )
        if created:
            user.set_password("DemoPass123!")
            user.save()

        venues = [
            {
                "name": "Auditorium Hall",
                "description": "Main college auditorium for seminars and cultural programs.",
                "location": "Main Block",
                "capacity": 500,
                "amenities": ["Projector", "AC", "Sound System"],
            },
            {
                "name": "College Ground",
                "description": "Open ground for festivals and outdoor activities.",
                "location": "East Campus",
                "capacity": 1000,
                "amenities": ["Open Area", "Lighting", "Stage"],
            },
            {
                "name": "Computer Lab",
                "description": "Computer laboratory for coding competitions and workshops.",
                "location": "Technology Block",
                "capacity": 100,
                "amenities": ["Computers", "Wi-Fi", "Projector"],
            },
        ]

        venue_map = {}
        for item in venues:
            venue, _ = Venue.objects.get_or_create(
                name=item["name"],
                defaults=item,
            )
            venue_map[venue.name] = venue

        now = timezone.now()
        events = [
            ("Tech Fest 2026", "Technical", venue_map["Auditorium Hall"], 10, 120),
            ("Cultural Fest", "Cultural", venue_map["College Ground"], 20, 280),
            ("Code Challenge", "Technical", venue_map["Computer Lab"], 30, 75),
        ]

        for title, category, venue, day_offset, capacity in events:
            event, _ = Event.objects.get_or_create(
                title=title,
                defaults={
                    "description": f"Demo {category.lower()} college event.",
                    "category": category,
                    "organizer": user,
                    "venue": venue,
                    "start_date": now + timedelta(days=day_offset),
                    "end_date": now + timedelta(days=day_offset, hours=4),
                    "capacity": min(capacity, venue.capacity),
                },
            )
            if not Registration.objects.filter(user=user, event=event).exists():
                Registration.objects.create(
                    user=user,
                    event=event,
                    status="registered",
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created. Login: demo_admin / DemoPass123!"
            )
        )
