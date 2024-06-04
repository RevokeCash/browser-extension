import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Title = ({ children }: Props) => {
  return <div className="uppercase font-bold tracking-widest">{children}</div>;
};

export default Title;
