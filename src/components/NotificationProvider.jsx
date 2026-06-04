import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const addToast = useCallback((notification) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...notification, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [
      { ...notification, id: crypto.randomUUID(), timestamp: new Date() },
      ...prev
    ]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      unreadCount,
      setUnreadCount,
      notifications,
      addNotification,
      clearUnread
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
