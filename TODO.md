# TODO: JWT Authentication Enhancements

## Completed Tasks
- [x] Basic JWT login endpoint
- [x] Frontend login component
- [x] Audit logging
- [x] Admin panel access
- [x] Remove old login page

## New Tasks to Implement

### Backend Changes
1. **Add JWT Refresh Endpoint**
   - Add TokenRefreshView to Django URLs
   - Test refresh token functionality

2. **Update Token Lifetimes**
   - Change access token from 5min to 30min
   - Change refresh token from 1day to 2hours
   - Update SIMPLE_JWT settings

### Frontend Changes
3. **Auto-Login on First Visit**
   - Check stored tokens on app startup
   - Validate tokens and auto-login if valid
   - Handle expired tokens gracefully

4. **409 Error Handling**
   - Catch 409 responses from backend
   - Redirect to login page on authentication conflicts
   - Clear invalid tokens

## Implementation Steps
- [ ] Update Django settings for token lifetimes
- [ ] Add refresh endpoint to URLs
- [ ] Update frontend auth store for auto-login
- [ ] Add 409 error handling in API calls
- [ ] Test all scenarios
