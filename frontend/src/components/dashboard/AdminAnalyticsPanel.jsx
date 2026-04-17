import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";

const renderPie = (dataset) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={dataset} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
        {dataset.map((entry) => (
          <Cell key={entry.name} fill={entry.color || "#94a3b8"} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const AdminAnalyticsPanel = ({ dashboard }) => {
  const roleMix = dashboard.charts?.roleDistribution?.length
    ? dashboard.charts.roleDistribution
    : [{ name: "No data", value: 1, color: "#cbd5e1" }];
  const taskMix = dashboard.charts?.taskStatusBreakdown?.length
    ? dashboard.charts.taskStatusBreakdown.map((entry, index) => ({
        ...entry,
        color: ["#38bdf8", "#8b5cf6", "#f59e0b", "#10b981"][index % 4],
      }))
    : [{ name: "No data", value: 1, color: "#cbd5e1" }];
  const projectHealthMix = dashboard.charts?.projectHealthMix?.length
    ? dashboard.charts.projectHealthMix
    : [{ name: "No data", value: 1, color: "#cbd5e1" }];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Analytics</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Platform analytics and health signals</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Understand user mix, task flow balance, and overall project health using live platform activity.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Role Distribution" subtitle="User mix by permission level">
          {renderPie(roleMix)}
        </ChartCard>
        <ChartCard title="Task Status Mix" subtitle="How work is distributed across the board">
          {renderPie(taskMix)}
        </ChartCard>
        <ChartCard title="Project Health Mix" subtitle="Healthy vs monitored vs at-risk workspaces">
          {renderPie(projectHealthMix)}
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalyticsPanel;
