from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
import os
from apps.core.services.camera_grpc_client import camera_grpc_client


class SystemViewSet(viewsets.ViewSet):
    # Remove global permission_classes - will set per action

    @action(detail=False, methods=['get'])
    def root(self, request):
        return Response({"status": "RPOS Backend Running"})

    @action(detail=False, methods=['get'])
    def telemetry(self, request):
        print("[DEBUG] Django: get_telemetry called")
        data = camera_grpc_client.get_telemetry()
        print(f"[DEBUG] Django: gRPC get_telemetry returned: {data}")
        return Response(data)

    @action(detail=False, methods=['post'])
    def move_ptz(self, request):
        azimuth = request.data.get("azimuth")
        elevation = request.data.get("elevation")
        if azimuth is None or elevation is None:
            return Response({"error": "Missing azimuth or elevation"}, status=status.HTTP_400_BAD_REQUEST)
        data = camera_grpc_client.move_ptz(azimuth, elevation)
        return Response(data)

    @action(detail=False, methods=['post'], permission_classes=[])
    def set_zoom(self, request):
        level = request.data.get("level")
        if level is None:
            return Response({"error": "Missing level"}, status=status.HTTP_400_BAD_REQUEST)
        data = camera_grpc_client.set_zoom(level)
        return Response(data)

    @action(detail=False, methods=['get'])
    def snapshot(self, request):
        snapshot_path = os.path.join("media", "snapshots", "snapshot.jpg")
        if os.path.exists(snapshot_path):
            with open(snapshot_path, "rb") as f:
                return HttpResponse(f.read(), content_type="image/jpeg")
        else:
            return Response({"error": "Snapshot not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def logs(self, request):
        logs_path = os.path.join("media", "logs", "app.log")
        if os.path.exists(logs_path):
            with open(logs_path, "r") as f:
                logs = f.read()
            return HttpResponse(logs, content_type="text/plain")
        else:
            return Response({"error": "Logs not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='maptiles/(?P<z>[^/.]+)/(?P<x>[^/.]+)/(?P<y>[^/.]+)')
    def map_tile(self, request, z=None, x=None, y=None):
        tile_path = os.path.join("media", "maptiles", z, x, f"{y}.png")
        if os.path.exists(tile_path):
            with open(tile_path, "rb") as f:
                return HttpResponse(f.read(), content_type="image/png")
        else:
            return Response({"error": "Tile not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def set_speed(self, request):
        speed = request.data.get("speed")
        if speed is None:
            return Response({"error": "Missing speed"}, status=status.HTTP_400_BAD_REQUEST)
        data = camera_grpc_client.set_speed(speed)
        return Response(data)

    @action(detail=False, methods=['post'])
    def set_manual_gps(self, request):
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        if latitude is None or longitude is None:
            return Response({"error": "Missing latitude or longitude"}, status=status.HTTP_400_BAD_REQUEST)
        data = camera_grpc_client.set_manual_gps(latitude, longitude)
        return Response(data)

    @action(detail=False, methods=['post'], permission_classes=[])
    def set_current_stream(self, request):
        stream = request.data.get("stream")
        if stream is None:
            return Response({"error": "Missing stream"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Stream set"})

    @action(detail=False, methods=['get'])
    def current_zoom(self, request):
        data = camera_grpc_client.get_current_zoom()
        return Response(data)

    @action(detail=False, methods=['get'])
    def cross_positions(self, request):
        zoom = request.query_params.get("zoom")
        if zoom is None:
            return Response({"error": "Missing zoom parameter"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            zoom = int(zoom)
            data = camera_grpc_client.get_cross_positions(zoom)
            return Response(data)
        except ValueError:
            return Response({"error": "Invalid zoom value"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def ptz_position(self, request):
        data = camera_grpc_client.get_ptz_position()
        return Response(data)

    @action(detail=False, methods=['post'])
    def set_resolution(self, request):
        width = request.data.get("width")
        height = request.data.get("height")
        if width is None or height is None:
            return Response({"error": "Missing width or height"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Resolution set"})

    @action(detail=False, methods=['get'])
    def angles(self, request):
        return Response({"azimuth": 0, "elevation": 0})

    @action(detail=False, methods=['get'])
    def distance(self, request):
        return Response({"distance": 0})

    @action(detail=False, methods=['get'])
    def login_attempts(self, request):
        return Response({"attempts": 0})

    @action(detail=False, methods=['post'])
    def schedule_reboot(self, request):
        time = request.data.get("time")
        password = request.data.get("password")
        script_path = request.data.get("scriptPath")
        run_as = request.data.get("runAs")
        if not all([time, password, script_path, run_as]):
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Reboot scheduled"})

    @action(detail=False, methods=['post'], permission_classes=[])
    def send_control(self, request):
        prop = request.data.get("prop")
        key = request.data.get("key")
        value = request.data.get("value")
        if not all([prop, key, value is not None]):
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)
        data = camera_grpc_client.send_control(prop, key, value)
        return Response(data)

    @action(detail=False, methods=['post'], permission_classes=[])
    def set_ptz_direction(self, request):
        direction = request.data.get("direction")
        start = request.data.get("start")
        if direction is None or start is None:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)
        data = camera_grpc_client.set_ptz_direction(direction, start)
        return Response(data)

