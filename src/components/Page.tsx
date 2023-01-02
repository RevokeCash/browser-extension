import React from 'react';
import { ColorThemeProvider } from '../hooks/useColorTheme';

interface Props {
  children: React.ReactNode;
}

const Page = ({ children }: Props) => {
  return <ColorThemeProvider>{children}</ColorThemeProvider>;
};

export default Page;
