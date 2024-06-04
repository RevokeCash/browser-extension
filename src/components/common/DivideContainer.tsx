import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const DivideContainer = ({ children, className }: Props) => {
  const classes = twMerge(
    'w-full flex flex-col items-stretch bg-neutral-0 dark:bg-neutral-750 divide-y divide-neutral-150 dark:divide-neutral-800',
    className
  );

  return <div className={classes}>{children}</div>;
};

export default DivideContainer;
