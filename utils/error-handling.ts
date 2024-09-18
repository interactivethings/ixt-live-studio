import { NotificationObj } from '@/types/general';

export const newError = ({
  title,
  message,
  link,
  location,
}: Omit<NotificationObj, 'time' | 'type'>): NotificationObj => {
  return {
    type: 'error',
    title,
    message,
    link,
    location,
    time: new Date().toISOString(),
  };
};
