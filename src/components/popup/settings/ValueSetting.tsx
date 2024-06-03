import React from 'react';

interface Props {
  label: string;
  value: string;
}

const ValueSetting = ({ label, value }: Props) => {
  return (
    <div className="flex justify-between items-center w-full px-6 py-4 gap-4 dark:bg-neutral-750 dark:text-neutral-400 text-base font-medium">
      <div>{label}</div>
      <div className="flex gap-8">
        <div>{value}</div>
      </div>
    </div>
  );
};

export default ValueSetting;
