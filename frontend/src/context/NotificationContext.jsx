import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { getSocket } from "../api/socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    };

    loadNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user) return undefined;

    const socket = getSocket();
    const handleNewNotification = (notification) => {
      setNotifications((current) => [notification, ...current]);
    };

    socket.on("notification:new", handleNewNotification);
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    const { data } = await api.patch(`/notifications/${notificationId}/read`);
    setNotifications((current) =>
      current.map((notification) => (notification._id === notificationId ? data : notification))
    );
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markAsRead,
    }),
    [notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
