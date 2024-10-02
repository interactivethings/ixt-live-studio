import { useChart } from '@/contexts/chart-context';
import { useConfig } from '@/contexts/config-context';
import { useDisplay } from '@/contexts/display-context';
import { useMedia } from '@/hooks/use-media';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { TeamMember } from '@/types/team-activity';
import {
  calculatePreferredWhiteSpace,
  calulcateAvailableSpace,
  ExtendedTeamMember,
  relativeTeamCommunicationMemberSize,
  viewTeamPositions,
} from '@/utils/general';
import { useEffect, useState } from 'react';
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
  // Contexts
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

  const slackData = displayData?.sensors[0].value;

  // Edges & Nodes
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [positions, setPositions] = useState<Node[]>([]);

  // Custom Branding
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

  // First useEffect: Update positions only when view changes or on initial render
  useEffect(() => {
    if (slackData) {
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
          radius,
        };
      });

      const positionPreparedData = viewTeamPositions({
        view,
        members: updatedNodes,
        spaces: {
          width,
          height,
          freeSpaceArea,
        },
        query,
        options: { offBranding: turnOffBranding },
      });

      setPositions(positionPreparedData);
    }
  }, [view, width, height, freeSpaceArea, query, turnOffBranding]);

  // Second useEffect: Update other node properties when data changes
  useEffect(() => {
    if (positions.length > 0 && slackData) {
      const totalMessages = slackData.reduce(
        (acc, value) => acc + value.messages,
        0
      );

      const updatedNodes = positions.map((node) => {
        const matchingValue = slackData.find((value) => value.id === node.id);
        if (matchingValue) {
          const radius = relativeTeamCommunicationMemberSize(
            matchingValue.messages,
            availableSpace,
            totalMessages,
            defaultMemberSize
          );

          return {
            ...node,
            ...matchingValue,
            radius,
          };
        } else {
          return node;
        }
      });

      setNodes(updatedNodes);
    }
  }, [slackData, positions, availableSpace, defaultMemberSize]);

  // Update edges when nodes change
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
          if (matchingKey.length > 0) {
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
        previousNodes={nodes}
        delayBetweenInstance={delayBetweenInstance}
        nodes={nodes}
      />
    </>
  );
};

export default TeamCommunication;
