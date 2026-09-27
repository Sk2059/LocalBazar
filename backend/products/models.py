from django.conf import settings
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):

    class FarmingMethod(models.TextChoices):
        ORGANIC = "organic", "Organic"
        NATURAL = "natural", "Natural"
        CONVENTIONAL = "conventional", "Conventional"

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )

    name = models.CharField(
        max_length=200,
    )

    slug = models.SlugField(
        max_length=220,
        unique=True,
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    bulk_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )

    bulk_minimum_quantity = models.PositiveIntegerField(
        default=10,
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(5),
        ],
    )

    unit = models.CharField(
        max_length=30,
        default="kg",
    )

    stock = models.PositiveIntegerField(
        default=0,
    )

    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )

    farming_method = models.CharField(
        max_length=20,
        choices=FarmingMethod.choices,
        default=FarmingMethod.NATURAL,
    )

    is_seasonal = models.BooleanField(
        default=False,
    )

    is_featured = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name