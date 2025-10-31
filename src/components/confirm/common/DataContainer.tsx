import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const DataContainer = ({ children, className }: Props) => {
  return (
    <div
      className={[
        // Make the content area flex, stretch, and scroll if it overflows
        'flex flex-col items-stretch grow px-4 py-3 min-h-0 overflow-y-auto',
        'bg-black text-white',
        'border-t border-neutral-900',
        className || '',
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default DataContainer;
