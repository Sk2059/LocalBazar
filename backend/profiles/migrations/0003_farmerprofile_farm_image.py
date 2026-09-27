from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profiles", "0002_rename_varification_note_farmerprofile_verification_note"),
    ]

    operations = [
        migrations.AddField(
            model_name="farmerprofile",
            name="farm_image",
            field=models.ImageField(blank=True, null=True, upload_to="farm_images/"),
        ),
    ]
