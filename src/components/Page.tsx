import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Page: React.FC<Props> = ({ children }) => {
  return (
    <div
      className="
        w-[360px] h-[600px]
        bg-[#0B0B0B] text-[#EDEDED]
        overflow-hidden rounded-[12px]
      "
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {children}
    </div>
  );
};

export default Page;
