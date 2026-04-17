import { motion } from "framer-motion";
import { BellRing, Inbox, MessageCircleMore, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import StatsCard from "../components/dashboard/StatsCard";
import { useNotifications } from "../context/NotificationContext";

const MessagesPage = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [dashboard, setDashboard] = useState({ feeds: {}, recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/dashboard");
        if (ignore) return;
        setDashboard({
          feeds: data?.feeds || {},
          recentActivity: data?.recentActivity || [],
        });
        setError("");
      } catch (requestError) {
        if (ignore) return;
        setError(requestError.userMessage || "Unable to load messages right now.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const inboxMessages = useMemo(() => {
    const feedMessages = dashboard.feeds?.messages || [];
    if (feedMessages.length > 0) {
      return feedMessages.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        read: item.subtitle?.toLowerCase().includes("read") && !item.subtitle?.toLowerCase().includes("unread"),
      }));
    }

    return notifications.map((notification) => ({
      id: notification._id,
      title: notification.message,
      subtitle: new Date(notification.createdAt).toLocaleString(),
      read: notification.read,
      notificationId: notification._id,
    }));
  }, [dashboard.feeds, notifications]);

  const commentThreads = useMemo(
    () => (dashboard.feeds?.recentComments || dashboard.recentActivity || []).slice(0, 10),
    [dashboard.feeds, dashboard.recentActivity]
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Messages</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Communication hub</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Stay on top of teammate updates, comment threads, and delivery signals in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Inbox Items"
          value={inboxMessages.length}
          hint="Direct updates and system messages"
          icon={Inbox}
          accent="from-brand-500 to-cyan-500"
        />
        <StatsCard
          title="Unread Alerts"
          value={unreadCount}
          hint="Need attention right now"
          icon={BellRing}
          accent="from-amber-500 to-orange-500"
          delay={0.05}
        />
        <StatsCard
          title="Comment Threads"
          value={commentThreads.length}
          hint="Recent task conversations"
          icon={MessageCircleMore}
          accent="from-violet-500 to-fuchsia-500"
          delay={0.1}
        />
      </div>

      {error ? (
        <div className="glass-panel rounded-[2rem] border border-amber-200/80 p-5 text-sm text-amber-700 dark:border-amber-500/20 dark:text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-bold">Inbox</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Notifications and role-specific updates from across your workspace.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {loading ? "Loading..." : `${inboxMessages.length} items`}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {inboxMessages.length > 0 ? (
              inboxMessages.map((message, index) => (
                <motion.button
                  key={message.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => {
                    if (!message.read && message.notificationId) {
                      markAsRead(message.notificationId);
                    }
                  }}
                  className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                    message.read
                      ? "border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60"
                      : "border-brand-200/70 bg-brand-50/70 dark:border-brand-500/30 dark:bg-brand-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{message.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message.subtitle}</p>
                    </div>
                    {!message.read ? (
                      <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-slate-100 p-5 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                No messages yet. When tasks move, comments land, or updates arrive, they will show here.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600 dark:text-brand-300">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">Recent Conversations</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Task comments and activity threads that keep work moving.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {commentThreads.length > 0 ? (
              commentThreads.map((thread, index) => (
                <motion.div
                  key={thread.id || `${thread.title}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-[1.5rem] bg-slate-100 p-4 dark:bg-slate-800/70"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{thread.title || thread.text}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {thread.subtitle || thread.meta || "Workspace update"}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-slate-100 p-5 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                No conversation threads are active right now.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
