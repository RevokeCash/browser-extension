import React from 'react';
import DivideContainer from '../../common/DivideContainer';
import NavigationHeader from '../NavigationHeader';

interface Props {
  title: string;
  children: React.ReactNode;
}

const SettingsPage = ({ title, children }: Props) => {
  return (
    <DivideContainer className="w-100 h-150">
      <NavigationHeader title={title} />
      {children}
      <div />
    </DivideContainer>
  );
};

export default SettingsPage;
