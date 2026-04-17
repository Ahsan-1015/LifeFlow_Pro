import { LifeBuoy, ShieldAlert, TimerReset } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const AdminSupportPanel = ({ dashboard }) => {
  const alerts = dashboard.tables?.supportQueue || [];
  const criticalAlerts = alerts.filter((alert) => alert.severity === "high").length;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Support Tickets</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Platform support and incident watch</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Keep an eye on overdue work, escalation candidates, and operational issues that need admin follow-up.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Open Support Signals" value={alerts.length} hint="Active platform issues to track" icon={LifeBuoy} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Critical Alerts" value={criticalAlerts} hint="High-severity items demanding attention" icon={ShieldAlert} accent="from-rose-500 to-orange-500" delay={0.05} />
        <StatsCard title="Tasks Created Today" value={dashboard.metrics.tasksCreatedToday || 0} hint="Operational movement affecting support load" icon={TimerReset} accent="from-amber-500 to-yellow-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TaskTable
          title="Support Queue"
          columns={[
            { key: "issue", label: "Issue" },
            { key: "severity", label: "Severity" },
            { key: "owner", label: "Owner" },
            { key: "project", label: "Project" },
          ]}
          rows={alerts}
          emptyText="The support queue is clear right now."
        />

        <ActivityFeed
          title="Alert Summary"
          items={(dashboard.feeds?.alerts || []).map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
          }))}
          emptyText="No alert summaries are available."
          delay={0.05}
        />
      </div>
    </div>
  );
};

export default AdminSupportPanel;
