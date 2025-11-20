 import { writable, derived } from 'svelte/store';

export const auth = writable({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null
});

export const currentUser = writable(null);

// Derived stores for easier access
export const accessToken = derived(auth, $auth => $auth.accessToken);
export const refreshAccessToken = derived(auth, $auth => $auth.refreshToken);
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);

export async function login(username, password) {
  try {
    const response = await fetch('http://192.168.0.104:8000/api/v1/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const authData = {
        isAuthenticated: true,
        user: { id: data.user_id, username: data.username },
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      };

      auth.set(authData);
      currentUser.set(authData.user);

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify(authData));
      }

      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function refreshToken() {
  const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!currentAuth.refreshToken) return false;

  try {
    const response = await fetch('/api/v1/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: currentAuth.refreshToken
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Decode the new access token to get user_id and username
      const token = JSON.parse(atob(data.access_token.split('.')[1]));
      const user_id = token.user_id;
      const username = token.username;

      const authData = {
        ...currentAuth,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || currentAuth.refreshToken, // Update if new refresh token provided
        user: { id: user_id, username: username } // Update user info from token
      };

      auth.set(authData);
      currentUser.set(authData.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify(authData));
      }
      return true;
    }
      // Refresh token expired, logout
      logout();
      return false;
    }
  } catch (error) {
    logout();
    return false;
  }
}

export function logout() {
  auth.set({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null
  });
  currentUser.set(null);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
  }
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (e) {
    return true; // If can't decode, consider expired
  }
}

export async function initAuth() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        // Validate tokens on app start
        if (authData.accessToken && authData.refreshToken) {
          if (!isTokenExpired(authData.accessToken)) {
            auth.set(authData);
            currentUser.set(authData.user);
            return;
          } else {
            // Try to refresh token
            const refreshed = await refreshToken();
            if (refreshed) {
              return;
            }
          }
        }
        // If we get here, tokens are invalid
        localStorage.removeItem('auth');
      } catch (e) {
        localStorage.removeItem('auth');
      }
    }
  }
}
