# Camera List Implementation Plan

## Backend Changes
- [x] Keep only ListAPIView in django_backend/apps/api/view/v1/camear/views.py for listing cameras.
- [x] Keep only cameras/ URL path in django_backend/apps/api/view/v1/urls.py for listing cameras.

## Frontend Changes
- [x] Keep only fetchCameras function in frontend/src/utils/api.js for fetching camera list.
- [x] Update frontend/src/components/Settings.svelte to display the camera list without add/edit/delete functionality.

## Testing and Followup
- [x] Test the GET /api/v1/cameras/ endpoint for listing cameras.
- [ ] Test the frontend camera list display.
- [x] Ensure authentication is handled properly (removed authentication for camera list).
