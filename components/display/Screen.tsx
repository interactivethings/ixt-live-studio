'use client';
import { useConfig } from '@/contexts/config-context';
import { useDisplay } from '@/contexts/display-context';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { MetricTypes } from '@/types/display-types';
import { getMetricType } from '@/utils/normalize';
import { FC, ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
}

const Screen: FC<ScreenProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const { displayType } = useConfig();
  const metricType = getMetricType(displayType as keyof MetricTypes);
  const { displayData } = useDisplay<typeof metricType>();
  console.log(displayData);

  return (
    <svg width={width} height={height}>
      {children}
    </svg>
  );
};

export default Screen;
