import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  className?: string;
  children: React.ReactNode;
  size: 'small' | 'large';
  colorChangeOnHover?: boolean;
}

const MenuItem = ({ className, size, colorChangeOnHover, children }: Props) => {
  const classMapping = {
    'size-small': 'px-4 py-3 text-sm',
    'size-large': 'px-6 py-4',
  };

  const classes = twMerge(
    'flex justify-between items-center w-full gap-4 bg-neutral-0 dark:bg-neutral-750',
    classMapping[`size-${size}`],
    colorChangeOnHover &&
      'hover:bg-neutral-150 hover:text-neutral-850 hover:dark:bg-neutral-800 hover:dark:text-neutral-300',
    className
  );

  return <div className={classes}>{children}</div>;
};

export default MenuItem;
