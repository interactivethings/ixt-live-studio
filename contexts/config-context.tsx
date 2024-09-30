'use client';
import { useRTDB } from '@/hooks/use-rtdb';
import { DisplayType, Metric, Views } from '@/types/firebase';
import { trpc } from '@/utils/trpc';
import { createContext, FC, useContext, useEffect, useState } from 'react';

export interface ConfigContextType<T extends keyof Views> {
  displayType: DisplayType;
  metricConfigs: Metric<T> | undefined;
}

export const ConfigContext = createContext<ConfigContextType<any> | undefined>(
  undefined
);

export const ConfigProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data = 'team-communication' } = useRTDB<DisplayType>({
    path: '/active',
  });

  const displayType = (data as keyof Views) || 'team-communication';

  const { data: metric } = trpc.firebaseAPI.getMetric.useQuery<
    Metric<typeof displayType>
  >(displayType as string, {
    enabled: !!displayType,
  });

  const [metricConfigs, setMetricConfigs] = useState<
    Metric<typeof displayType> | undefined
  >(metric);

  useEffect(() => {
    setMetricConfigs(metric);
  }, [metric]);

  const contextValue: ConfigContextType<typeof displayType> = {
    displayType: displayType,
    metricConfigs,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = <T extends keyof Views>() => {
  const ctx = useContext(ConfigContext) as ConfigContextType<T>;

  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return ctx;
};
