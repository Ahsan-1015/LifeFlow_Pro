const ROLE_MAP = {
  admin: "super_admin",
  super_admin: "super_admin",
  owner: "owner",
  project_owner: "owner",
  manager: "manager",
  team_lead: "manager",
  member: "member",
  employee: "member",
  guest: "guest",
  client: "guest",
};

export const APP_ROLES = ["super_admin", "owner", "manager", "member", "guest"];

export const normalizeRole = (role) => ROLE_MAP[String(role || "").toLowerCase()] || "member";

export const hasRoleAccess = (userRole, allowedRoles = []) =>
  allowedRoles.map(normalizeRole).includes(normalizeRole(userRole));
