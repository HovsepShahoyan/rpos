from django.urls import path
from . import views

urlpatterns = [
    path('telemetry/', views.get_telemetry, name='get_telemetry'),
    path('move/', views.move_ptz, name='move_ptz'),
    path('zoom/', views.set_zoom, name='set_zoom'),
    path('ptzMove/', views.move_ptz, name='ptz_move'),
    path('setSpeed/', views.set_speed, name='set_speed'),
    path('setManualGps/', views.set_manual_gps, name='set_manual_gps'),
    path('setCurrentStream/', views.set_current_stream, name='set_current_stream'),
    path('currentZoom/', views.get_current_zoom, name='get_current_zoom'),
    path('setZoomLevel/', views.set_zoom, name='set_zoom_level'),
    path('crossPositions/', views.get_cross_positions, name='get_cross_positions'),
    path('ptzPosition/', views.get_ptz_position, name='get_ptz_position'),
    path('setResolution/', views.set_resolution, name='set_resolution'),
    path('angles/', views.get_angles, name='get_angles'),
    path('distance/', views.get_distance, name='get_distance'),
    path('loginAttempts/', views.get_login_attempts, name='get_login_attempts'),
    path('scheduleReboot/', views.schedule_reboot, name='schedule_reboot'),
    path('snapshot/', views.take_snapshot, name='take_snapshot'),
    path('logs/', views.get_logs, name='get_logs'),
    path('maptiles/<str:z>/<str:x>/<str:y>/', views.get_map_tile, name='get_map_tile'),
]
