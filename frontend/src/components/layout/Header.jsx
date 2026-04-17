import { Menu } from "lucide-react";
import { motion } from "framer-motion";

const Header = ({ title, description, action, onOpenSidebar }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
  >
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="glass-panel flex h-12 w-12 items-center justify-center lg:hidden"
      >
        <Menu size={20} />
      </button>
      <div>
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
    {action}
  </motion.div>
);

export default Header;
