import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { TestCase, TestDimension, TestPriority, TestCaseStatus } from '../types/index.js';

interface TestCaseEditModalProps {
  testCase: TestCase | null;
  onSave: (updated: TestCase) => void;
  onClose: () => void;
}

export const TestCaseEditModal: React.FC<TestCaseEditModalProps> = ({
  testCase,
  onSave,
  onClose,
}) => {
  if (!testCase) return null;

  const [form, setForm] = useState<TestCase>({
    ...testCase,
    steps: [...testCase.steps],
  });

  const handleStepChange = (index: number, val: string) => {
    const updatedSteps = [...form.steps];
    updatedSteps[index] = val;
    setForm({ ...form, steps: updatedSteps });
  };

  const handleAddStep = () => {
    setForm({ ...form, steps: [...form.steps, ''] });
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = form.steps.filter((_, i) => i !== index);
    setForm({ ...form, steps: updatedSteps });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Edit Test Case <span className="font-mono text-sky-600 font-semibold">{form.testCaseId}</span>
            </h3>
            <p className="text-xs text-slate-500">Refine test parameters, execution steps, and assertions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Test Case Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Description / Objective</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Controls: Dimension, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dimension</label>
              <select
                value={form.dimension}
                onChange={(e) => setForm({ ...form, dimension: e.target.value as TestDimension })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                <option value="POSITIVE">Positive (Happy Path)</option>
                <option value="NEGATIVE">Negative (Error Path)</option>
                <option value="EDGE_CASE">Edge & Concurrency</option>
                <option value="VALIDATION">Validation & Schema</option>
                <option value="SECURITY">Security & Access</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TestPriority })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">QA Review Status</label>
              <select
                value={form.status || 'DRAFT'}
                onChange={(e) => setForm({ ...form, status: e.target.value as TestCaseStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>
          </div>

          {/* Preconditions */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Preconditions</label>
            <input
              type="text"
              value={form.preconditions}
              onChange={(e) => setForm({ ...form, preconditions: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Test Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Test Execution Steps</label>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 w-5 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    required
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  {form.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expected Result */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Expected Result</label>
            <textarea
              rows={2}
              value={form.expectedResult}
              onChange={(e) => setForm({ ...form, expectedResult: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
