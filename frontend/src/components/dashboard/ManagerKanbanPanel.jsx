import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../../api/client";
import TaskModal from "../modals/TaskModal";

const columns = [
  { key: "todo", title: "Todo", description: "Ready to start" },
  { key: "inprogress", title: "In Progress", description: "Actively moving" },
  { key: "review", title: "Review", description: "Waiting for approval" },
  { key: "done", title: "Done", description: "Completed delivery" },
];

const statusOptions = [
  { value: "todo", label: "Todo" },
  { value: "inprogress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const ManagerKanbanPanel = ({ dashboard, onRefresh }) => {
  const [savingTaskId, setSavingTaskId] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const projectMap = useMemo(
    () => new Map((dashboard.projects || []).map((project) => [String(project._id), project])),
    [dashboard.projects]
  );

  const handleMoveTask = async (task, nextStatus) => {
    if (task.status === nextStatus) return;

    try {
      setSavingTaskId(task.id);
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      onRefresh?.();
    } finally {
      setSavingTaskId("");
    }
  };

  const openTaskDetails = async (task) => {
    const project = projectMap.get(String(task.projectId));
    if (!project) return;

    const { data } = await api.get(`/projects/${task.projectId}`);
    const fullTask = data.tasks?.find((item) => item._id === task.id);
    setSelectedProject(data);
    setSelectedTask(fullTask || null);
    setTaskModalOpen(true);
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
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Kanban Board</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Cross-project workflow supervision</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Move tasks through delivery stages, reassign work, and keep project momentum visible across every active board.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column, index) => {
          const items = dashboard.boards?.[column.key] || [];

          return (
            <motion.section
              key={column.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel min-h-[520px] rounded-[2rem] p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold">{column.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{column.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-slate-800">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <FolderKanban size={16} className="mt-1 text-brand-500" />
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.project}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {item.assignee}
                        </span>
                        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300">
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Due {item.deadline}</p>

                      <div className="mt-4 space-y-3">
                        <select
                          value={item.status}
                          onChange={(event) => handleMoveTask(item, event.target.value)}
                          disabled={savingTaskId === item.id}
                          className="input-field py-2.5 text-sm"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              Move to {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => openTaskDetails(item)}
                          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
                        >
                          Reassign / Comment
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                    No tasks in this column right now.
                  </div>
                )}
              </div>
            </motion.section>
          );
        })}
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

export default ManagerKanbanPanel;
