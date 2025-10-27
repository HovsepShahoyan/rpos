from django.db import models


class Camera(models.Model):
    class CameraType(models.TextChoices):
        DAY_CAMERA = 1, 'DAY Camera'
        THERMAL_CAMERA = 2, 'THERMAL Camera'

    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    port = models.PositiveIntegerField()
    type = models.CharField(choices=CameraType.choices, default=CameraType.DAY_CAMERA, max_length=50)

    def __str__(self):
        return self.name
