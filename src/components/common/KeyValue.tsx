import React from 'react';

interface Props {
  children: React.ReactNode;
}

const KeyValue = ({ children }: Props) => {
  return <div className="flex grow justify-between items-center">{children}</div>;
};

export default KeyValue;
