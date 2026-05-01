import { get, post } from "@/lib/api";
import { SentNotification, TargetType, NotificationType } from "@/stores/notification.store";

export interface NotificationPayload {
  title: string;
  content: string;
  target_role: string;
  type: string;
}

export interface SendToUserDto {
  userIds: string[];
  notification: NotificationPayload;
}

export interface SendToRoleDto {
  notification: NotificationPayload;
}

/**
 * Notification Service
 * Encapsulates all notification-related API calls.
 */
export const notificationService = {
  /**
   * Get all sent notifications for table view
   * GET /api/v1/admin/notifications/table/list
   */
  getAll: (): Promise<{ data: { items: SentNotification[] } }> =>
    get<{ data: { items: SentNotification[] } }>("/admin/notifications/table/list"),

  /**
   * Send a notification to specific roles
   * POST /api/v1/admin/notifications/send-to-role
   */
  sendToRole: (data: SendToRoleDto): Promise<unknown> =>
    post<unknown>("/admin/notifications/send-to-role", data),

  /**
   * Send a notification to specific users
   * POST /api/v1/admin/notifications/send-to-user
   */
  sendToUser: (data: SendToUserDto): Promise<unknown> =>
    post<unknown>("/admin/notifications/send-to-user", data),
};
