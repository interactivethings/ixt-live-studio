export interface DefaultChildren {
  children: React.ReactNode;
}

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

export const mediaQueries = ['sm', 'md', 'lg'];
export type MediaQueries = (typeof mediaQueries)[number];

export interface Bound extends DOMRect {
  id: string
}