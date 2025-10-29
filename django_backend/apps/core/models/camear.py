from django.db import models


class Camera(models.Model):
    class CameraType(models.IntegerChoices):
        DAY = 1, 'DAY'
        THERMAL = 2, 'THERMAL'

    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    port = models.PositiveIntegerField()
    type = models.IntegerField(choices=CameraType.choices, default=CameraType.DAY)

    def __str__(self):
        return self.name
