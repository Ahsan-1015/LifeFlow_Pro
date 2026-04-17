import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Filter, Plus, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import { getSocket } from "../../api/socket";
import BoardColumn from "../../components/board/BoardColumn";
import SkeletonCard from "../../components/common/SkeletonCard";
import TaskModal from "../../components/modals/TaskModal";

const boardColumns = [
  { id: "todo", title: "Todo", description: "Ideas ready to be picked up" },
  { id: "inprogress", title: "In Progress", description: "Work actively moving" },
  { id: "review", title: "Review", description: "Needs feedback or QA" },
  { id: "done", title: "Done", description: "Delivered outcomes" },
];

const getBoardCacheKey = (projectId) => `flowpilot_project_${projectId}_cache`;

const ProjectBoardPage = () => {
  const { projectId } = useParams();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [project, setProject] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({ priority: "", assignedTo: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProject = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data);
      sessionStorage.setItem(getBoardCacheKey(projectId), JSON.stringify(data));
    } catch (err) {
      const cached = sessionStorage.getItem(getBoardCacheKey(projectId));
      if (cached) {
        setProject(JSON.parse(cached));
      }
      setError(err.userMessage || "Unable to load this project board.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem(getBoardCacheKey(projectId));
    if (cached) {
      setProject(JSON.parse(cached));
      setLoading(false);
      loadProject({ silent: true });
      return;
    }

    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return undefined;

    const socket = getSocket();
    socket.emit("project:join", projectId);

    const handleTaskCreated = (task) => {
      setProject((current) => ({ ...current, tasks: [task, ...(current?.tasks || [])] }));
    };
    const handleTaskUpdated = (task) => {
      setProject((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item._id === task._id ? task : item)),
      }));
    };
    const handleTaskDeleted = ({ taskId }) => {
      setProject((current) => ({
        ...current,
        tasks: current.tasks.filter((item) => item._id !== taskId),
      }));
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
    };
  }, [projectId]);

  const filteredTasks = useMemo(() => {
    const tasks = project?.tasks || [];
    return tasks.filter((task) => {
      const matchesPriority = filters.priority ? task.priority === filters.priority : true;
      const matchesAssignee = filters.assignedTo ? task.assignedTo?._id === filters.assignedTo : true;
      return matchesPriority && matchesAssignee;
    });
  }, [project?.tasks, filters]);

  const tasksByColumn = useMemo(
    () =>
      boardColumns.reduce((accumulator, column) => {
        accumulator[column.id] = filteredTasks.filter((task) => task.status === column.id);
        return accumulator;
      }, {}),
    [filteredTasks]
  );

  const handleSaveTask = async (payload) => {
    if (selectedTask?._id) {
      await api.put(`/tasks/${selectedTask._id}`, payload);
    } else {
      await api.post(`/tasks/project/${projectId}`, payload);
    }
    setTaskModalOpen(false);
    setSelectedTask(null);
    await loadProject();
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || !project) return;
    const draggedTask = project.tasks.find((task) => task._id === active.id);
    if (!draggedTask) return;

    const targetStatus = boardColumns.some((column) => column.id === over.id)
      ? over.id
      : project.tasks.find((task) => task._id === over.id)?.status;

    if (!targetStatus || targetStatus === draggedTask.status) return;

    setProject((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task._id === draggedTask._id ? { ...task, status: targetStatus } : task)),
    }));

    await api.put(`/tasks/${draggedTask._id}`, { status: targetStatus });
  };

  const handleDeleteTask = async () => {
    if (!selectedTask?._id) return;
    await api.delete(`/tasks/${selectedTask._id}`);
    setTaskModalOpen(false);
    setSelectedTask(null);
    await loadProject();
  };

  const handleInviteMember = async (event) => {
    event.preventDefault();
    await api.post(`/projects/${projectId}/invite`, { email: inviteEmail, role: inviteRole });
    setInviteEmail("");
    setInviteRole("member");
    await loadProject();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="min-h-40" />
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} className="min-h-[460px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-panel rounded-[2rem] p-8">
        <h3 className="font-display text-2xl font-bold">Board unavailable</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{error || "Project data could not be loaded."}</p>
        <button
          type="button"
          onClick={() => loadProject()}
          className="gradient-button mt-5"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {(refreshing || error) ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-slate-900/70">
          <div>
            {refreshing ? <p className="text-slate-500">Refreshing board...</p> : null}
            {error ? <p className="text-amber-600 dark:text-amber-300">{error}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => loadProject({ silent: true })}
            className="rounded-2xl bg-slate-950 px-4 py-2 font-semibold text-white dark:bg-brand-500"
          >
            Refresh
          </button>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_auto]">
        <div className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Project board</p>
          <h3 className="mt-2 font-display text-3xl font-bold">{project.title}</h3>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}</span>
            <span className="flex items-center gap-2">
              <Users size={16} />
              {project.members?.length || 0} collaborators
            </span>
          </div>
        </div>

        <div className="glass-panel flex flex-wrap items-center gap-3 rounded-[2rem] p-5">
          <Filter size={18} />
          <select
            className="input-field min-w-36"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className="input-field min-w-40"
            value={filters.assignedTo}
            onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}
          >
            <option value="">Everyone</option>
            {project.members.map((member) => (
              <option key={member.user._id} value={member.user._id}>
                {member.user.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setSelectedTask(null);
              setTaskModalOpen(true);
            }}
            className="gradient-button"
          >
            <Plus size={18} />
            <span className="ml-2">New Task</span>
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="glass-panel rounded-[2rem] p-5">
          <h4 className="font-display text-2xl font-bold">Team Members</h4>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {project.members.map((member) => (
              <div key={member.user._id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                <p className="font-semibold">{member.user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.user.email}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleInviteMember} className="glass-panel rounded-[2rem] p-5">
          <h4 className="font-display text-2xl font-bold">Invite Member</h4>
          <div className="mt-4 space-y-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="member@company.com"
              className="input-field"
              required
            />
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
              className="input-field"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
            <button type="submit" className="gradient-button w-full">
              Send Invite
            </button>
          </div>
        </form>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {boardColumns.map((column, index) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              id={column.id}
            >
              <BoardColumn
                column={column}
                tasks={tasksByColumn[column.id] || []}
                onOpenTask={(task) => {
                  setSelectedTask(task);
                  setTaskModalOpen(true);
                }}
              />
            </motion.div>
          ))}
        </div>
      </DndContext>

      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        project={project}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </>
  );
};

export default ProjectBoardPage;
