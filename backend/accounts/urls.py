from django.urls import path
from rest_framework_simplejwt.views import  TokenRefreshView
from . import views

urlpatterns = [
    path('', views.index, name='accounts_index'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.MeView.as_view(), name='me'),

    # Admin console. `admin/` must stay above the root catch-alls in the
    # products/orders URLconfs — it lives under /auth here so there is no clash.
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
]

