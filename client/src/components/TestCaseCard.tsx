import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle,
} from 'lucide-react';
import { TestCase } from '../types/index.js';

interface TestCaseCardProps {
  testCase: TestCase;
  index: number;
  onEdit: (tc: TestCase) => void;
  onDelete: (testCaseId: string) => void;
  viewMode: 'MANUAL_QA' | 'GHERKIN_BDD';
}

export const TestCaseCard: React.FC<TestCaseCardProps> = ({
  testCase,
  index,
  onEdit,
  onDelete,
  viewMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const getDimensionBadge = (dim: string) => {
    switch (dim) {
      case 'POSITIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'NEGATIVE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EDGE_CASE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VALIDATION':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'SECURITY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const handleCopyGherkin = () => {
    const textToCopy = testCase.gherkin || `Feature: ${testCase.title}\n  Scenario: ${testCase.title}\n${testCase.steps.map((s) => `    When ${s}`).join('\n')}\n    Then ${testCase.expectedResult}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all overflow-hidden mb-3">
      {/* Header bar */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 text-white">
              {testCase.testCaseId}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">#{index + 1}</span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDimensionBadge(testCase.dimension)}`}>
                {testCase.dimension.replace('_', ' ')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(testCase.priority)}`}>
                {testCase.priority} PRIORITY
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {testCase.status || 'DRAFT'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
              {testCase.title}
            </h4>
            {testCase.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {testCase.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(testCase)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Edit Test Case"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(testCase.testCaseId)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Test Case"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40 text-xs">
          {viewMode === 'MANUAL_QA' ? (
            <div className="space-y-3 pt-2">
              {/* Preconditions */}
              {testCase.preconditions && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-700 block mb-1">Preconditions:</span>
                  <span className="text-slate-600 leading-relaxed">{testCase.preconditions}</span>
                </div>
              )}

              {/* Test Steps */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-700 block mb-2">Step-by-Step Execution:</span>
                <ol className="space-y-1.5 pl-4 list-decimal text-slate-700">
                  {testCase.steps.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Expected Result */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80">
                <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Expected Result:
                </span>
                <span className="text-emerald-800 leading-relaxed font-medium">
                  {testCase.expectedResult}
                </span>
              </div>
            </div>
          ) : (
            /* Gherkin BDD View */
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] text-slate-500 font-semibold">
                  Gherkin / Cucumber BDD Spec
                </span>
                <button
                  onClick={handleCopyGherkin}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-sky-600 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Scenario</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {testCase.gherkin ||
                  `Feature: ${testCase.title}
  Scenario: ${testCase.title}
    Given ${testCase.preconditions || 'the system is initialized'}
${testCase.steps.map((s) => `    When ${s}`).join('\n')}
    Then ${testCase.expectedResult}`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
