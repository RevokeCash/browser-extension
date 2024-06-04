import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import ExternalLink from './ExternalLink';
import MenuItem from './MenuItem';

interface Props<T> {
  href?: string;
  children: ReactNode;
  className?: string;
  size: 'small' | 'large';
  colorChangeOnHover?: boolean;
}

const MenuItemOrLink = <T,>({ href, children, size, className, colorChangeOnHover }: Props<T>) => {
  if (href) {
    return (
      <ExternalLink href={href} size={size} colorChangeOnHover={colorChangeOnHover}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <MenuItem size={size} className={twMerge(className)} colorChangeOnHover={colorChangeOnHover}>
      {children}
    </MenuItem>
  );
};

export default MenuItemOrLink;
