from django.contrib import admin

from .. import models


@admin.register(models.Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ('name', 'ip_address', 'port', 'type')
    search_fields = ('name', 'ip_address', 'type')

