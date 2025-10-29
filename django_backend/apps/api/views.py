import os
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from apps.core.services.camera_grpc_client import camera_grpc_client



@require_http_methods(["GET"])
def root(request):
    return JsonResponse({"status": "RPOS Backend Running"})


@require_http_methods(["GET"])
def get_telemetry(request):
    print("[DEBUG] Django: get_telemetry called")
    data = camera_grpc_client.get_telemetry()
    print(f"[DEBUG] Django: gRPC get_telemetry returned: {data}")
    return JsonResponse(data)


@csrf_exempt
@require_http_methods(["POST"])
def move_ptz(request):
    try:
        body = json.loads(request.body)
        azimuth = body.get("azimuth")
        elevation = body.get("elevation")
        if azimuth is None or elevation is None:
            return JsonResponse({"error": "Missing azimuth or elevation"}, status=400)
        data = camera_grpc_client.move_ptz(azimuth, elevation)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def set_zoom(request):
    try:
        body = json.loads(request.body)
        level = body.get("level")
        if level is None:
            return JsonResponse({"error": "Missing level"}, status=400)
        data = camera_grpc_client.set_zoom(level)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["GET"])
def take_snapshot(request):
    # Assuming snapshot is saved to media/snapshots/
    snapshot_path = os.path.join("media", "snapshots", "snapshot.jpg")
    if os.path.exists(snapshot_path):
        with open(snapshot_path, "rb") as f:
            return HttpResponse(f.read(), content_type="image/jpeg")
    else:
        return JsonResponse({"error": "Snapshot not found"}, status=404)


@require_http_methods(["GET"])
def get_logs(request):
    logs_path = os.path.join("media", "logs", "app.log")
    if os.path.exists(logs_path):
        with open(logs_path, "r") as f:
            logs = f.read()
        return HttpResponse(logs, content_type="text/plain")
    else:
        return JsonResponse({"error": "Logs not found"}, status=404)


@require_http_methods(["GET"])
def get_map_tile(request, z, x, y):
    tile_path = os.path.join("media", "maptiles", z, x, f"{y}.png")
    if os.path.exists(tile_path):
        with open(tile_path, "rb") as f:
            return HttpResponse(f.read(), content_type="image/png")
    else:
        return JsonResponse({"error": "Tile not found"}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def set_speed(request):
    try:
        body = json.loads(request.body)
        speed = body.get("speed")
        if speed is None:
            return JsonResponse({"error": "Missing speed"}, status=400)
        data = camera_grpc_client.set_speed(speed)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def set_manual_gps(request):
    try:
        body = json.loads(request.body)
        latitude = body.get("latitude")
        longitude = body.get("longitude")
        if latitude is None or longitude is None:
            return JsonResponse({"error": "Missing latitude or longitude"}, status=400)
        data = camera_grpc_client.set_manual_gps(latitude, longitude)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def set_current_stream(request):
    try:
        body = json.loads(request.body)
        stream = body.get("stream")
        if stream is None:
            return JsonResponse({"error": "Missing stream"}, status=400)
        # For now, just return success - implement logic as needed
        return JsonResponse({"success": True, "message": "Stream set"})
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["GET"])
def get_current_zoom(request):
    data = camera_grpc_client.get_current_zoom()
    return JsonResponse(data)


@require_http_methods(["GET"])
def get_cross_positions(request):
    zoom = request.GET.get("zoom")
    if zoom is None:
        return JsonResponse({"error": "Missing zoom parameter"}, status=400)
    try:
        zoom = int(zoom)
        data = camera_grpc_client.get_cross_positions(zoom)
        return JsonResponse(data)
    except ValueError:
        return JsonResponse({"error": "Invalid zoom value"}, status=400)


@require_http_methods(["GET"])
def get_ptz_position(request):
    data = camera_grpc_client.get_ptz_position()
    return JsonResponse(data)


@csrf_exempt
@require_http_methods(["POST"])
def set_resolution(request):
    try:
        body = json.loads(request.body)
        width = body.get("width")
        height = body.get("height")
        if width is None or height is None:
            return JsonResponse({"error": "Missing width or height"}, status=400)
        # For now, just return success - implement logic as needed
        return JsonResponse({"success": True, "message": "Resolution set"})
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["GET"])
def get_angles(request):
    # Return mock data or implement as needed
    return JsonResponse({"azimuth": 0, "elevation": 0})


@require_http_methods(["GET"])
def get_distance(request):
    # Return mock data or implement as needed
    return JsonResponse({"distance": 0})


@require_http_methods(["GET"])
def get_login_attempts(request):
    # Return mock data or implement as needed
    return JsonResponse({"attempts": 0})


@csrf_exempt
@require_http_methods(["POST"])
def schedule_reboot(request):
    try:
        body = json.loads(request.body)
        time = body.get("time")
        password = body.get("password")
        script_path = body.get("scriptPath")
        run_as = body.get("runAs")
        if not all([time, password, script_path, run_as]):
            return JsonResponse({"error": "Missing required parameters"}, status=400)
        # For now, just return success - implement logic as needed
        return JsonResponse({"success": True, "message": "Reboot scheduled"})
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def send_control(request):
    try:
        body = json.loads(request.body)
        prop = body.get("prop")
        key = body.get("key")
        value = body.get("value")
        if not all([prop, key, value is not None]):
            return JsonResponse({"error": "Missing parameters"}, status=400)
        data = camera_grpc_client.send_control(prop, key, value)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def set_ptz_direction(request):
    try:
        body = json.loads(request.body)
        direction = body.get("direction")
        start = body.get("start")
        if direction is None or start is None:
            return JsonResponse({"error": "Missing parameters"}, status=400)
        data = camera_grpc_client.set_ptz_direction(direction, start)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
