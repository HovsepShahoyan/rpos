from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from apps.core.models import Camera
from rest_framework import serializers

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'name', 'ip_address', 'port', 'type']

class CameraListView(ListAPIView):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
