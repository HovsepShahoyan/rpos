from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .users.view import LoginAPIView, LogoutAPIView
from .camear.views import CameraViewSet

router = DefaultRouter()
router.register(r'cameras', CameraViewSet)

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("", include(router.urls)),
]
