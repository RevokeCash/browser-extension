import React from 'react';
import { twMerge } from 'tailwind-merge';
import MenuItem from '../../common/MenuItem';
import { Option } from './SelectPage';

interface Props<T> {
  option: Option<T>;
  isSelected: boolean;
  select: (option: Option<T>) => void;
}

const SelectOption = <T,>({ option, isSelected, select }: Props<T>) => {
  return (
    <button onClick={() => select(option)} className={'flex w-full text-left'}>
      {isSelected && <div className="w-1 h-full bg-brand dark:bg-brand" />}
      <MenuItem
        size="large"
        colorChangeOnHover={true}
        className={twMerge(
          isSelected && 'pl-8 text-brand dark:text-brand hover:text-brand hover:dark:text-brand font-bold',
        )}
      >
        {option.label}
      </MenuItem>
    </button>
  );
};

export default SelectOption;
