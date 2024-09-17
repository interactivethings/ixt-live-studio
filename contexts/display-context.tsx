'use client';
import { useRTDB } from '@/hooks/use-rtdb';
import { DisplayType } from '@/types/display-types';
import { createContext, FC } from 'react';

export interface DisplayContextType {
  displayType: DisplayType | null;
}

export const DisplayContext = createContext<DisplayContextType | undefined>(
  undefined
);

export const DisplayProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: displayType } = useRTDB<DisplayType>({ path: '/active' });

  const contextValue: DisplayContextType = {
    displayType,
  };

  return (
    <DisplayContext.Provider value={contextValue}>
      {children}
    </DisplayContext.Provider>
  );
};
