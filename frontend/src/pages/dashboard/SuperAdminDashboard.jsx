import {
  Activity,
  FolderOpen,
  Server,
  Shield,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import AdminAnalyticsPanel from "../../components/dashboard/AdminAnalyticsPanel";
import AdminProjectsPanel from "../../components/dashboard/AdminProjectsPanel";
import AdminReportsPanel from "../../components/dashboard/AdminReportsPanel";
import AdminRevenuePanel from "../../components/dashboard/AdminRevenuePanel";
import AdminSettingsPanel from "../../components/dashboard/AdminSettingsPanel";
import AdminSupportPanel from "../../components/dashboard/AdminSupportPanel";
import AdminUsersPanel from "../../components/dashboard/AdminUsersPanel";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Platform overview",
  users: "User administration",
  projects: "Platform projects",
  revenue: "Revenue and plans",
  reports: "Executive reports",
  analytics: "Analytics center",
  support: "Support ticket queue",
  settings: "Platform settings",
};

const SuperAdminDashboard = ({ dashboard, section = "overview", onRefresh }) => {
  const userGrowthSeries = dashboard.charts?.userGrowth || [];
  const projectActivitySeries = dashboard.charts?.projectActivity || [];
  const roleDistribution = dashboard.charts?.roleDistribution?.length
    ? dashboard.charts.roleDistribution
    : [{ name: "No data", value: 1, color: "#cbd5e1" }];
  const projectRows = dashboard.tables?.recentProjects || [];
  const userRows = dashboard.tables?.latestUsers || [];
  const issueRows = dashboard.tables?.platformAlerts || [];

  if (section === "users") {
    return <AdminUsersPanel dashboard={dashboard} onRefresh={onRefresh} />;
  }

  if (section === "projects") {
    return <AdminProjectsPanel dashboard={dashboard} />;
  }

  if (section === "revenue") {
    return <AdminRevenuePanel dashboard={dashboard} />;
  }

  if (section === "reports") {
    return <AdminReportsPanel dashboard={dashboard} />;
  }

  if (section === "analytics") {
    return <AdminAnalyticsPanel dashboard={dashboard} />;
  }

  if (section === "support") {
    return <AdminSupportPanel dashboard={dashboard} />;
  }

  if (section === "settings") {
    return <AdminSettingsPanel dashboard={dashboard} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Super Admin</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Platform overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Monitor platform growth, user health, support signals, and workspace operations from one admin control surface.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatsCard title="Total Users" value={dashboard.metrics.totalUsers || 0} hint="Across all workspaces" icon={Users} accent="from-blue-500 to-indigo-500" />
        <StatsCard title="Active Users" value={dashboard.metrics.activeUsers || 0} hint="Updated during the last 7 days" icon={Shield} accent="from-emerald-500 to-teal-500" delay={0.05} />
        <StatsCard title="Total Projects" value={dashboard.metrics.totalProjects} hint="Platform-wide project count" icon={FolderOpen} accent="from-fuchsia-500 to-violet-500" delay={0.1} />
        <StatsCard title="Tasks Created Today" value={dashboard.metrics.tasksCreatedToday || 0} hint="Recent operational activity" icon={Activity} accent="from-amber-500 to-orange-500" delay={0.15} />
        <StatsCard title="Monthly Growth" value={dashboard.metrics.monthlyGrowth || "0%"} hint="User and workspace expansion" icon={Users} accent="from-cyan-500 to-sky-500" delay={0.2} />
        <StatsCard title="Server Status" value={dashboard.metrics.serverStatus || "Operational"} hint="Core services healthy" icon={Server} accent="from-slate-700 to-slate-900" delay={0.25} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="User Growth" subtitle="Weekly activation trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowthSeries}>
              <defs>
                <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.25} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#userGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Project Activity" subtitle="Workspace creation and movement">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectActivitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="projects" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TaskTable
          title={section === "support" ? "Support Signals" : "Latest Users"}
          columns={
            section === "support"
              ? [
                  { key: "issue", label: "Issue" },
                  { key: "severity", label: "Severity" },
                  { key: "owner", label: "Owner" },
                ]
              : [
                  { key: "name", label: "User" },
                  { key: "role", label: "Role" },
                  { key: "status", label: "Status" },
                ]
          }
          rows={section === "support" ? issueRows : userRows}
        />
        <ChartCard title="Role Distribution" subtitle="Current role mix across the platform">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                {roleDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityFeed
          title="Platform Alerts"
          items={issueRows.map((issue) => ({
            id: issue.id,
            title: issue.issue,
            subtitle: `${issue.severity} priority • ${issue.owner}`,
          }))}
          delay={0.05}
        />
        <TaskTable
          title="Recent Projects"
          columns={[
            { key: "project", label: "Project" },
            { key: "owner", label: "Owner" },
            { key: "deadline", label: "Deadline" },
            { key: "health", label: "Health" },
          ]}
          rows={projectRows}
          emptyText="No projects found yet."
          delay={0.1}
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
