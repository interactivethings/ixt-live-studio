import { FC, Fragment } from 'react';
import { Edge } from '../TeamCommunication';

interface ITeamDefsProps {
  edges: Edge[];
}

const TeamDefs: FC<ITeamDefsProps> = ({ edges }) => {
  return (
    <defs>
      {edges.map((edge, i) => {
        return (
          <Fragment key={`gradient-${i}-${edge.source.id}-${edge.target.id}`}>
            <linearGradient
              id={`source-${String(edge.source.id)}-${
                edge.source.color.split('#')[1]
              }-${edge.target.color.split('#')[1]}`}
              x1={edge.source.x > edge.target.x ? '100%' : '0'}
              y1={edge.source.y > edge.target.y ? '100%' : '0'}
              x2={edge.source.x > edge.target.x ? '0' : '100%'}
              y2={edge.source.y > edge.target.y ? '0' : '100%'}
            >
              <stop offset="0%" stopOpacity={1} stopColor={edge.source.color} />
              <stop
                offset="75%"
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
              <stop offset="0%" stopOpacity={1} stopColor={edge.target.color} />
              <stop
                offset="75%"
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
  );
};

export default TeamDefs;
