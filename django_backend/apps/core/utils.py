from .models import Audit
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    logger.debug(f'[AUDIT] Client IP determined: {ip}')
    return ip


def log_user_event(user, action: Audit.Action, request=None):
    logger.info(f'[AUDIT] log_user_event called')
    logger.info(f'[AUDIT] User: {user}')
    logger.info(f'[AUDIT] Action: {action}')
    logger.info(f'[AUDIT] Request provided: {request is not None}')
    
    ip = None
    if request:
        ip = get_client_ip(request)
        logger.info(f'[AUDIT] IP address: {ip}')
    else:
        logger.warning('[AUDIT] No request provided, IP will be None')
    
    try:
        audit = Audit.objects.create(user=user, action=action, ip_address=ip)
        logger.info(f'[AUDIT] Audit entry created successfully with ID: {audit.id}')
        logger.info(f'[AUDIT] Audit details - User: {audit.user}, Action: {audit.action}, IP: {audit.ip_address}, Created: {audit.created}')
        return audit
    except Exception as e:
        logger.error(f'[AUDIT] Failed to create audit entry: {str(e)}')
        logger.exception('[AUDIT] Full traceback:')
        raise
