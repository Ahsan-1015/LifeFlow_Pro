import { ClipboardCheck, MessageSquareMore } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../../api/client";
import TaskModal from "../modals/TaskModal";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";
import TaskTable from "./TaskTable";

const ManagerReviewsPanel = ({ dashboard, onRefresh }) => {
  const [savingTaskId, setSavingTaskId] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const projectMap = useMemo(
    () => new Map((dashboard.projects || []).map((project) => [String(project._id), project])),
    [dashboard.projects]
  );

  const openTaskDetails = async (task) => {
    const project = projectMap.get(String(task.projectId));
    if (!project) return;

    const { data } = await api.get(`/projects/${task.projectId}`);
    const fullTask = data.tasks?.find((item) => item._id === task.id);
    setSelectedProject(data);
    setSelectedTask(fullTask || null);
    setTaskModalOpen(true);
  };

  const handleReviewAction = async (task, nextStatus) => {
    try {
      setSavingTaskId(task.id);
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      onRefresh?.();
    } finally {
      setSavingTaskId("");
    }
  };

  const handleSaveTask = async (payload) => {
    if (!selectedTask?._id) return;
    await api.put(`/tasks/${selectedTask._id}`, payload);
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
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Reviews</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Review queue and approval flow</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Approve submitted work, send tasks back with changes, and add comments when the team needs more direction.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard title="In Review" value={dashboard.metrics.inReviewTasks || 0} hint="Submitted for approval" icon={ClipboardCheck} accent="from-indigo-500 to-violet-500" />
        <StatsCard title="Recent Comments" value={(dashboard.feeds?.recentComments || []).length} hint="Feedback loops needing manager attention" icon={MessageSquareMore} accent="from-brand-500 to-cyan-500" delay={0.05} />
      </div>

      <div className="grid gap-4">
        {(dashboard.tables?.reviewQueue || []).map((task) => (
          <div key={task.id} className="glass-panel rounded-[2rem] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-brand-500">{task.project}</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{task.task}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {task.owner} • {task.priority} priority • due {task.deadline}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleReviewAction(task, "done")}
                  disabled={savingTaskId === task.id}
                  className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {savingTaskId === task.id ? "Updating..." : "Approve Work"}
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction(task, "inprogress")}
                  disabled={savingTaskId === task.id}
                  className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                >
                  Needs Changes
                </button>
                <button
                  type="button"
                  onClick={() => openTaskDetails(task)}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        ))}
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

export default ManagerReviewsPanel;
