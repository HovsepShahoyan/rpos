from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class MeasureRangeView(APIView):
    def post(self, request, *args, **kwargs):
        # Dummy response, replace with actual logic
        return Response({'message': 'Measure range received.'}, status=status.HTTP_200_OK)