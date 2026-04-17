import { motion } from "framer-motion";

const ChartCard = ({ title, subtitle, children, action, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel rounded-[2rem] p-6"
  >
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-2xl font-bold">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    <div className="h-72">{children}</div>
  </motion.section>
);

export default ChartCard;
