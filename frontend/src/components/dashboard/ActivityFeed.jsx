import { motion } from "framer-motion";

const ActivityFeed = ({ title, items = [], emptyText = "No recent activity yet.", delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel rounded-[2rem] p-6"
  >
    <h3 className="font-display text-2xl font-bold">{title}</h3>
    <div className="mt-5 space-y-4">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div key={item.id || item._id || `${item.title}-${index}`} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
            <p className="font-semibold">{item.title || item.text}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {item.subtitle || item.meta || item.userId?.name || "TaskFlow Pro"}
            </p>
          </div>
        ))
      ) : (
        <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
          {emptyText}
        </div>
      )}
    </div>
  </motion.section>
);

export default ActivityFeed;
