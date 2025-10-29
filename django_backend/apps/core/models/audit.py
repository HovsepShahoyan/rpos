from django.db import models

from django.conf import settings


class Audit(models.Model):
    class Action(models.TextChoices):
        SAMPLE = "sample", "Sample"

    created = models.DateTimeField(auto_now_add=True)
    action = models.CharField(choices=Action.choices, max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('-created',)
