import { CheckCircle2, Clock3, FolderKanban, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Owner overview",
  team: "Team members",
  boards: "Board health",
  tasks: "Task operations",
  calendar: "Calendar and deadlines",
  reports: "Performance reports",
  billing: "Billing and plans",
};

const OwnerDashboard = ({ dashboard, section = "overview" }) => {
  const projectRows = dashboard.tables?.projectHealth || [];
  const productivitySeries = dashboard.charts?.weeklyCompleted || [];
  const activityItems = dashboard.feeds?.activity || [];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Project Owner</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Owner overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage owned projects, assign momentum, and keep every delivery milestone visible for your team.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total Projects" value={dashboard.metrics.totalProjects} hint="Workspaces you oversee" icon={FolderKanban} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Team Members" value={dashboard.metrics.teamMembers || 0} hint="Across active projects" icon={Users} accent="from-indigo-500 to-violet-500" delay={0.05} />
        <StatsCard title="Pending Tasks" value={dashboard.metrics.pendingTasks} hint="Needs action" icon={Clock3} accent="from-amber-500 to-orange-500" delay={0.1} />
        <StatsCard title="Completed Tasks" value={dashboard.metrics.completedTasks} hint="Delivered recently" icon={CheckCircle2} accent="from-emerald-500 to-teal-500" delay={0.15} />
        <StatsCard title="Upcoming Deadlines" value={dashboard.metrics.upcomingDeadlinesCount || 0} hint="Within the next 7 days" icon={TrendingUp} accent="from-fuchsia-500 to-pink-500" delay={0.2} />
      </div>

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
          items={dashboard.feeds?.deadlines || []}
          emptyText="No deadlines scheduled this week."
          delay={0.1}
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
