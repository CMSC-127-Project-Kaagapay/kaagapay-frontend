// src/lib/auth.ts

// Function to retrieve the authentication token from localStorage
export function getAuthToken(): string | null {
  const authDataString = localStorage.getItem('sb-sjsgbvfpgxniweyvxemp-auth-token');
  if (authDataString) {
    try {
      const authData = JSON.parse(authDataString);
      return authData.access_token || null;
    } catch (e) {
      console.error("Failed to parse auth data from localStorage", e);
      return null;
    }
  }
  return null;
}
