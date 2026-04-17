import { AlertTriangle, ClipboardCheck, Users, Workflow } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import ChartCard from "../../components/dashboard/ChartCard";
import ManagerKanbanPanel from "../../components/dashboard/ManagerKanbanPanel";
import ManagerMessagesPanel from "../../components/dashboard/ManagerMessagesPanel";
import ManagerReportsPanel from "../../components/dashboard/ManagerReportsPanel";
import ManagerReviewsPanel from "../../components/dashboard/ManagerReviewsPanel";
import ManagerTeamTasksPanel from "../../components/dashboard/ManagerTeamTasksPanel";
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Manager overview",
  "team-tasks": "Team task execution",
  kanban: "Kanban supervision",
  reviews: "Approval queue",
  messages: "Manager inbox",
  reports: "Team performance reports",
};

const ManagerDashboard = ({ dashboard, section = "overview" }) => {
  const performanceRows = dashboard.tables?.teamPerformance || [];
  const approvalRows = dashboard.tables?.reviewQueue || [];
  const reviewSeries = dashboard.charts?.reviewFlow || [];

  if (section === "team-tasks") {
    return <ManagerTeamTasksPanel dashboard={dashboard} />;
  }

  if (section === "kanban") {
    return <ManagerKanbanPanel dashboard={dashboard} />;
  }

  if (section === "reviews") {
    return <ManagerReviewsPanel dashboard={dashboard} />;
  }

  if (section === "messages") {
    return <ManagerMessagesPanel dashboard={dashboard} />;
  }

  if (section === "reports") {
    return <ManagerReportsPanel dashboard={dashboard} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Manager / Team Lead</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Manager overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Keep execution flowing, review incoming work, and surface the highest priority tasks before blockers grow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Team Pending Tasks" value={dashboard.metrics.pendingTasks} hint="Open team workload" icon={Workflow} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="In Review Tasks" value={dashboard.metrics.inReviewTasks || 0} hint="Submitted for approval" icon={ClipboardCheck} accent="from-indigo-500 to-violet-500" delay={0.05} />
        <StatsCard title="Overdue Tasks" value={dashboard.metrics.overdueTasks || 0} hint="Needs intervention" icon={AlertTriangle} accent="from-amber-500 to-orange-500" delay={0.1} />
        <StatsCard title="Member Productivity" value={dashboard.metrics.memberProductivity || "0%"} hint="Average weekly efficiency" icon={Users} accent="from-emerald-500 to-teal-500" delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TaskTable
          title="Team Performance Table"
          columns={[
            { key: "member", label: "Member" },
            { key: "done", label: "Done" },
            { key: "pending", label: "Pending" },
            { key: "efficiency", label: "Efficiency" },
          ]}
          rows={performanceRows}
        />
        <ActivityFeed
          title="Priority Tasks"
          items={dashboard.feeds?.priorityTasks || []}
          emptyText="No high priority items are currently flagged."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="Task Approval Queue" subtitle="Submitted vs approved across the week">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reviewSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <TaskTable
          title="Review Submissions"
          columns={[
            { key: "task", label: "Task" },
            { key: "owner", label: "Owner" },
            { key: "status", label: "Status" },
          ]}
          rows={approvalRows}
          delay={0.1}
        />
      </div>
    </div>
  );
};

export default ManagerDashboard;
