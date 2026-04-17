const priorityStyles = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const PriorityBadge = ({ priority = "medium" }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${priorityStyles[priority]}`}>
    {priority}
  </span>
);

export default PriorityBadge;
