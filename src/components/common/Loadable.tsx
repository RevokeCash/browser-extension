import React, { ReactNode } from 'react';
import Spinner from './Spinner';

interface Props {
  children: ReactNode;
  loading: boolean;
  error?: Error;
}

const Loadable = ({ children, loading, error }: Props) => {
  if (loading) return <Spinner className="w-5 h-5" />;
  if (error) return <div className="text-red-500">{error.message}</div>;

  return <>{children}</>;
};

export default Loadable;
