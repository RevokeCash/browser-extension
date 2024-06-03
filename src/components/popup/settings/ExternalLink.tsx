import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Href from '../../common/Href';
import MenuItem from './MenuItem';

interface Props<T> {
  href: string;
  label: string;
}

const ExternalLink = <T,>({ href, label }: Props<T>) => {
  return (
    <Href href={href} className="w-full" underline="none">
      <MenuItem>
        <div>{label}</div>
        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
      </MenuItem>
    </Href>
  );
};

export default ExternalLink;
