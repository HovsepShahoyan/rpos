from rest_framework import viewsets
from apps.core.models import Camera
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'name', 'ip_address', 'port', 'ip_address_secondary', 'port_secondary', 'type']

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAuthenticated]
