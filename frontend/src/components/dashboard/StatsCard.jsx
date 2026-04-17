import { motion } from "framer-motion";

const StatsCard = ({ title, value, hint, icon: Icon, accent = "from-brand-500 to-cyan-500", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel rounded-[2rem] p-5"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-4 font-display text-4xl font-bold">{value}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      </div>
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
        <Icon size={22} />
      </div>
    </div>
  </motion.div>
);

export default StatsCard;
