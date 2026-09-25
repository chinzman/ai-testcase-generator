import React from 'react';
import { Sparkles, Database, Key, FolderArchive, Activity } from 'lucide-react';
import { SystemHealth } from '../types/index.js';

interface HeaderProps {
  health: SystemHealth | null;
  readiness: { status: string; database: string; aiEngine: string } | null;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenKeys: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  readiness,
  savedCount,
  onOpenSaved,
  onOpenKeys,
  hasCustomKey,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">Esperia Studio</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 tracking-wide">
                Enterprise AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Automated QA & Test Case Synthesis</p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Health & DB Status */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>System Online</span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>{readiness?.database === 'CONNECTED' ? 'SQLite Ready' : 'Connecting...'}</span>
            </div>
          </div>

          {/* BYOK Settings Button */}
          <button
            onClick={onOpenKeys}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasCustomKey
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Configure AI API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasCustomKey ? 'Custom Key Set' : 'AI Engine Keys'}</span>
          </button>

          {/* Saved Suites Drawer Trigger */}
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Saved Suites</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
