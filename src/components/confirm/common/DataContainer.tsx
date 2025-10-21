import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const DataContainer = ({ children, className }: Props) => {
  return (
    <div
      className={[
        'flex flex-col items-center grow px-4 py-3',
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
