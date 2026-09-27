from django.urls import path

from .views import (
    AdminCategoryDetailView,
    AdminCategoryListCreateView,
    AdminProductListView,
    CategoryDetailView,
    CategoryListCreateView,
    FarmerProductListView,
    ProductDetailView,
    ProductListCreateView,
)


urlpatterns = [

    # Categories
    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),

    # Admin category management. Sits above the public `<int:pk>` route so the
    # `admin/` prefix wins over an id, and shows archived rows too.
    path(
        "admin/categories/",
        AdminCategoryListCreateView.as_view(),
        name="admin-category-list-create",
    ),

    path(
        "admin/categories/<int:pk>/",
        AdminCategoryDetailView.as_view(),
        name="admin-category-detail",
    ),

    # Farmer catalogue (own products, drafts included) and the admin catalogue
    # sit above the public `<int:pk>` route so these prefixes win over an id.
    path(
        "farmer/products/",
        FarmerProductListView.as_view(),
        name="farmer-product-list",
    ),

    path(
        "admin/products/",
        AdminProductListView.as_view(),
        name="admin-product-list",
    ),

    # Products
    path(
        "",
        ProductListCreateView.as_view(),
        name="product-list-create",
    ),

    path(
        "<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
]
