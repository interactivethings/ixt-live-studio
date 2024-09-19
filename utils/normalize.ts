import { Node } from '@/components/team-communication/TeamCommunication';
import { RADIUS_PADDING, SCREEN_PADDING } from '@/configs/styling';
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
        ? Object.entries(item.value).map(([key, obj]) => ({
            id: key,
            ...obj,
          }))
        : [item.value];

      return {
        ...item,
        value: valueArray,
      };
    }
  );

  return normalizedValues;
};

export const resolveCollisions = (
  nodes: Node[],
  width: number,
  height: number
): Node[] => {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];

      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = nodeA.radius + nodeB.radius + RADIUS_PADDING;

      if (distance < minDistance) {
        // Calculate overlap and resolve by shifting the nodes apart
        const overlap = minDistance - distance;
        const shiftX = (dx / distance) * (overlap / 2);
        const shiftY = (dy / distance) * (overlap / 2);

        // Ensure nodes don't go outside screen boundaries
        nodeA.x = Math.max(
          nodeA.radius + SCREEN_PADDING,
          Math.min(width - nodeA.radius - SCREEN_PADDING, nodeA.x + shiftX)
        );
        nodeA.y = Math.max(
          nodeA.radius + SCREEN_PADDING,
          Math.min(height - nodeA.radius - SCREEN_PADDING, nodeA.y + shiftY)
        );

        nodeB.x = Math.max(
          nodeB.radius + SCREEN_PADDING,
          Math.min(width - nodeB.radius - SCREEN_PADDING, nodeB.x - shiftX)
        );
        nodeB.y = Math.max(
          nodeB.radius + SCREEN_PADDING,
          Math.min(height - nodeB.radius - SCREEN_PADDING, nodeB.y - shiftY)
        );
      }
    }
  }

  return nodes;
};

export const calculatePreferredWhiteSpace = (
  width: number,
  height: number,
  ratio: [number, number]
): number => {
  const [preferredWidth, preferredHeight] = ratio;

  const widthWhiteSpace = width * (0.99 + preferredWidth / 100);
  const heightWhiteSpace = height * (0.99 + preferredHeight / 100);

  return widthWhiteSpace * heightWhiteSpace;
};

export const calulcateAvailableSpace = (space: number, whiteSpace: number) => {
  return space - whiteSpace;
};
export const relativeTeamCommunicationMemberSize = (
  messages: number,
  availableSpace: number,
  totalMessages: number,
  absoluteRadius: number
): number => {
  const messageProportion = messages / totalMessages;

  const scaledRadius = Math.sqrt(messageProportion * availableSpace) / 2;

  return Math.max(scaledRadius, absoluteRadius);
};
