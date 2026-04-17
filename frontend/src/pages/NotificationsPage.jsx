import { motion } from "framer-motion";
import { BellRing } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <motion.button
          key={notification._id}
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          onClick={() => markAsRead(notification._id)}
          className={`glass-panel flex w-full items-start gap-4 rounded-[2rem] p-5 text-left ${
            notification.read ? "opacity-70" : ""
          }`}
        >
          <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600">
            <BellRing size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{notification.message}</p>
            <p className="mt-1 text-sm text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
          </div>
          {!notification.read ? <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs text-white">New</span> : null}
        </motion.button>
      ))}
    </div>
  );
};

export default NotificationsPage;
