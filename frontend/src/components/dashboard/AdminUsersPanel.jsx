import { Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import { roleLabels } from "../../utils/roles";

const manageableRoles = ["super_admin", "owner", "manager", "member", "guest"];

const formatRoleLabel = (role) => roleLabels[role] || role.replace("_", " ");

const AdminUsersPanel = ({ dashboard, onRefresh }) => {
  const { user: currentUser } = useAuth();
  const allUsers = dashboard.tables?.allUsers || [];
  const activeUsers = allUsers.filter((user) => user.status === "Active").length;
  const ownerUsers = allUsers.filter((user) => user.roleKey === "owner").length;
  const [roleSelections, setRoleSelections] = useState(() =>
    allUsers.reduce((accumulator, user) => {
      accumulator[user.id] = user.roleKey || "member";
      return accumulator;
    }, {})
  );
  const [savingUserId, setSavingUserId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const sortedUsers = useMemo(
    () => [...allUsers].sort((left, right) => left.name.localeCompare(right.name)),
    [allUsers]
  );

  useEffect(() => {
    setRoleSelections(
      allUsers.reduce((accumulator, user) => {
        accumulator[user.id] = user.roleKey || "member";
        return accumulator;
      }, {})
    );
  }, [allUsers]);

  const handleRoleChange = (userId, nextRole) => {
    setRoleSelections((current) => ({
      ...current,
      [userId]: nextRole,
    }));
  };

  const handleSaveRole = async (user) => {
    const nextRole = roleSelections[user.id];
    if (!nextRole || nextRole === user.roleKey) {
      setFeedback({
        type: "info",
        message: `No role change needed for ${user.name}.`,
      });
      return;
    }

    try {
      setSavingUserId(user.id);
      setFeedback({ type: "", message: "" });
      const { data } = await api.patch(`/admin/users/${user.id}/role`, {
        role: nextRole,
      });

      setFeedback({
        type: "success",
        message: data.message || `${user.name}'s role updated successfully.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Could not update ${user.name}'s role right now.`,
      });
      setRoleSelections((current) => ({
        ...current,
        [user.id]: user.roleKey,
      }));
    } finally {
      setSavingUserId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">All Users</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Platform user management</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Review who is active, which role they hold, and how many workspaces they currently influence.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Users" value={dashboard.metrics.totalUsers || 0} hint="Registered across the platform" icon={Users} accent="from-blue-500 to-indigo-500" />
        <StatsCard title="Active Users" value={activeUsers} hint="Recently active in workspaces" icon={ShieldCheck} accent="from-emerald-500 to-teal-500" delay={0.05} />
        <StatsCard title="Owner Accounts" value={ownerUsers} hint="Users driving project delivery" icon={UserPlus} accent="from-fuchsia-500 to-violet-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800">
            <h3 className="font-display text-2xl font-bold">All User Directory</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Change platform-level access for owners, managers, members, and guest users.
            </p>
          </div>

          {feedback.message ? (
            <div
              className={`mx-6 mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                feedback.type === "error"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                  : feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          {sortedUsers.length > 0 ? (
            <div className="overflow-x-auto px-6 pb-6 pt-5">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="pb-4 font-semibold">User</th>
                    <th className="pb-4 font-semibold">Email</th>
                    <th className="pb-4 font-semibold">Projects</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold">Joined</th>
                    <th className="pb-4 font-semibold">Role</th>
                    <th className="pb-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => {
                    const selectedRole = roleSelections[user.id] || user.roleKey;
                    const isSaving = savingUserId === user.id;
                    const isCurrentAdmin = currentUser?._id === user.id;

                    return (
                      <tr key={user.id} className="border-t border-slate-200/70 dark:border-slate-800">
                        <td className="py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-brand-500">
                              {formatRoleLabel(user.roleKey)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">{user.projects}</td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">{user.status}</td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">{user.joined}</td>
                        <td className="py-4">
                          <select
                            value={selectedRole}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            disabled={isSaving || isCurrentAdmin}
                          >
                            {manageableRoles.map((role) => (
                              <option key={role} value={role}>
                                {formatRoleLabel(role)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4">
                          <button
                            type="button"
                            onClick={() => handleSaveRole(user)}
                            disabled={isSaving || selectedRole === user.roleKey || isCurrentAdmin}
                            className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-500 px-4 py-2 font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isCurrentAdmin
                              ? "Current admin"
                              : isSaving
                                ? "Saving..."
                                : selectedRole === user.roleKey
                                  ? "Up to date"
                                  : "Update role"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-300">
              No users have joined the platform yet.
            </div>
          )}
        </section>

        <ActivityFeed
          title="Admin Notes"
          items={(dashboard.feeds?.adminReports || []).map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
          }))}
          emptyText="No admin updates are available yet."
          delay={0.05}
        />
      </div>
    </div>
  );
};

export default AdminUsersPanel;
