import { normalizeRole } from "./roles.js";
import { createError } from "./createError.js";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

export const getProjectMembership = (project, userId) =>
  project.members.find((member) => normalizeId(member.user) === normalizeId(userId));

export const ensureProjectAccess = (project, userId) => {
  const isOwner = normalizeId(project.owner) === normalizeId(userId);
  const membership = getProjectMembership(project, userId);

  if (!isOwner && !membership) {
    throw createError(403, "You do not have access to this project");
  }

  return { isOwner, membership };
};

export const getProjectPermissions = (project, user, task = null) => {
  const { isOwner, membership } = ensureProjectAccess(project, user?._id);
  const platformRole = normalizeRole(user?.role);
  const memberRole = membership?.role || "";
  const isSuperAdmin = platformRole === "super_admin";
  const isGuest = platformRole === "guest";
  const isManager =
    platformRole === "manager" || memberRole === "manager" || memberRole === "admin";
  const canManageProject = isSuperAdmin || isOwner;
  const canManageTeam = canManageProject || isManager;
  const canManageTasks = canManageProject || isManager;
  const isAssignedUser = task ? normalizeId(task.assignedTo) === normalizeId(user?._id) : false;
  const canUpdateOwnTask = !isGuest && isAssignedUser;
  const canUploadTaskAttachment = !isGuest && (canManageTasks || isAssignedUser);
  const canLeaveFeedback = true;

  return {
    isOwner,
    membership,
    platformRole,
    isGuest,
    canManageProject,
    canManageTeam,
    canManageTasks,
    canUpdateOwnTask,
    canUploadTaskAttachment,
    canLeaveFeedback,
  };
};
