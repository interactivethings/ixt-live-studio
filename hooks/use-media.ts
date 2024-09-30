import { MediaQueries } from '@/types/general';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from './use-window-dimensions';

export const useMedia = ():MediaQueries => {
  const { width } = useWindowDimensions();
  const [media, setMedia] = useState<MediaQueries>(
    width > 1024 ? 'lg' : width > 768 ? 'md' : 'sm'
  );

  useEffect(() => {
    setMedia(width > 1024 ? 'lg' : width > 768 ? 'md' : 'sm');
  }, [width]);

  return media;
};
