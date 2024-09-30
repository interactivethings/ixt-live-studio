import { SCREEN_PADDING } from '@/configs/styling';
import { useChart } from '@/contexts/chart-context';
import { useDisplay } from '@/contexts/display-context';
import { useFreeSpace } from '@/hooks/use-freespace';
import { useMedia } from '@/hooks/use-media';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { MediaQueries } from '@/types/general';
import { adjustToMedia } from '@/utils/styles';
import { motion } from 'framer-motion';
import { TbEye } from 'react-icons/tb';

const ToolKit = () => {
  const { width, height } = useWindowDimensions();
  const media = useMedia();
  const { setFreeSpaceArea } = useDisplay();
  const toolkitStyles = useToolkitStyles(media);
  const { setHover } = useChart();
  const toolkitGroupRef = useFreeSpace(setFreeSpaceArea, 'toolkit-group-box', [
    height,
    width,
  ]);

  // Type-safe state for icons
  // const [icons, setIcons] = useState<{
  //   [key: string]: React.ComponentType<any>;
  // }>({});

  // // Dynamically import icons
  // useEffect(() => {
  //   const loadIcons = async () => {
  //     const loadedIcons: { [key: string]: React.ComponentType<any> } = {};

  //     for (const view of views) {
  //       if (view.icon) {
  //         try {
  //           // Dynamically import only the specific icon from react-icons/tb
  //           const { [view.icon]: ImportedIcon } = await import(
  //             'react-icons/tb'
  //           );
  //           if (ImportedIcon) {
  //             loadedIcons[view.icon] = ImportedIcon;
  //           }
  //         } catch (error) {
  //           console.error(`Error loading icon ${view.icon}:`, error);
  //         }
  //       }
  //     }

  //     setIcons(loadedIcons);
  //   };

  //   loadIcons();
  // }, [views]);

  return (
    <motion.foreignObject
      ref={toolkitGroupRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      x={
        width -
        adjustToMedia(media, SCREEN_PADDING) -
        (toolkitStyles.toolkit.fontSize + 16) +
        // * (views.length + 1)
        8
      }
      y={
        height -
        adjustToMedia(media, SCREEN_PADDING) -
        toolkitStyles.toolkit.fontSize +
        8
      }
      height={toolkitStyles.toolkit.fontSize * 1.2}
      width={
        toolkitStyles.toolkit.fontSize + 16
        // * (views.length + 1)
      }
    >
      <div className="flex items-center gap-4">
        {/* {views.map((item, index) => {
          const IconComponent = icons[item.icon];

          return (
            <div key={index}>
              {IconComponent ? (
                <IconComponent
                  onClick={() => setView(item.view)}
                  style={{ fontSize: toolkitStyles.toolkit.fontSize }}
                  className="text-gray-500 cursor-pointer hover:text-white duration-300 transition-all"
                />
              ) : null}
            </div>
          );
        })} */}
        <TbEye
          onMouseEnter={() => setHover('all')}
          onMouseLeave={() => setHover('')}
          style={{ fontSize: toolkitStyles.toolkit.fontSize }}
          className=" text-gray-500 cursor-pointer hover:text-white duration-300 transition-all"
        />
      </div>
    </motion.foreignObject>
  );
};

export default ToolKit;

const useToolkitStyles = (media: MediaQueries) => {
  return {
    toolkit: {
      fontSize: adjustToMedia(media, [20, 24, 32]),
    },
  };
};
