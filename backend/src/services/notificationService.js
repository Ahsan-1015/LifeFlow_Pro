import Notification from "../models/Notification.js";
import { emitToUser } from "./socketStore.js";

export const createNotification = async (io, { userId, message, type, metadata = {} }) => {
  const notification = await Notification.create({
    userId,
    message,
    type,
    metadata,
  });

  emitToUser(io, String(userId), "notification:new", notification);
  return notification;
};
