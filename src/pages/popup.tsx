import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route } from 'react-router-dom';
import SlideRoutes from 'react-slide-routes';
import Page from '../components/Page';
import { IntlProvider } from '../i18n';
import AboutPage from '../components/popup/routes/AboutPage';
import ColorThemeSelectPage from '../components/popup/routes/ColorThemeSelectPage';
import LanguageSelectPage from '../components/popup/routes/LanguageSelectPage';
import MainPage from '../components/popup/routes/MainPage';
import '../styles.css';

const Popup = () => {
  return (
    <Page>
      <div className="w-full h-full flex flex-col min-h-0">
        <MemoryRouter>
          <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
            <SlideRoutes duration={100}>
              <Route
                path="/"
                element={
                  <div className="h-full min-h-0 flex flex-col">
                    <MainPage />
                  </div>
                }
              ></Route>
              <Route
                path="/color-theme"
                element={
                  <div className="h-full min-h-0 flex flex-col">
                    <ColorThemeSelectPage />
                  </div>
                }
              />
              <Route
                path="/language"
                element={
                  <div className="h-full min-h-0 flex flex-col">
                    <LanguageSelectPage />
                  </div>
                }
              />
              <Route
                path="/about"
                element={
                  <div className="h-full min-h-0 flex flex-col">
                    <AboutPage />
                  </div>
                }
              />
            </SlideRoutes>
          </div>
        </MemoryRouter>
      </div>
    </Page>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntlProvider>
      <Popup />
    </IntlProvider>
  </React.StrictMode>,
);
