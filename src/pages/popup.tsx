import React from 'react';
import ReactDOM from 'react-dom';
import Page from '../components/Page';
import Header from '../components/common/Header';
import Footer from '../components/popup/Footer';
import Settings from '../components/popup/Settings';
import { useTranslation } from '../i18n';
import '../styles.css';

const Popup = () => {
  const { t } = useTranslation();

  return (
    <Page>
      <div className="flex flex-col gap-4 items-center p-4 w-92">
        <Header size="small" />
        <Settings />
        <Footer />
      </div>
    </Page>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
