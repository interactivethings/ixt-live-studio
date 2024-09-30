import { SCREEN_PADDING } from '@/configs/styling';
import { useDisplay } from '@/contexts/display-context';
import { useFreeSpace } from '@/hooks/use-freespace';
import { useMedia } from '@/hooks/use-media';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { MediaQueries } from '@/types/general';
import { adjustToMedia } from '@/utils/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Helper function to format the date and time
const formatDateTime = () => {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('default', { month: 'short' });
  const year = now.getFullYear();

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return {
    date: `${day}. ${month} ${year}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};

const Time = () => {
  const { height } = useWindowDimensions();
  const media = useMedia();
  const timeStyles = useTimeStyles(media);
  const { setFreeSpaceArea } = useDisplay();

  const [currentTime, setCurrentTime] = useState(formatDateTime());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(formatDateTime());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const timeGroupRef = useFreeSpace(setFreeSpaceArea, 'time-group-box', [
    height,
  ]);

  return (
    <motion.g
      ref={timeGroupRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <text
        x={adjustToMedia(media, SCREEN_PADDING)}
        y={
          height -
          adjustToMedia(media, SCREEN_PADDING) -
          timeStyles.time.fontSize -
          8
        }
        textAnchor="left"
        {...timeStyles.date}
      >
        {currentTime.date}
      </text>
      <text
        x={adjustToMedia(media, SCREEN_PADDING)}
        y={height - adjustToMedia(media, SCREEN_PADDING)}
        textAnchor="left"
        {...timeStyles.time}
      >
        {currentTime.time}
      </text>
    </motion.g>
  );
};

export default Time;

const useTimeStyles = (query: MediaQueries) => {
  return {
    time: {
      fontSize: adjustToMedia(query, [10, 10, 14]),
      fill: '#fff',
    },
    date: {
      fontSize: adjustToMedia(query, [10, 10, 14]),
      fill: '#333',
    },
  };
};
