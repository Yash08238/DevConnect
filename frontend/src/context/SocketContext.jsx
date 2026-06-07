import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to Socket.IO with auth token
    const newSocket = io('/', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server');
    });

    newSocket.on('new_notification', (notification) => {
      console.log('🔔 New Notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show dynamic toast alert
      showToast(notification);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const showToast = (notification) => {
    const toast = document.createElement('div');
    toast.className = 'glass-card fade-in';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '1000';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.borderColor = 'var(--accent-cyan)';
    toast.style.padding = '12px 20px';
    toast.style.minWidth = '300px';

    const avatarHtml = notification.sender?.avatar?.url 
      ? `<img src="${notification.sender.avatar.url}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
      : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">${notification.sender?.name?.charAt(0) || 'U'}</div>`;

    toast.innerHTML = `
      ${avatarHtml}
      <div>
        <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-white);">${notification.sender?.name || 'System'}</div>
        <div style="font-size: 0.8rem; color: var(--text-sub);">${notification.message}</div>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
