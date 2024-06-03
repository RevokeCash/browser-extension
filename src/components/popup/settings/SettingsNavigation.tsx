import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  href: string;
  label: string;
  value?: string;
}

const SettingsNavigation = ({ href, label, value }: Props) => {
  return (
    <Link
      to={href}
      className="flex justify-between items-center w-full px-5 py-4 gap-4 bg-neutral-0 dark:bg-neutral-750"
    >
      <div>{label}</div>
      <div className="flex gap-8 items-center">
        {value ? <div>{value}</div> : null}
        <ChevronRightIcon className="w-5 h-5" />
      </div>
    </Link>
  );
};

export default SettingsNavigation;
