import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
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
    <Href href={href} className="w-full hover:text-neutral-850 hover:dark:text-neutral-300" underline="none">
      <MenuItem size={size} className={className} colorChangeOnHover={colorChangeOnHover}>
        {children}
        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
      </MenuItem>
    </Href>
  );
};

export default ExternalLink;
