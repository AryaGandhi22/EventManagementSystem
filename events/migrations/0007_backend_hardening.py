from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0006_remove_registration_status_event_venue_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="registration",
            name="status",
            field=models.CharField(
                choices=[
                    ("registered", "Registered"),
                    ("waitlisted", "Waitlisted"),
                    ("cancelled", "Cancelled"),
                ],
                default="registered",
                max_length=20,
            ),
        ),
        migrations.AddConstraint(
            model_name="registration",
            constraint=models.UniqueConstraint(
                fields=("user", "event"),
                name="unique_user_event_registration",
            ),
        ),
        migrations.AddConstraint(
            model_name="feedback",
            constraint=models.UniqueConstraint(
                fields=("user", "event"),
                name="unique_user_event_feedback",
            ),
        ),
        migrations.AddIndex(
            model_name="event",
            index=models.Index(fields=["start_date"], name="event_start_idx"),
        ),
        migrations.AddIndex(
            model_name="event",
            index=models.Index(fields=["category"], name="event_category_idx"),
        ),
        migrations.AddIndex(
            model_name="event",
            index=models.Index(fields=["title"], name="event_title_idx"),
        ),
        migrations.AddIndex(
            model_name="registration",
            index=models.Index(fields=["event", "status"], name="reg_event_status_idx"),
        ),
        migrations.AddIndex(
            model_name="registration",
            index=models.Index(fields=["user", "status"], name="reg_user_status_idx"),
        ),
        migrations.AddIndex(
            model_name="venue",
            index=models.Index(fields=["name"], name="venue_name_idx"),
        ),
        migrations.AddIndex(
            model_name="venue",
            index=models.Index(fields=["is_available"], name="venue_available_idx"),
        ),
    ]
