'use client';
import { database } from '@/server/firebase/init';
import { NotificationObj } from '@/types/general';
import { off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export interface RTDB<T> {
  path: string;
  transformFunc?: (data: T) => T;
  start?: boolean;
}

export const useRTDB = <T>({
  path,
  transformFunc,
  start = true,
}: RTDB<T>): { data: T | null; error: NotificationObj } & {
  loading: boolean;
} => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<NotificationObj>({ type: 'error' });

  useEffect(() => {
    setError({ type: 'error' });
    if (start) {
      const dataRef = ref(database, path);
      const listener = onValue(
        dataRef,
        (snapshot) => {
          try {
            if (snapshot.exists()) {
              const rawData = snapshot.val();
              if (transformFunc) {
                const transformedData = transformFunc(rawData);
                setData(transformedData);
              } else {
                setData(rawData);
              }
            } else {
              setData(null);
            }
          } catch (error) {
            if (error instanceof Error) {
              const errorState: NotificationObj = {
                type: 'error',
                message: error.message,
                location: 'RTDB',
              };
              setError(errorState);
            }
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          if (error instanceof Error) {
            const errorState: NotificationObj = {
              type: 'error',
              message: error.message,
              location: 'RTDB',
            };

            setError(errorState);
          }
        }
      );

      return () => {
        off(dataRef, 'value', listener);
      };
    }
  }, [path, transformFunc, start]);

  return { data, error, loading };
};
