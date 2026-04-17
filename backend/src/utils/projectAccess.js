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
