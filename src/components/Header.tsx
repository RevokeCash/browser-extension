import React from 'react';

interface Props {
  size: 'small' | 'large';
}

const Header = ({ size }: Props) => {
  return (
    <div className={size === 'small' ? 'w-[280px]' : 'w-[360px]'}>
      <img src="/images/revoke.svg" alt="revoke.cash logo" width={size === 'small' ? '280' : '360'} />
    </div>
  );
};

export default Header;
