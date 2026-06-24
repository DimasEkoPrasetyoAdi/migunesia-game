import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Register from './components/Register';
import Countdown from './components/Countdown';
import Game from './components/Game';
import Score from './components/Score';
import AdminSettings from './components/AdminSettings';
import './App.css';

// Custom hook to calculate scaling factor
const useWindowScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const scaleX = window.innerWidth / 2160;
      const scaleY = window.innerHeight / 3840;
      // Fit to screen (contain within browser window)
      setScale(Math.min(scaleX, scaleY));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return scale;
};

function App() {
  const scale = useWindowScale();
  const [page, setPage] = useState('HOME');
  const [participant, setParticipant] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [showAdmin, setShowAdmin] = useState(false);
  const [backendConfig, setBackendConfig] = useState({
    showNoHp: true,
    showEmail: true
  });

  const backendUrl = import.meta.env.VITE_API_URL

  // Fetch backend configurations on load
  const fetchConfig = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/config`);
      if (res.ok) {
        const data = await res.json();
        setBackendConfig(data);
      }
    } catch (err) {
      console.error('Failed to connect to backend api:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden select-none relative">
      {/* Dynamic Scaler Canvas Container */}
      <div
        className="w-[2160px] h-[3840px] bg-white relative flex flex-col overflow-hidden shadow-2xl origin-center shrink-0"
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Floating Admin/Settings Toggle - visible in HOME page */}
        {page === 'HOME' && (
          <button
            onClick={() => setShowAdmin(true)}
            className="absolute top-8 right-8 z-50 p-4 bg-white/80 backdrop-blur rounded-full shadow-lg border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
            title="Open Settings"
          >
            {/* Simple gear icon */}
            <svg
              className="w-12 h-12 text-cyan-600 animate-[spin_8s_linear_infinite]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}

        {/* State routing screens */}
        {page === 'HOME' && (
          <Home
            onStart={() => setPage('REGISTER')}
          />
        )}

        {page === 'REGISTER' && (
          <Register
            backendUrl={backendUrl}
            config={backendConfig}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onRegisterSuccess={(registeredParticipant) => {
              setParticipant(registeredParticipant);
              setPage('COUNTDOWN');
            }}
            onBack={() => setPage('HOME')}
          />
        )}

        {page === 'COUNTDOWN' && (
          <Countdown
            onComplete={() => setPage('GAME')}
          />
        )}

        {page === 'GAME' && (
          <Game
            participant={participant}
            difficulty={difficulty}
            backendUrl={backendUrl}
            onGameOver={(score) => {
              setFinalScore(score);
              setPage('SCORE');
            }}
          />
        )}

        {page === 'SCORE' && (
          <Score
            score={finalScore}
            onFinished={() => {
              setParticipant(null);
              setFinalScore(0);
              setPage('HOME');
            }}
          />
        )}

        {/* Admin Configuration Settings Modal */}
        {showAdmin && (
          <AdminSettings
            backendUrl={backendUrl}
            config={backendConfig}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onConfigChange={(newConfig) => setBackendConfig(newConfig)}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
