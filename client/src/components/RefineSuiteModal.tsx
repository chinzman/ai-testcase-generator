import React, { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';

interface RefineSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefine: (feedbackPrompt: string) => void;
  isLoading: boolean;
}

const SAMPLE_REFINEMENTS = [
  'Add boundary scenarios for extreme string lengths and negative balances.',
  'Include OWASP Top 10 security test cases (injection, broken auth, rate limits).',
  'Add concurrency test cases simulating race conditions and duplicate clicks.',
  'Generate tests for network timeout, slow 3G, and retry resilience.',
];

export const RefineSuiteModal: React.FC<RefineSuiteModalProps> = ({
  isOpen,
  onClose,
  onRefine,
  isLoading,
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onRefine(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Refine Test Suite with AI</h3>
              <p className="text-xs text-slate-500">Provide specific instructions to iterate on scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Quick Suggestions:</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SAMPLE_REFINEMENTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sample)}
                  className="text-left text-[11px] p-2 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 transition-colors border border-transparent hover:border-purple-200"
                >
                  💡 {sample}
                </button>
              ))}
            </div>

            <label className="font-bold text-slate-700 block mb-1">
              Refinement Instructions / Re-prompt:
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Make sure to add scenarios covering session timeout during checkout, and verify that inventory is returned if the user closes the tab.'"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Iterating Suite...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Refinement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
