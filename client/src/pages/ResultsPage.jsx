import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
  Fingerprint,
  HelpCircle,
  FileText
} from 'lucide-react';
import { getCaseResult } from '../api';

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCaseResult(id)
      .then(res => {
        if (res.success) {
          setResult(res);
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to retrieve case results.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-slate-400 font-mono text-sm">Unsealing verdict and forensic debriefing...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Results Unavailable</h2>
        <p className="text-slate-400 text-sm">{error || 'Could not find case result.'}</p>
        <Link to={`/investigate/${id}`} className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm">
          Return to Case
        </Link>
      </div>
    );
  }

  const caseObj = result.case;
  const isCorrect = caseObj.isAccusationCorrect;
  const breakdown = result.scoreBreakdown || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Verdict Announcement Banner */}
      <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden backdrop-blur-md ${
        isCorrect
          ? 'bg-emerald-950/40 border-emerald-500/40'
          : 'bg-red-950/40 border-red-500/40'
      }`}>
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ${
            isCorrect
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-red-500 text-white'
          }`}>
            {isCorrect ? (
              <ShieldCheck className="w-12 h-12 stroke-[2.2]" />
            ) : (
              <XCircle className="w-12 h-12 stroke-[2.2]" />
            )}
          </div>

          <div className="space-y-1">
            <span className={`text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
              isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {isCorrect ? 'Deduction Successful' : 'Flawed Deduction'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
              {isCorrect ? 'Case Closed: Justice Served!' : 'Case Unsolved: The Culprit Escaped!'}
            </h1>
            <p className="text-sm text-slate-300">
              {isCorrect
                ? 'Your razor-sharp deductive reasoning isolated the real perpetrator and aligned the forensic evidence.'
                : 'The evidence pointed elsewhere. The true mastermind slipped through the cracks.'}
            </p>
          </div>
        </div>
      </div>

      {/* Culprit Reveal Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
          <Fingerprint className="w-4 h-4" /> The True Culprit Unmasked
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl font-serif">
            {caseObj.culpritName?.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{caseObj.culpritName}</h3>
            <span className="text-xs font-mono text-slate-400">Designated Culprit ID: {caseObj.culpritId}</span>
          </div>
        </div>

        {/* Narrative Solution Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" /> Complete Solution & Modus Operandi
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
            {caseObj.solutionExplanation}
          </p>
        </div>
      </div>

      {/* Official Scorecard Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Detective Scorecard
          </h2>
          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {caseObj.difficulty} Tier
          </span>
        </div>

        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-slate-400">Base Accusation Reward:</span>
            <span className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-slate-500'}`}>
              +{breakdown.basePoints || 0} pts
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-slate-400">
              Discovered Clues Bonus ({breakdown.discoveredCount || 0} × 5 pts):
            </span>
            <span className="font-bold text-cyan-400">
              +{breakdown.cluesBonus || 0} pts
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-slate-400">
              Informant Hints Penalty ({breakdown.hintsCount || 0} × -10 pts):
            </span>
            <span className="font-bold text-red-400">
              -{breakdown.hintsPenalty || 0} pts
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 text-base">
            <span className="text-white font-bold font-sans">Final Certified Score:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {caseObj.score || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link
          to="/create"
          className="px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 flex items-center gap-2 text-base transition-all hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          Solve Another Mystery
        </Link>
        <Link
          to="/"
          className="px-6 py-4 rounded-xl font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all text-base"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

