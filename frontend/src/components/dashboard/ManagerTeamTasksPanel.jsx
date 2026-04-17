import { ClipboardList, Clock3, Flag } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const ManagerTeamTasksPanel = ({ dashboard }) => {
  const teamTasks = dashboard.tables?.teamTasks || [];
  const highPriority = teamTasks.filter((task) => task.priority === "high").length;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Team Tasks</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Daily execution across all assigned projects</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track who owns each task, what needs attention, and where work is drifting before delivery slows down.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Tracked Tasks" value={teamTasks.length} hint="Visible to your manager scope" icon={ClipboardList} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="High Priority" value={highPriority} hint="Needs close follow-up" icon={Flag} accent="from-rose-500 to-orange-500" delay={0.05} />
        <StatsCard title="Pending Queue" value={dashboard.metrics.pendingTasks || 0} hint="Still in active execution" icon={Clock3} accent="from-amber-500 to-yellow-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TaskTable
          title="Team Task Directory"
          columns={[
            { key: "task", label: "Task" },
            { key: "project", label: "Project" },
            { key: "owner", label: "Owner" },
            { key: "status", label: "Status" },
            { key: "priority", label: "Priority" },
            { key: "deadline", label: "Deadline" },
          ]}
          rows={teamTasks}
          emptyText="No team tasks are visible yet."
        />

        <ActivityFeed
          title="Recent Task Conversations"
          items={dashboard.feeds?.recentComments || []}
          emptyText="No recent task comments yet."
          delay={0.05}
        />
      </div>
    </div>
  );
};

export default ManagerTeamTasksPanel;
