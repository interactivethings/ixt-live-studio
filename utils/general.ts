import { Node } from '@/components/team-communication/TeamCommunication';
import { RADIUS_PADDING, SCREEN_PADDING } from '@/configs/styling';
import {
  DisplayDataMapping,
  FormattedDataMapping,
} from '@/contexts/display-context';
import { DisplayType, Views } from '@/types/firebase';
import { Bound, MediaQueries } from '@/types/general';
import { TeamMember } from '@/types/team-activity';
import { adjustToMedia } from './styles';

export const formatRTDBData = <T extends FormattedDataMapping<any>>(
  data: any | null,
  displayType: DisplayType
): T | null => {
  if (!data) return null;

  const typedData = data as DisplayDataMapping<typeof displayType>;

  const formattedSensors = Object.keys(typedData.sensors).map((sensorKey) => {
    const sensor = typedData.sensors[sensorKey as `sensor-${number}`];

    const value =
      typeof sensor.value === 'object' && !Array.isArray(sensor.value)
        ? Object.entries(sensor.value as { [key: string]: T }).map(
            ([key, value]) => ({
              id: key,
              ...(value as object),
            })
          )
        : sensor.value;

    return {
      id: sensorKey, // use the sensor key as the id
      title: sensor.title,
      value,
    };
  });

  const formattedData: T = {
    title: typedData.title,
    description: typedData.description,
    sensors: formattedSensors,
  } as T;

  return formattedData;
};

export interface ExtendedTeamMember extends TeamMember {
  radius: number;
}

//TeamCommunication Functions
type TeamPositions = {
  circle: (
    members: ExtendedTeamMember[],
    options?: { [key: string]: boolean }
  ) => Node[];
  x: (
    members: ExtendedTeamMember[],
    options?: { [key: string]: boolean }
  ) => Node[];
  random: (
    members: ExtendedTeamMember[],
    options?: { [key: string]: boolean }
  ) => Node[];
};

interface TeamViewPositionsParams {
  view: Views['team-communication'][number]['view'];
  members: ExtendedTeamMember[];
  spaces: Spaces;
  query: MediaQueries;
  options?: { [key: string]: boolean };
}

