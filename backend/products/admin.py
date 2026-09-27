from django.contrib import admin

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "farmer",
        "category",
        "price",
        "rating",
        "stock",
        "farming_method",
        "is_active",
        "is_featured",
        "rating",
    )

    list_filter = (
        "category",
        "farming_method",
        "is_active",
        "is_featured",
        "is_seasonal",
    )

    search_fields = (
        "name",
        "description",
        "farmer__email",
        "farmer__name",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }
