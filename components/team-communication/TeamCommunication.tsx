'use client';
import { easingCubic, RADIUS_PADDING, SCREEN_PADDING } from '@/configs/styling';
import { useConfig } from '@/contexts/config-context';
import { useDisplay } from '@/contexts/display-context';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { MetricTypes } from '@/types/display-types';
import { getMetricType, resolveCollisions } from '@/utils/normalize';
import { motion } from 'framer-motion';
import { FC, Fragment, useEffect, useState } from 'react';

export interface Node {
  id: string;
  name: string;
  messages: number;
  characters: number;
  lastMessage: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  connections: {
    [key: string]: { messages: number; characters: number };
  };
  change: boolean; // New change prop
}

export interface Edge {
  source: Node;
  target: Node;
  connection: string;
}

// Helper function to check for collisions

const TeamCommunication: FC = () => {
  const { displayType, metricConfigs } = useConfig();
  const metricType = getMetricType(displayType as keyof MetricTypes);
  const { displayData } = useDisplay<typeof metricType>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hasRendered, setHasRendered] = useState(false);
  const [textOpacity, setTextOpacity] = useState(true);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (hasRendered) {
      const id = setTimeout(() => {
        setTextOpacity(false);
      }, 5000);

      return () => {
        clearTimeout(id);
      };
    }
  }, [hasRendered]);

  // Use an effect to set hasRendered to true after the first render
  useEffect(() => {
    setHasRendered(true); // Mark component as rendered after first mount
  }, []);
  const defaultMemberSize =
    metricConfigs?.config.defaults.circleMultiplicator || 10;

  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!width || !height) return;

    let updatedNodes: Node[] = displayData.flatMap((sensor) =>
      sensor.value.map((member, i) => {
        const radius = member.messages * defaultMemberSize || defaultMemberSize;
        const existingNode = nodes.find((node) => node.name === member.name);
        const hasChanged = existingNode?.radius !== radius;
        const fallbackPosition = radius + RADIUS_PADDING + SCREEN_PADDING;

        if (hasChanged) {
          setActive(member.id);
        }

        const connections = member.connections || {};

        if (existingNode) {
          return {
            ...existingNode,
            radius,
            change: hasChanged,
            connections, // Ensure connections are updated from member
          };
        }
        const x = Math.max(
          fallbackPosition,
          Math.min(Math.random() * width, width - fallbackPosition)
        );

        const y = Math.max(
          fallbackPosition,
          Math.min(Math.random() * height, height - fallbackPosition)
        );

        return {
          ...member,
          index: i,
          x,
          y,
          radius,
          change: true, // Reset change to true
        };
      })
    );

    // Resolve collisions
    updatedNodes = resolveCollisions(updatedNodes, width, height);

    setNodes(updatedNodes);
  }, [displayData, width, height, defaultMemberSize]);

  useEffect(() => {
    const newEdges: Edge[] = [];
    nodes.forEach((node, i) => {
      nodes.forEach((targetNode, j) => {
        if (i !== j) {
          const nodeKeys = Object.keys(node.connections);
          const targetKeys = Object.keys(targetNode.connections);

          const matchingKey = nodeKeys.find((key) => targetKeys.includes(key));
          if (matchingKey) {
            const edgeExists = newEdges.some(
              (edge) =>
                (edge.source === node && edge.target === targetNode) ||
                (edge.source === targetNode && edge.target === node)
            );

            if (!edgeExists) {
              newEdges.push({
                source: node,
                target: targetNode,
                connection: matchingKey,
              });
            }
          }
        }
      });
    });
    setEdges(newEdges); // Update edges when nodes change
  }, [nodes]);

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
    const arcHeight = 30 + index * 20;

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

  return (
    <svg width={width} height={height}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {edges.map((edge, i) => {
          return (
            <Fragment key={`gradient-${i}`}>
              <linearGradient
                id={`source-${String(edge.source.id)}-${
                  edge.source.color.split('#')[1]
                }-${edge.target.color.split('#')[1]}`}
                x1={edge.source.x > edge.target.x ? '100%' : '0'}
                y1={edge.source.y > edge.target.y ? '100%' : '0'}
                x2={edge.source.x > edge.target.x ? '0' : '100%'}
                y2={edge.source.y > edge.target.y ? '0' : '100%'}
              >
                <stop
                  offset="0%"
                  stopOpacity={1}
                  stopColor={edge.source.color}
                />

                <stop
                  offset="100%"
                  stopOpacity={1}
                  stopColor={edge.target.color}
                />
              </linearGradient>
              <linearGradient
                id={`target-${String(edge.target.id)}-${
                  edge.target.color.split('#')[1]
                }-${edge.source.color.split('#')[1]}`}
                x1={edge.target.x > edge.source.x ? '100%' : '0'}
                y1={edge.target.y > edge.source.y ? '100%' : '0'}
                x2={edge.target.x > edge.source.x ? '0' : '100%'}
                y2={edge.target.y > edge.source.y ? '0' : '100%'}
              >
                <stop
                  offset="0%"
                  stopOpacity={1}
                  stopColor={edge.target.color}
                />

                <stop
                  offset="100%"
                  stopOpacity={1}
                  stopColor={edge.source.color}
                />
              </linearGradient>
            </Fragment>
          );
        })}
      </defs>
      {edges.map((edge, i) => {
        const targetNode = nodes.find((node) => node.name === edge.target.name);
        const sourceNode = nodes.find((node) => node.name === edge.source.name);
        if (!targetNode || !sourceNode) return null;

        const sourceMessageCount =
          edge.source.connections[edge.connection].messages;
        const targetMessageCount =
          edge.target.connections[edge.connection].messages;

        return (
          <g key={`edge-${i}`}>
            {Array.from({ length: sourceMessageCount }).map((_, msgIdx) => {
              const arcSourcePath = generateAlternatingArcPath(
                sourceNode.x,
                sourceNode.y,
                targetNode.x,
                targetNode.y,
                msgIdx
              );
              return (
                <motion.path
                  id={`source-${sourceNode.id}-${msgIdx}`}
                  key={`source-${sourceNode.id}-${msgIdx}`}
                  d={arcSourcePath}
                  fill={'transparent'}
                  stroke={`url(#source-${sourceNode.id}-${
                    sourceNode.color.split('#')[1]
                  }-${targetNode.color.split('#')[1]}`}
                  strokeWidth="1"
                  initial={{
                    opacity: 0,
                    strokeWidth: 10,
                    pathLength: 0,
                  }}
                  animate={{
                    opacity: 1,
                    strokeWidth: 1,
                    pathLength: 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: hasRendered ? 1.5 : 0,
                    ease: easingCubic,
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

              return (
                <motion.path
                  id={`target-${targetNode.id}-${msgIdx}`}
                  key={`target-${targetNode.id}-${msgIdx}`}
                  d={arcTargetPath}
                  fill={'transparent'}
                  stroke={`url(#target-${targetNode.id}-${
                    targetNode.color.split('#')[1]
                  }-${sourceNode.color.split('#')[1]}`}
                  strokeWidth="1"
                  initial={{
                    opacity: 0,
                    strokeWidth: 10,
                    pathLength: 0,
                  }}
                  animate={{
                    opacity: 1,
                    strokeWidth: 1,
                    pathLength: 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: hasRendered ? 1.5 : 0,
                    ease: easingCubic,
                  }}
                />
              );
            })}
          </g>
        );
      })}
      {nodes.map((node, i) => {
        if (node.name === 'Noah') {
          console.log(node.id === active);
        }
        return (
          <>
            <motion.circle
              id={node.name}
              key={`node-${node.name}-${i}`}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color}
              initial={{
                opacity: 0,
                cx: width / 2,
                cy: height / 2,
                filter: '',
              }}
              animate={{
                opacity: 1,
                cx: node.x,
                cy: node.y,
                r: node.radius,
                filter: active === node.id ? 'url(#glow)' : '',
              }}
              filter={active === node.id ? 'url(#glow)' : ''}
              onAnimationComplete={() =>
                setTimeout(() => {
                  setActive('');
                }, 2000)
              }
              transition={{
                duration: 1.5,
                ease: easingCubic,
              }}
            />
            {active === node.id && (
              <motion.circle
                id={node.name}
                key={`node-${node.id}-${i}`}
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.color}
                initial={{
                  opacity: 0,

                  filter: '',
                }}
                animate={{
                  opacity: 1,

                  r: node.radius,
                  filter: 'url(#glow)',
                }}
                onAnimationComplete={() =>
                  setTimeout(() => {
                    setActive('');
                  }, 2000)
                }
                transition={{
                  duration: 1.5,
                  ease: easingCubic,
                }}
              />
            )}
          </>
        );
      })}

      <motion.text
        x={40}
        y={40}
        initial={{
          opacity: 1, // Start with full opacity
          y: -100,
        }}
        animate={{
          opacity: textOpacity ? 1 : 0, // Smooth transition
          y: 40,
        }}
        transition={{
          duration: 1, // Fade-out transition duration of 5s
          delay: 3, // Add delay before opacity transitions
          ease: 'easeInOut',
        }}
        textAnchor="left"
        fill="white"
        fontFamily="Arial"
        fontWeight={600}
        fontSize={width < 768 ? 28 : 56}
      >
        {displayData[0]?.title}
      </motion.text>
    </svg>
  );
};

export default TeamCommunication;
