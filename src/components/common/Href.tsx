import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

// This has been copy pasted with slight mdifications from RevokeCash/revoke.cash

interface Props {
  href: string;
  children?: ReactNode;
  className?: string;
  html?: boolean;
  underline?: 'always' | 'hover' | 'none';
}

const Href = ({ href, children, className, underline, html }: Props) => {
  const styleMapping = {
    html: 'text-blue-700 visited:text-fuchsia-800',
    inherit: 'text-current visited:text-current',
  };

  const underlineMapping = {
    always: 'underline hover:underline',
    hover: 'no-underline hover:underline',
    none: 'no-underline hover:no-underline',
  };

  const classes = twMerge(
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:rounded',
    className,
    styleMapping[html ? 'html' : 'inherit'],
    underlineMapping[underline ?? 'always'],
  );

  return (
    <a className={classes} href={href} target="_blank">
      {children}
    </a>
  );
};

export default Href;
