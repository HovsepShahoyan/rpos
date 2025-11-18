from django.contrib import admin
from django.contrib.admin import register

from apps.core import models



@register(models.Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ('created', 'action', 'user', 'ip_address')
    list_filter = ('action', 'created', 'user')
    search_fields = ('user__username', 'ip_address')
    readonly_fields = ('created', 'action', 'user', 'ip_address')
    ordering = ('-created',)

