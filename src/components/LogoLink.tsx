import React from 'react';

interface Props {
  src: string;
  alt: string;
  href: string;
  size?: number;
}

const LogoLink = ({ src, alt, href, size }: Props) => (
  <a href={href} target="_blank">
    <img src={src} alt={alt} height={size ?? 24} width={size ?? 24} className="rounded-full" />
  </a>
);

export default LogoLink;
