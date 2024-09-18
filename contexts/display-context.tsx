'use client';
import { useRTDB } from '@/hooks/use-rtdb';
import { MetricTypes } from '@/types/display-types';
import {
  getMetricType,
  MetricBody,
  normalizeData,
  NormalizedMetricNode,
} from '@/utils/normalize';
import { select } from 'd3';
import { createContext, FC, useContext, useEffect, useRef } from 'react';
import { useConfig } from './config-context';
export interface DisplayContextType<T> {
  displayData: NormalizedMetricNode<T>[];
  svgRef: React.RefObject<SVGSVGElement> | null;
}

export const DisplayContext = createContext<
  DisplayContextType<unknown> | undefined
>(undefined);

export const DisplayProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { displayType } = useConfig();

  const { data } = useRTDB<MetricBody>({
    path: `/data/` + displayType,
  });

  const metricType = getMetricType(displayType as keyof MetricTypes);
  const displayData = normalizeData<typeof metricType>(data);

  useEffect(() => {
    const svg = select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%');

    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  const contextValue: DisplayContextType<typeof metricType> = {
    displayData,
    svgRef,
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
