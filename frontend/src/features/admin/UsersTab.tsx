import { Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminUsers, useUpdateAdminUser } from "./data/hooks";
import type { AdminUserApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

const ROLES: AdminUserApi["role"][] = ["buyer", "farmer", "admin"];

/**
 * The account directory. An admin can re-role or suspend someone; email and the
 * order count are read-only on the server, so they're display-only here too.
 */
export default function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    if (!users) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle),
    );
  }, [users, query]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
            Accounts
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-ink">Every user</h2>
        </div>

        <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-cream px-3 lg:w-72">
          <Search size={15} className="shrink-0 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email…"
            className="min-w-0 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
          <UserRound size={26} className="mx-auto text-stone-400" />
          <p className="mt-3 text-sm font-bold text-ink">No accounts found</p>
          <p className="mt-1 text-xs text-muted">
            {query ? "Try a different name or email." : "Nobody has signed up yet."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-150 border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Orders</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Joined</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-200">
              {visible.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function UserRow({ user }: { user: AdminUserApi }) {
  const update = useUpdateAdminUser();
  const toast = useToast();

  function submit(
    payload: { role?: AdminUserApi["role"]; is_active?: boolean },
    successMessage: string,
  ) {
    update.mutate(
      { userId: user.id, payload },
      {
        onSuccess: () => toast.success("Updated", successMessage),
        onError: (error) =>
          toast.error("Could not update", resolveApiError(error).message),
      },
    );
  }

  function handleRoleChange(role: AdminUserApi["role"]) {
    if (role === user.role) return;
    submit({ role }, `${user.name} is now a ${role}.`);
  }

  function handleToggleActive() {
    submit(
      { is_active: !user.is_active },
      `${user.name} can${user.is_active ? "not" : " now"} sign in.`,
    );
  }

  return (
    <tr className="text-sm">
      <td className="py-3.5 pr-4">
        <p className="font-bold text-ink">{user.name}</p>
        <p className="text-[11px] text-muted">{user.email}</p>
      </td>

      <td className="py-3.5 pr-4">
        <select
          value={user.role}
          onChange={(event) =>
            handleRoleChange(event.target.value as AdminUserApi["role"])
          }
          disabled={update.isPending}
          className="rounded-lg border border-stone-200 bg-cream px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none transition focus:border-forest-600 disabled:opacity-60"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </td>

      <td className="py-3.5 pr-4 text-[11px] font-bold text-muted">
        {user.order_count}
      </td>

      <td className="py-3.5 pr-4">
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={update.isPending}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-60 ${
            user.is_active
              ? "bg-forest-50 text-forest-700 hover:bg-forest-100"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          {user.is_active ? "Active" : "Suspended"}
        </button>
      </td>

      <td className="py-3.5 text-[11px] text-muted">
        {new Date(user.created_at).toLocaleDateString(undefined, {
          dateStyle: "medium",
        })}
      </td>
    </tr>
  );
}
