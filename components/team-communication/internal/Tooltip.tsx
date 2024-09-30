import { determineTooltipPosition } from '@/utils/styles';
import { FC, useEffect, useRef, useState } from 'react';
interface TooltipProps {
  title: string;
  detailsList: DetailsList[];
  x: number;
  y: number;
  width: number;
  height: number;
  offset?: number;
  timestamp?: string;
}

export interface ToolTipDimensions
  extends Omit<TooltipProps, 'title' | 'detailsList'> {
  tooltipW: number;
  tooltipH: number;
  offsetY?: number;
  offsetX?: number;
}

interface DetailsList {
  key: string;
  value: string;
}

const Tooltip: FC<TooltipProps> = ({
  title,
  detailsList,
  timestamp,
  offset,
  ...props
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }
  }, [detailsList, title]);

  const { x, y } = determineTooltipPosition({
    ...props,
    offsetX: offset,
    offsetY: offset,
    tooltipW: 192,
    tooltipH: tooltipHeight,
  });

  return (
    <foreignObject x={x} y={y} width={192} height={tooltipHeight}>
      <div
        ref={tooltipRef}
        className="w-48 flex flex-col gap-2 rounded-lg px-3 py-2 border border-gray-800 backdrop-blur-md bg-gray-950 bg-opacity-25"
      >
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm text-white">{title}</h4>
          <h6 className="text-xs text-gray-400">{timestamp}</h6>
        </div>
        <div className="flex flex-col gap-1">
          {detailsList.map((item, i) => (
            <div key={i} className="flex justify-between">
              <p className="text-xs font-medium text-white">{item.key}</p>
              <p className="text-xs text-gray-400">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
};

export default Tooltip;
