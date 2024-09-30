import { useChart } from '@/contexts/chart-context';
import { useConfig } from '@/contexts/config-context';
import { useDisplay } from '@/contexts/display-context';
import { useMedia } from '@/hooks/use-media';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { TeamMember } from '@/types/firebase';
import {
  calculatePreferredWhiteSpace,
  calulcateAvailableSpace,
  ExtendedTeamMember,
  relativeTeamCommunicationMemberSize,
  viewTeamPositions,
} from '@/utils/general';
import { useEffect, useRef, useState } from 'react';
import TeamDefs from './internal/TeamDefs';
import TeamEdges from './internal/TeamEdges';
import TeamNodes from './internal/TeamNodes';

export interface Node extends TeamMember {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface Edge {
  source: Node;
  target: Node;
  connection: string[];
}

const TeamCommunication = () => {
  //Contexts
  const { displayData, freeSpaceArea } = useDisplay<'team-communication'>();
  const { view } = useChart();
  const { metricConfigs } = useConfig();
  const { width, height } = useWindowDimensions();
  const query = useMedia();

  const whiteSpaceRatio = (metricConfigs?.config.defaults.ratio as [
    number,
    number
  ]) || [0.5, 0.5];

  const whiteSpace = calculatePreferredWhiteSpace(
    width,
    height,
    whiteSpaceRatio
  );

  const defaultMemberSize: number =
    (metricConfigs?.config.defaults.minimumCircleSize as number) || 10;
  const availableSpace = calulcateAvailableSpace(width * height, whiteSpace);

  const delayBetweenInstance = 0.2;

  //Only Support Slack
  const slackData = displayData?.sensors[0].value;
  const oldSlackDataRef = useRef(slackData);

  // Edges & Nodes
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);

  //Custom Branding
  const [turnOffBranding, setTurnOffBranding] = useState(false);

  useEffect(() => {
    if (view === 'x') {
      const timeoutId = setTimeout(() => {
        setTurnOffBranding(true);
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      setTurnOffBranding(false);
    }
  }, [view]);

  useEffect(() => {
    if (slackData) {
      // First, calculate the radius for each node based on messages
      const totalMessages = slackData.reduce(
        (acc, value) => acc + value.messages,
        0
      );

      const updatedNodes: ExtendedTeamMember[] = slackData.map((value) => {
        const radius = relativeTeamCommunicationMemberSize(
          value.messages,
          availableSpace,
          totalMessages,
          defaultMemberSize
        );

        return {
          ...value,
          radius, // Add radius first
        };
      });

      const positionPreparedData = viewTeamPositions({
        view,
        members: updatedNodes, // Pass nodes with radius
        spaces: {
          width,
          height,
          freeSpaceArea,
        },
        query,
        options: { offBranding: turnOffBranding },
      });

      // Update the nodes with the new positions
      setNodes(positionPreparedData);

      oldSlackDataRef.current = slackData;
    }
  }, [slackData, view, width, height, freeSpaceArea, query]);

  useEffect(() => {
    const newEdges: Edge[] = [];
    nodes.forEach((node, i) => {
      nodes.forEach((targetNode, j) => {
        if (i !== j) {
          const nodeKeys = Object.keys(node.connections);
          const targetKeys = Object.keys(targetNode.connections);

          const matchingKey = nodeKeys.filter((key) =>
            targetKeys.includes(key)
          );
          if (matchingKey) {
            newEdges.push({
              source: node,
              target: targetNode,
              connection: matchingKey,
            });
          }
        }
      });
    });
    setEdges(newEdges);
  }, [nodes]);

  return (
    <>
      <TeamDefs edges={edges} />
      <TeamEdges
        delayBetweenInstance={delayBetweenInstance}
        edges={edges}
        nodes={nodes}
      />
      <TeamNodes
        previousNodes={oldSlackDataRef.current}
        delayBetweenInstance={delayBetweenInstance}
        nodes={nodes}
      />
    </>
  );
};

export default TeamCommunication;
