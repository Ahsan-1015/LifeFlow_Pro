import { CalendarClock, Download, Eye, Flag, MessageSquareText, PackageOpen } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useEffect, useState } from "react";
import api from "../../api/client";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Client overview",
  "shared-projects": "Shared projects",
  milestones: "Milestone roadmap",
  feedback: "Feedback panel",
  billing: "Billing snapshot",
};

const GuestDashboard = ({ dashboard, section = "overview", onRefresh }) => {
  const timelineSeries = dashboard.charts?.milestoneTimeline?.length
    ? dashboard.charts.milestoneTimeline
    : [{ name: "No data", progress: 0 }];
  const milestoneRows = dashboard.tables?.sharedMilestones || [];
  const sharedProjects = dashboard.tables?.sharedProjects || [];
  const files = dashboard.tables?.files || [];
  const feedbackTargets = dashboard.tables?.feedbackTargets || [];
  const billingSummary = dashboard.tables?.billingSummary || [];
  const [feedbackTaskId, setFeedbackTaskId] = useState(feedbackTargets[0]?.id || "");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackState, setFeedbackState] = useState({ type: "", message: "" });
  const [sendingFeedback, setSendingFeedback] = useState(false);

  useEffect(() => {
    if (!feedbackTargets.length) {
      setFeedbackTaskId("");
      return;
    }

    setFeedbackTaskId((current) =>
      feedbackTargets.some((target) => target.id === current) ? current : feedbackTargets[0].id
    );
  }, [feedbackTargets]);

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (!feedbackTaskId || !feedbackMessage.trim()) return;

    try {
      setSendingFeedback(true);
      setFeedbackState({ type: "", message: "" });
      await api.post(`/comments/${feedbackTaskId}`, { message: feedbackMessage.trim() });
      setFeedbackMessage("");
      setFeedbackState({
        type: "success",
        message: "Feedback sent successfully.",
      });
      onRefresh?.();
    } catch (error) {
      setFeedbackState({
        type: "error",
        message: error.userMessage || "Unable to send feedback right now.",
      });
    } finally {
      setSendingFeedback(false);
    }
  };

  const renderOverview = () => (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Project Timeline" subtitle="Milestone roadmap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ActivityFeed
          title="Feedback Panel"
          items={dashboard.feeds?.feedback || []}
          emptyText="No feedback messages yet."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sharedProjects.length > 0 ? (
          sharedProjects.map((project) => (
            <div key={project.id} className="glass-panel rounded-[2rem] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-500">Shared Project</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{project.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300">
                  {project.progress}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {project.members} members
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {project.screenshots} files
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Delivery: {project.deadline}</p>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500 dark:text-slate-300 md:col-span-2 xl:col-span-3">
            No shared projects are visible yet. Once your team shares delivery workspaces with you, progress and files will appear here.
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TaskTable
          title="Shared Milestones"
          columns={[
            { key: "milestone", label: "Milestone" },
            { key: "progress", label: "Progress" },
            { key: "delivery", label: "Delivery" },
          ]}
          rows={milestoneRows}
          emptyText="No shared milestones available yet."
        />
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center gap-2">
            <PackageOpen className="text-brand-500" size={18} />
            <h3 className="font-display text-2xl font-bold">Shared Files</h3>
          </div>
          <div className="mt-5 space-y-3">
            {files.length > 0 ? (
              files.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[1.5rem] bg-slate-100 p-4 transition hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{file.title}</p>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{file.subtitle}</p>
                  </div>
                  <Download size={16} className="shrink-0 text-slate-400" />
                </a>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                No shared files are available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderSharedProjects = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sharedProjects.length > 0 ? (
          sharedProjects.map((project) => (
            <div key={project.id} className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <Eye className="text-brand-500" />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {project.progress}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{project.title}</h3>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Members</p>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white">{project.members}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Files</p>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white">{project.screenshots}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Upcoming delivery: {project.deadline}</p>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500 dark:text-slate-300 md:col-span-2 xl:col-span-3">
            No shared projects are available right now.
          </div>
        )}
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center gap-2">
          <Download className="text-brand-500" size={18} />
          <h3 className="font-display text-2xl font-bold">Download Shared Files</h3>
        </div>
        <div className="mt-5 grid gap-3">
          {files.length > 0 ? (
            files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-[1.5rem] bg-slate-100 p-4 transition hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{file.title}</p>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{file.subtitle}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">Download</span>
              </a>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              No files are ready for download yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-6">
      <ChartCard title="Milestone Roadmap" subtitle="Track progress and delivery timing across shared projects">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <TaskTable
        title="Project Timeline"
        columns={[
          { key: "milestone", label: "Milestone" },
          { key: "progress", label: "Progress" },
          { key: "delivery", label: "Delivery" },
        ]}
        rows={milestoneRows}
        emptyText="No milestone roadmap available yet."
      />
    </div>
  );

  const renderFeedback = () => (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center gap-2">
          <MessageSquareText className="text-brand-500" size={18} />
          <h3 className="font-display text-2xl font-bold">Leave Feedback</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Share client notes and delivery feedback without editing the project itself.
        </p>

        {feedbackState.message ? (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${
              feedbackState.type === "error"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
            }`}
          >
            {feedbackState.message}
          </div>
        ) : null}

        <form onSubmit={submitFeedback} className="mt-5 space-y-4">
          <div>
            <label className="label-text">Feedback Target</label>
            <select
              className="input-field"
              value={feedbackTaskId}
              onChange={(event) => setFeedbackTaskId(event.target.value)}
              disabled={!feedbackTargets.length}
            >
              {feedbackTargets.length > 0 ? (
                feedbackTargets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.project} - {target.title}
                  </option>
                ))
              ) : (
                <option value="">No active feedback targets yet</option>
              )}
            </select>
          </div>
          <div>
            <label className="label-text">Comment</label>
            <textarea
              className="input-field min-h-32"
              value={feedbackMessage}
              onChange={(event) => setFeedbackMessage(event.target.value)}
              placeholder="Homepage looks good. Please use blue theme."
              disabled={!feedbackTargets.length}
            />
          </div>
          <button type="submit" disabled={sendingFeedback || !feedbackTaskId} className="gradient-button w-full">
            {sendingFeedback ? "Sending..." : "Send Feedback"}
          </button>
        </form>
      </div>

      <ActivityFeed
        title="Recent Feedback"
        items={dashboard.feeds?.feedback || []}
        emptyText="No feedback messages yet."
        delay={0.05}
      />
    </div>
  );

  const renderBilling = () => (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <TaskTable
        title="Billing Snapshot"
        columns={[
          { key: "workspace", label: "Workspace" },
          { key: "members", label: "Members" },
          { key: "plan", label: "Plan" },
          { key: "delivery", label: "Delivery" },
        ]}
        rows={billingSummary}
        emptyText="No billing summary is available yet."
      />
      <ActivityFeed
        title="Client Notes"
        items={[
          {
            id: "guest-note-1",
            title: `${dashboard.metrics.progressPercentage || "0%"} average progress is currently visible`,
            subtitle: "Clients can monitor delivery progress without editing project execution.",
          },
          {
            id: "guest-note-2",
            title: `${dashboard.metrics.completedMilestones || 0} milestones have already been completed`,
            subtitle: "Completed work is reflected automatically from the delivery pipeline.",
          },
          {
            id: "guest-note-3",
            title: `Next shared delivery is ${dashboard.metrics.nextDeliveryDate || "TBD"}`,
            subtitle: "Use milestone and feedback sections to review upcoming handoff expectations.",
          },
        ]}
        emptyText="No client notes are available."
        delay={0.05}
      />
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "shared-projects":
        return renderSharedProjects();
      case "milestones":
        return renderMilestones();
      case "feedback":
        return renderFeedback();
      case "billing":
        return renderBilling();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Client Access</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Read-only delivery view</h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              You can review progress, milestones, shared files, and timelines without changing project execution. Feedback stays open so clients can guide delivery clearly.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
            Feedback only access
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Guest / Client</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Client overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Review progress, milestones, screenshots, files, and delivery timing with a clean read-only experience and a simple feedback channel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Progress %" value={dashboard.metrics.progressPercentage || "0%"} hint="Across shared initiatives" icon={Eye} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Completed Milestones" value={dashboard.metrics.completedMilestones || 0} hint="Recent delivery markers" icon={Flag} accent="from-emerald-500 to-teal-500" delay={0.05} />
        <StatsCard title="Upcoming Delivery Date" value={dashboard.metrics.nextDeliveryDate || "TBD"} hint="Next expected milestone" icon={CalendarClock} accent="from-fuchsia-500 to-pink-500" delay={0.1} />
      </div>

      {renderSection()}
    </div>
  );
};

export default GuestDashboard;
