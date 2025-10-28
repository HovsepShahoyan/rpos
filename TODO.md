# TODO: Fix Frontend Buttons Not Working

## Information Gathered
- Frontend buttons in FastLive.svelte are using fetch('/') to post control commands, which fails in the new Svelte + Django + gRPC setup.
- Old Node.js server handled these POSTs, but now frontend is separate.
- Need to add new gRPC methods for controls, update Django backend, and modify frontend to use new API endpoints.

## Plan
1. Update proto/camera.proto to add SendControl and SetPTZDirection RPCs and messages. ✅
2. Regenerate protobuf files for Python and JS. ✅
3. Update grpc_server/server.js to implement new RPCs. ✅
4. Update django_backend/api/grpc_client.py to add client methods. ✅
5. Update django_backend/api/views.py to add new views. ✅
6. Update django_backend/api/urls.py to add new URL patterns. ✅
7. Update frontend/src/utils/api.js to add new API functions. ✅
8. Update frontend/src/components/FastLive.svelte to use new API functions instead of fetch('/'). ✅
9. Test by running servers and checking button functionality.

## Dependent Files to Edit
- proto/camera.proto ✅
- grpc_server/server.js ✅
- django_backend/api/grpc_client.py ✅
- django_backend/api/views.py ✅
- django_backend/api/urls.py ✅
- frontend/src/utils/api.js ✅
- frontend/src/components/FastLive.svelte ✅

## Followup Steps
- Regenerate protobuf files after proto update. ✅
- Restart all servers (gRPC, Django, Node.js).
- Test buttons in browser, check console and logs for errors.
- If issues, debug network requests and gRPC calls.
