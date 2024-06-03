import React from 'react';
import Header from '../Header';
import Settings from '../Settings';

const MainPage = () => {
  return (
    <div className="flex flex-col justify-between gap-4 items-center p-3 w-100 h-150 bg-neutral-100 dark:bg-neutral-800">
      <Header />
      <Settings />
    </div>
  );
};

export default MainPage;
