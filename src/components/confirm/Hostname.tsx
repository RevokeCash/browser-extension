import { GlobeAltIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Props {
  hostname: string;
}

// TODO: Analyse hostname
const Hostname = ({ hostname }: Props) => {
  return (
    <div className="w-full flex items-center gap-2 px-4 py-1 text-sm">
      <GlobeAltIcon className="h-4 w-4" />
      <span className="w-80 truncate">https://{hostname}</span>
    </div>
  );
};

export default Hostname;
