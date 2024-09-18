'use client';
import { useRTDB } from '@/hooks/use-rtdb';
import { DisplayType } from '@/types/display-types';
import { Metric } from '@/types/firebase';
import { trpc } from '@/utils/trpc';
import { createContext, FC, useContext, useEffect, useState } from 'react';

export interface ConfigContextType {
  displayType: DisplayType | null;
  metricConfigs: Metric | undefined;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined
);

export const ConfigProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: displayType } = useRTDB<DisplayType>({ path: '/active' });
  const { data: metric } = trpc.firebaseAPI.getMetric.useQuery<Metric>(
    displayType as string,
    {
      enabled: !!displayType,
    }
  );

  const [metricConfigs, setMetricConfigs] = useState<Metric | undefined>(
    metric
  );

  useEffect(() => {
    setMetricConfigs(metric);
  }, [metric]);

  const contextValue: ConfigContextType = {
    displayType,
    metricConfigs,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);

  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return ctx;
};
