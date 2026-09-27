from django.db import migrations, models
from django.core.validators import MinValueValidator


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_product_rating"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="bulk_price",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="bulk_minimum_quantity",
            field=models.PositiveIntegerField(default=10),
        ),
    ]