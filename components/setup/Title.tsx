import { easingCubic } from '@/configs/styling';
import { useDisplay } from '@/contexts/display-context';
import { useFreeSpace } from '@/hooks/use-freespace';
import { useMedia } from '@/hooks/use-media';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { MediaQueries } from '@/types/general';
import { adjustToMedia, getTextWidth } from '@/utils/styles';
import { motion } from 'framer-motion';

const Title = () => {
  const media = useMedia();
  const { width } = useWindowDimensions();
  const titleStyles = useTitleStyle(media);
  const { displayData, setFreeSpaceArea } = useDisplay();
  const titleGroupRef = useFreeSpace(setFreeSpaceArea, 'title-group-box', [
    width,
    displayData?.title,
    displayData?.description,
  ]);
  if (!displayData) return null;

  const { title, description } = displayData;

  const titleWidth = getTextWidth(title, {
    fontSize: titleStyles.title.fontSize + 2,
  });
  const descriptionWidth = getTextWidth(description, {
    fontSize: titleStyles.description.fontSize,
  });

  const descriptionLineBreaks = Math.ceil(descriptionWidth / width);
  const titleLineBreaks = Math.ceil(titleWidth / width);

  const totalTextHeight =
    titleLineBreaks * (titleStyles.title.fontSize + 8) +
    descriptionLineBreaks * (titleStyles.description.fontSize + 8);

  const rectWidth = titleWidth + titleStyles.rect.padding * 2;
  const rectHeight = totalTextHeight + titleStyles.rect.padding * 2;

  return (
    <motion.foreignObject
      ref={titleGroupRef}
      key={title}
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: [0, 1, 1, 0], y: [-100, 0, 0, -100] }}
      transition={{
        duration: 10,
        times: [0, 0.1, 0.9, 1],
        easings: easingCubic,
      }}
      x={0}
      y={0}
      width={Math.min(rectWidth, width)}
      height={rectHeight}
    >
      <div style={{ padding: titleStyles.rect.padding }}>
        <h1 style={titleStyles.title}>{title}</h1>
        <p style={titleStyles.description}>{description}</p>
      </div>
    </motion.foreignObject>
  );
};

export default Title;

export const useTitleStyle = (query: MediaQueries) => {
  return {
    rect: {
      padding: adjustToMedia(query, [24, 32, 40]),
    },
    title: {
      fontSize: adjustToMedia(query, [24, 32, 40]),
      fontWeight: 'bold',
      color: '#fff',
      filter: 'url(#text-glow-slight)',
    },
    description: {
      fontSize: adjustToMedia(query, [12, 16, 16]),
      fontWeight: 'medium',
      color: '#888',
    },
  };
};
