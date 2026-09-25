import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { RequirementQualityAnalysis } from '../types/index.js';

interface QualityAnalysisCardProps {
  analysis: RequirementQualityAnalysis;
}

export const QualityAnalysisCard: React.FC<QualityAnalysisCardProps> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Requirement Quality & Ambiguity Analysis</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                AI Linter
              </span>
            </div>
            <p className="text-xs text-slate-500">Evaluated against enterprise QA specifications</p>
          </div>
        </div>

        {/* Scores & Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getScoreColor(analysis.completenessScore)}`}>
              {analysis.completenessScore}% Completeness
            </div>
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getScoreColor(analysis.clarityScore)}`}>
              {analysis.clarityScore}% Clarity
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand insights'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Analysis Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
          {/* Strengths */}
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Identified Strengths</span>
            </div>
            <ul className="space-y-1.5 text-slate-700">
              {analysis.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ambiguities */}
          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Ambiguities & Gaps</span>
            </div>
            <ul className="space-y-1.5 text-slate-700">
              {analysis.ambiguities.map((amb, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{amb}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-sky-50/50 rounded-xl p-3 border border-sky-100">
            <div className="flex items-center gap-1.5 font-bold text-sky-800 mb-2">
              <Lightbulb className="w-4 h-4 text-sky-600" />
              <span>QA Recommendations</span>
            </div>
            <ul className="space-y-1.5 text-slate-700">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-sky-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
