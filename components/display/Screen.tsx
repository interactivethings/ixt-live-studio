'use client';
import { useDisplay } from '@/contexts/display-context';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { FC, ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
}

const Screen: FC<ScreenProps> = ({ children }) => {
  const { svgRef } = useDisplay();
  const { width, height } = useWindowDimensions();

  return (
    <svg ref={svgRef} width={width} height={height}>
      {children}
    </svg>
  );
};

export default Screen;
