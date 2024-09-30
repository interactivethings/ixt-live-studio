import { Node } from '@/components/team-communication/TeamCommunication';
import { RADIUS_PADDING, SCREEN_PADDING } from '@/configs/styling';
import {
  DisplayDataMapping,
  FormattedDataMapping,
} from '@/contexts/display-context';
import { DisplayType, TeamMember, Views } from '@/types/firebase';
import { Bound, MediaQueries } from '@/types/general';
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
      const margin = adjustToMedia(query, [200, 300, 400]);
      const step = (space - margin) / (members.length / 2); // Base step size

      return members.map((member, i) => {
        const diagonal = i < members.length / 2 ? 'positive' : 'negative';

        if (diagonal === 'positive') {
          // Positive diagonal (\)
          return {
            ...member,
            color: options?.offBranding ? member.color : '#003B5C',

            x: centerX - (members.length / 4) * step + i * step,
            y: centerY - (members.length / 4) * step + i * step,
          };
        } else {
          // Negative diagonal (/)
          const index = i - members.length / 2;
          const totalNegativePoints = members.length / 2;
          const threshold = Math.floor(totalNegativePoints * 0.4); // 40% of the negative diagonal

          if (index === threshold) {
            // If the point is exactly at the 40% mark, increase the space
            const largerStep = step * 2; // Increase step size at 40%
            return {
              ...member,
              color: options?.offBranding ? member.color : '#003B5C',
              x:
                centerX +
                (members.length / 4) * step -
                (index * step + largerStep), // Larger space at 40%
              y:
                centerY -
                (members.length / 4) * step +
                (index * step + largerStep), // Larger space at 40%
            };
          } else if (index > threshold) {
            // For the points after 40%, adjust the spacing to account for the larger step at the 40% mark
            const remainingPoints = totalNegativePoints - threshold;
            const adjustedStep = (space - margin - step * 4) / remainingPoints; // Adjusted step after 40%

            const adjustedIndex = index - threshold; // Adjust index after 40%
            return {
              ...member,
              color: options?.offBranding ? member.color : '#003B5C',
              x:
                centerX +
                (members.length / 4) * step -
                threshold * step -
                adjustedIndex * adjustedStep, // Adjusted position
              y:
                centerY -
                (members.length / 4) * step +
                threshold * step +
                adjustedIndex * adjustedStep, // Adjusted position
            };
          } else {
            // Regular step for points before 40%
            return {
              ...member,
              color: options?.offBranding ? member.color : '#FF5555',
              x: centerX + (members.length / 4) * step - index * step, // Regular step before 40%
              y: centerY - (members.length / 4) * step + index * step, // Regular step before 40%
            };
          }
        }
      });
    },
  };

  return positions[view as keyof typeof positions](members, options);
};

export interface Spaces {
  width: number;
  height: number;
  freeSpaceArea: Bound[];
}

