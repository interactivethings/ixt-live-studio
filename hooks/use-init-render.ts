import { useEffect, useRef } from 'react';

export const useInitialRender = () => {
  const initialRender = useRef(true);
  useEffect(() => {
    initialRender.current = false;
  }, []);
  return initialRender.current;
};
