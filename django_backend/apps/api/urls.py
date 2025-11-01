from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.api import views

router = DefaultRouter()
router.register(r'system', views.SystemViewSet, basename='system')

urlpatterns = [
    path("v1/", include("apps.api.view.v1.urls")),
    path("", include(router.urls)),
]
