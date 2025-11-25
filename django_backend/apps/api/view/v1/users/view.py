from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.core.models import Audit
from apps.core.utils import log_user_event

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        return token

class LoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Decode the access token to get user_id and username
        access_token = response.data['access']
        token = AccessToken(access_token)
        user_id = token['user_id']
        username = token['username']
        user = User.objects.get(id=user_id)
        log_user_event(user, Audit.Action.LOGIN, request)

        # Customize response to match frontend expectations
        data = response.data
        custom_data = {
            'access_token': data['access'],
            'refresh_token': data['refresh']
        }
        response.data = custom_data
        return response


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        log_user_event(request.user, Audit.Action.LOGOUT, request)

        return Response({"success": "Logged out successfully"})


class RefreshAPIView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Decode the new access token to get user_id and username
        access_token = response.data['access']
        token = AccessToken(access_token)
        user_id = token['user_id']
        username = token['username']

        # Customize response to match frontend expectations
        data = response.data
        custom_data = {
            'access_token': data['access'],
            'refresh_token': data.get('refresh', request.data.get('refresh'))
        }
        response.data = custom_data
        return response


class MeasureRangeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info('[MEASURE_RANGE] POST request received')
        logger.info(f'[MEASURE_RANGE] User: {request.user}')
        logger.info(f'[MEASURE_RANGE] User authenticated: {request.user.is_authenticated}')
        logger.info(f'[MEASURE_RANGE] Request path: {request.path}')
        logger.info(f'[MEASURE_RANGE] Request method: {request.method}')
        logger.info(f'[MEASURE_RANGE] Request headers: {dict(request.headers)}')
        
        try:
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            logger.info(f'[MEASURE_RANGE] Client IP: {ip}')
            
            # Log the event
            logger.info('[MEASURE_RANGE] Calling log_user_event...')
            log_user_event(request.user, Audit.Action.MEASURE_RANGE, request)
            logger.info('[MEASURE_RANGE] Audit log created successfully')
            
            # Verify the audit was created
            latest_audit = Audit.objects.filter(
                user=request.user, 
                action=Audit.Action.MEASURE_RANGE
            ).order_by('-created').first()
            
            if latest_audit:
                logger.info(f'[MEASURE_RANGE] Latest audit entry ID: {latest_audit.id}')
                logger.info(f'[MEASURE_RANGE] Latest audit created at: {latest_audit.created}')
                logger.info(f'[MEASURE_RANGE] Latest audit IP: {latest_audit.ip_address}')
            else:
                logger.warning('[MEASURE_RANGE] No audit entry found after creation!')
            
            response_data = {
                'status': 'ok', 
                'message': 'Measure range event logged',
                'audit_id': latest_audit.id if latest_audit else None,
                'user': request.user.username,
                'timestamp': latest_audit.created.isoformat() if latest_audit else None
            }
            logger.info(f'[MEASURE_RANGE] Returning response: {response_data}')
            return Response(response_data)
            
        except Exception as e:
            logger.error(f'[MEASURE_RANGE] Exception occurred: {str(e)}')
            logger.error(f'[MEASURE_RANGE] Exception type: {type(e).__name__}')
            logger.exception('[MEASURE_RANGE] Full traceback:')
            return Response(
                {'status': 'error', 'message': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
