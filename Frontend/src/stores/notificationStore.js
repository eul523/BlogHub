import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (message, type) => {
    const id = crypto.randomUUID();
    const notification = {
      id,
      message,
      type, // "success" | "error" | "info"
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // auto-remove after 5s
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
