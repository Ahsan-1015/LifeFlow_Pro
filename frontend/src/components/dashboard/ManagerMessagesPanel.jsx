import { BellRing, MessageCircleMore, MessagesSquare } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import StatsCard from "./StatsCard";

const ManagerMessagesPanel = ({ dashboard }) => {
  const messages = dashboard.feeds?.messages || [];
  const comments = dashboard.feeds?.recentComments || [];
  const unread = messages.filter((message) => message.subtitle?.includes("Unread")).length;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Messages</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Manager inbox and team communication</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Stay on top of assignments, review updates, and comment threads without leaving the dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Inbox Messages" value={messages.length} hint="Recent system and task updates" icon={MessagesSquare} accent="from-brand-500 to-cyan-500" />
        <StatsCard title="Unread" value={unread} hint="Needs attention right now" icon={BellRing} accent="from-amber-500 to-orange-500" delay={0.05} />
        <StatsCard title="Comment Threads" value={comments.length} hint="Live team feedback loops" icon={MessageCircleMore} accent="from-indigo-500 to-violet-500" delay={0.1} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActivityFeed
          title="Manager Inbox"
          items={messages}
          emptyText="No messages are waiting in the manager inbox."
        />
        <ActivityFeed
          title="Comment Threads"
          items={comments}
          emptyText="No recent task conversations yet."
          delay={0.05}
        />
      </div>
    </div>
  );
};

export default ManagerMessagesPanel;
