import { motion } from "framer-motion";

const Loader = ({ label = "Loading workspace..." }) => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel flex w-full max-w-sm flex-col items-center gap-4 px-6 py-10 text-center"
    >
      <div className="h-14 w-14 animate-pulse rounded-3xl bg-gradient-to-br from-brand-500 to-emerald-400" />
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
    </motion.div>
  </div>
);

export default Loader;
