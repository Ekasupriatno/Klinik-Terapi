import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevUnreadCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  // Core fetch function
  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Prevent concurrent overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (showLoading) setLoading(true);

    try {
      const response = await notificationService.getAll({ limit: 20 });
      if (response.data?.success) {
        const items = response.data.data || [];
        const count = response.data.unread_count || 0;

        setNotifications(items);
        setUnreadCount(count);

        // Optional: Trigger subtle notification sound if new notification arrived
        if (count > prevUnreadCountRef.current && prevUnreadCountRef.current > 0) {
          try {
            // Subtle web audio ping
            playNotificationChime();
          } catch {
            // ignore audio restrictions
          }
        }
        prevUnreadCountRef.current = count;
      }
    } catch (err) {
      // Silently catch 401 or network glitch during polling
      if (err.response?.status !== 401) {
        console.error('Error fetching notifications:', err);
      }
    } finally {
      isFetchingRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, [isAuthenticated]);

  // Fast broadcast trigger function
  const refreshNotifications = useCallback(() => {
    fetchNotifications(false);
    // Broadcast to other tabs or listeners
    try {
      window.dispatchEvent(new CustomEvent('notification-refresh'));
      localStorage.setItem('last_notification_sync', Date.now().toString());
    } catch {
      // ignore
    }
  }, [fetchNotifications]);

  // Mark single as read
  const markAsRead = useCallback(async (id) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    prevUnreadCountRef.current = Math.max(0, prevUnreadCountRef.current - 1);

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);
    prevUnreadCountRef.current = 0;

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Delete single notification
  const deleteNotification = useCallback(async (id) => {
    // Optimistic UI update
    setNotifications((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && !target.read_at) {
        setUnreadCount((count) => Math.max(0, count - 1));
        prevUnreadCountRef.current = Math.max(0, prevUnreadCountRef.current - 1);
      }
      return prev.filter((item) => item.id !== id);
    });

    try {
      await notificationService.delete(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    // Optimistic UI update
    setNotifications([]);
    setUnreadCount(0);
    prevUnreadCountRef.current = 0;

    try {
      await notificationService.deleteAll();
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Reactive Lifecycle: Polling & Event Listeners
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
      return undefined;
    }

    // 1. Initial immediate fetch
    fetchNotifications(true);

    // 2. High-responsiveness polling interval (every 4 seconds when active)
    const POLL_INTERVAL = 4000;
    const intervalId = window.setInterval(() => {
      // Only poll when browser tab is active/visible
      if (document.visibilityState === 'visible') {
        fetchNotifications(false);
      }
    }, POLL_INTERVAL);

    // 3. Instant fetch upon tab focus or visibility change (NO REFRESH NEEDED)
    const handleFocus = () => {
      fetchNotifications(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(false);
      }
    };

    // 4. Custom event for immediate sync after actions
    const handleCustomRefresh = () => {
      fetchNotifications(false);
    };

    // 5. Cross-tab storage sync
    const handleStorageChange = (e) => {
      if (e.key === 'last_notification_sync') {
        fetchNotifications(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('notification-refresh', handleCustomRefresh);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notification-refresh', handleCustomRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Subtle Web Audio Chime without requiring audio files
function playNotificationChime() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}
