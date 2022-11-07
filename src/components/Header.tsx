import React from 'react';

interface Props {
  size: 'small' | 'large';
}

const Header = ({ size }: Props) => {
  return (
    <div className={size === 'small' ? 'w-[200px]' : 'w-[360px]'}>
      <img src="/images/revoke.svg" alt="revoke.cash logo" width={size === 'small' ? '200' : '360'} />
    </div>
  );
};

export default Header;
