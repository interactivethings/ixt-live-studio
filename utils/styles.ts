import { ToolTipDimensions } from '@/components/team-communication/internal/Tooltip';
import { mediaQueries, MediaQueries } from '@/types/general';

export const adjustToMedia = <T>(query: MediaQueries, values: T[]): T => {
  const i = mediaQueries.findIndex((value) => value === query);
  return values[i];
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export const getTextWidth = (
  text: string,
  options: { fontSize: number; fontFamily?: string } = {
    fontSize: 16,
    fontFamily: 'Arial',
  }
) => {
  if (canvas === undefined && ctx === undefined) {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  ctx.font = `${options.fontSize}px ${options.fontFamily}`;

  return ctx.measureText(text).width;
};

export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  // Within the current minute -> "now"
  if (diffInSeconds < 60) {
    return 'now';
  }

  // Less than 60 minutes ago -> "X minutes ago"
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  // Less than 4 hours ago -> "X hours ago"
  if (diffInHours < 4) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  // Otherwise, return the time in HH.mm format
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const determineTooltipPosition = ({
  tooltipW,
  tooltipH,
  width,
  height,
  x,
  y,
  offsetX = 20,
  offsetY = 10,
}: ToolTipDimensions) => {
  const directionX = x > width / 2 ? 'right' : 'left';
  const directionY = y > height / 2 ? 'up' : 'down';

  const xPosition =
    directionX === 'left' ? x + offsetX : x - tooltipW - offsetX;
  const yPosition = directionY === 'up' ? y - tooltipH - offsetY : y + offsetY;

  return { x: xPosition, y: yPosition };
};
