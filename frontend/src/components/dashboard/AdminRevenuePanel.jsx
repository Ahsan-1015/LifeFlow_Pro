import { CreditCard, FolderKanban, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const AdminRevenuePanel = ({ dashboard }) => {
  const planMix = dashboard.charts?.planMix?.length
    ? dashboard.charts.planMix
    : [{ name: "No workspaces", value: 1, color: "#cbd5e1" }];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Revenue / Plans</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Workspace value and plan mix</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          A business-facing view of how active workspaces translate into plan capacity and platform value.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Estimated Monthly Value" value={dashboard.metrics.estimatedMonthlyValue || "$0"} hint="Derived from current project workspace sizes" icon={CreditCard} accent="from-emerald-500 to-teal-500" />
        <StatsCard title="Average Workspace Value" value={dashboard.metrics.avgWorkspaceValue || "$0"} hint="Per active project" icon={FolderKanban} accent="from-indigo-500 to-violet-500" delay={0.05} />
        <StatsCard title="Monthly Growth" value={dashboard.metrics.monthlyGrowth || "0%"} hint="User pipeline growth over the last 30 days" icon={TrendingUp} accent="from-cyan-500 to-sky-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <ChartCard title="Plan Mix" subtitle="Workspace mix by size tier">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={planMix} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                {planMix.map((entry) => (
                  <Cell key={entry.name} fill={entry.color || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <TaskTable
          title="Workspace Value Backing"
          columns={[
            { key: "project", label: "Project" },
            { key: "owner", label: "Owner" },
            { key: "members", label: "Members" },
            { key: "tasks", label: "Tasks" },
            { key: "health", label: "Health" },
          ]}
          rows={dashboard.tables?.allProjects || []}
          emptyText="No projects are contributing to workspace value yet."
        />
      </div>
    </div>
  );
};

export default AdminRevenuePanel;
