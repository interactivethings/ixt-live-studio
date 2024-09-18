import { MetricForDisplayType, MetricTypes } from '@/types/display-types';

export interface MetricBody {
  [key: `sensor-${number}`]: MetricNode<object>;
}

export interface MetricNode<T> {
  id: string;
  title: string;
  value: T;
}

export interface NormalizedMetricNode<T> {
  id: string;
  title: string;
  value: T[];
}

export const getMetricType = <T extends keyof MetricTypes>(
  displayType: T
): MetricForDisplayType<T> => {
  console.log(displayType);
  return {} as MetricForDisplayType<T>;
};

export const normalizeData = <T>(
  data: MetricBody | null
): NormalizedMetricNode<T>[] => {
  if (!data) return [];

  const normalizedData = Object.values(data);

  const normalizedValues = normalizedData.map(
    (item: MetricNode<T>): NormalizedMetricNode<T> => {
      const valueArray = Array.isArray(item.value)
        ? item.value
        : typeof item.value === 'object' && item.value !== null
        ? Object.values(item.value)
        : [item.value];

      return {
        ...item,
        value: valueArray,
      };
    }
  );

  return normalizedValues;
};
