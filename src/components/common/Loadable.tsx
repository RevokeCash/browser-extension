import React, { ReactNode } from 'react';
import Spinner from './Spinner';

interface Props {
  children: ReactNode;
  loading: boolean;
}

const Loadable = ({ children, loading }: Props) => {
  if (loading) return <Spinner className="w-5 h-5" />;
  return <>{children}</>;
};

export default Loadable;
