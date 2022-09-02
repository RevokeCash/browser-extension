import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
}

const Button = ({ children, onClick, secondary }: Props) => (
  <button
    className={`px-2 py-1 border border-black rounded ${secondary ? 'bg-white text-black' : 'bg-black text-white'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
