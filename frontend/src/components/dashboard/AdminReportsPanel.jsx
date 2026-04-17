import { FileText, ShieldAlert, Users } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const AdminReportsPanel = ({ dashboard }) => (
  <div className="space-y-6">
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Reports</p>
      <h2 className="mt-3 font-display text-3xl font-bold">Executive and operational reports</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        A clean reporting surface for platform growth, delivery risk, and user activity snapshots.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard title="Growth Snapshot" value={dashboard.metrics.monthlyGrowth || "0%"} hint="Month-over-month user growth" icon={Users} accent="from-blue-500 to-indigo-500" />
      <StatsCard title="Open Risk Signals" value={dashboard.metrics.atRiskProjects || 0} hint="Projects that may affect delivery" icon={ShieldAlert} accent="from-rose-500 to-orange-500" delay={0.05} />
      <StatsCard title="Unread Admin Notices" value={dashboard.metrics.unreadNotifications || 0} hint="Alerts waiting for follow-up" icon={FileText} accent="from-amber-500 to-yellow-500" delay={0.1} />
    </div>

    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <ActivityFeed
        title="Executive Highlights"
        items={dashboard.feeds?.adminReports || []}
        emptyText="No executive highlights yet."
      />

      <TaskTable
        title="Platform Risk Report"
        columns={[
          { key: "issue", label: "Issue" },
          { key: "severity", label: "Severity" },
          { key: "owner", label: "Owner" },
          { key: "project", label: "Project" },
        ]}
        rows={dashboard.tables?.supportQueue || []}
        emptyText="No current risk signals to report."
      />
    </div>
  </div>
);

export default AdminReportsPanel;
