import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Game from './src/pages/Game.jsx';
import { LanguageProvider } from './src/context/LanguageContext.jsx';
import { MemoryRouter } from 'react-router-dom';

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  Telegram: { WebApp: {} }
};

try {
  const html = ReactDOMServer.renderToString(
    <MemoryRouter>
      <LanguageProvider>
        <Game />
      </LanguageProvider>
    </MemoryRouter>
  );
  console.log("Rendered successfully! Length:", html.length);
} catch (error) {
  console.error("CRASH DURING RENDER:", error);
}
