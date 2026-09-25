import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredProvider, setStoredProvider } from '../services/api.js';

interface KeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const KeySettingsModal: React.FC<KeySettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [provider, setProvider] = useState<'openai' | 'claude' | 'auto'>(getStoredProvider());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey.trim());
    setStoredProvider(provider);
    setSavedNotice(true);
    onSaved();
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
    setStoredProvider('auto');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Engine Configuration</h3>
              <p className="text-xs text-slate-500">Bring Your Own Key (BYOK) or use Server Engine</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 flex items-start gap-2 text-sky-800">
            <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Your API key is stored securely in your browser's local storage and used directly for requests. If left blank, the application will use the server's configured environment keys or the built-in resilient heuristic QA engine.
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Preferred AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              <option value="auto">Auto (Cloud LLM / Built-in Engine)</option>
              <option value="openai">OpenAI (GPT-4o-mini)</option>
              <option value="claude">Anthropic Claude (Claude 3.5 Sonnet)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">API Key (Optional)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... or sk-proj-..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Clear Custom Key
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                {savedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
