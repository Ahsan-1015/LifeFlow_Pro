import { CalendarDays, MessageSquare, User2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PriorityBadge from "../common/PriorityBadge";

const TaskCard = ({ task, onOpen }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(task)}
      className={`w-full rounded-3xl bg-white p-4 text-left shadow-md transition dark:bg-slate-900 ${
        isDragging ? "rotate-1 shadow-2xl" : "hover:-translate-y-1 hover:shadow-xl"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{task.description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CalendarDays size={14} />
          {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
        </span>
        <span className="flex items-center gap-1">
          <User2 size={14} />
          {task.assignedTo?.name || "Unassigned"}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={14} />
          Comments
        </span>
      </div>
    </button>
  );
};

export default TaskCard;
