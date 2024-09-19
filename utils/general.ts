import { Node } from '@/components/team-communication/TeamCommunication';

export const hexToRgb = (hex: string) => {
  // Remove the  hash symbol if presen=> t
  hex = hex.replace('#', '');

  // Parse the three RGB components
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

export const getMidpointColor = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Calculate the midpoint for each RGB component
  const midR = Math.floor((rgb1.r + rgb2.r) / 2);
  const midG = Math.floor((rgb1.g + rgb2.g) / 2);
  const midB = Math.floor((rgb1.b + rgb2.b) / 2);

  // Convert the midpoint RGB values back to hex
  return rgbToHex(midR, midG, midB);
};
export const createCurvedHornTriangleConnection = (
  source: Node,
  target: Node,
  strokeWidth: number = 2 // Default stroke width
): string => {
  // Calculate the direction from source to target
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Calculate the angle between source and target
  const angle = Math.atan2(dy, dx);

  // Offset the angle by 90 degrees (π/2 radians) to find the perpendicular directions
  const offsetAngle90 = angle + Math.PI / 2;
  const offsetAngleMinus90 = angle - Math.PI / 2;

  // Calculate the midpoint between source and target (this is one of the corners)
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  // Calculate the two other corner points (90-degree offsets from the source-target line, at source.radius distance)
  const cornerX1 =
    source.x + (source.radius - strokeWidth / 2) * Math.cos(offsetAngle90);
  const cornerY1 =
    source.y + (source.radius - strokeWidth / 2) * Math.sin(offsetAngle90);

  const cornerX2 =
    source.x + (source.radius - strokeWidth / 2) * Math.cos(offsetAngleMinus90);
  const cornerY2 =
    source.y + (source.radius - strokeWidth / 2) * Math.sin(offsetAngleMinus90);

  // Calculate the deepest inward bend (start point), perpendicular to the midpoint
  const startX =
    midX + (source.radius - strokeWidth / 2) * Math.cos(offsetAngle90);
  const startY =
    midY + (source.radius - strokeWidth / 2) * Math.sin(offsetAngle90);

  // Adjust the bend factor to consider stroke width
  const bendFactor = (source.radius - strokeWidth) / 3; // More aggressive inward bend

  // Define control points to create inward curves, accounting for stroke width
  // Control points for the curve between corner 1 and the deepest bend (start)
  const controlX1 = (midX + cornerX1) / 2;
  const controlY1 = (midY + cornerY1) / 2 - bendFactor; // Curve inward

  // Control points for the curve between corner 2 and the deepest bend (start)
  const controlX2 = (midX + cornerX2) / 2;
  const controlY2 = (midY + cornerY2) / 2 - bendFactor; // Curve inward

  // Control points for the curve between corner 1 and corner 2 (side opposite to the midpoint)
  const controlXMid = (cornerX1 + cornerX2) / 2;
  const controlYMid = (cornerY1 + cornerY2) / 2 - bendFactor; // Curve inward

  // Create the SVG path with cubic Bézier curves for the inward-sloped sides of the triangle
  const path = `
    M ${midX} ${midY} 
    C ${controlX1} ${controlY1}, ${cornerX1} ${cornerY1}, ${cornerX1} ${cornerY1}
    C ${controlXMid} ${controlYMid}, ${cornerX2} ${cornerY2}, ${cornerX2} ${cornerY2}
    C ${controlX2} ${controlY2}, ${startX} ${startY}, ${startX} ${startY}
  `;

  return path;
};
