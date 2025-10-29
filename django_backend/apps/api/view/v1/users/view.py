from django.contrib.auth import get_user_model
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.core.models import Audit
from apps.core.utils import log_user_event

User = get_user_model()

class LoginAPIView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data["token"])

        user = User.objects.get(id=token.user_id)
        log_user_event(user, Audit.Action.LOGIN, request)

        return Response(
            {
                "token": token.key,
                "user_id": token.user_id,
                "username": token.user.username,
            }
        )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()

        log_user_event(request, Audit.Action.LOGOUT, request)

        return Response({"success": "Logged out successfully"})
