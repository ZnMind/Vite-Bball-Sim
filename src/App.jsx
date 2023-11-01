import { useState, useEffect } from 'react';
import Matchup from './Matchup';
import Stats from './Stats';
import teams from './json/teams.json';
import './App.css';

function App() {
  const [screen, setScreen] = useState('matchup');
  const components = { 'matchup': Matchup, 'stats': Stats };
  let Display = components[screen];
  return (
    <div className='container'>
      <div className='banner'>
        <button onClick={() => setScreen('matchup')}>Matchup</button>
        <button onClick={() => setScreen('stats')}>Stats</button>
      </div>
      <Display />
    </div>
  )
}

export default App