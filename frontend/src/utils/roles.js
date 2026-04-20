export const normalizeRole = (role) => {
  const value = String(role || "").toLowerCase();

  if (value === "admin" || value === "super_admin") return "super_admin";
  if (value === "owner" || value === "project_owner") return "owner";
  if (value === "manager" || value === "team_lead") return "manager";
  if (value === "guest" || value === "client") return "guest";
  return "member";
};

export const roleLabels = {
  super_admin: "Super Admin",
  owner: "Project Owner",
  manager: "Manager / Team Lead",
  member: "Member / Employee",
  guest: "Guest / Client",
};

export const roleMenus = {
  super_admin: [
    { key: "overview", label: "Overview", to: "/dashboard" },
    { key: "users", label: "All Users", to: "/dashboard/users" },
    { key: "projects", label: "All Projects", to: "/dashboard/projects" },
    { key: "revenue", label: "Revenue / Plans", to: "/dashboard/revenue" },
    { key: "reports", label: "Reports", to: "/dashboard/reports" },
    { key: "analytics", label: "Analytics", to: "/dashboard/analytics" },
    { key: "support", label: "Support Tickets", to: "/dashboard/support" },
    { key: "settings", label: "Settings", to: "/dashboard/settings" },
  ],
  owner: [
    { key: "overview", label: "Dashboard", to: "/dashboard" },
    { key: "projects", label: "My Projects", to: "/projects" },
    { key: "team", label: "Team Members", to: "/dashboard/team" },
    { key: "boards", label: "Boards", to: "/dashboard/boards" },
    { key: "tasks", label: "Tasks", to: "/dashboard/tasks" },
    { key: "calendar", label: "Calendar", to: "/dashboard/calendar" },
    { key: "reports", label: "Reports", to: "/dashboard/reports" },
    { key: "billing", label: "Billing", to: "/dashboard/billing" },
    { key: "settings", label: "Settings", to: "/dashboard/settings" },
  ],
  manager: [
    { key: "overview", label: "Dashboard", to: "/dashboard" },
    { key: "assigned", label: "Assigned Projects", to: "/projects" },
    { key: "teamtasks", label: "Team Tasks", to: "/dashboard/team-tasks" },
    { key: "kanban", label: "Kanban Board", to: "/dashboard/kanban" },
    { key: "reviews", label: "Reviews", to: "/dashboard/reviews" },
    { key: "messages", label: "Messages", to: "/dashboard/messages" },
    { key: "reports", label: "Reports", to: "/dashboard/reports" },
  ],
  member: [
    { key: "overview", label: "Dashboard", to: "/dashboard" },
    { key: "mytasks", label: "My Tasks", to: "/dashboard/my-tasks" },
    { key: "projects", label: "Projects", to: "/projects" },
    { key: "calendar", label: "Calendar", to: "/dashboard/calendar" },
    { key: "messages", label: "Messages", to: "/messages" },
    { key: "files", label: "Files", to: "/dashboard/files" },
    { key: "profile", label: "Profile", to: "/profile" },
  ],
  guest: [
    { key: "overview", label: "Dashboard", to: "/dashboard" },
    { key: "shared", label: "Shared Projects", to: "/dashboard/shared-projects" },
    { key: "milestones", label: "Milestones", to: "/dashboard/milestones" },
    { key: "feedback", label: "Feedback", to: "/dashboard/feedback" },
    { key: "billing", label: "Billing", to: "/dashboard/billing" },
  ],
};

export const hasRoleAccess = (role, allowedRoles = []) =>
  allowedRoles.map(normalizeRole).includes(normalizeRole(role));
