import { easingCubic } from '@/configs/styling';
import { useChart } from '@/contexts/chart-context';
import { useConfig } from '@/contexts/config-context';
import { useInitialRender } from '@/hooks/use-init-render';
import { motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import { Edge, Node } from '../TeamCommunication';

interface ITeamEdgesProps {
  edges: Edge[];
  nodes: Node[];
  defaultArcHeight?: number;
  arcHeihgtMultiplier?: number;
  delayBetweenInstance?: number;
}

const TeamEdges: FC<ITeamEdgesProps> = ({
  edges,
  nodes,
  arcHeihgtMultiplier = 20,
  defaultArcHeight = 30,
  delayBetweenInstance = 0.2,
}) => {
  const initialRender = useInitialRender(); // Custom hook to track the initial render
  const [resetPath, setResetPath] = useState(false);

  const { metricConfigs } = useConfig();
  const { hover } = useChart();
  const viewTime = (metricConfigs?.settings?.view_time || 0) * 1000; // Convert to milliseconds

  useEffect(() => {
    if (!initialRender) {
      const resetTimeout = viewTime - 1600; // 1.5 seconds before view change

      const resetPathTimeout = setTimeout(() => {
        setResetPath(true); // Start the reset
      }, resetTimeout);

      const resetCompleteTimeout = setTimeout(() => {
        setResetPath(false); // Re-draw after reset
      }, resetTimeout + 1500); // After reset animation (1.5s)

      return () => {
        clearTimeout(resetPathTimeout);
        clearTimeout(resetCompleteTimeout);
      };
    }
  }, [edges, initialRender, viewTime]);

  const generateAlternatingArcPath = (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    index: number
  ) => {
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // Define arc height adjustment based on index
    const arcHeight = defaultArcHeight + index * arcHeihgtMultiplier;

    // Calculate the control point in 2D space where the arcs will meet
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;

    // Adjust the control point's X and Y based on the perpendicular direction and arcHeight
    const controlPointX =
      midX + 1 * arcHeight * (deltaY / Math.sqrt(deltaX ** 2 + deltaY ** 2));
    const controlPointY =
      midY - 1 * arcHeight * (deltaX / Math.sqrt(deltaX ** 2 + deltaY ** 2));

    // Generate the path from source to the calculated control point with offset on the final point
    return `M ${sourceX},${sourceY} Q ${controlPointX},${controlPointY} ${targetX},${targetY}`;
  };

  return edges.map((edge, i) => {
    const targetNode = nodes.find((node) => node.name === edge.target.name);
    const sourceNode = nodes.find((node) => node.name === edge.source.name);
    const initialAnimationDelay = nodes.length * delayBetweenInstance;
    if (!targetNode || !sourceNode) return null;

    return edge.connection.map((connection, j) => {
      const sourceMessageCount = edge.source.connections[connection].messages;
      const targetMessageCount = edge.target.connections[connection].messages;

      return (
        <g key={`edge-${i}-${connection}-${j}`}>
          {Array.from({ length: sourceMessageCount }).map((_, msgIdx) => {
            const arcSourcePath = generateAlternatingArcPath(
              sourceNode.x,
              sourceNode.y,
              targetNode.x,
              targetNode.y,
              msgIdx
            );
            const animationDelay = (j + i + msgIdx) * 0.05;

            return (
              <motion.path
                id={`source-${sourceNode.id}-${msgIdx}-${sourceNode.name}`}
                key={`source-${sourceNode.id}-${msgIdx}-${connection}-${i}-${j}`}
                fill={'transparent'}
                strokeWidth="1"
                d={arcSourcePath}
                initial={{
                  pathLength: resetPath ? 1 : 0, // If reset is true, pathLength starts at 1, otherwise 0
                  strokeWidth: resetPath ? 1 : 5,
                }}
                animate={{
                  pathLength: resetPath ? 0 : 1, // Reset to 0 if resetPath is true, then back to 1
                  strokeWidth: resetPath ? 5 : 1,
                  opacity: hover !== '' && hover !== sourceNode.id ? 0.1 : 1,
                  stroke:
                    hover === sourceNode.id
                      ? 'white'
                      : `url(#source-${sourceNode.id}-${
                          sourceNode.color.split('#')[1]
                        }-${targetNode.color.split('#')[1]})`,
                }}
                transition={{
                  pathLength: {
                    duration: 1.5, // Duration for both reset and re-draw
                    delay: resetPath
                      ? 0
                      : initialAnimationDelay + animationDelay, // No delay for reset, delay for re-draw
                    ease: easingCubic,
                  },
                  opacity: {
                    duration: hover !== '' ? 0 : 0.3,
                    ease: easingCubic,
                  },
                  stroke: {
                    duration: 0.5,
                    ease: easingCubic,
                  },
                  strokeWidth: {
                    duration: 1.5, // Duration for both reset and re-draw
                    delay: resetPath
                      ? 0
                      : initialAnimationDelay + animationDelay, // No delay for reset, delay for re-draw
                    ease: easingCubic,
                  },
                }}
              />
            );
          })}

          {Array.from({ length: targetMessageCount }).map((_, msgIdx) => {
            const arcTargetPath = generateAlternatingArcPath(
              targetNode.x,
              targetNode.y,
              sourceNode.x,
              sourceNode.y,
              msgIdx
            );

            const animationDelay = (j + i + msgIdx) * 0.05;

            return (
              <motion.path
                id={`target-${targetNode.id}-${msgIdx}-${targetNode.name}`}
                key={`target-${targetNode.id}-${msgIdx}-${connection}-${i}-${j}`}
                fill={'transparent'}
                strokeWidth="1"
                d={arcTargetPath}
                initial={{
                  pathLength: resetPath ? 1 : 0, // If reset is true, pathLength starts at 1, otherwise 0
                  strokeWidth: resetPath ? 1 : 5,
                }}
                animate={{
                  pathLength: resetPath ? 0 : 1, // Reset to 0 if resetPath is true, then back to 1
                  strokeWidth: resetPath ? 5 : 1,
                  opacity: hover !== '' && hover !== targetNode.id ? 0.1 : 1,
                  stroke:
                    hover === targetNode.id
                      ? 'white'
                      : `url(#target-${targetNode.id}-${
                          targetNode.color.split('#')[1]
                        }-${sourceNode.color.split('#')[1]}`,
                }}
                transition={{
                  pathLength: {
                    duration: 1.5, // Duration for both reset and re-draw
                    delay: resetPath
                      ? 0
                      : initialAnimationDelay + animationDelay, // No delay for reset, delay for re-draw
                    ease: easingCubic,
                  },
                  opacity: {
                    duration: hover !== '' ? 0 : 0.3,
                    ease: easingCubic,
                  },
                  stroke: {
                    duration: 0.5,
                    ease: easingCubic,
                  },
                  strokeWidth: {
                    duration: 1.5, // Duration for both reset and re-draw
                    delay: resetPath
                      ? 0
                      : initialAnimationDelay + animationDelay, // No delay for reset, delay for re-draw
                    ease: easingCubic,
                  },
                }}
              />
            );
          })}
        </g>
      );
    });
  });
};

export default TeamEdges;
