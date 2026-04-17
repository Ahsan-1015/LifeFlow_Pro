import { CalendarClock, CheckCircle2, Clock3, Gauge, ListTodo, MessageSquareText, Paperclip } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import ChartCard from "../../components/dashboard/ChartCard";
import MemberTaskActionModal from "../../components/dashboard/MemberTaskActionModal";
import StatsCard from "../../components/dashboard/StatsCard";
import TaskTable from "../../components/dashboard/TaskTable";

const sectionTitles = {
  overview: "Member overview",
  "my-tasks": "My task queue",
  calendar: "My calendar",
  files: "Task files",
};

const statusLabels = {
  todo: "Todo",
  inprogress: "Doing",
  review: "Review",
  done: "Done",
};

const MemberDashboard = ({ dashboard, section = "overview", onRefresh }) => {
  const focusTasks = dashboard.tables?.focusTasks || [];
  const myTasks = dashboard.tables?.myTasks || [];
  const fileRows = dashboard.tables?.files || [];
  const progressSeries = dashboard.charts?.personalProductivity || [];
  const miniBoard = dashboard.boards || { todo: [], doing: [], done: [] };
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const taskMap = useMemo(() => {
    const map = new Map();
    [...focusTasks, ...myTasks].forEach((task) => {
      map.set(task.id || task.taskId, task);
    });
    ["todo", "doing", "done"].forEach((column) => {
      (miniBoard[column] || []).forEach((task) => {
        map.set(task.id, {
          id: task.id,
          taskId: task.id,
          projectId: task.projectId,
          task: task.title,
          priority: task.priority,
          due: task.due,
          status: column === "doing" ? "inprogress" : column,
        });
      });
    });
    return map;
  }, [focusTasks, myTasks, miniBoard]);

  const openTaskWorkspace = (taskId) => {
    const task = taskMap.get(taskId);
    if (!task) return;
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const renderOverview = () => (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <TaskTable
          title="Today Focus Tasks"
          columns={[
            { key: "task", label: "Task" },
            { key: "status", label: "Status" },
            { key: "priority", label: "Priority" },
            { key: "due", label: "Due" },
          ]}
          rows={focusTasks.map((task) => ({
            ...task,
            status: statusLabels[task.status] || task.status,
            priority: task.priority?.charAt(0)?.toUpperCase() + task.priority?.slice(1),
          }))}
          emptyText="No focus tasks are waiting right now."
        />
        <ChartCard title="Productivity Trend" subtitle="Personal output across the week">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressSeries}>
              <defs>
                <linearGradient id="memberProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#memberProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-bold">My Kanban Mini Board</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A simple view of what is queued, actively moving, and already delivered.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {[
            { key: "todo", title: "Todo" },
            { key: "doing", title: "Doing" },
            { key: "done", title: "Done" },
          ].map((column) => (
            <div key={column.key} className="rounded-[1.7rem] bg-slate-100 p-4 dark:bg-slate-800/70">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-display text-xl font-bold">{column.title}</h4>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {(miniBoard[column.key] || []).length}
                </span>
              </div>
              <div className="space-y-3">
                {(miniBoard[column.key] || []).length > 0 ? (
                  (miniBoard[column.key] || []).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => openTaskWorkspace(task.id)}
                      className="w-full rounded-2xl bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/80"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.project}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300">
                          {task.priority}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {task.due}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500 dark:bg-slate-900/70 dark:text-slate-300">
                    No tasks here right now.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActivityFeed
          title="Deadlines"
          items={dashboard.feeds?.deadlines || []}
          emptyText="No upcoming deadlines assigned right now."
        />
        <ActivityFeed
          title="Recent Comments"
          items={dashboard.feeds?.recentComments || []}
          emptyText="No new comments on your tasks yet."
          delay={0.1}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {focusTasks.slice(0, 4).map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => openTaskWorkspace(task.id)}
            className="glass-panel rounded-[2rem] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <ListTodo className="text-brand-500" />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {statusLabels[task.status] || task.status}
              </span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{task.task}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Open task workspace to update progress, comment, or upload files.</p>
          </button>
        ))}
      </div>
    </>
  );

  const renderMyTasksSection = () => (
    <div className="space-y-6">
      <TaskTable
        title="My Tasks"
        columns={[
          { key: "task", label: "Task" },
          { key: "project", label: "Project" },
          { key: "status", label: "Status" },
          { key: "priority", label: "Priority" },
          { key: "due", label: "Due" },
          { key: "attachments", label: "Files" },
        ]}
        rows={myTasks.map((task) => ({
          ...task,
          status: statusLabels[task.status] || task.status,
          priority: task.priority?.charAt(0)?.toUpperCase() + task.priority?.slice(1),
        }))}
        emptyText="No tasks are assigned to you yet."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {myTasks.map((task) => (
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
                {task.due}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openTaskWorkspace(task.id)}
              className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
            >
              Update Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendarSection = () => (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <ActivityFeed
        title="Upcoming Due List"
        items={dashboard.feeds?.deadlines || []}
        emptyText="No upcoming due items."
      />
      <div className="glass-panel rounded-[2rem] p-6">
        <h3 className="font-display text-2xl font-bold">Deadline Planner</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Track which assigned tasks are due soon and open them quickly when you need to submit progress.
        </p>
        <div className="mt-5 space-y-3">
          {myTasks
            .filter((task) => task.due && task.due !== "Flexible")
            .map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => openTaskWorkspace(task.id)}
                className="flex w-full items-center justify-between rounded-[1.5rem] bg-slate-100 p-4 text-left transition hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{task.task}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.project}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {task.due}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderFilesSection = () => (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <h3 className="font-display text-2xl font-bold">Task Files</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Review the files attached to your assigned tasks and open a task workspace to upload the next delivery.
        </p>
        <div className="mt-5 space-y-3">
          {fileRows.length > 0 ? (
            fileRows.map((file) => (
              <div key={file.id} className="rounded-[1.5rem] bg-slate-100 p-4 dark:bg-slate-800/70">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{file.title}</p>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{file.subtitle}</p>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    Open
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              No files are attached to your tasks yet.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center gap-2">
            <Paperclip className="text-brand-500" size={18} />
            <h3 className="font-display text-2xl font-bold">Upload Hub</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Choose a task and upload screenshots, documents, or handoff files from its task workspace.
          </p>
          <div className="mt-5 space-y-3">
            {myTasks.slice(0, 6).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => openTaskWorkspace(task.id)}
                className="flex w-full items-center justify-between rounded-[1.5rem] bg-slate-100 p-4 text-left transition hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{task.task}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.project}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
                  Open
                </span>
              </button>
            ))}
          </div>
        </div>

        <ActivityFeed
          title="Recent Comments"
          items={dashboard.feeds?.recentComments || []}
          emptyText="No recent file-related updates yet."
          delay={0.05}
        />
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "my-tasks":
        return renderMyTasksSection();
      case "calendar":
        return renderCalendarSection();
      case "files":
        return renderFilesSection();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Member / Employee</p>
        <h2 className="mt-3 font-display text-3xl font-bold">{sectionTitles[section] || "Member overview"}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Complete assigned work efficiently, keep deadlines visible, post updates, and submit tasks for review without extra clutter.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="My Pending Tasks" value={dashboard.metrics.pendingTasks} hint="Current personal load" icon={ListTodo} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Due Today" value={dashboard.metrics.dueToday || 0} hint="Immediate deadlines" icon={CalendarClock} accent="from-amber-500 to-orange-500" delay={0.05} />
        <StatsCard title="Completed This Week" value={dashboard.metrics.completedThisWeek || 0} hint="Finished work" icon={CheckCircle2} accent="from-emerald-500 to-teal-500" delay={0.1} />
        <StatsCard title="Productivity Score" value={dashboard.metrics.productivityScore || "0%"} hint="Momentum this week" icon={Gauge} accent="from-fuchsia-500 to-pink-500" delay={0.15} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/messages" className="glass-panel rounded-[2rem] p-5 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <MessageSquareText className="text-brand-500" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Messages</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Open team communication and recent updates.</p>
        </Link>
        <button type="button" onClick={() => focusTasks[0] && openTaskWorkspace(focusTasks[0].id)} className="glass-panel rounded-[2rem] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <Clock3 className="text-amber-500" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Start Assigned Work</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Move a task into progress and begin execution.</p>
        </button>
        <button type="button" onClick={() => focusTasks[0] && openTaskWorkspace(focusTasks[0].id)} className="glass-panel rounded-[2rem] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="text-emerald-500" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Submit Work</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Send your finished task to the manager review queue.</p>
        </button>
        <button type="button" onClick={() => myTasks[0] && openTaskWorkspace(myTasks[0].id)} className="glass-panel rounded-[2rem] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <Paperclip className="text-violet-500" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Upload Files</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Attach screenshots, docs, and handoff assets to your task.</p>
        </button>
      </div>

      {renderSection()}

      <MemberTaskActionModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default MemberDashboard;
