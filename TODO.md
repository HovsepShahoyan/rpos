# TODO: Implement JWT-Based Login Endpoint in Django Backend

## Steps to Complete

1. **Update Dependencies**
   - Add `djangorestframework-simplejwt` to `django_backend/pyproject.toml` under dependencies.
   - Install the package using `pip install djangorestframework-simplejwt` (run in django_backend directory).

2. **Update Django Settings**
   - Edit `django_backend/backend/settings.py`:
     - Add `'rest_framework_simplejwt'` to `INSTALLED_APPS`.
     - Update `REST_FRAMEWORK` to include `JWTAuthentication` and set default permissions to `IsAuthenticated`.
     - Add JWT configuration settings (e.g., token lifetimes).

3. **Modify Login View**
   - Edit `django_backend/apps/api/view/v1/users/view.py`:
     - Replace `ObtainAuthToken` with `TokenObtainPairView` from `rest_framework_simplejwt`.
     - Update the response to include access and refresh tokens.
     - Keep audit logging for login events.

4. **Update Logout View (Optional)**
   - Edit `django_backend/apps/api/view/v1/users/view.py`:
     - Simplify logout to return a success message (since JWT is stateless).
     - Keep audit logging for logout events.

5. **Verify URLs**
   - Check `django_backend/apps/api/view/v1/urls.py` to ensure routes are correct (may need to update imports if views change).

6. **Test Implementation**
   - Run Django server and test login endpoint (e.g., via curl or Postman) to ensure JWT tokens are generated.
   - Verify logout and token refresh if implemented.

7. **Frontend Integration Notes**
   - Update frontend (Svelte) to handle JWT: store tokens in localStorage, send in Authorization headers.
   - Add token refresh logic if needed.
   - Example: In `frontend/src/utils/api.js`, modify fetch calls to include `Authorization: Bearer ${accessToken}`.
   - Handle token expiration by checking response status and refreshing if needed.

## Progress Tracking
- [x] Step 1: Update Dependencies
- [x] Step 2: Update Settings
- [x] Step 3: Modify Login View
- [x] Step 4: Update Logout View
- [x] Step 5: Verify URLs
- [x] Step 6: Test Implementation
- [x] Step 7: Frontend Notes (if applicable)
- [x] Create Auth Store (`frontend/src/stores/auth.js`)
- [x] Create Login Component (`frontend/src/components/Login.svelte`) with Aragats branding and military theme
- [x] Update App.svelte for auth routing
- [x] Update api.js for JWT headers
- [x] Add logout to Navigation with user info
