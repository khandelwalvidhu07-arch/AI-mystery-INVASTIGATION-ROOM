import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Compass, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createCase } from '../api';

const PRESETS = [
  {
    title: "The Midnight Diamond Heist",
    premise: "A priceless 100-carat blue diamond vanishes from the vault during an exclusive masquerade ball at the Blackwood Manor."
  },
  {
    title: "Poison in the Silicon Boardroom",
    premise: "The charismatic CEO of an AI quantum computing startup collapses during a high-stakes shareholder vote on a hostile takeover."
  },
  {
    title: "The Vanishing Alpine Express",
    premise: "As the luxury sleeper train emerges from a snowbound tunnel high in the Swiss Alps, a reclusive art collector disappears from his locked compartment."
  },
  {
    title: "The Cyber Heist of Neo-Tokyo",
    premise: "An experimental biometric AI core is extracted from an underground vault with no signs of forced entry or alarms tripped."
  }
];

export default function CreateMysteryPage() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!premise.trim()) {
      setError('Please provide a crime premise or choose one of the presets.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await createCase({ premise: premise.trim(), difficulty });
      if (data?.case?._id) {
        navigate(`/investigate/${data.case._id}`);
      } else {
        throw new Error('Case creation did not return a valid ID.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to craft the mystery. Please check if your server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Case Formulation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
            Initiate a New Investigation
          </h1>
          <p className="text-sm text-slate-300">
            Define the scenario. Gemini will synthesize suspects with conflicting alibis, forge physical forensic clues, and conceal the truth.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Premise Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">
              Mystery Scenario & Premise
            </label>
            <textarea
              rows={4}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="e.g. During the total solar eclipse at the cliffside observatory, the observatory director is found locked in the telescope dome..."
              className="w-full bg-slate-950/70 border border-slate-700 rounded-2xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm leading-relaxed"
              disabled={loading}
            />

            {/* Quick Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Quick Investigation Themes:
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPremise(preset.premise)}
                    className="text-left p-3 rounded-xl bg-slate-950/40 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 text-xs transition-all text-slate-300 hover:text-amber-300"
                    disabled={loading}
                  >
                    <div className="font-semibold text-white mb-0.5">{preset.title}</div>
                    <div className="text-slate-400 text-[11px] line-clamp-1">{preset.premise}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Tier Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">
              Choose Difficulty Tier
            </label>
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Easy */}
              <div
                onClick={() => !loading && setDifficulty('easy')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  difficulty === 'easy'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Easy</span>
                  {difficulty === 'easy' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>3 Suspects</div>
                  <div>5 Forensic Clues</div>
                  <div>2 Hint Lifelines</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold">
                  +100 Base Points
                </div>
              </div>

              {/* Medium */}
              <div
                onClick={() => !loading && setDifficulty('medium')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  difficulty === 'medium'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Medium</span>
                  {difficulty === 'medium' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>4 Suspects</div>
                  <div>7 Forensic Clues</div>
                  <div>3 Hint Lifelines</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-400 font-semibold">
                  +150 Base Points
                </div>
              </div>

              {/* Hard */}
              <div
                onClick={() => !loading && setDifficulty('hard')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  difficulty === 'hard'
                    ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Hard</span>
                  {difficulty === 'hard' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>5 Suspects</div>
                  <div>9 Forensic Clues</div>
                  <div>3 Hint Lifelines</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-red-400 font-semibold">
                  +200 Base Points
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 text-base transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Weaving Alibis & Staging Crime Scene with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Mystery Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

