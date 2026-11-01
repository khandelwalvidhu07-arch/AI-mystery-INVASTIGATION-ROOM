import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Sparkles, FolderArchive, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-amber-900/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-wide">AI Mystery Room</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight">Procedural Whodunit Engine</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/create"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            New Case
          </Link>
        </nav>
      </div>
    </header>
  );
}

