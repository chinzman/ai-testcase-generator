import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { TestDimension } from '../types/index.js';

interface RequirementInputProps {
  requirement: string;
  onChangeRequirement: (val: string) => void;
  selectedDimensions: TestDimension[];
  onToggleDimension: (dim: TestDimension) => void;
  onGenerate: () => void;
  isLoading: boolean;
  loadingStage: string;
}

const TEMPLATES = [
  {
    name: 'E-Commerce Stripe Checkout',
    content: `As an online customer,
I want to checkout my cart items using Stripe payment processing,
So that I can securely pay via credit card, redeem discount coupon codes, and receive an order confirmation email.

Acceptance Criteria:
1. Customer can enter valid Visa, Mastercard, or Amex card details.
2. System must check real-time inventory and place a 15-minute reservation hold on items.
3. If coupon code is valid, apply discount percentage before calculating total with tax.
4. If payment fails or cards decline, display clear error message and release the inventory hold.
5. On successful charge, deduct stock, create Order record in status 'PAID', and dispatch order confirmation email.
6. Must prevent duplicate charges if user clicks 'Pay Now' repeatedly.`,
  },
  {
    name: 'User Authentication & 2FA',
    content: `As a registered user,
I want to sign in using my email and password with optional Two-Factor Authentication (TOTP),
So that my account remains secure and I receive a valid session token.

Acceptance Criteria:
1. Valid credentials authenticate user and issue HttpOnly secure JWT cookie with 24-hour expiry.
2. Invalid email or password returns 401 Unauthorized with generic message to prevent user enumeration.
3. If 2FA is enabled, user must supply a 6-digit TOTP code before session issuance.
4. Account is temporarily locked out for 15 minutes after 5 consecutive failed attempts.
5. Expired or malformed tokens must return 401 and redirect user to /login.`,
  },
  {
    name: 'Bulk CSV Data Import',
    content: `As a data operations engineer,
I want to upload a CSV file containing up to 10,000 product records,
So that products can be bulk imported or updated in the catalog database.

Acceptance Criteria:
1. Allowed file formats: .csv with max file size of 20MB.
2. Schema validation: 'sku' (string, unique), 'name' (string, mandatory), 'price' (positive decimal), 'stock' (non-negative integer).
3. If any rows fail validation, generate downloadable error log with row number and reason, while allowing partial commit of valid rows.
4. Processing runs asynchronously with progress percentage reported via polling or websocket.
5. System must handle network drops and prevent memory spikes during stream parsing.`,
  },
  {
    name: 'Role-Based Access Control (RBAC)',
    content: `As a workspace administrator,
I want to assign roles (Admin, Editor, Viewer) to team members,
So that access to sensitive billing data and project configuration is restricted based on least privilege.

Acceptance Criteria:
1. Admin can invite users, assign/revoke roles, view invoices, and delete projects.
2. Editor can create, update, and publish documents, but cannot view billing or delete workspace.
3. Viewer can only read documents and export public reports.
4. Unauthorized API attempts must return 403 Forbidden with audit log entry.
5. Organization must always retain at least one active Admin member.`,
  },
];

const ALL_DIMENSIONS: { id: TestDimension; label: string; desc: string; color: string }[] = [
  { id: 'POSITIVE', label: 'Positive Scenarios', desc: 'Happy path & expected success', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'NEGATIVE', label: 'Negative Scenarios', desc: 'Errors, invalid inputs & auth failure', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'EDGE_CASE', label: 'Edge & Concurrency', desc: 'Boundary values & race conditions', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'VALIDATION', label: 'Schema Validation', desc: 'Format rules & mandatory constraints', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { id: 'SECURITY', label: 'Security & Access', desc: 'OWASP injection & privilege checks', color: 'text-purple-700 bg-purple-50 border-purple-200' },
];

export const RequirementInput: React.FC<RequirementInputProps> = ({
  requirement,
  onChangeRequirement,
  selectedDimensions,
  onToggleDimension,
  onGenerate,
  isLoading,
  loadingStage,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onChangeRequirement(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onChangeRequirement(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Software Requirement Input</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {requirement.length} characters
          </span>
          {requirement.length > 0 && (
            <button
              onClick={() => onChangeRequirement('')}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              title="Clear input"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Templates Selector */}
      <div className="mb-3">
        <span className="text-xs font-semibold text-slate-500 mb-2 block">
          Load Sample Specification Template:
        </span>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => onChangeRequirement(tmpl.content)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors border border-transparent hover:border-sky-200"
            >
              ⚡ {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Requirement Textarea with Drag & Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border transition-all ${
          dragActive
            ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-200'
            : 'border-slate-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 bg-slate-50/50'
        }`}
      >
        <textarea
          rows={11}
          value={requirement}
          onChange={(e) => onChangeRequirement(e.target.value)}
          placeholder="Paste user stories, product requirements document (PRD), or acceptance criteria here...&#10;&#10;e.g., 'As an admin, I want to revoke API tokens with immediate propagation across distributed gateway caches...'"
          className="w-full p-4 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-mono leading-relaxed"
        />

        {/* Upload File Button overlay */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200/70 bg-white/70 rounded-b-xl">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-sky-600 cursor-pointer transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Upload .txt / .md / .json</span>
            <input
              type="file"
              accept=".txt,.md,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-[11px] text-slate-400">
            Min 10 characters required
          </span>
        </div>
      </div>

      {/* Testing Dimensions Configuration */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Testing Dimensions to Synthesize
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedDimensions.length} dimensions selected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ALL_DIMENSIONS.map((dim) => {
            const isChecked = selectedDimensions.includes(dim.id);
            return (
              <label
                key={dim.id}
                onClick={() => onToggleDimension(dim.id)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isChecked
                    ? `${dim.color} ring-1 ring-inset ring-current/20 shadow-sm`
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">{dim.label}</div>
                  <div className="text-[10px] opacity-80 truncate">{dim.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Button & Loading Status */}
      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || requirement.trim().length < 10 || selectedDimensions.length === 0}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
            isLoading || requirement.trim().length < 10 || selectedDimensions.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-500/25 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{loadingStage || 'Processing Requirements with AI...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Comprehensive Test Cases</span>
            </>
          )}
        </button>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 animate-pulse py-1">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span>Enforcing QA JSON schemas, verifying coverage dimensions, and parsing scenarios...</span>
          </div>
        )}
      </div>
    </div>
  );
};
