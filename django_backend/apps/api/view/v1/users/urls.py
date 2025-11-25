from django.urls import path
from .view import MeasureRangeAPIView

urlpatterns = [
    path('measure-range/', MeasureRangeAPIView.as_view(), name='measure-range'),
]