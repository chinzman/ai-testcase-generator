import React from 'react';
import { Search, Filter, CheckCircle2, ShieldAlert, Cpu, CheckSquare, Shield } from 'lucide-react';
import { TestCase } from '../types/index.js';

interface DimensionTabsProps {
  testCases: TestCase[];
  selectedFilter: string; // 'ALL' | TestDimension
  onSelectFilter: (dim: string) => void;
  selectedPriority: string; // 'ALL' | TestPriority
  onSelectPriority: (p: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'MANUAL_QA' | 'GHERKIN_BDD';
  onToggleViewMode: (mode: 'MANUAL_QA' | 'GHERKIN_BDD') => void;
}

export const DimensionTabs: React.FC<DimensionTabsProps> = ({
  testCases,
  selectedFilter,
  onSelectFilter,
  selectedPriority,
  onSelectPriority,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
}) => {
  const getCount = (dim: string) => {
    if (dim === 'ALL') return testCases.length;
    return testCases.filter((tc) => tc.dimension === dim).length;
  };

  const tabs = [
    { id: 'ALL', label: 'All Cases', icon: Filter },
    { id: 'POSITIVE', label: 'Positive', icon: CheckCircle2 },
    { id: 'NEGATIVE', label: 'Negative', icon: ShieldAlert },
    { id: 'EDGE_CASE', label: 'Edge Cases', icon: Cpu },
    { id: 'VALIDATION', label: 'Validation', icon: CheckSquare },
    { id: 'SECURITY', label: 'Security', icon: Shield },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 mb-4 space-y-3">
      {/* Top Bar: Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Dimension Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const count = getCount(tab.id);
            const isActive = selectedFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Manual QA vs Gherkin BDD */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => onToggleViewMode('MANUAL_QA')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'MANUAL_QA'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Standard QA
          </button>
          <button
            onClick={() => onToggleViewMode('GHERKIN_BDD')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'GHERKIN_BDD'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🥒 Gherkin BDD
          </button>
        </div>
      </div>

      {/* Bottom Bar: Search & Priority Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search test cases by ID, title, or steps..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-medium">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => onSelectPriority(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
};
