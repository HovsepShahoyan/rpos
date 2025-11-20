# TODO: Update Login and Refresh Endpoints to Extract User Info from Token

- [x] Update `LoginAPIView` in `django_backend/apps/api/view/v1/users/view.py` to decode the access token and get user_id/username from token instead of request.
- [x] Create a new `RefreshAPIView` in `django_backend/apps/api/view/v1/users/view.py` that customizes the response to include user_id and username from the refreshed access token.
- [x] Update `django_backend/apps/api/view/v1/urls.py` to import and use `RefreshAPIView` instead of `TokenRefreshView`.
