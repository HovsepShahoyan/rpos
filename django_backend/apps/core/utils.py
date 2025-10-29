from .models import Audit


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_user_event(user, action: Audit.Action, request=None):
    ip = None
    if request:
        ip = get_client_ip(request)
    Audit.objects.create(user=user, action=action, ip_address=ip)
