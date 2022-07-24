import React, { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  href: string;
}

const Link = ({ children, href }: Props) => (
  <a className="underline decoration-2 decoration-slate-500" href={href} target="_blank">
    {children}
  </a>
);

export default Link;
