# django_backend

This directory will contain the Django project for the migrated backend. See requirements.txt for dependencies.

## gRPC Stub Generation (Python)

Run the following command from /home/jetson/rpos/django_backend:

```
python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/camera.proto
```

This will generate camera_pb2.py and camera_pb2_grpc.py for use in Django views.
