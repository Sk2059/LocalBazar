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
    )

    # Curation flags are editable straight from the changelist so featuring a
    # product is one click instead of a full change-form round trip. `name`
    # stays the link into the detail form, and Django refuses editable fields
    # that are also links, so it's declared explicitly.
    list_display_links = ("name",)

    list_editable = (
        "is_active",
        "is_featured",
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
