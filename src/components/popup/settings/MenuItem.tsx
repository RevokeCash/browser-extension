import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  className?: string;
  children: React.ReactNode;
}

const MenuItem = ({ className, children }: Props) => {
  const classes = twMerge(
    'flex justify-between items-center w-full px-6 py-4 gap-4 bg-neutral-0 hover:bg-neutral-150 hover:text-neutral-850 dark:bg-neutral-750 hover:dark:bg-neutral-800 hover:dark:text-neutral-300',
    className
  );

  return <div className={classes}>{children}</div>;
};

export default MenuItem;
