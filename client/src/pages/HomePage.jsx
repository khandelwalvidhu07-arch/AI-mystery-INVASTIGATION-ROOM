import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Search, Fingerprint, Award, ChevronRight, HelpCircle, AlertTriangle, FolderArchive } from 'lucide-react';
import { getCases } from '../api';

export default function HomePage() {
  const [recentCases, setRecentCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    getCases()
      .then(data => {
        if (data.cases) setRecentCases(data.cases);
      })
      .catch(err => console.log('No existing cases or backend offline:', err.message))
      .finally(() => setLoadingCases(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-6 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini & Node.js
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-serif max-w-4xl mx-auto leading-tight">
          Step into the Room. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
            Unravel the Crime. Deduce the Culprit.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          Procedurally generated murder mysteries with airtight logic. Question suspects, inspect hidden clues, leverage informant hints, and seal your verdict.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            to="/create"
            className="px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 flex items-center gap-2 text-base transition-all hover:scale-105 active:scale-95"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            Start Investigation
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-serif">1. Infinite AI Cases</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every investigation is crafted dynamically using Gemini. Enter any crime premise—from a cyberpunk bank heist to a gothic manor murder.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-serif">2. Forensic Clue Locker</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Examine physical clues, cross-examine suspect alibis, and watch your score increase by +5 points for every lead discovered.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-serif">3. High-Stakes Accusation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            The culprit is secured on the backend until you make your accusation. Correct deductions earn up to 200 base points!
          </p>
        </div>
      </section>

      {/* Difficulty Table Overview */}
      <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-white font-serif">Investigation Tiers</h2>
          <p className="text-sm text-slate-400 mt-1">Difficulty scales the complexity of suspects, clues, and maximum base reward.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold uppercase text-xs tracking-wider">Tier 1</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">100 Base Pts</span>
            </div>
            <h4 className="text-lg font-bold text-white">Easy</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
              <li>• 3 Suspect Dossiers</li>
              <li>• 5 Forensic Clues</li>
              <li>• 2 Hint Lifelines</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-amber-500/40 bg-amber-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold uppercase text-xs tracking-wider">Tier 2</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">150 Base Pts</span>
            </div>
            <h4 className="text-lg font-bold text-white">Medium</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
              <li>• 4 Suspect Dossiers</li>
              <li>• 7 Forensic Clues</li>
              <li>• 3 Hint Lifelines</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-red-500/40 bg-red-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-bold uppercase text-xs tracking-wider">Tier 3</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">200 Base Pts</span>
            </div>
            <h4 className="text-lg font-bold text-white">Hard</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
              <li>• 5 Suspect Dossiers</li>
              <li>• 9 Forensic Clues</li>
              <li>• 3 Hint Lifelines</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Case Archives / Recent Cases */}
      {recentCases.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-amber-400" /> Recent Case Files
            </h2>
            <span className="text-xs text-slate-400 font-mono">{recentCases.length} loaded</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {recentCases.slice(0, 4).map(c => (
              <Link
                key={c._id}
                to={c.status === 'completed' ? `/cases/${c._id}/results` : `/investigate/${c._id}`}
                className="group p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                      c.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                      c.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {c.difficulty}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                      c.status === 'completed' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{c.premise}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

