import { GlobeAltIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Props {
  hostname: string;
}

const Hostname = ({ hostname }: Props) => {
  return (
    <div className="flex flex-col py-2">
      <div className="w-full flex items-center gap-2 px-4 text-sm">
        <GlobeAltIcon className="h-4 w-4" />
        <span className="max-w-100 truncate">https://{hostname}</span>
      </div>
    </div>
  );
};

export default Hostname;
