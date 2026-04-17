import { AlertTriangle, FolderKanban, TimerReset } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const AdminProjectsPanel = ({ dashboard }) => {
  const allProjects = dashboard.tables?.allProjects || [];
  const atRiskProjects = allProjects.filter((project) => project.health === "At risk");
  const monitoringProjects = allProjects.filter((project) => project.health === "Monitoring").length;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">All Projects</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Workspace and delivery oversight</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track project health, owner coverage, task load, and deadlines across every active workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Projects" value={dashboard.metrics.totalProjects || 0} hint="Tracked across the platform" icon={FolderKanban} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="At Risk" value={dashboard.metrics.atRiskProjects || atRiskProjects.length} hint="Projects needing intervention" icon={AlertTriangle} accent="from-rose-500 to-orange-500" delay={0.05} />
        <StatsCard title="Monitoring" value={monitoringProjects} hint="Projects close to slipping" icon={TimerReset} accent="from-amber-500 to-yellow-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TaskTable
          title="All Project Directory"
          columns={[
            { key: "project", label: "Project" },
            { key: "owner", label: "Owner" },
            { key: "members", label: "Members" },
            { key: "tasks", label: "Tasks" },
            { key: "progress", label: "Progress" },
            { key: "deadline", label: "Deadline" },
            { key: "health", label: "Health" },
          ]}
          rows={allProjects}
          emptyText="No projects have been created yet."
        />

        <ActivityFeed
          title="Projects Needing Action"
          items={atRiskProjects.map((project) => ({
            id: project.id,
            title: project.project,
            subtitle: `${project.owner} • ${project.deadline} • ${project.health}`,
          }))}
          emptyText="No projects currently need escalation."
          delay={0.05}
        />
      </div>
    </div>
  );
};

export default AdminProjectsPanel;
