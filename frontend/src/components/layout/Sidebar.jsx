import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  FolderKanban,
  Headset,
  Home,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserCircle2,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { normalizeRole, roleLabels, roleMenus } from "../../utils/roles";

const iconMap = {
  overview: LayoutDashboard,
  users: Users,
  projects: FolderKanban,
  revenue: CreditCard,
  reports: BarChart3,
  analytics: BarChart3,
  support: Headset,
  settings: Settings,
  team: Users,
  boards: KanbanSquare,
  tasks: FileText,
  calendar: CalendarDays,
  billing: CreditCard,
  assigned: FolderKanban,
  teamtasks: FileText,
  kanban: KanbanSquare,
  reviews: ShieldCheck,
  messages: MessageSquare,
  mytasks: FileText,
  files: FileText,
  profile: UserCircle2,
  shared: FolderKanban,
  milestones: CalendarDays,
  feedback: MessageSquare,
};

const Sidebar = ({ onNavigate }) => {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const navItems = roleMenus[role] || roleMenus.member;
  const handleNavigate = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <aside className="premium-scroll glass-panel flex h-full min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain p-5 lg:h-[calc(100vh-3rem)]">
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">FlowPilot</div>
        <h1 className="font-display text-2xl font-bold">Team momentum, organized.</h1>
      </div>

      <div className="rounded-2xl bg-slate-950/90 p-4 text-white dark:bg-slate-800">
        <p className="text-sm text-white/70">Signed in as</p>
        <p className="mt-2 font-semibold">{user?.name}</p>
        <p className="text-sm text-white/70">{user?.email}</p>
        <div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-200">
          {roleLabels[role]}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const ItemIcon = iconMap[item.key] || LayoutDashboard;
          const isNotifications = item.label.toLowerCase().includes("message");

          return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                  : "text-slate-600 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800/80"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <ItemIcon size={18} />
              {item.label}
            </span>
            {isNotifications && unreadCount > 0 ? (
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs">{unreadCount}</span>
            ) : null}
          </NavLink>
          );
        })}
      </nav>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleNavigate("/")}
          className="flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-200"
        >
          <Home size={18} />
          Back to Home
        </button>
        <button
          type="button"
          onClick={() => handleNavigate("/search")}
          className="flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-200"
        >
          <Search size={18} />
          Global Search
        </button>
        <button
          type="button"
          onClick={() => {
            toggleTheme();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-200"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
