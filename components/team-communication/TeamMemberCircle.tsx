interface CircleProps {
  cx: number;
  cy: number;
  radius: number;
  fill?: string;
}

const CircleComponent: React.FC<CircleProps> = ({
  cx,
  cy,
  radius,
  fill = 'lightblue',
}) => {
  return <circle cx={cx} cy={cy} r={radius} fill={fill} />;
};

export default CircleComponent;
