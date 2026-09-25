import React from 'react';
import { X, Folder, Calendar, Layers, Trash2, ArrowRight } from 'lucide-react';

interface SavedSuitesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suites: any[];
  onSelectSuite: (id: string) => void;
  onDeleteSuite: (id: string) => void;
  isLoading: boolean;
}

export const SavedSuitesDrawer: React.FC<SavedSuitesDrawerProps> = ({
  isOpen,
  onClose,
  suites,
  onSelectSuite,
  onDeleteSuite,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Saved Test Suites</h3>
              <p className="text-xs text-slate-500">Persistent database history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
              <span className="text-xs font-medium">Fetching saved suites...</span>
            </div>
          ) : suites.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No saved suites yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Generate test cases and click "Save Suite to DB" to store them for future retrieval.
              </p>
            </div>
          ) : (
            suites.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                      {s.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{s._count?.testCases ?? s.testCases?.length ?? 0} Cases</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSuite(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete saved suite"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {s.modelUsed}
                  </span>
                  <button
                    onClick={() => {
                      onSelectSuite(s.id);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    <span>Load Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
