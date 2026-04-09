import { get, post } from "@/lib/api";
import { SentNotification, TargetType, NotificationType } from "@/stores/notification.store";

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  targetType: TargetType;
  targetRole?: string;
  targetUsers?: string[];
}

/**
 * Notification Service
 * Encapsulates all notification-related API calls.
 */
export const notificationService = {
  /**
   * Get all sent notifications
   * GET /api/v1/admin/notifications/
   */
  /**
   * Get all sent notifications for table view
   * GET /api/v1/admin/notification/table/list
   */
  getAll: (): Promise<{ data: { items: SentNotification[] } }> =>
    get<{ data: { items: SentNotification[] } }>("/admin/notifications/table/list"),

  /**
   * Broadcast a notification to all users
   * POST /api/v1/admin/notifications/boardcast
   */
  broadcast: (data: CreateNotificationDto): Promise<unknown> =>
    post<unknown>("/admin/notifications/boardcast", data),

  /**
   * Send a notification to specific roles
   * POST /api/v1/admin/notifications/send-to-role
   */
  sendToRole: (data: CreateNotificationDto): Promise<unknown> =>
    post<unknown>("/admin/notifications/send-to-role", data),

  /**
   * Send a notification to specific users
   * POST /api/v1/admin/notifications/send-to-user
   */
  sendToUser: (data: CreateNotificationDto): Promise<unknown> =>
    post<unknown>("/admin/notifications/send-to-user", data),
};