export const viewTeamPositions = ({
  view,
  members,
  spaces,
  query,
  options,
}: TeamViewPositionsParams) => {
  const positions: TeamPositions = {
    random: (members: ExtendedTeamMember[]) => {
      const nodes = members.map((member) => {
        return {
          ...member,
          x: Math.random() * spaces.width,
          y: Math.random() * spaces.height,
        } as Node;
      });
      return resolveCollisions(spaces, nodes, query);
    },
    circle: (members: ExtendedTeamMember[]) => {
      const center = { x: spaces.width / 2, y: spaces.height / 2 };
      const angle = (2 * Math.PI) / members.length;
      const radius = Math.min(spaces.width, spaces.height) / 2 - 100;

      return members.map((member, i) => {
        return {
          ...member,
          x: center.x + radius * Math.cos(i * angle),
          y: center.y + radius * Math.sin(i * angle),
        };
      });
    },
    x: (
      members: ExtendedTeamMember[],
      options: {
        [key: string]: boolean;
      } = {
        offBranding: true,
      }
    ) => {
      const centerX = spaces.width / 2;
      const centerY = spaces.height / 2;
      const space = Math.min(spaces.width, spaces.height);
      const margin = adjustToMedia(query, [50, 100, 200]);

      const diagLength = space - margin * 2;

      const outerOffset = 50; // Space between end and last point

      const half = Math.ceil(members.length / 2);
      const positiveDiagonalMembers = members.slice(0, half);
      const negativeDiagonalMembers = members.slice(half);

      const positions: Node[] = [];

      /*** Positive Diagonal (\) - Full length, Blue ***/
      const x0_pos = centerX - diagLength / 2 + outerOffset;
      const y0_pos = centerY - diagLength / 2 + outerOffset;
      const x1_pos = centerX + diagLength / 2 - outerOffset;
      const y1_pos = centerY + diagLength / 2 - outerOffset;

      const n_pos = positiveDiagonalMembers.length;

      for (let i = 0; i < n_pos; i++) {
        const member = positiveDiagonalMembers[i];

        let x, y;

        if (n_pos === 1) {
          x = (x0_pos + x1_pos) / 2;
          y = (y0_pos + y1_pos) / 2;
        } else {
          const t = i / (n_pos - 1);
          x = x0_pos + t * (x1_pos - x0_pos);
          y = y0_pos + t * (y1_pos - y0_pos);
        }

        positions.push({
          ...member,
          x: x,
          y: y,
          color: options?.offBranding ? member.color : '#003B5C', // Blue color
        } as Node);
      }

      /*** Negative Diagonal (/) - Split into Upper (Red) and Lower (Blue) segments ***/
      const n_neg = negativeDiagonalMembers.length;
      const n_upper = Math.ceil(n_neg * 0.4); // Approx. 40% of members for the upper segment
      const n_lower = n_neg - n_upper;

      const upperSegmentMembers = negativeDiagonalMembers.slice(0, n_upper);
      const lowerSegmentMembers = negativeDiagonalMembers.slice(n_upper);

      // Upper Segment (Red) - From top right, half-length towards center
      const x0_neg_upper = centerX + diagLength / 2 - outerOffset;
      const y0_neg_upper = centerY - diagLength / 2 + outerOffset;
      const x_center = centerX;
      const y_center = centerY;
      const x1_neg_upper = x0_neg_upper + (x_center - x0_neg_upper) * 0.5;
      const y1_neg_upper = y0_neg_upper + (y_center - y0_neg_upper) * 0.5;

      for (let i = 0; i < n_upper; i++) {
        const member = upperSegmentMembers[i];

        let x, y;

        if (n_upper === 1) {
          x = (x0_neg_upper + x1_neg_upper) / 2;
          y = (y0_neg_upper + y1_neg_upper) / 2;
        } else {
          const t = i / (n_upper - 1);
          x = x0_neg_upper + t * (x1_neg_upper - x0_neg_upper);
          y = y0_neg_upper + t * (y1_neg_upper - y0_neg_upper);
        }

        positions.push({
          ...member,
          x: x,
          y: y,
          color: options?.offBranding ? member.color : '#FF5555', // Red color
        } as Node);
      }

      // Lower Segment (Blue) - From bottom left up to the center
      const x0_neg_lower = centerX - diagLength / 2 + outerOffset;
      const y0_neg_lower = centerY + diagLength / 2 - outerOffset;
      const x1_neg_lower = centerX;
      const y1_neg_lower = centerY;

      for (let i = 0; i < n_lower; i++) {
        const member = lowerSegmentMembers[i];

        let x, y;

        if (n_lower === 1) {
          x = (x0_neg_lower + x1_neg_lower) / 2;
          y = (y0_neg_lower + y1_neg_lower) / 2;
        } else {
          const t = i / (n_lower - 1);
          x = x0_neg_lower + t * (x1_neg_lower - x0_neg_lower);
          y = y0_neg_lower + t * (y1_neg_lower - y0_neg_lower);
        }

        positions.push({
          ...member,
          x: x,
          y: y,
          color: options?.offBranding ? member.color : '#003B5C', // Blue color
        } as Node);
      }

      return positions;
    },
  };

  return positions[view as keyof typeof positions](members, options);
};

export interface Spaces {
  width: number;
  height: number;
  freeSpaceArea: Bound[];
}

