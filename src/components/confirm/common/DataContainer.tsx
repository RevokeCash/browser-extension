import React from 'react';

interface Props {
  children: React.ReactNode;
}

const DataContainer = ({ children }: Props) => {
  return <div className="flex flex-col items-center px-3 grow">{children}</div>;
};

export default DataContainer;
