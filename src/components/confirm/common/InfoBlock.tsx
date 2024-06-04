import React from 'react';
import { twMerge } from 'tailwind-merge';
import MenuItem from '../../common/MenuItem';

interface Props {
  children: React.ReactNode;
  isWarning?: boolean;
}

const InfoBlock = ({ children, isWarning }: Props) => {
  return (
    <MenuItem size="small" className={twMerge('mt-3 h-16', isWarning && 'text-brand bg-brand/15 dark:bg-brand/10')}>
      {children}
    </MenuItem>
  );
};

export default InfoBlock;
