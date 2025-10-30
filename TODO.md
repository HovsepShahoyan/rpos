# Camera REST API Implementation Plan

## Backend Changes
- [x] Convert to ModelViewSet in django_backend/apps/api/view/v1/camear/views.py for full REST API.
- [x] Update django_backend/apps/api/view/v1/urls.py to use DefaultRouter for automatic URL generation.

## Frontend Changes
- [x] Add addCamera, updateCamera, deleteCamera functions to frontend/src/utils/api.js for full CRUD operations.
- [x] Update frontend/src/components/Settings.svelte to include add/edit/delete functionality for cameras.

## Testing and Followup
- [ ] Test all REST API endpoints (GET, POST, PUT, DELETE for cameras).
- [ ] Test the frontend camera management UI.
- [x] Ensure authentication is handled properly (removed authentication for camera list).
