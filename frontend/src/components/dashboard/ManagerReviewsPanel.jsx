import { ClipboardCheck, MessageSquareMore } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const ManagerReviewsPanel = ({ dashboard }) => (
  <div className="space-y-6">
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Reviews</p>
      <h2 className="mt-3 font-display text-3xl font-bold">Review queue and approval flow</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Approve submitted work faster, spot stale review items, and keep the team moving through feedback loops.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <StatsCard title="In Review" value={dashboard.metrics.inReviewTasks || 0} hint="Submitted for approval" icon={ClipboardCheck} accent="from-indigo-500 to-violet-500" />
      <StatsCard title="Recent Comments" value={(dashboard.feeds?.recentComments || []).length} hint="Feedback loops needing manager attention" icon={MessageSquareMore} accent="from-brand-500 to-cyan-500" delay={0.05} />
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <TaskTable
        title="Review Queue"
        columns={[
          { key: "task", label: "Task" },
          { key: "project", label: "Project" },
          { key: "owner", label: "Owner" },
          { key: "priority", label: "Priority" },
          { key: "deadline", label: "Deadline" },
          { key: "status", label: "Status" },
        ]}
        rows={dashboard.tables?.reviewQueue || []}
        emptyText="No review items are waiting right now."
      />

      <ActivityFeed
        title="Review Comments"
        items={dashboard.feeds?.recentComments || []}
        emptyText="No review feedback has been posted yet."
        delay={0.05}
      />
    </div>
  </div>
);

export default ManagerReviewsPanel;
