import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Leaderboard from './src/components/game/Leaderboard.jsx';
import { LanguageProvider } from './src/context/LanguageContext.jsx';
import { MemoryRouter } from 'react-router-dom';

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.window = {};

const mockProps = {
  currentTotalScore: 100,
  totalGames: 5,
  playerName: "Test Player",
  onUpdatePlayerName: () => {}
};

try {
  const html = ReactDOMServer.renderToString(
    <MemoryRouter>
      <LanguageProvider>
        <Leaderboard {...mockProps} />
      </LanguageProvider>
    </MemoryRouter>
  );
  console.log("Rendered successfully! Length:", html.length);
} catch (error) {
  console.error("CRASH DURING RENDER:", error);
}
