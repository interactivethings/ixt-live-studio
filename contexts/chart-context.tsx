'use client';
import { Views } from '@/types/firebase';
import { DefaultChildren } from '@/types/general';
import {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useConfig } from './config-context';

interface Change {
  id: string;
  timestamp: number;
  cause?: string;
}
// Type for ChartContext that ensures 'view' is a specific element from Views[T]
export interface ChartContextType<T extends keyof Views> {
  hover: string;
  setHover: Dispatch<SetStateAction<string>>;
  view: Views[T][number]['view']; // This ensures that 'view' is a specific string from Views[T]
  setView: Dispatch<SetStateAction<Views[T][number]['view']>>;
  changed: Change[]; // Add changed state type
  addChange: (id: string, cause?: string) => void;
}

// Create the context with an undefined initial value
export const ChartContext = createContext<ChartContextType<any> | undefined>(
  undefined
);

// ChartProvider component
export const ChartProvider: FC<DefaultChildren> = ({ children }) => {
  const [hover, setHover] = useState<string>('');
  const [changed, setChanged] = useState<Change[]>([]);

  const { metricConfigs, displayType } = useConfig();
  const [view, setView] = useState<Views[typeof displayType][number]['view']>(
    metricConfigs?.views[0].view || 'random'
  );

  // Cycle through views every X seconds
  useEffect(() => {
    if (!metricConfigs) return;
    const id = setInterval(() => {
      setView((prevView) => {
        const index =
          metricConfigs?.views.findIndex((view) => view.view === prevView) || 0;
        const nextIndex = (index + 1) % (metricConfigs?.views?.length ?? 0);
        return metricConfigs?.views[nextIndex].view || 'random';
      });
    }, (metricConfigs.settings.view_time || 10) * 1000);

    return () => clearInterval(id);
  }, [displayType, metricConfigs]);

  // Effect to remove objects from 'changed' after 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      setChanged((prevChanged) =>
        prevChanged.filter((item) => now - item.timestamp < 3000)
      );
    }, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, []);

  // Example function to add a change
  const addChange = (id: string, cause?: string) => {
    setChanged((prevChanged) => [
      ...prevChanged,
      { id, timestamp: Date.now(), cause },
    ]);
  };

  const contextValue: ChartContextType<typeof displayType> = {
    hover,
    setHover,
    view,
    setView,
    changed,
    addChange,
  };

  return (
    <ChartContext.Provider value={contextValue}>
      {children}
    </ChartContext.Provider>
  );
};

// useChart hook
export const useChart = <T extends keyof Views>() => {
  const ctx = useContext(ChartContext) as ChartContextType<T>;

  if (!ctx) {
    throw new Error('useChart must be used within a ChartProvider');
  }

  return ctx;
};
