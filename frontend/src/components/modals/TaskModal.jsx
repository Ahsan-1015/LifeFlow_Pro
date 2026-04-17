import { useEffect, useState } from "react";
import api from "../../api/client";
import { getSocket } from "../../api/socket";
import PriorityBadge from "../common/PriorityBadge";
import ModalShell from "./ModalShell";

const TaskModal = ({ open, onClose, project, task, onSave, onDelete }) => {
  const [values, setValues] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    status: "todo",
    assignedTo: "",
  });
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setValues({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      deadline: task?.deadline?.slice?.(0, 10) || "",
      status: task?.status || "todo",
      assignedTo: task?.assignedTo?._id || "",
    });
  }, [task, open]);

  useEffect(() => {
    if (!task?._id || !open) return undefined;

    const loadComments = async () => {
      const { data } = await api.get(`/tasks/${task._id}/comments`);
      setComments(data);
    };

    loadComments();

    const socket = getSocket();
    socket.emit("task:join", task._id);

    const handleCommentCreated = (comment) => {
      setComments((current) => [...current, comment]);
    };

    socket.on("comment:created", handleCommentCreated);
    return () => {
      socket.off("comment:created", handleCommentCreated);
    };
  }, [task?._id, open]);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    await api.post(`/comments/${task._id}`, { message });
    setMessage("");
  };

  return (
    <ModalShell open={open} onClose={onClose} title={task?._id ? "Task Details" : "Create Task"}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(values);
        }}
        className="space-y-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label-text">Task title</label>
            <input
              className="input-field"
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-text">Description</label>
            <textarea
              className="input-field min-h-24"
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            />
          </div>
          <div>
            <label className="label-text">Priority</label>
            <select
              className="input-field"
              value={values.priority}
              onChange={(event) => setValues((current) => ({ ...current, priority: event.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label-text">Status</label>
            <select
              className="input-field"
              value={values.status}
              onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="todo">Todo</option>
              <option value="inprogress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="label-text">Deadline</label>
            <input
              type="date"
              className="input-field"
              value={values.deadline}
              onChange={(event) => setValues((current) => ({ ...current, deadline: event.target.value }))}
            />
          </div>
          <div>
            <label className="label-text">Assigned user</label>
            <select
              className="input-field"
              value={values.assignedTo}
              onChange={(event) => setValues((current) => ({ ...current, assignedTo: event.target.value }))}
            >
              <option value="">Unassigned</option>
              {project?.members?.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800/70">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Current priority</span>
          <PriorityBadge priority={values.priority} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="gradient-button w-full">
            {task?._id ? "Update Task" : "Create Task"}
          </button>
          {task?._id ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white"
            >
              Delete
            </button>
          ) : null}
        </div>
      </form>

      {task?._id ? (
        <div className="mt-8">
          <h4 className="font-display text-xl font-semibold">Comments</h4>
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{comment.userId?.name}</p>
                  <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{comment.message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={submitComment} className="mt-4 flex gap-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add a comment..."
              className="input-field"
            />
            <button type="submit" className="gradient-button whitespace-nowrap">
              Send
            </button>
          </form>
        </div>
      ) : null}
    </ModalShell>
  );
};

export default TaskModal;
