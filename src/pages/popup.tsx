import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route } from 'react-router-dom';
import SlideRoutes from 'react-slide-routes';
import Page from '../components/Page';
import AboutPage from '../components/popup/routes/AboutPage';
import ColorThemeSelectPage from '../components/popup/routes/ColorThemeSelectPage';
import LanguageSelectPage from '../components/popup/routes/LanguageSelectPage';
import MainPage from '../components/popup/routes/MainPage';
import '../styles.css';

const Popup = () => {
  return (
    <Page>
      <div className="w-100 h-150">
        <MemoryRouter>
          <SlideRoutes duration={100}>
            <Route path="/" element={<MainPage />}></Route>
            <Route path="/color-theme" element={<ColorThemeSelectPage />} />
            <Route path="/language" element={<LanguageSelectPage />} />
            <Route path="/about" element={<AboutPage />} />
          </SlideRoutes>
        </MemoryRouter>
      </div>
    </Page>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
