import { CalendarClock, Eye, Flag } from "lucide-react";
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
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Client overview",
  "shared-projects": "Shared projects",
  milestones: "Milestone roadmap",
  feedback: "Feedback panel",
  billing: "Billing snapshot",
};

const GuestDashboard = ({ dashboard, section = "overview" }) => {
  const timelineSeries = dashboard.charts?.milestoneTimeline?.length
    ? dashboard.charts.milestoneTimeline
    : [{ name: "No data", progress: 0 }];
  const milestoneRows = dashboard.tables?.sharedMilestones || [];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Guest / Client</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Client overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          A read-friendly progress dashboard with milestone visibility, shared files, and a clean feedback surface.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Progress %" value={dashboard.metrics.progressPercentage || "0%"} hint="Across shared initiatives" icon={Eye} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Completed Milestones" value={dashboard.metrics.completedMilestones || 0} hint="Recent delivery markers" icon={Flag} accent="from-emerald-500 to-teal-500" delay={0.05} />
        <StatsCard title="Upcoming Delivery Date" value={dashboard.metrics.nextDeliveryDate || "TBD"} hint="Next expected milestone" icon={CalendarClock} accent="from-fuchsia-500 to-pink-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Project Timeline" subtitle="Milestone roadmap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ActivityFeed
          title="Feedback Panel"
          items={dashboard.feeds?.feedback || []}
          emptyText="No feedback messages yet."
        />
      </div>

      <TaskTable
        title="Shared Milestones"
        columns={[
          { key: "milestone", label: "Milestone" },
          { key: "progress", label: "Progress" },
          { key: "delivery", label: "Delivery" },
        ]}
        rows={milestoneRows}
        emptyText="No shared milestones available yet."
      />
    </div>
  );
};

export default GuestDashboard;
