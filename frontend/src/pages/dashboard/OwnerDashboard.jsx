import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Owner overview",
  team: "Team members",
  boards: "Board operations",
  tasks: "Task operations",
  calendar: "Calendar and deadlines",
  reports: "Performance reports",
  billing: "Billing and plans",
};

const statusLabels = {
  todo: "Todo",
  inprogress: "In Progress",
  review: "Review",
  done: "Done",
};

const roleLabels = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
};

const OwnerDashboard = ({ dashboard, section = "overview", onRefresh }) => {
  const [inviteForm, setInviteForm] = useState({
    projectId: dashboard.projects?.[0]?._id || "",
    email: "",
    role: "member",
  });
  const [savingKey, setSavingKey] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const projectRows = dashboard.tables?.projectHealth || [];
  const productivitySeries = dashboard.charts?.weeklyCompleted || [];
  const activityItems = dashboard.feeds?.activity || [];
  const deadlines = dashboard.feeds?.deadlines || [];
  const teamDirectory = dashboard.tables?.teamDirectory || [];
  const taskOperations = dashboard.tables?.taskOperations || [];
  const billingSummary = dashboard.tables?.billingSummary || [];
  const statusMix = dashboard.charts?.statusMix || [];
  const teamHighlights = dashboard.feeds?.teamHighlights || [];

  const projectOptions = useMemo(
    () =>
      (dashboard.projects || []).map((project) => ({
        id: project._id,
        title: project.title,
      })),
    [dashboard.projects]
  );

  useEffect(() => {
    if (!projectOptions.length) return;

    setInviteForm((current) => {
      const hasCurrentProject = projectOptions.some((project) => project.id === current.projectId);
      if (hasCurrentProject) return current;

      return {
        ...current,
        projectId: projectOptions[0].id,
      };
    });
  }, [projectOptions]);

  const teamGroups = useMemo(() => {
    const groups = new Map();
    teamDirectory.forEach((member) => {
      if (!groups.has(member.projectId)) {
        groups.set(member.projectId, {
          projectId: member.projectId,
          project: member.project,
          members: [],
        });
      }
      groups.get(member.projectId).members.push(member);
    });
    return [...groups.values()];
  }, [teamDirectory]);

  const handleInviteMember = async (event) => {
    event.preventDefault();

    if (!inviteForm.projectId) {
      setFeedback({ type: "error", message: "Select a project before inviting a teammate." });
      return;
    }

    try {
      setSavingKey("invite");
      setFeedback({ type: "", message: "" });
      const { data } = await api.post(`/projects/${inviteForm.projectId}/invite`, {
        email: inviteForm.email,
        role: inviteForm.role,
      });

      setInviteForm((current) => ({
        ...current,
        email: "",
        role: "member",
      }));
      setFeedback({
        type: "success",
        message: data?.title ? `${data.title} updated successfully.` : "Member invited successfully.",
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || "Unable to invite this teammate right now.",
      });
    } finally {
      setSavingKey("");
    }
  };

  const handleMemberRoleUpdate = async (member, nextRole) => {
    try {
      setSavingKey(`role:${member.id}`);
      setFeedback({ type: "", message: "" });
      await api.patch(`/projects/${member.projectId}/members/${member.memberId}`, { role: nextRole });
      setFeedback({
        type: "success",
        message: `${member.name}'s project role was updated to ${roleLabels[nextRole] || nextRole}.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Unable to update ${member.name}'s project role right now.`,
      });
    } finally {
      setSavingKey("");
    }
  };

  const handleRemoveMember = async (member) => {
    const confirmed = window.confirm(`Remove ${member.name} from ${member.project}?`);
    if (!confirmed) return;

    try {
      setSavingKey(`remove:${member.id}`);
      setFeedback({ type: "", message: "" });
      await api.delete(`/projects/${member.projectId}/members/${member.memberId}`);
      setFeedback({
        type: "success",
        message: `${member.name} was removed from ${member.project}.`,
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || `Unable to remove ${member.name} right now.`,
      });
    } finally {
      setSavingKey("");
    }
  };

  const renderOverview = () => (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TaskTable
          title="Recent Projects Grid"
          columns={[
            { key: "project", label: "Project" },
            { key: "progress", label: "Progress" },
            { key: "deadline", label: "Deadline" },
            { key: "members", label: "Members" },
          ]}
          rows={projectRows}
          emptyText="Create your first project to start assigning work."
        />
        <ActivityFeed title="Team Activity Feed" items={activityItems} emptyText="Team activity will appear here as work progresses." delay={0.05} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Productivity Graph" subtitle="Tasks completed across the week">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#14b8a6" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ActivityFeed
          title="Upcoming Deadlines"
          items={deadlines}
          emptyText="No deadlines scheduled this week."
          delay={0.1}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/projects" className="glass-panel rounded-[2rem] p-5 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <FolderKanban className="text-brand-500" />
            <ArrowRight size={16} className="text-slate-400" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Create Project</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start a new workspace with description, deadline, and delivery structure.</p>
        </Link>
        <Link to="/dashboard/team" className="glass-panel rounded-[2rem] p-5 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <UserPlus className="text-indigo-500" />
            <ArrowRight size={16} className="text-slate-400" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Add Members</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Invite managers and teammates into the right project with role-based access.</p>
        </Link>
        <Link to="/dashboard/tasks" className="glass-panel rounded-[2rem] p-5 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="text-emerald-500" />
            <ArrowRight size={16} className="text-slate-400" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Assign Tasks</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Open board-level tasks, delegate work, and keep execution moving.</p>
        </Link>
        <Link to="/dashboard/reports" className="glass-panel rounded-[2rem] p-5 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <TrendingUp className="text-fuchsia-500" />
            <ArrowRight size={16} className="text-slate-400" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">View Reports</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Monitor project health, completion rate, and delivery confidence.</p>
        </Link>
      </div>
    </>
  );

  const renderTeamSection = () => (
    <>
      {feedback.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            feedback.type === "error"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleInviteMember} className="glass-panel rounded-[2rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Team Setup</p>
          <h3 className="mt-3 font-display text-2xl font-bold">Invite managers and members</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Build your delivery team, promote a manager, and bring specialists into the right project.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label-text">Project</label>
              <select
                className="input-field"
                value={inviteForm.projectId}
                onChange={(event) => setInviteForm((current) => ({ ...current, projectId: event.target.value }))}
              >
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Member Email</label>
              <input
                type="email"
                className="input-field"
                value={inviteForm.email}
                onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="member@company.com"
                required
              />
            </div>
            <div>
              <label className="label-text">Project Role</label>
              <select
                className="input-field"
                value={inviteForm.role}
                onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="manager">Manager</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={savingKey === "invite"} className="gradient-button mt-6 w-full">
            {savingKey === "invite" ? "Inviting..." : "Add Member"}
          </button>
        </form>

        <ActivityFeed
          title="Team Highlights"
          items={teamHighlights}
          emptyText="Your project team will appear here once members are added."
          delay={0.05}
        />
      </div>

      <div className="space-y-4">
        {teamGroups.length > 0 ? (
          teamGroups.map((group) => (
            <section key={group.projectId} className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-bold">{group.project}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage managers and project members in this workspace.
                  </p>
                </div>
                <Link
                  to={`/projects/${group.projectId}`}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-brand-500"
                >
                  Open Board
                </Link>
              </div>

              <div className="mt-5 grid gap-3">
                {group.members.map((member) => {
                  const isRoleSaving = savingKey === `role:${member.id}`;
                  const isRemoving = savingKey === `remove:${member.id}`;

                  return (
                    <div
                      key={member.id}
                      className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="h-11 w-11 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 font-bold text-white">
                              {member.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">{member.name}</p>
                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <select
                            defaultValue={member.role}
                            onChange={(event) => handleMemberRoleUpdate(member, event.target.value)}
                            disabled={isRoleSaving || isRemoving}
                            className="input-field min-w-[160px] py-2.5"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="member">Member</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            disabled={isRoleSaving || isRemoving}
                            className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20 disabled:opacity-60 dark:text-rose-300"
                          >
                            {isRemoving ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500 dark:text-slate-300">
            No team members are assigned yet. Invite a manager or member to start building the project team.
          </div>
        )}
      </div>
    </>
  );

  const renderBoardsSection = () => (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projectRows.length > 0 ? (
        projectRows.map((project) => (
          <div key={project.id} className="glass-panel rounded-[2rem] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-500">Board</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{project.project}</h3>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {project.progress}
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tasks</p>
                <p className="mt-2 text-lg font-bold">{project.tasks}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pending</p>
                <p className="mt-2 text-lg font-bold">{project.pending}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Review</p>
                <p className="mt-2 text-lg font-bold">{project.review}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Deadline: {project.deadline}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Members: {project.members}</p>
            <Link
              to={`/projects/${project.projectId}`}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
            >
              Open Board
              <ArrowRight size={16} />
            </Link>
          </div>
        ))
      ) : (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500 dark:text-slate-300">
          No boards are available yet.
        </div>
      )}
    </div>
  );

  const renderTasksSection = () => (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <TaskTable
        title="Task Operations"
        columns={[
          { key: "task", label: "Task" },
          { key: "project", label: "Project" },
          { key: "assignee", label: "Assignee" },
          { key: "priority", label: "Priority" },
          { key: "status", label: "Status" },
          { key: "deadline", label: "Deadline" },
        ]}
        rows={taskOperations.map((task) => ({
          ...task,
          status: statusLabels[task.status] || task.status,
          priority: task.priority?.charAt(0)?.toUpperCase() + task.priority?.slice(1),
        }))}
        emptyText="No tasks are assigned yet."
      />
      <ActivityFeed
        title="Task Approval Focus"
        items={taskOperations
          .filter((task) => task.status === "review" || task.priority === "high")
          .slice(0, 8)
          .map((task) => ({
            id: task.id,
            title: task.task,
            subtitle: `${task.project} • ${task.assignee} • ${task.priority} priority`,
          }))}
        emptyText="High-priority and review tasks will appear here."
        delay={0.05}
      />
    </div>
  );

  const renderCalendarSection = () => (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <ActivityFeed
        title="Deadline Timeline"
        items={deadlines}
        emptyText="No upcoming deadlines are scheduled."
      />
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-brand-500" />
          <div>
            <h3 className="font-display text-2xl font-bold">Calendar Summary</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use this view to watch delivery timing across your owned workspaces.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {projectRows.map((project) => (
            <div key={project.id} className="rounded-[1.4rem] bg-slate-100 p-4 dark:bg-slate-800/70">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900 dark:text-white">{project.project}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {project.deadline}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {project.members} members working toward {project.progress} completion.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportsSection = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Weekly Completion" subtitle="Completed tasks across owned workspaces">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Task Status Mix" subtitle="Execution balance across all owned project tasks">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>
                {statusMix.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.name === "Done"
                        ? "#10b981"
                        : entry.name === "Review"
                          ? "#8b5cf6"
                          : entry.name === "In Progress"
                            ? "#06b6d4"
                            : "#f59e0b"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <TaskTable
        title="Project Performance Report"
        columns={[
          { key: "project", label: "Project" },
          { key: "progress", label: "Progress" },
          { key: "tasks", label: "Tasks" },
          { key: "pending", label: "Pending" },
          { key: "review", label: "Review" },
          { key: "deadline", label: "Deadline" },
        ]}
        rows={projectRows}
        emptyText="Report data will appear once projects are active."
      />
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Active Managers"
          value={dashboard.metrics.activeManagers || 0}
          hint="Managers across owned projects"
          icon={ShieldCheck}
          accent="from-brand-500 to-cyan-500"
        />
        <StatsCard
          title="Workspace Value"
          value={dashboard.metrics.ownerWorkspaceValue || "$0"}
          hint="Estimated monthly workspace usage"
          icon={ReceiptText}
          accent="from-emerald-500 to-teal-500"
          delay={0.05}
        />
        <StatsCard
          title="Project Portfolio"
          value={dashboard.metrics.totalProjects || 0}
          hint="Tracked billing workspaces"
          icon={BriefcaseBusiness}
          accent="from-fuchsia-500 to-violet-500"
          delay={0.1}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TaskTable
          title="Billing Snapshot"
          columns={[
            { key: "workspace", label: "Workspace" },
            { key: "members", label: "Members" },
            { key: "plan", label: "Plan" },
            { key: "value", label: "Estimated Value" },
          ]}
          rows={billingSummary}
          emptyText="Billing data will appear once projects are live."
        />
        <ActivityFeed
          title="Owner Billing Notes"
          items={[
            {
              id: "billing-1",
              title: `${dashboard.metrics.totalProjects || 0} owned projects are currently being tracked`,
              subtitle: "Use project size and team count to plan the next workspace tier.",
            },
            {
              id: "billing-2",
              title: `${dashboard.metrics.teamMembers || 0} collaborators are active across your portfolio`,
              subtitle: "Larger delivery teams move projects toward growth and scale workspace plans.",
            },
            {
              id: "billing-3",
              title: `${dashboard.metrics.ownerWorkspaceValue || "$0"} is your estimated monthly workspace value`,
              subtitle: "This reflects a simple plan model based on project team size.",
            },
          ]}
          emptyText="Billing notes are unavailable right now."
          delay={0.05}
        />
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "team":
        return renderTeamSection();
      case "boards":
        return renderBoardsSection();
      case "tasks":
        return renderTasksSection();
      case "calendar":
        return renderCalendarSection();
      case "reports":
        return renderReportsSection();
      case "billing":
        return renderBillingSection();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Project Owner</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Owner overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Create projects, add managers, invite team members, assign work, monitor progress, and approve delivery outcomes across every owned workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total Projects" value={dashboard.metrics.totalProjects} hint="Workspaces you oversee" icon={FolderKanban} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Team Members" value={dashboard.metrics.teamMembers || 0} hint="Across active projects" icon={Users} accent="from-indigo-500 to-violet-500" delay={0.05} />
        <StatsCard title="Pending Tasks" value={dashboard.metrics.pendingTasks} hint="Needs action" icon={Clock3} accent="from-amber-500 to-orange-500" delay={0.1} />
        <StatsCard title="Completed Tasks" value={dashboard.metrics.completedTasks} hint="Delivered recently" icon={CheckCircle2} accent="from-emerald-500 to-teal-500" delay={0.15} />
        <StatsCard title="Upcoming Deadlines" value={dashboard.metrics.upcomingDeadlinesCount || 0} hint="Within the next 7 days" icon={TrendingUp} accent="from-fuchsia-500 to-pink-500" delay={0.2} />
      </div>

      {renderSection()}
    </div>
  );
};

export default OwnerDashboard;
