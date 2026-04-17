import { Ban, CheckCircle2, Loader2, ShieldCheck, Trash2, UserPlus, Users, XCircle } from "lucide-react";
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
  const pendingOwnerApprovals = allUsers.filter((user) => user.ownerAccessStatus === "pending").length;
  const [roleSelections, setRoleSelections] = useState(() =>
    allUsers.reduce((accumulator, user) => {
      accumulator[user.id] = user.roleKey || "member";
      return accumulator;
    }, {})
  );
  const [savingUserId, setSavingUserId] = useState("");
  const [actionLoading, setActionLoading] = useState("");
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

  const handleBlockToggle = async (user) => {
    try {
      setActionLoading(`block:${user.id}`);
      setFeedback({ type: "", message: "" });
      const { data } = await api.patch(`/admin/users/${user.id}/block`, {
        blocked: !user.isBlocked,
      });

      setFeedback({
        type: "success",
        message: data.message || `${user.name} updated successfully.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Could not update ${user.name}'s access right now.`,
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}'s account? This will remove their access from the platform.`);
    if (!confirmed) return;

    try {
      setActionLoading(`delete:${user.id}`);
      setFeedback({ type: "", message: "" });
      const { data } = await api.delete(`/admin/users/${user.id}`);

      setFeedback({
        type: "success",
        message: data.message || `${user.name} deleted successfully.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Could not delete ${user.name} right now.`,
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleApproveOwnerRequest = async (user) => {
    try {
      setActionLoading(`approve:${user.id}`);
      setFeedback({ type: "", message: "" });
      const { data } = await api.patch(`/admin/users/${user.id}/owner-approval`);

      setFeedback({
        type: "success",
        message: data.message || `${user.name} is now approved as a project owner.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Could not approve ${user.name}'s owner access right now.`,
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleRejectOwnerRequest = async (user) => {
    try {
      setActionLoading(`reject:${user.id}`);
      setFeedback({ type: "", message: "" });
      const { data } = await api.patch(`/admin/users/${user.id}/owner-rejection`);

      setFeedback({
        type: "success",
        message: data.message || `${user.name}'s owner access request was declined.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Could not reject ${user.name}'s owner access right now.`,
      });
    } finally {
      setActionLoading("");
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Users" value={dashboard.metrics.totalUsers || 0} hint="Registered across the platform" icon={Users} accent="from-blue-500 to-indigo-500" />
        <StatsCard title="Active Users" value={activeUsers} hint="Recently active in workspaces" icon={ShieldCheck} accent="from-emerald-500 to-teal-500" delay={0.05} />
        <StatsCard title="Owner Accounts" value={ownerUsers} hint="Users driving project delivery" icon={UserPlus} accent="from-fuchsia-500 to-violet-500" delay={0.1} />
        <StatsCard title="Owner Requests" value={dashboard.metrics.pendingOwnerApprovals || pendingOwnerApprovals} hint="Waiting for super admin review" icon={CheckCircle2} accent="from-amber-500 to-orange-500" delay={0.15} />
      </div>

      <div className="space-y-6">
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
            <div className="space-y-2.5 px-5 pb-5 pt-4">
              {sortedUsers.map((user) => {
                const selectedRole = roleSelections[user.id] || user.roleKey;
                const isSaving = savingUserId === user.id;
                const isCurrentAdmin = currentUser?._id === user.id;
                const isBlocking = actionLoading === `block:${user.id}`;
                const isDeleting = actionLoading === `delete:${user.id}`;
                const isApprovingOwner = actionLoading === `approve:${user.id}`;
                const isRejectingOwner = actionLoading === `reject:${user.id}`;
                const hasPendingOwnerRequest = user.ownerAccessStatus === "pending";

                return (
                  <div
                    key={user.id}
                    className="rounded-[1.1rem] border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
                  >
                    <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex min-w-0 items-center gap-2.5">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-lg shadow-brand-500/10"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-brand-500/20">
                                {user.name?.slice(0, 1)?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <p className="truncate text-[14px] font-semibold leading-5 text-slate-900 dark:text-white">{user.name}</p>
                                <div className="inline-flex rounded-full bg-brand-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand-600 dark:text-brand-300">
                                  {formatRoleLabel(user.roleKey)}
                                </div>
                              </div>
                              <p className="mt-0.5 truncate text-[12px] leading-4.5 text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {user.projects} projects
                            </div>
                            <div className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              user.isBlocked
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}>
                              {user.status}
                            </div>
                            <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {user.joined}
                            </div>
                            {hasPendingOwnerRequest ? (
                              <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                Owner request pending
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 rounded-[0.95rem] border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                        <div className="grid gap-1.5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Role Control
                          </p>
                          <select
                            value={selectedRole}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-700 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            disabled={isSaving || isCurrentAdmin}
                          >
                            {manageableRoles.map((role) => (
                              <option key={role} value={role}>
                                {formatRoleLabel(role)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-1.5 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => handleSaveRole(user)}
                            disabled={isSaving || selectedRole === user.roleKey || isCurrentAdmin}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1"
                          >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isCurrentAdmin
                              ? "Current admin"
                              : isSaving
                                ? "Saving..."
                                : selectedRole === user.roleKey
                                  ? "Saved"
                                  : "Save role"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBlockToggle(user)}
                            disabled={isCurrentAdmin || isBlocking || isDeleting || isApprovingOwner || isRejectingOwner}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.isBlocked
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-300"
                                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                            }`}
                          >
                            {isBlocking ? <Loader2 size={16} className="animate-spin" /> : <Ban size={15} />}
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isCurrentAdmin || isDeleting || isBlocking || isApprovingOwner || isRejectingOwner}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 px-2.5 py-1.5 text-[12px] font-semibold text-rose-600 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-300"
                          >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
                            Delete
                          </button>
                        </div>

                        {hasPendingOwnerRequest ? (
                          <div className="grid gap-1.5 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => handleApproveOwnerRequest(user)}
                              disabled={isCurrentAdmin || isApprovingOwner || isRejectingOwner || isSaving}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 px-2.5 py-1.5 text-[12px] font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300"
                            >
                              {isApprovingOwner ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={15} />}
                              Approve Owner
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectOwnerRequest(user)}
                              disabled={isCurrentAdmin || isApprovingOwner || isRejectingOwner || isSaving}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-200/80 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              {isRejectingOwner ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={15} />}
                              Reject Request
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-300">
              No users have joined the platform yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminUsersPanel;
