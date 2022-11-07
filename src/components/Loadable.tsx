import React, { ReactNode } from 'react';
import { ClipLoader } from 'react-spinners';

interface Props {
  children: ReactNode;
  loading: boolean;
}

const Loadable = ({ children, loading }: Props) => {
  if (loading) return <ClipLoader size={24} color={'#000'} loading={loading} />;
  return <>{children}</>;
};

export default Loadable;
