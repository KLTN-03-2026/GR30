import { create } from "zustand";

export type NotificationType = "PROMOTIONAL" | "ALERT" | "REMINDER" | "SYSTEM" | "PROMOTION";
export type TargetType = "all" | "role" | "specific" | "ALL";
export type NotificationStatus = "SENT" | "SCHEDULED" | "DRAFT" | "FAILED" | "sent" | "scheduled" | "draft" | "failed" | string;

export interface SentNotification {
  id: string;
  title: string;
  content?: string;
  type: NotificationType;
  targetType?: TargetType;
  targetRole?: string;
  targetUsers?: string[];
  recipientCount: number;
  readCount: number;
  isRead?: boolean;
  readSummary: string;
  status: NotificationStatus;
  createdAt: string;
  sentAt?: string;
  readAt?: string | null;
  createdBy: string;
}

interface NotificationUIState {
  notifications: SentNotification[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (
    notifications: SentNotification[] | ((prev: SentNotification[]) => SentNotification[])
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationUIState>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  setNotifications: (updater) =>
    set((state) => ({
      notifications:
        typeof updater === "function" ? updater(state.notifications) : updater,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
