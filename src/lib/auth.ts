// src/lib/auth.ts

// supabase-js keeps the session under `sb-<project ref>-auth-token`, where the project ref is the first
// part of the project's URL. Derive it from the configured URL so every Supabase project works.
function authStorageKey(): string {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  try {
    return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
  } catch {
    return 'sb-auth-token';
  }
}

// Function to retrieve the authentication token from localStorage
export function getAuthToken(): string | null {
  const authDataString = localStorage.getItem(authStorageKey());
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
