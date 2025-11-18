from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.core.models import Audit
from apps.core.utils import log_user_event

User = get_user_model()

class LoginAPIView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = User.objects.get(username=request.data.get('username'))
        log_user_event(user, Audit.Action.LOGIN, request)

        return response


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        log_user_event(request.user, Audit.Action.LOGOUT, request)

        return Response({"success": "Logged out successfully"})
