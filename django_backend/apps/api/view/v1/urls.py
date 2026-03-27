from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .users.view import LoginAPIView, LogoutAPIView, RefreshAPIView
from .camear.views import CameraViewSet

router = DefaultRouter()
router.register(r'cameras', CameraViewSet)

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("refresh/", RefreshAPIView.as_view(), name="token_refresh"),
    path("users/", include("apps.api.view.v1.users.urls")),
    path("", include(router.urls)),
]
