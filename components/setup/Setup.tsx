'use client';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { DefaultChildren } from '@/types/general';
import { FC } from 'react';
import Defs from './Defs';
import Time from './Time';
import Title from './Title';
import ToolKit from './ToolKit';

const Setup: FC<DefaultChildren> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  return (
    <svg width={width} height={height}>
      {children}
      <Title />
      <Defs />
      <Time />
      <ToolKit />
    </svg>
  );
};

export default Setup;