function circleRectOverlap(node: Node, rect: Bound): boolean {
  // Find the closest point to the circle within the rectangle
  const closestX = clamp(node.x, rect.x, rect.x + rect.width);
  const closestY = clamp(node.y, rect.y, rect.y + rect.height);

  // Calculate the distance between the circle's center and this closest point
  const dx = node.x - closestX;
  const dy = node.y - closestY;

  // If the distance is less than the circle's radius, an intersection occurs
  const distanceSquared = dx * dx + dy * dy;

  return distanceSquared < node.radius * node.radius;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Implementing resolveFreeSpaceCollisions
export const resolveFreeSpaceCollisions = (
  nodes: Node[],
  spaces: Spaces
): Node[] => {
  const adjustedNodes = nodes.map((node) => {
    const adjustedNode = { ...node };
    let overlapFound = true;
    const maxIterations = 10;
    let iterations = 0;

    while (overlapFound && iterations < maxIterations) {
      overlapFound = false;

      for (const bound of spaces.freeSpaceArea) {
        if (circleRectOverlap(adjustedNode, bound)) {
          // Adjust node position
          // Move node away from the rectangle
          const dx = adjustedNode.x - (bound.x + bound.width / 2);
          const dy = adjustedNode.y - (bound.y + bound.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const moveDistance = adjustedNode.radius;

          if (distance > 0) {
            adjustedNode.x += (dx / distance) * moveDistance;
            adjustedNode.y += (dy / distance) * moveDistance;
          } else {
            // Randomly move the node
            adjustedNode.x += Math.random() * moveDistance * 2 - moveDistance;
            adjustedNode.y += Math.random() * moveDistance * 2 - moveDistance;
          }

          overlapFound = true;
          break; // Recheck all bounds after adjusting
        }
      }

      iterations++;
    }

    return adjustedNode;
  });

  return adjustedNodes;
};

// Implementing resolveNodeCollisions
export const resolveNodeCollisions = (nodes: Node[]): Node[] => {
  const adjustedNodes = nodes.map((node) => ({ ...node }));

  const maxIterations = 10;
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let collisionFound = false;

    for (let i = 0; i < adjustedNodes.length; i++) {
      for (let j = i + 1; j < adjustedNodes.length; j++) {
        const nodeA = adjustedNodes[i];
        const nodeB = adjustedNodes[j];

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = nodeA.radius + nodeB.radius;

        if (distance < minDistance) {
          // Nodes are overlapping
          collisionFound = true;

          // Calculate overlap amount
          const overlap = (minDistance - distance) / 2;

          // Normalize the vector between nodes
          const nx = dx / distance;
          const ny = dy / distance;

          // Displace nodes away from each other
          nodeA.x -= nx * overlap;
          nodeA.y -= ny * overlap;
          nodeB.x += nx * overlap;
          nodeB.y += ny * overlap;
        }
      }
    }

    if (!collisionFound) {
      break;
    }
  }

  return adjustedNodes;
};

// Updating resolveCollisions to include the new functions
export const resolveCollisions = (
  spaces: Spaces,
  nodes: Node[],
  query: MediaQueries
): Node[] => {
  // Step 1 - Check for viewport collisions
  const viewPortResolvedNodes = resolveViewportCollisions(spaces, query, nodes);

  // Step 2 - Check for free space collisions
  const freeSpaceResolvedNodes = resolveFreeSpaceCollisions(
    viewPortResolvedNodes,
    spaces
  );

  // Step 3 - Check for node collisions between each node
  const finalResolvedNodes = resolveNodeCollisions(freeSpaceResolvedNodes);

  return finalResolvedNodes;
};

export const resolveViewportCollisions = (
  spaces: Spaces,
  query: MediaQueries,
  nodes: Node[]
): Node[] => {
  const { width, height } = spaces;

  const screenPadding = adjustToMedia(query, SCREEN_PADDING);
  const radiusPadding = adjustToMedia(query, RADIUS_PADDING);

  const resolvedNodes = nodes.map((node) => {
    let x = node.x;
    let y = node.y;

    if (x - node.radius - radiusPadding < screenPadding) {
      x = node.radius + radiusPadding + screenPadding;
    }

    if (x + node.radius + radiusPadding > width - screenPadding) {
      x = width - node.radius - radiusPadding - screenPadding;
    }

    if (y - node.radius - radiusPadding < screenPadding) {
      y = node.radius + radiusPadding + screenPadding;
    }

    if (y + node.radius + radiusPadding > height - screenPadding) {
      y = height - node.radius - radiusPadding - screenPadding;
    }

    return { ...node, x, y };
  });

  return resolvedNodes;
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

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export const getTextWidth = (
  text: string,
  options: { fontSize: number } = { fontSize: 16 }
) => {
  if (canvas === undefined && ctx === undefined) {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  ctx.font = `${options.fontSize}px Arial`;

  return ctx.measureText(text).width;
};

export const calculateStrokeWidth = (t: number, min = 1, max = 20) => {
  const amplitude = (max - min) / 2;
  const offset = (max + min) / 2;

  const strokeWidth = amplitude * Math.sin(t) + offset;

  return strokeWidth;
};

export const updateStrokeWidths = (t: number): [number, number] => {
  const initialStrokeWidth = calculateStrokeWidth(t * 0.5);
  const animatedStrokeWidth = calculateStrokeWidth(t * 0.5 + Math.PI / 2);

  return [initialStrokeWidth, animatedStrokeWidth];
};
