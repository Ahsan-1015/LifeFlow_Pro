import { ClipboardList, Clock3, Flag, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import TaskModal from "../modals/TaskModal";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const statusLabels = {
  todo: "Todo",
  inprogress: "In Progress",
  review: "Review",
  done: "Done",
};

const ManagerTeamTasksPanel = ({ dashboard, onRefresh }) => {
  const teamTasks = dashboard.tables?.teamTasks || [];
  const highPriority = teamTasks.filter((task) => task.priority === "high").length;
  const [selectedProjectId, setSelectedProjectId] = useState(dashboard.projects?.[0]?._id || "");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const projectMap = useMemo(
    () => new Map((dashboard.projects || []).map((project) => [String(project._id), project])),
    [dashboard.projects]
  );

  const actionableTasks = useMemo(() => teamTasks.slice(0, 8), [teamTasks]);

  const openCreateTask = () => {
    const project = projectMap.get(String(selectedProjectId));
    if (!project) return;
    setSelectedProject(project);
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const openExistingTask = async (task) => {
    const project = projectMap.get(String(task.projectId));
    if (!project) return;

    const { data } = await api.get(`/projects/${task.projectId}`);
    const fullTask = data.tasks?.find((item) => item._id === task.id);
    setSelectedProject(data);
    setSelectedTask(fullTask || null);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (payload) => {
    if (!selectedProject?._id) return;

    if (selectedTask?._id) {
      await api.put(`/tasks/${selectedTask._id}`, payload);
    } else {
      await api.post(`/tasks/project/${selectedProject._id}`, payload);
    }

    setTaskModalOpen(false);
    setSelectedTask(null);
    onRefresh?.();
  };

  const handleDeleteTask = async () => {
    if (!selectedTask?._id) return;
    await api.delete(`/tasks/${selectedTask._id}`);
    setTaskModalOpen(false);
    setSelectedTask(null);
    onRefresh?.();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Team Tasks</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Daily execution across all assigned projects</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Break work into tasks, assign it to teammates, set deadlines, and fix blockers before they delay delivery.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Tracked Tasks" value={teamTasks.length} hint="Visible to your manager scope" icon={ClipboardList} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="High Priority" value={highPriority} hint="Needs close follow-up" icon={Flag} accent="from-rose-500 to-orange-500" delay={0.05} />
        <StatsCard title="Pending Queue" value={dashboard.metrics.pendingTasks || 0} hint="Still in active execution" icon={Clock3} accent="from-amber-500 to-yellow-500" delay={0.1} />
        <StatsCard title="Review Queue" value={dashboard.metrics.inReviewTasks || 0} hint="Waiting for approval" icon={PlusCircle} accent="from-indigo-500 to-violet-500" delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <h3 className="font-display text-2xl font-bold">Create and Assign Task</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Pick a project, create a task, assign it to a teammate, and set the deadline from one place.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label-text">Project</label>
              <select
                className="input-field"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
              >
                {(dashboard.projects || []).map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={openCreateTask} className="gradient-button w-full">
              Create New Task
            </button>
          </div>
        </div>

        <ActivityFeed
          title="Recent Task Conversations"
          items={dashboard.feeds?.recentComments || []}
          emptyText="No recent task comments yet."
          delay={0.05}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {actionableTasks.map((task) => (
          <div key={task.id} className="glass-panel rounded-[2rem] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-brand-500">{task.project}</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{task.task}</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {statusLabels[task.status] || task.status}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300">
                {task.priority}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {task.owner}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {task.deadline}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openExistingTask(task)}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
              >
                Reassign / Edit
              </button>
              <Link
                to={`/projects/${task.projectId}`}
                className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                Open Board
              </Link>
            </div>
          </div>
        ))}
      </div>

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
        rows={teamTasks.map((task) => ({
          ...task,
          status: statusLabels[task.status] || task.status,
        }))}
        emptyText="No team tasks are visible yet."
      />

      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
          setSelectedProject(null);
        }}
        project={selectedProject}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default ManagerTeamTasksPanel;
