from django.urls import path
from .users.view import LoginAPIView, LogoutAPIView
from .camear.views import CameraListView

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("cameras/", CameraListView.as_view(), name="camera-list"),
]
