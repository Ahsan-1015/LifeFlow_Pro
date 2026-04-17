import { CalendarDays, MessageSquare, Paperclip, PlayCircle, SendHorizontal, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import ModalShell from "../modals/ModalShell";

const statusLabels = {
  todo: "Todo",
  inprogress: "In Progress",
  review: "In Review",
  done: "Done",
};

const MemberTaskActionModal = ({ open, onClose, task, onRefresh }) => {
  const [fullTask, setFullTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!open || !task?.id || !task?.projectId) {
      setFullTask(null);
      setComments([]);
      setComment("");
      setFile(null);
      setFeedback({ type: "", message: "" });
      return;
    }

    let ignore = false;

    const loadTask = async () => {
      try {
        const [{ data: projectData }, { data: commentData }] = await Promise.all([
          api.get(`/projects/${task.projectId}`),
          api.get(`/tasks/${task.id}/comments`),
        ]);

        if (ignore) return;

        const foundTask = projectData.tasks?.find((item) => item._id === task.id);
        setFullTask(foundTask || null);
        setComments(commentData || []);
      } catch (error) {
        if (ignore) return;
        setFeedback({
          type: "error",
          message: error.userMessage || "Unable to load this task right now.",
        });
      }
    };

    loadTask();
    return () => {
      ignore = true;
    };
  }, [open, task]);

  const attachments = useMemo(() => fullTask?.attachments || [], [fullTask]);

  const updateStatus = async (status) => {
    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });
      await api.put(`/tasks/${task.id}`, { status });
      setFullTask((current) => (current ? { ...current, status } : current));
      setFeedback({
        type: "success",
        message:
          status === "inprogress"
            ? "Task moved to In Progress."
            : status === "review"
              ? "Task submitted for manager review."
              : "Task updated successfully.",
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || "Unable to update task status right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });
      const { data } = await api.post(`/comments/${task.id}`, { message: comment.trim() });
      setComments((current) => [...current, data]);
      setComment("");
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || "Unable to add your comment right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (event) => {
    event.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/tasks/${task.id}/attachments`, formData);
      setFullTask(data);
      setFile(null);
      setFeedback({
        type: "success",
        message: "File uploaded successfully.",
      });
      onRefresh?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.userMessage || "Unable to upload this file right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title={task?.task || "Task Workspace"}>
      <div className="space-y-6">
        {feedback.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              feedback.type === "error"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
              {statusLabels[fullTask?.status || task?.status] || task?.status}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">{fullTask?.priority || task?.priority}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Deadline</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
              {fullTask?.deadline ? new Date(fullTask.deadline).toLocaleDateString() : task?.due || "Flexible"}
            </p>
          </div>
        </div>

        <div className="rounded-[1.6rem] bg-slate-100 p-5 dark:bg-slate-800/70">
          <h4 className="font-display text-xl font-bold">Task Actions</h4>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Start work when you begin, then submit the task for review when your part is ready.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => updateStatus("inprogress")}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
            >
              <PlayCircle size={16} />
              Start Work
            </button>
            <button
              type="button"
              onClick={() => updateStatus("review")}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              <SendHorizontal size={16} />
              Submit Work
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-500" />
              <h4 className="font-display text-xl font-bold">Comments</h4>
            </div>
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((item) => (
                  <div key={item._id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.userId?.name}</p>
                      <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                  No comments yet.
                </div>
              )}
            </div>
            <form onSubmit={submitComment} className="space-y-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="input-field min-h-28"
                placeholder="Add an update or ask for help..."
              />
              <button type="submit" disabled={loading} className="gradient-button w-full">
                Post Comment
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Paperclip size={18} className="text-brand-500" />
              <h4 className="font-display text-xl font-bold">Files</h4>
            </div>
            <div className="space-y-3">
              {attachments.length > 0 ? (
                attachments.map((attachment) => (
                  <a
                    key={attachment.publicId || attachment.url}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl bg-slate-100 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="truncate">{attachment.originalName || "Attachment"}</span>
                    <CalendarDays size={16} className="shrink-0 text-slate-400" />
                  </a>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                  No files uploaded yet for this task.
                </div>
              )}
            </div>
            <form onSubmit={uploadAttachment} className="rounded-[1.6rem] bg-slate-100 p-5 dark:bg-slate-800/70">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Upload Task File</p>
              <input
                type="file"
                className="mt-4 block w-full text-sm"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <button type="submit" disabled={loading || !file} className="gradient-button mt-5 w-full">
                <Upload size={16} />
                <span className="ml-2">Upload File</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default MemberTaskActionModal;
