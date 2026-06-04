import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used inside NotificationProvider'
    );
  }

  return context;
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // =========================
  // TOAST
  // =========================
  const addToast = useCallback((notification) => {
    const id = crypto.randomUUID();

    const toast = {
      id,
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message || '',
      link: notification.link || null
    };

    setToasts((prev) => [...prev, toast]);

    // auto remove setelah 5 detik
    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }, 5000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }, []);

  // =========================
  // NOTIFICATION CENTER
  // =========================
  const addNotification = useCallback((notification) => {
    const item = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    };

    setNotifications((prev) => [
      item,
      ...prev
    ]);

    setUnreadCount((prev) => prev + 1);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true
      }))
    );
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,

    notifications,
    addNotification,

    unreadCount,
    setUnreadCount,
    clearUnread
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}