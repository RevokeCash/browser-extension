import React from 'react';
import NavigationHeader from '../NavigationHeader';

interface Props {
  title: string;
  children: React.ReactNode;
}

const SettingsPage = ({ title, children }: Props) => {
  return (
    <div className="flex flex-col items-stretch w-100 h-150 bg-neutral-0 dark:bg-neutral-750 divide-y divide-neutral-150 dark:divide-neutral-800">
      <NavigationHeader title={title} />
      {children}
      <div />
    </div>
  );
};

export default SettingsPage;
