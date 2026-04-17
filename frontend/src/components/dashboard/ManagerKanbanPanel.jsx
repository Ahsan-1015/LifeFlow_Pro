import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";

const columns = [
  { key: "todo", title: "Todo", description: "Ready to start" },
  { key: "inprogress", title: "In Progress", description: "Actively moving" },
  { key: "review", title: "Review", description: "Waiting for approval" },
  { key: "done", title: "Done", description: "Completed delivery" },
];

const ManagerKanbanPanel = ({ dashboard }) => (
  <div className="space-y-6">
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Kanban Board</p>
      <h2 className="mt-3 font-display text-3xl font-bold">Cross-project workflow supervision</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        A manager-level kanban snapshot showing how work is distributed across all active projects in your scope.
      </p>
    </div>

    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column, index) => {
        const items = dashboard.boards?.[column.key] || [];

        return (
          <motion.section
            key={column.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-panel min-h-[520px] rounded-[2rem] p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold">{column.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{column.description}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-slate-800">
                {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <FolderKanban size={16} className="mt-1 text-brand-500" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.project}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item.assignee}
                      </span>
                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-600 dark:text-brand-300">
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Due {item.deadline}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                  No tasks in this column right now.
                </div>
              )}
            </div>
          </motion.section>
        );
      })}
    </div>
  </div>
);

export default ManagerKanbanPanel;
