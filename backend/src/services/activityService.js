import Activity from "../models/Activity.js";

export const createActivity = async ({ projectId, userId, text, entityType, entityId }) =>
  Activity.create({
    projectId,
    userId,
    text,
    entityType,
    entityId,
  });
