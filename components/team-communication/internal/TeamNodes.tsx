import { easingCubic } from '@/configs/styling';
import { useChart } from '@/contexts/chart-context';
import { useInitialRender } from '@/hooks/use-init-render';
import { useMedia } from '@/hooks/use-media';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import {
  adjustToMedia,
  determineTooltipPosition,
  formatDate,
  getTextWidth,
} from '@/utils/styles';
import { easeInOut, motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import { Node } from '../TeamCommunication';
import Tooltip from './Tooltip';
import { TeamMember } from '@/types/team-activity';

interface ITeamNodeProps {
  nodes: Node[];
  previousNodes: TeamMember[] | undefined;
  delayBetweenInstance?: number;
}

const TeamNodes: FC<ITeamNodeProps> = ({
  nodes,
  delayBetweenInstance = 0.2,
}) => {
  const { width, height } = useWindowDimensions();
  const { hover, setHover, changed, addChange } = useChart();
  const media = useMedia();
  const initialRender = useInitialRender();

  const [previousNodes, setPreviousNodes] = useState<Node[]>([]);
  useEffect(() => {
    setPreviousNodes(nodes.map((node) => ({ ...node })));
  }, [nodes]);

  return (
    <>
      {nodes.map((node, i) => {
        const prevNode = previousNodes?.find((prev) => prev.id === node.id);

        // Check if messages or reactions have increased
        const messagesIncreased =
          prevNode && node.messages !== prevNode.messages;
        const reactionsIncreased =
          prevNode && node.reactions !== prevNode.reactions;

        if (messagesIncreased) {
          addChange(node.id, 'messages');
        }

        if (reactionsIncreased) {
          addChange(node.id, 'reactions');
        }

        const messageChange = changed.find(
          (change) => change.id === node.id && change?.cause === 'messages'
        );

        return (
          <motion.circle
            onMouseEnter={() => setHover(node.id)}
            onMouseLeave={() => setHover('')}
            key={`node-circle-${node.id}-${i}`}
            style={{ cursor: 'pointer' }}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={hover === node.id ? '#fff' : node.color || 'transparent'}
            initial={{
              opacity: 0,
              cx: width / 2,
              cy: height / 2,
              r: node.radius,
              filter: '',
            }}
            animate={{
              opacity: 1,
              cx: node.x,
              cy: node.y,
              r: node.radius,
              fill: hover === node.id ? '#fff' : node.color || 'transparent',
              filter: messageChange ? 'url(#super-glow)' : 'url(#glow)',
            }}
            transition={{
              duration: hover === node.id ? 0.5 : 1.5,
              delay: hover
                ? 0
                : !initialRender
                ? i * delayBetweenInstance
                : 1.5,
              ease: easingCubic,
            }}
          />
        );
      })}
      {nodes.map((node, i) => {
        const messageChange = changed.find(
          (change) => change.id === node.id && change?.cause === 'messages'
        );
        const reactionChange = changed.find(
          (change) => change.id === node.id && change?.cause === 'reactions'
        );

        return (
          <g key={`node-tooltip-${node.id}-${i}`}>
            <motion.g
              initial={{ opacity: 0, visibility: 'hidden' }}
              animate={{
                opacity: hover === node.id ? 1 : 0,
                visibility: hover === node.id ? 'visible' : 'hidden',
              }}
              transition={{ duration: 0.3, ease: easeInOut }}
            >
              <Tooltip
                width={width}
                height={height}
                x={node.x}
                y={node.y}
                offset={node.radius}
                timestamp={formatDate(new Date(node.lastMessage))}
                title={node.name}
                detailsList={[
                  {
                    key: 'Messages Sent',
                    value: node.messages.toString(),
                  },
                  {
                    key: 'Total Characters',
                    value: node.characters.toString(),
                  },
                  {
                    key: 'Last Reaction',
                    value: node.lastReaction,
                  },
                ]}
              />
            </motion.g>
            <motion.text
              initial={{
                y: node.y,
                x: node.x,
                fontSize: 0,
              }}
              textAnchor={'center'}
              animate={{
                opacity: messageChange || hover === 'all' ? 1 : 0,
                visibility:
                  messageChange || hover === 'all' ? 'visible' : 'hidden',

                ...(messageChange || hover === 'all'
                  ? determineTooltipPosition({
                      x: node.x,
                      y: node.y,
                      width,
                      height,
                      tooltipH: adjustToMedia(media, [10, 12, 16]),
                      tooltipW: getTextWidth(node.name, {
                        fontSize: adjustToMedia(media, [10, 12, 16]),
                      }),
                      offsetX:
                        -getTextWidth(node.name, {
                          fontSize: adjustToMedia(media, [10, 12, 16]),
                        }) / 2,
                      offsetY:
                        adjustToMedia(media, [10, 12, 16]) +
                        node.radius +
                        (node.y < height / 2
                          ? adjustToMedia(media, [10, 12, 16])
                          : 0),
                    })
                  : { x: node.x, y: node.y }),
                fontSize:
                  messageChange || hover === 'all'
                    ? adjustToMedia(media, [10, 12, 16])
                    : 0,
              }}
              transition={{ duration: 0.3, ease: easeInOut }}
              fontFamily={'Arial'}
              fontWeight={300}
              fill={'#fff'}
            >
              {node.name}
            </motion.text>

            <motion.text
              initial={{
                y: node.y,
                x: node.x,
                fontSize: 0,
              }}
              textAnchor={'center'}
              animate={{
                opacity: reactionChange ? 1 : 0,
                visibility: reactionChange ? 'visible' : 'hidden',
                ...(reactionChange
                  ? determineTooltipPosition({
                      x: node.x,
                      y: node.y,
                      width,
                      height,
                      tooltipH: adjustToMedia(media, [96, 104, 112]),
                      tooltipW: getTextWidth(node.lastReaction, {
                        fontSize: adjustToMedia(media, [96, 104, 112]),
                        fontFamily: 'Apple Color Emoji',
                      }),
                      offsetX:
                        -getTextWidth(node.lastReaction, {
                          fontSize: adjustToMedia(media, [96, 104, 112]),
                          fontFamily: 'Apple Color Emoji',
                        }) / 2,
                      offsetY: node.radius,
                    })
                  : { y: node.y, x: node.x }),
                fontSize: reactionChange
                  ? adjustToMedia(media, [96, 104, 112])
                  : 0,
              }}
              transition={{ duration: 0.3, ease: easeInOut }}
              fontFamily={'Apple Color Emoji'}
              fontWeight={300}
              fill={'#fff'}
            >
              {node.lastReaction}
            </motion.text>
          </g>
        );
      })}
    </>
  );
};

export default TeamNodes;
