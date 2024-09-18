'use client';
import { SCREEN_PADDING } from '@/configs/styling';
import { useConfig } from '@/contexts/config-context';
import { useDisplay } from '@/contexts/display-context';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { MetricTypes } from '@/types/display-types';
import { getMetricType } from '@/utils/normalize';
import * as d3 from 'd3';
import { useEffect, useState } from 'react';

const TeamMembers = () => {
  const { displayType, metricConfigs } = useConfig();
  const metricType = getMetricType(displayType as keyof MetricTypes);
  const { displayData } = useDisplay<typeof metricType>();

  const { width, height } = useWindowDimensions();

  const defaultMemberSize =
    metricConfigs?.config.defaults.circleMultiplicator || 10;

  const [nodes, setNodes] = useState<
    {
      index: number;
      x: number;
      y: number;
      radius: number;
      name: string;
      characters: number;
      messages: number;
      lastMessage: number;
      color: string;
      connections: { [key: string]: { messages: number; characters: number } };
    }[]
  >([]);

  useEffect(() => {
    const initialNodes = displayData.flatMap((sensor) =>
      sensor.value.map((member, i) => {
        const radius = member.messages * defaultMemberSize || defaultMemberSize;


        // Ensure x is between radius and width - radius
        const x = Math.max(
          radius + SCREEN_PADDING,
          Math.min(
            Math.random() * (width - SCREEN_PADDING),
            width - radius - SCREEN_PADDING
          )
        );

        // Ensure y is between radius and height - radius
        const y = Math.max(
          radius + SCREEN_PADDING,
          Math.min(
            Math.random() * (height - SCREEN_PADDING),
            height - radius - SCREEN_PADDING
          )
        );


        return {
          ...member,
          index: i,
          x,
          y,
          radius,
        };
      })
    );

    setNodes(initialNodes);

    interface NodeData {
      index: number;
      x: number;
      y: number;
      radius: number;
      name: string;
      characters: number;
      messages: number;
      lastMessage: number;
      color: string;
      connections: { [key: string]: { messages: number; characters: number } };
    }

    const simulation = d3
      .forceSimulation<NodeData>(initialNodes)
      .force(
        'collide',
        d3.forceCollide<NodeData>().radius((d) => d.radius + 5)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', () => {
        setNodes([...initialNodes]);
      });

    return () => {
      simulation.stop();
    };
  }, [displayData, width, height, defaultMemberSize]);

  console.log(nodes);

  return (
    <>
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={node.radius}
          fill={node.color}
        />
      ))}
    </>
  );
};

export default TeamMembers;
