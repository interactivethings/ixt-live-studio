import { Bound } from '@/types/general';
import {
  DependencyList,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';

export const useFreeSpace = (
  setState: Dispatch<SetStateAction<Bound[]>>,
  id: string,
  deps: DependencyList = []
) => {
  const ref = useRef<SVGForeignObjectElement>(null);

  useEffect(() => {
    if (ref.current) {
      const box = ref.current.getBoundingClientRect();
      setState((ps) => {
        const existingIndex = ps.findIndex((item) => item.id === id);

        if (existingIndex !== -1) {
          return ps.map((item, index) =>
            index === existingIndex ? { ...item, box } : item
          );
        }

        return [...ps, { id, ...box }];
      });
    }
  }, [...deps]);

  return ref;
};
