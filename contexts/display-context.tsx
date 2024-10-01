'use client';
import { useRTDB } from '@/hooks/use-rtdb';
import { FormtattedDataBaseType } from '@/types/data';
import { DisplayDataType } from '@/types/firebase';
import { Bound } from '@/types/general';
import { formatRTDBData } from '@/utils/general';
import {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { useConfig } from './config-context';

// Define a mapped type based on the keys of DisplayDataType
export type FormattedDataMapping<T extends keyof FormtattedDataBaseType> =
  FormtattedDataBaseType[T];

export type DisplayDataMapping<T extends keyof DisplayDataType> =
  DisplayDataType[T];

export interface DisplayContextType<T> {
  displayData: T | null;
  freeSpaceArea: Bound[];
  setFreeSpaceArea: Dispatch<SetStateAction<Bound[]>>;
}

export const DisplayContext = createContext<
  DisplayContextType<any> | undefined
>(undefined);

export const DisplayProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { displayType } = useConfig();
  const [freeSpaceArea, setFreeSpaceArea] = useState<Bound[]>([]);

  const { data: displayData } = useRTDB<
    FormattedDataMapping<typeof displayType>
  >({
    path: `/${
      process.env.NODE_ENV === 'development' ? 'test' : 'data'
    }/${displayType}`,
  });

  // Format data based on displayType
  const formattedData = formatRTDBData<
    FormattedDataMapping<typeof displayType>
  >(displayData, displayType);

  const contextValue: DisplayContextType<
    FormattedDataMapping<typeof displayType>
  > = {
    displayData: formattedData,
    freeSpaceArea,
    setFreeSpaceArea,
  };

  return (
    <DisplayContext.Provider value={contextValue}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = <T extends keyof FormtattedDataBaseType>() => {
  const ctx = useContext(DisplayContext) as DisplayContextType<
    FormattedDataMapping<T>
  >;

  if (!ctx) {
    throw new Error('useDisplay must be used within a DisplayProvider');
  }

  return ctx;
};
