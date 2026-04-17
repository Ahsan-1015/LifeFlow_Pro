import { motion } from "framer-motion";

const TaskTable = ({ title, columns = [], rows = [], emptyText = "No rows available.", delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel overflow-hidden rounded-[2rem]"
  >
    <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800">
      <h3 className="font-display text-2xl font-bold">{title}</h3>
    </div>
    {rows.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100/90 text-slate-500 backdrop-blur dark:bg-slate-900/90 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-4 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || row._id || index} className="border-t border-slate-200/70 dark:border-slate-800">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-slate-700 dark:text-slate-200">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-300">{emptyText}</div>
    )}
  </motion.section>
);

export default TaskTable;
