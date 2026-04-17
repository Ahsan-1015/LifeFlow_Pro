import { CalendarClock, CheckCircle2, Clock3, Gauge, ListTodo } from "lucide-react";
import {
  Area,
  AreaChart,
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
  overview: "Member overview",
  "my-tasks": "My task queue",
  calendar: "My calendar",
  files: "Shared files",
};

const MemberDashboard = ({ dashboard, section = "overview" }) => {
  const focusTasks = dashboard.tables?.focusTasks || [];
  const progressSeries = dashboard.charts?.personalProductivity || [];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Member / Employee</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Member overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          A focused workspace for your personal task flow, deadlines, and the comments that need your attention most.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="My Pending Tasks" value={dashboard.metrics.pendingTasks} hint="Current personal load" icon={ListTodo} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Due Today" value={dashboard.metrics.dueToday || 0} hint="Immediate deadlines" icon={CalendarClock} accent="from-amber-500 to-orange-500" delay={0.05} />
        <StatsCard title="Completed This Week" value={dashboard.metrics.completedThisWeek || 0} hint="Finished work" icon={CheckCircle2} accent="from-emerald-500 to-teal-500" delay={0.1} />
        <StatsCard title="Productivity Score" value={dashboard.metrics.productivityScore || "0%"} hint="Momentum this week" icon={Gauge} accent="from-fuchsia-500 to-pink-500" delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <TaskTable
          title="Today Focus Tasks"
          columns={[
            { key: "task", label: "Task" },
            { key: "status", label: "Status" },
            { key: "due", label: "Due" },
          ]}
          rows={focusTasks}
        />
        <ChartCard title="Productivity Trend" subtitle="Personal output across the week">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressSeries}>
              <defs>
                <linearGradient id="memberProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#memberProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActivityFeed
          title="Deadlines"
          items={dashboard.feeds?.deadlines || []}
          emptyText="No upcoming deadlines assigned right now."
        />
        <ActivityFeed
          title="Recent Comments"
          items={dashboard.feeds?.recentComments || []}
          emptyText="No new comments on your tasks yet."
          delay={0.1}
        />
      </div>
    </div>
  );
};

export default MemberDashboard;
