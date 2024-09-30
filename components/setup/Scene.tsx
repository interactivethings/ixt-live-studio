'use client';
import { useConfig } from '@/contexts/config-context';
import { motion } from 'framer-motion';
import TeamCommunication from '../team-communication/TeamCommunication';

const Scene = () => {
  const { displayType } = useConfig();

  return (
    <motion.g
      key={displayType}
      initial={{ x: displayType === 'team-communication' ? '100%' : '0%' }}
      animate={{ x: displayType === 'team-communication' ? '0%' : '-100%' }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ position: 'absolute', width: '100%' }}
    >
      {displayType === 'team-communication' && <TeamCommunication />}
    </motion.g>
  );
};

export default Scene;
