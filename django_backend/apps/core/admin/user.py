from django.contrib import admin
from django.contrib.admin import register
from django.contrib.auth import get_user_model

User = get_user_model()


@register(User)
class UserAdmin(admin.ModelAdmin):
    pass

