'use client';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { FC, ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
}

const Screen: FC<ScreenProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();

  return (
    <svg width={width} height={height}>
      {children}
    </svg>
  );
};

export default Screen;
