import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Eye,
  HelpCircle,
  Award,
  AlertTriangle,
  User,
  Fingerprint,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { getCase, discoverClue, requestHint } from '../api';

export default function InvestigationRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchCase = async () => {
    try {
      const data = await getCase(id);
      if (data?.case) {
        if (data.case.status === 'completed') {
          navigate(`/cases/${id}/results`);
          return;
        }
        setCaseData(data.case);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load case file.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const triggerToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Discover Clue handler
  const handleDiscoverClue = async (clueId) => {
    try {
      setActionLoading(true);
      const res = await discoverClue(id, clueId);
      if (res.success) {
        setCaseData(prev => ({
          ...prev,
          score: res.currentScore,
          clues: prev.clues.map(c => c.id === clueId ? { ...c, isDiscovered: true, description: res.clue.description } : c)
        }));
        triggerToast(`+5 Points! Clue Examined: ${res.clue.title}`, 'success');
      }
    } catch (err) {
      triggerToast(err.response?.data?.error || 'Could not examine clue.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Request Hint handler
  const handleRequestHint = async () => {
    try {
      setActionLoading(true);
      const res = await requestHint(id);
      if (res.success) {
        setCaseData(prev => ({
          ...prev,
          score: res.currentScore,
          hints: prev.hints.map(h => h.id === res.hint.id ? { ...h, isRevealed: true, hintText: res.hint.hintText } : h)
        }));
        setShowHintModal(false);
        triggerToast(`-10 Points: Informant Hint Uncovered`, 'warning');
      }
    } catch (err) {
      triggerToast(err.response?.data?.error || 'No hints available.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-slate-400 font-mono text-sm tracking-wider">Accessing Case File Archives...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Case File Inaccessible</h2>
        <p className="text-slate-400 text-sm">{error || 'Unable to find investigation dossier.'}</p>
        <Link to="/create" className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm">
          Initiate New Case
        </Link>
      </div>
    );
  }

  const discoveredCount = caseData.clues.filter(c => c.isDiscovered).length;
  const totalClues = caseData.clues.length;
  const revealedHints = caseData.hints.filter(h => h.isRevealed);
  const unrevealedHintsCount = caseData.hints.filter(h => !h.isRevealed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
            : notification.type === 'warning'
            ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
            : 'bg-red-950/90 text-red-300 border-red-500/50'
        }`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Case Header Dashboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                caseData.difficulty === 'hard' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                caseData.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {caseData.difficulty} Case
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {caseData._id?.slice(-6)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
              {caseData.title}
            </h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Score</div>
              <div className="text-xl font-black text-amber-400 font-mono">{caseData.score || 0} pts</div>
            </div>

            <Link
              to={`/investigate/${id}/accuse`}
              className="px-5 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 shadow-lg shadow-red-500/20 flex items-center gap-2 text-sm transition-all hover:scale-105"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              Accuse Suspect
            </Link>
          </div>
        </div>

        {/* Narrative Synopsis */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Crime Scene Briefing
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            {caseData.story}
          </p>
        </div>

        {/* Evidence Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Forensic Evidence Discovered</span>
            <span className="text-amber-400 font-bold">{discoveredCount} / {totalClues}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(discoveredCount / totalClues) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suspect Dossiers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> Suspect Dossiers ({caseData.suspects.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Cross-examine alibis with clues</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseData.suspects.map((suspect, idx) => (
            <div
              key={suspect.id || idx}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-colors relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-amber-400 font-serif">
                  {suspect.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{suspect.name}</h3>
                  <div className="text-xs text-amber-400 font-mono">{suspect.role}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1 border-t border-slate-800/80">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Alibi:</span>
                  <p className="text-slate-300 italic">{suspect.alibi}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Potential Motive:</span>
                  <p className="text-slate-300">{suspect.motive}</p>
                </div>
                {suspect.demeanor && (
                  <div>
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Demeanor:</span>
                    <p className="text-slate-400">{suspect.demeanor}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clues Board / Evidence Locker */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-cyan-400" /> Evidence Locker ({totalClues} Clues)
          </h2>
          <span className="text-xs text-slate-400 font-mono">+5 pts per discovered clue</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {caseData.clues.map((clue) => (
            <div
              key={clue.id}
              className={`rounded-2xl p-5 border transition-all ${
                clue.isDiscovered
                  ? 'bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {clue.isDiscovered ? (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      Examined
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-800 text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Sealed Lead
                    </span>
                  )}
                  <h3 className="font-bold text-white text-sm">{clue.title}</h3>
                </div>

                {!clue.isDiscovered && (
                  <button
                    onClick={() => handleDiscoverClue(clue.id)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Examine (+5 pts)
                  </button>
                )}
              </div>

              <p className={`text-xs leading-relaxed ${clue.isDiscovered ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                {clue.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Hints & Informant Hotline */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" /> Informant Hotline
            </h2>
            <p className="text-xs text-slate-400">Request subtle deductive guidance when stuck. Warning: Deducts 10 points per hint.</p>
          </div>

          {unrevealedHintsCount > 0 ? (
            <button
              onClick={() => setShowHintModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <HelpCircle className="w-4 h-4" />
              Call Informant ({unrevealedHintsCount} left)
            </button>
          ) : (
            <span className="text-xs font-mono text-slate-500">All available hints unlocked</span>
          )}
        </div>

        {/* Revealed Hints List */}
        {revealedHints.length > 0 ? (
          <div className="space-y-2 pt-2">
            {revealedHints.map((hint, idx) => (
              <div key={hint.id || idx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono text-[10px] uppercase font-bold text-amber-400">
                  Hint #{idx + 1}
                </span>
                <p className="leading-relaxed">{hint.hintText}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            No hints requested yet. Your deductive reputation is untarnished!
          </div>
        )}
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-40 bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">Current Score</div>
            <div className="text-lg font-black text-amber-400 font-mono">{caseData.score || 0} pts</div>
          </div>
        </div>

        <Link
          to={`/investigate/${id}/accuse`}
          className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-red-500 via-amber-500 to-amber-400 hover:from-red-400 hover:to-amber-300 shadow-xl shadow-red-500/20 flex items-center gap-2 text-sm transition-all hover:scale-105"
        >
          <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
          Confront Suspect (Lock in Accusation)
        </Link>
      </div>

      {/* Hint Confirmation Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">Call Informant?</h3>
            </div>
            <p className="text-sm text-slate-300">
              Requesting an informant hint costs <strong className="text-amber-400">-10 points</strong> from your final score. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestHint}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm (-10 pts)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

