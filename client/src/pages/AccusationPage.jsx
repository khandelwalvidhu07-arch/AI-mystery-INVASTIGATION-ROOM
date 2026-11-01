import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, User, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getCase, submitAccusation } from '../api';

export default function AccusationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCase(id)
      .then(res => {
        if (res.case) {
          if (res.case.status === 'completed') {
            navigate(`/cases/${id}/results`);
            return;
          }
          setCaseData(res.case);
        }
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load case data.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAccuse = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      setError('You must select a suspect to accuse.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await submitAccusation(id, selectedSuspectId);
      if (res.success) {
        navigate(`/cases/${id}/results`);
      } else {
        throw new Error(res.error || 'Failed to register accusation.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-slate-400 font-mono text-sm">Reviewing dossier files...</p>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Error Loading Accusation Chamber</h2>
        <p className="text-slate-400 text-sm">{error}</p>
        <Link to={`/investigate/${id}`} className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm">
          Return to Investigation
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Return button */}
      <Link
        to={`/investigate/${id}`}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Investigation Room
      </Link>

      <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> High-Stakes Confrontation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
            The Accusation Chamber
          </h1>
          <p className="text-sm text-slate-300">
            You have gathered your evidence and surveyed the crime scene. Point your finger at the true perpetrator.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAccuse} className="space-y-8">
          {/* Suspect Radio Grid */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">
              Select the Suspect You Are Formally Charging:
            </label>

            <div className="space-y-3">
              {caseData.suspects.map((suspect) => {
                const isSelected = selectedSuspectId === suspect.id;
                return (
                  <div
                    key={suspect.id}
                    onClick={() => !submitting && setSelectedSuspectId(suspect.id)}
                    className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'border-red-500 bg-red-950/20 ring-2 ring-red-500/40'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg font-serif border ${
                        isSelected
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {suspect.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{suspect.name}</h4>
                          <span className="text-xs text-amber-400 font-mono">({suspect.role})</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          <strong className="text-slate-300">Alibi:</strong> {suspect.alibi}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          <strong className="text-slate-300">Motive:</strong> {suspect.motive}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-slate-950">
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>
              <strong>Irreversible Decision:</strong> Submitting this accusation immediately closes the case and scores your performance based on the evidence uncovered.
            </span>
          </div>

          {/* Submit Accusation Button */}
          <button
            type="submit"
            disabled={submitting || !selectedSuspectId}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sealing Indictment & Evaluating Evidence...
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                Submit Accusation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