export const resolveCollisions = (
  spaces: Spaces,
  nodes: Node[],
  query: MediaQueries
): Node[] => {
  // Step 1 - Check for viewport collisions and return the updated nodes
  const viewPortResolvedNodes = resolveViewportCollisions(spaces, query, nodes);

  // Step 2 - Check for free space collisions and return the updated nodes
  // const freeSpaceResolvedNodes = resolveFreeSpaceCollisions(
  //   viewPortResolvedNodes,
  //   spaces,
  //   query
  // );

  // // Step 3 - Check for node collisions between each node
  // const finalResolvedNodes = resolveNodeCollisions(
  //   freeSpaceResolvedNodes,
  //   query
  // );

  return viewPortResolvedNodes;
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

// export const resolveFreeSpaceCollisions = (
//   nodes: Node[],
//   spaces: Spaces,
//   query: MediaQueries
// ): Node[] => {
//   const radiusPadding = adjustToMedia(query, RADIUS_PADDING);

//   const resolvedNodes = nodes.map((node) => {
//     const intersections: { x: number; y: number }[] = [];
//     // Cast rays in 4 directions (left, right, up, down)
//     const rays = [
//       { dx: -1, dy: 0 }, // Left
//       { dx: 1, dy: 0 }, // Right
//       { dx: 0, dy: -1 }, // Up
//       { dx: 0, dy: 1 }, // Down
//     ];

//     rays.forEach((ray) => {
//       const rayEnd = castRay(node, ray, spaces);
//       if (rayEnd) intersections.push(rayEnd);
//     });

//     if (intersections.length === 0) return node;

//     const chosenIntersection =
//       intersections[Math.floor(Math.random() * intersections.length)];

//     const adjustedNode = {
//       ...node,
//       x: chosenIntersection.x + node.radius + radiusPadding,
//       y: chosenIntersection.y + node.radius + radiusPadding,
//     };

//     return adjustedNode;
//   });

//   return resolvedNodes;
// };

// const isInside = (
//   edges: [number[], number[]][],
//   xp: number,
//   yp: number
// ): boolean => {
//   let cnt = 0;

//   edges.forEach((edge) => {
//     const [[x1, y1], [x2, y2]] = edge;

//     if (yp < y1 !== yp < y2 && xp < x1 + ((yp - y1) / (y2 - y1)) * (x2 - x1)) {
//       cnt++;
//     }
//   });

//   return cnt % 2 === 1;
// };

// const castRay = (
//   node: Node,
//   ray: Ray,
//   spaces: Spaces
// ): { x: number; y: number } | null => {
//   let rayX = node.x;
//   let rayY = node.y;

//   const getEdgesFromRect = (rect: Bound): [number[], number[]][] => [
//     [
//       [rect.left, rect.top],
//       [rect.right, rect.top],
//     ], // Top edge
//     [
//       [rect.right, rect.top],
//       [rect.right, rect.bottom],
//     ], // Right edge
//     [
//       [rect.right, rect.bottom],
//       [rect.left, rect.bottom],
//     ], // Bottom edge
//     [
//       [rect.left, rect.bottom],
//       [rect.left, rect.top],
//     ], // Left edge
//   ];

//   while (true) {
//     rayX += ray.dx;
//     rayY += ray.dy;

//     for (const rect of spaces.freeSpaceArea) {
//       const edges = getEdgesFromRect(rect);
//       if (isInside(edges, rayX, rayY)) {
//         return { x: rayX, y: rayY };
//       }
//     }

//     if (rayX < 0 || rayY < 0 || rayX > spaces.width || rayY > spaces.height) {
//       break;
//     }
//   }

//   return null;
// };

// export const resolveNodeCollisions = (
//   nodes: Node[],
//   query: MediaQueries
// ): Node[] => {
//   const radiusPadding = adjustToMedia(query, RADIUS_PADDING);
//   const resolvedNodes = [...nodes];

//   for (let i = 0; i < resolvedNodes.length; i++) {
//     for (let j = i + 1; j < resolvedNodes.length; j++) {
//       const node1 = resolvedNodes[i];
//       const node2 = resolvedNodes[j];

//       const dx = node2.x - node1.x;
//       const dy = node2.y - node1.y;
//       const distance = Math.sqrt(dx * dx + dy * dy);

//       const minDistance = node1.radius + node2.radius + 2 * radiusPadding;

//       if (distance < minDistance) {
//         const rays = [
//           { dx: -1, dy: 0 }, // Left
//           { dx: 1, dy: 0 }, // Right
//           { dx: 0, dy: -1 }, // Up
//           { dx: 0, dy: 1 }, // Down
//         ];

//         const intersections1 = castRaysForCollisions(node1, rays, nodes);
//         const intersections2 = castRaysForCollisions(node2, rays, nodes);

//         if (intersections1.length > 0) {
//           const chosenIntersection1 =
//             intersections1[Math.floor(Math.random() * intersections1.length)];
//           resolvedNodes[i] = {
//             ...node1,
//             x: chosenIntersection1.x + node1.radius + radiusPadding,
//             y: chosenIntersection1.y + node1.radius + radiusPadding,
//           };
//         }

//         if (intersections2.length > 0) {
//           const chosenIntersection2 =
//             intersections2[Math.floor(Math.random() * intersections2.length)];
//           resolvedNodes[j] = {
//             ...node2,
//             x: chosenIntersection2.x + node2.radius + radiusPadding,
//             y: chosenIntersection2.y + node2.radius + radiusPadding,
//           };
//         }
//       }
//     }
//   }

//   return resolvedNodes;
// };
// const castRaysForCollisions = (
//   node: Node,
//   rays: { dx: number; dy: number }[],
//   nodes: Node[]
// ): { x: number; y: number }[] => {
//   const intersections: { x: number; y: number }[] = [];

//   rays.forEach((ray) => {
//     let rayX = node.x;
//     let rayY = node.y;

//     while (true) {
//       rayX += ray.dx;
//       rayY += ray.dy;

//       let collisionFound = false;

//       for (const otherNode of nodes) {
//         if (otherNode !== node) {
//           const dx = otherNode.x - rayX;
//           const dy = otherNode.y - rayY;
//           const distance = Math.sqrt(dx * dx + dy * dy);

//           if (distance < otherNode.radius) {
//             intersections.push({ x: rayX, y: rayY });
//             collisionFound = true;
//             break;
//           }
//         }
//       }

//       if (collisionFound) break;

//       if (
//         rayX < 0 ||
//         rayY < 0 ||
//         rayX > window.innerWidth ||
//         rayY > window.innerHeight
//       ) {
//         break;
//       }
//     }
//   });

//   return intersections;
// };

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
