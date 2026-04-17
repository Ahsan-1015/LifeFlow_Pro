import { registerUserSocket, unregisterSocket } from "../services/socketStore.js";

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("auth:join", (userId) => {
      registerUserSocket(String(userId), socket.id);
    });

    socket.on("project:join", (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("task:join", (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on("disconnect", () => {
      unregisterSocket(socket.id);
    });
  });
};
