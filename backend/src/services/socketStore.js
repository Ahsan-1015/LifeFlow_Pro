const userSocketMap = new Map();

export const registerUserSocket = (userId, socketId) => {
  const currentSockets = userSocketMap.get(userId) || [];
  userSocketMap.set(userId, [...new Set([...currentSockets, socketId])]);
};

export const unregisterSocket = (socketId) => {
  for (const [userId, sockets] of userSocketMap.entries()) {
    const nextSockets = sockets.filter((currentSocket) => currentSocket !== socketId);
    if (nextSockets.length > 0) {
      userSocketMap.set(userId, nextSockets);
    } else {
      userSocketMap.delete(userId);
    }
  }
};

export const emitToUser = (io, userId, eventName, payload) => {
  const sockets = userSocketMap.get(String(userId)) || [];
  sockets.forEach((socketId) => {
    io.to(socketId).emit(eventName, payload);
  });
};
