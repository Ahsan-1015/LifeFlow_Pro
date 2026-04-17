import { motion } from "framer-motion";
import { BellRing, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import { useNotifications } from "../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const readCount = notifications.length - unreadCount;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Notifications</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Alerts, assignments, and updates</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Track new assignments, task movement, mentions, and reminder events without losing context.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Alerts"
          value={notifications.length}
          hint="Recent workspace notifications"
          icon={BellRing}
          accent="from-brand-500 to-cyan-500"
        />
        <StatsCard
          title="Unread"
          value={unreadCount}
          hint="Still waiting for review"
          icon={ShieldAlert}
          accent="from-amber-500 to-orange-500"
          delay={0.05}
        />
        <StatsCard
          title="Reviewed"
          value={readCount}
          hint="Already acknowledged"
          icon={CheckCircle2}
          accent="from-emerald-500 to-teal-500"
          delay={0.1}
        />
      </div>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-bold">Notification Feed</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Click an unread item to mark it as reviewed.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {notifications.length} items
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.button
                key={notification._id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification._id);
                  }
                }}
                className={`flex w-full items-start gap-4 rounded-[1.6rem] border px-4 py-4 text-left transition ${
                  notification.read
                    ? "border-slate-200/80 bg-white/75 dark:border-slate-800 dark:bg-slate-900/65"
                    : "border-brand-200/70 bg-brand-50/70 dark:border-brand-500/30 dark:bg-brand-500/10"
                }`}
              >
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600 dark:text-brand-300">
                  <BellRing size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{notification.message}</p>
                    {!notification.read ? (
                      <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium dark:bg-slate-800">
                      {notification.type || "update"}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-slate-100 p-5 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              You are all caught up. New assignments and comments will appear here automatically.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NotificationsPage;
