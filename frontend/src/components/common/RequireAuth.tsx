import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";

import { isAuthenticated } from "../../api/auth";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { dashboardPath, type UserRole } from "../../features/auth/paths";

/**
 * Gates buyer-only pages (checkout, orders) behind authentication.
 * Unauthenticated visitors are sent to the login page instead of hitting a 401
 * from the API.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Gates a page behind authentication *and* a role.
 *
 * `RequireAuth` only knows about tokens; this knows about the account behind
 * them, so a buyer following a `/admin` link gets a polite explanation instead
 * of a table full of 403s. The role comes from `GET /auth/me/` (the JWT itself
 * carries no role claim), so a short loading state covers the first hop.
 */
export function RequireRole({
  role,
  children,
}: {
  role: UserRole | UserRole[];
  children: ReactNode;
}) {
  const { data: user, isLoading } = useCurrentUser();

  if (!isAuthenticated()) {
    const next = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (isLoading || !user) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-cream">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="size-7 animate-spin rounded-full border-2 border-forest-200 border-t-forest-700" />
          <p className="text-xs font-bold uppercase tracking-widest">
            Checking your access…
          </p>
        </div>
      </main>
    );
  }

  const allowed = Array.isArray(role)
    ? role.includes(user.role)
    : user.role === role;

  if (!allowed) {
    return <WrongRole role={user.role} />;
  }

  return <>{children}</>;
}

function WrongRole({ role }: { role: UserRole }) {
  return (
    <main className="grid min-h-[60vh] place-items-center bg-cream px-5">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-forest-50 text-forest-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-6"
          >
            <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </span>

        <h1 className="mt-4 text-lg font-extrabold text-ink">
          This area isn't for you
        </h1>

        <p className="mt-2 text-sm text-muted">
          You're signed in as a {role}. That page belongs to another role, so
          we've stopped you here rather than show you an error on every
          request.
        </p>

        <Link
          to={dashboardPath(role)}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-forest-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-forest-800"
        >
          Go to your dashboard
        </Link>
      </div>
    </main>
  );
}
