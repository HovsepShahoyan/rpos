from django.contrib import admin
from django.contrib.admin import register

from apps.core import models



@register(models.Audit)
class AuditAdmin(admin.ModelAdmin):
    pass

