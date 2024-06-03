import React from 'react';
import SelectOption from './SelectOption';
import SettingsPage from './SettingsPage';

export interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  title: string;
  selected: Option<T>;
  options: Array<Option<T>>;
  select: (option: Option<T>) => void;
}

const SelectPage = <T,>({ title, options, selected, select }: Props<T>) => {
  return (
    <SettingsPage title={title}>
      {options.map((option) => (
        <SelectOption key={option.label} option={option} isSelected={option.value === selected.value} select={select} />
      ))}
    </SettingsPage>
  );
};

export default SelectPage;
