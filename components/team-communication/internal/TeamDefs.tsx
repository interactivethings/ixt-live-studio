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
              gradientUnits="userSpaceOnUse"
              x1={edge.source.x}
              y1={edge.source.y}
              x2={edge.target.x}
              y2={edge.target.y}
            >
              <stop offset="0%" stopColor={edge.source.color} />
              <stop offset="100%" stopColor={edge.target.color} />
            </linearGradient>
            <linearGradient
              id={`target-${String(edge.target.id)}-${
                edge.target.color.split('#')[1]
              }-${edge.source.color.split('#')[1]}`}
              gradientUnits="userSpaceOnUse"
              x1={edge.target.x}
              y1={edge.target.y}
              x2={edge.source.x}
              y2={edge.source.y}
            >
              <stop offset="0%" stopColor={edge.target.color} />
              <stop offset="100%" stopColor={edge.source.color} />
            </linearGradient>
          </Fragment>
        );
      })}
    </defs>
  );
};

export default TeamDefs;
