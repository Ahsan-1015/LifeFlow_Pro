import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import ActivityFeed from "./ActivityFeed";
import ChartCard from "./ChartCard";
import TaskTable from "./TaskTable";

const ManagerReportsPanel = ({ dashboard }) => {
  const memberLoad = dashboard.charts?.memberLoad || [];
  const performance = dashboard.tables?.teamPerformance || [];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Reports</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Manager performance and workload reports</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          See who is overloaded, who is shipping consistently, and how the team is balancing output against open work.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Member Workload" subtitle="Pending vs completed output by teammate">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberLoad}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="pending" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              <Bar dataKey="done" fill="#10b981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ActivityFeed
          title="Report Highlights"
          items={(dashboard.feeds?.activity || []).slice(0, 6)}
          emptyText="No report highlights available yet."
          delay={0.05}
        />
      </div>

      <TaskTable
        title="Team Performance Report"
        columns={[
          { key: "member", label: "Member" },
          { key: "done", label: "Done" },
          { key: "pending", label: "Pending" },
          { key: "efficiency", label: "Efficiency" },
        ]}
        rows={performance}
        emptyText="No performance data available yet."
      />
    </div>
  );
};

export default ManagerReportsPanel;
