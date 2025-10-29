import grpc
import camera_pb2
import camera_pb2_grpc


class CameraGrpcClient:
    def __init__(self, host="127.0.0.1", port=50051):
        self.channel = grpc.insecure_channel(f"{host}:{port}")
        self.stub = camera_pb2_grpc.CameraServiceStub(self.channel)

    def get_telemetry(self):
        print("[DEBUG] Django gRPC client: Calling GetTelemetry")
        request = camera_pb2.Empty()
        try:
            response = self.stub.GetTelemetry(request)
            print(f"[DEBUG] Django gRPC client: GetTelemetry response: {response}")
            return {
                "inclinoData": response.inclinoData,
                "gpsData": response.gpsData,
                "stmdData": response.stmdData,
                "movementData": response.movementData,
                "rangeData": response.rangeData,
            }
        except grpc.RpcError as e:
            print(f"[ERROR] Django gRPC client: gRPC call failed: {e}")
            return {"error": str(e)}

    def move_ptz(self, azimuth, elevation):
        request = camera_pb2.MovePTZRequest(azimuth=azimuth, elevation=elevation)
        try:
            response = self.stub.MovePTZ(request)
            return {"success": response.success, "message": response.message}
        except grpc.RpcError as e:
            return {"success": False, "message": str(e)}

    def set_zoom(self, level):
        request = camera_pb2.SetZoomRequest(level=level)
        try:
            response = self.stub.SetZoom(request)
            return {"success": response.success, "message": response.message}
        except grpc.RpcError as e:
            return {"success": False, "message": str(e)}

    def get_current_zoom(self):
        request = camera_pb2.Empty()
        try:
            response = self.stub.GetCurrentZoom(request)
            return {"zoom": response.zoom}
        except grpc.RpcError as e:
            return {"error": str(e)}

    def set_speed(self, speed):
        request = camera_pb2.SetSpeedRequest(speed=int(speed))
        try:
            response = self.stub.SetSpeed(request)
            return {"success": response.success, "message": response.message}
        except grpc.RpcError as e:
            return {"success": False, "message": str(e)}

    def set_manual_gps(self, latitude, longitude):
        request = camera_pb2.ManualGpsRequest(latitude=latitude, longitude=longitude)
        try:
            response = self.stub.SetManualGps(request)
            return {"success": response.success, "message": response.message}
        except grpc.RpcError as e:
            return {"success": False, "message": str(e)}

    def get_cross_positions(self, zoom):
        request = camera_pb2.CrossPositionsRequest(zoom=zoom)
        try:
            response = self.stub.GetCrossPositions(request)
            return {"x": response.x, "y": response.y}
        except grpc.RpcError as e:
            return {"error": str(e)}

    def get_ptz_position(self):
        request = camera_pb2.Empty()
        try:
            response = self.stub.GetPTZPosition(request)
            return {"az": response.az, "el": response.el}
        except grpc.RpcError as e:
            return {"error": str(e)}

    def send_control(self, prop, key, value):
        request = camera_pb2.SendControlRequest()
        request.prop = prop
        request.key = key
        request.value = str(value)
        try:
            response = self.stub.SendControl(request)
            return {"success": response.success, "message": response.message}
        except grpc.RpcError as e:
            return {"success": False, "message": str(e)}

    def set_ptz_direction(self, direction, start):
        request = camera_pb2.SetPTZDirectionRequest()
        request.direction = direction
        request.start = start
        try:
            response = self.stub.SetPTZDirection(request)
            return {"success": response.success, "message": response.message}
        except grpc.RpcError as e:
            return {"success": False, "message": str(e)}
