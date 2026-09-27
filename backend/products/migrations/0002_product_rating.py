from django.db import migrations, models
from django.core.validators import MaxValueValidator, MinValueValidator


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="rating",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=3,
                validators=[
                    MinValueValidator(0),
                    MaxValueValidator(5),
                ],
            ),
        ),
    ]