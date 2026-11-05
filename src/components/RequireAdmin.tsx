import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ApiError, getAdminMe } from '@/src/lib/api';
import { getAuthToken } from '@/src/lib/auth';

type Access = 'checking' | 'allowed' | 'signed-out' | 'not-admin' | { error: string };

/**
 * Wraps the admin pages. The API is what really blocks non-admins; this keeps everyone else from
 * seeing an empty admin screen: signed-out people go to the login page, signed-in non-admins go home.
 */
export default function RequireAdmin() {
  const [access, setAccess] = useState<Access>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setAccess('checking');
    const token = getAuthToken();
    if (!token) {
      setAccess('signed-out');
      return;
    }
    getAdminMe(token)
      .then(() => !cancelled && setAccess('allowed'))
      .catch((err: any) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) setAccess('signed-out');
        else if (err instanceof ApiError && err.status === 403) setAccess('not-admin');
        else setAccess({ error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (access === 'allowed') return <Outlet />;
  if (access === 'signed-out') return <Navigate to="/login" replace />;
  if (access === 'not-admin') return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-40 text-center">
      {access === 'checking' ? (
        <p role="status" className="text-on-surface-variant">Checking your access…</p>
      ) : (
        <div className="space-y-2">
          <p role="alert" className="font-medium text-on-surface">Could not check your access: {access.error}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
