from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

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
