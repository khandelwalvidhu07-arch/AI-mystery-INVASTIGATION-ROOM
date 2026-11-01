import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateMysteryPage from './pages/CreateMysteryPage';
import InvestigationRoomPage from './pages/InvestigationRoomPage';
import AccusationPage from './pages/AccusationPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Navbar />
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateMysteryPage />} />
          <Route path="/investigate/:id" element={<InvestigationRoomPage />} />
          <Route path="/investigate/:id/accuse" element={<AccusationPage />} />
          <Route path="/cases/:id/results" element={<ResultsPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        AI Mystery Room • Powered by Gemini & React • Detective Deduction Game
      </footer>
    </div>
  );
}

