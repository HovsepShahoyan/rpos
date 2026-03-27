from django.db import models


class Camera(models.Model):
    class CameraType(models.IntegerChoices):
        DAY = 1, 'DAY'
        THERMAL = 2, 'THERMAL'

    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    port = models.PositiveIntegerField()
    # Secondary connection for CommandClient (HOST1/PORT1)
    ip_address_secondary = models.GenericIPAddressField(null=True, blank=True)
    port_secondary = models.PositiveIntegerField(null=True, blank=True)
    type = models.IntegerField(choices=CameraType.choices, default=CameraType.DAY)

    def __str__(self):
        return self.name
