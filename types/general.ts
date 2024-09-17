export type NotificationTypes =
  | 'message'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

export interface NotificationObj {
  type: NotificationTypes;
  message?: string;
  title?: string;
  location?: string | null;
  link?: string;
  time?: string;
}
