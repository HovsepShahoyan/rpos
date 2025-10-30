from rest_framework import viewsets
from apps.core.models import Camera
from rest_framework import serializers

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'name', 'ip_address', 'port', 'type']

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
