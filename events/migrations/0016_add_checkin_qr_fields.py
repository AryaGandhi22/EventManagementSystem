import secrets
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def populate_qr_tokens(apps, schema_editor):
    """Backfill unique qr_token values for all existing registrations."""
    Registration = apps.get_model("events", "Registration")
    for reg in Registration.objects.filter(qr_token=""):
        reg.qr_token = secrets.token_urlsafe(32)
        reg.save(update_fields=["qr_token"])


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0015_userprofile_is_verified_organizer_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # 1. Add checked_in_at
        migrations.AddField(
            model_name="registration",
            name="checked_in_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        # 2. Add checked_in_by FK
        migrations.AddField(
            model_name="registration",
            name="checked_in_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="checked_in_registrations",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # 3. Add qr_token WITHOUT unique constraint first
        migrations.AddField(
            model_name="registration",
            name="qr_token",
            field=models.CharField(max_length=128, blank=True, default=""),
        ),
        # 4. Backfill unique tokens for existing rows
        migrations.RunPython(
            populate_qr_tokens,
            reverse_code=migrations.RunPython.noop,
        ),
        # 5. Now apply the unique constraint
        migrations.AlterField(
            model_name="registration",
            name="qr_token",
            field=models.CharField(max_length=128, blank=True, unique=True),
        ),
    ]
