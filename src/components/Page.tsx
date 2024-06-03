import React from 'react';
import { ColorThemeProvider } from '../hooks/useColorTheme';
import { IntlProvider } from '../i18n';

interface Props {
  children: React.ReactNode;
}

const Page = ({ children }: Props) => {
  return (
    <IntlProvider>
      <ColorThemeProvider>{children}</ColorThemeProvider>
    </IntlProvider>
  );
};

export default Page;
