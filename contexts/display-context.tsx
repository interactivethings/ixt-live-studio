'use client';
import { useRTDB } from '@/hooks/use-rtdb';
import { MetricTypes } from '@/types/display-types';
import {
  getMetricType,
  MetricBody,
  normalizeData,
  NormalizedMetricNode,
} from '@/utils/normalize';
import { createContext, FC, useContext } from 'react';
import { useConfig } from './config-context';

export interface DisplayContextType<T> {
  displayData: NormalizedMetricNode<T>[];
}

export const DisplayContext = createContext<
  DisplayContextType<unknown> | undefined
>(undefined);

export const DisplayProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { displayType } = useConfig();

  const { data } = useRTDB<MetricBody>({
    path: `/data/` + displayType,
  });

  const metricType = getMetricType(displayType as keyof MetricTypes);
  const displayData = normalizeData<typeof metricType>(data);

  const contextValue: DisplayContextType<typeof metricType> = {
    displayData,
  };

  return (
    <DisplayContext.Provider value={contextValue}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = <T,>() => {
  const ctx = useContext(DisplayContext) as DisplayContextType<T>;

  if (!ctx) {
    throw new Error('useDisplay must be used within a DisplayProvider');
  }

  return ctx;
};
