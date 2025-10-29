from django.db import models

from django.conf import settings


class Audit(models.Model):
    class Action(models.TextChoices):
        LOGIN = 'login', "Login"
        LOGOUT = 'logout', "Logout"

    created = models.DateTimeField(auto_now_add=True)
    action = models.CharField(choices=Action.choices, max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    ip_address = models.GenericIPAddressField()

    class Meta:
        ordering = ('-created',)
