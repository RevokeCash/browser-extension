import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';
import Href from './Href';
import MenuItem from './MenuItem';

interface Props<T> {
  href: string;
  children: ReactNode;
  className?: string;
  size: 'small' | 'large';
  colorChangeOnHover?: boolean;
}

const ExternalLink = <T,>({ href, children, className, size, colorChangeOnHover }: Props<T>) => {
  return (
    <Href href={href} className="group w-full hover:text-neutral-850 hover:dark:text-neutral-300" underline="none">
      <MenuItem size={size} className={className} colorChangeOnHover={colorChangeOnHover}>
        {children}
        <ArrowUpRightIcon className="w-4 h-4 text-neutral-550/30 dark:text-neutral-400/30 group-hover:text-neutral-850 group-hover:dark:text-neutral-300" />
      </MenuItem>
    </Href>
  );
};

export default ExternalLink;
