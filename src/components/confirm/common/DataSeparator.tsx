import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

const DataSeparator = () => {
  return (
    <div className="flex grow justify-center py-1">
      <ChevronDownIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
    </div>
  );
};

export default DataSeparator;
