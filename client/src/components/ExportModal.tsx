import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { TestCase } from '../types/index.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  suiteTitle: string;
  testCases: TestCase[];
  rawRequirement: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  suiteTitle,
  testCases,
  rawRequirement,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'MARKDOWN' | 'GHERKIN' | 'CSV' | 'JSON'>('MARKDOWN');
  const [copied, setCopied] = useState(false);

  // 1. Generate Markdown
  const generateMarkdown = () => {
    let md = `# Test Suite: ${suiteTitle}\n\n`;
    md += `## Original Requirement\n\`\`\`\n${rawRequirement}\n\`\`\`\n\n`;
    md += `## Test Cases Summary\nTotal Test Cases: ${testCases.length}\n\n`;
    md += `| Test ID | Title | Dimension | Priority | Expected Result |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    testCases.forEach((tc) => {
      md += `| ${tc.testCaseId} | ${tc.title} | ${tc.dimension} | ${tc.priority} | ${tc.expectedResult.replace(/\n/g, ' ')} |\n`;
    });
    md += `\n---\n\n## Detailed Scenarios\n\n`;
    testCases.forEach((tc) => {
      md += `### [${tc.testCaseId}] ${tc.title}\n`;
      md += `- **Dimension:** ${tc.dimension}\n`;
      md += `- **Priority:** ${tc.priority}\n`;
      md += `- **Status:** ${tc.status || 'DRAFT'}\n`;
      md += `- **Preconditions:** ${tc.preconditions || 'None'}\n`;
      md += `- **Steps:**\n`;
      tc.steps.forEach((s, idx) => {
        md += `  ${idx + 1}. ${s}\n`;
      });
      md += `- **Expected Result:** ${tc.expectedResult}\n\n`;
    });
    return md;
  };

  // 2. Generate Gherkin Feature
  const generateGherkin = () => {
    let gherkin = `@automated @test_suite\nFeature: ${suiteTitle}\n\n`;
    gherkin += `  Background: Ingested Software Requirement\n`;
    gherkin += `    Given the application is configured and running\n\n`;
    testCases.forEach((tc) => {
      gherkin += `  @${tc.dimension.toLowerCase()} @priority_${tc.priority.toLowerCase()}\n`;
      gherkin += `  Scenario: [${tc.testCaseId}] ${tc.title}\n`;
      gherkin += `    Given ${tc.preconditions || 'the user is on the target interface'}\n`;
      tc.steps.forEach((s) => {
        gherkin += `    When ${s}\n`;
      });
      gherkin += `    Then ${tc.expectedResult}\n\n`;
    });
    return gherkin;
  };

  // 3. Generate CSV for Jira / Xray
  const generateCSV = () => {
    const headers = ['Issue Key', 'Summary', 'Description', 'Test Type', 'Priority', 'Preconditions', 'Step', 'Expected Result'];
    const rows = [headers.join(',')];

    testCases.forEach((tc) => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      const stepsFormatted = tc.steps.map((s, i) => `${i + 1}. ${s}`).join('; ');
      rows.push([
        escape(tc.testCaseId),
        escape(tc.title),
        escape(tc.description),
        escape(tc.dimension),
        escape(tc.priority),
        escape(tc.preconditions),
        escape(stepsFormatted),
        escape(tc.expectedResult),
      ].join(','));
    });

    return rows.join('\n');
  };

  // 4. Generate JSON
  const generateJSON = () => {
    return JSON.stringify(
      {
        suiteTitle,
        totalCases: testCases.length,
        exportedAt: new Date().toISOString(),
        testCases,
      },
      null,
      2
    );
  };

  const getExportContent = () => {
    switch (activeTab) {
      case 'MARKDOWN':
        return { content: generateMarkdown(), filename: `${suiteTitle.replace(/\s+/g, '_')}.md`, type: 'text/markdown' };
      case 'GHERKIN':
        return { content: generateGherkin(), filename: `${suiteTitle.replace(/\s+/g, '_')}.feature`, type: 'text/plain' };
      case 'CSV':
        return { content: generateCSV(), filename: `${suiteTitle.replace(/\s+/g, '_')}_jira_xray.csv`, type: 'text/csv' };
      case 'JSON':
        return { content: generateJSON(), filename: `${suiteTitle.replace(/\s+/g, '_')}.json`, type: 'application/json' };
    }
  };

  const currentExport = getExportContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentExport.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentExport.content], { type: currentExport.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentExport.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Export Test Suite</h3>
            <p className="text-xs text-slate-500">Download formatted test artifacts for QA systems or CI/CD pipelines</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Format Selector */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('MARKDOWN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'MARKDOWN'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Spec (.md)</span>
          </button>
          <button
            onClick={() => setActiveTab('GHERKIN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'GHERKIN'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Cucumber BDD (.feature)</span>
          </button>
          <button
            onClick={() => setActiveTab('CSV')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'CSV'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Jira / Xray (.csv)</span>
          </button>
          <button
            onClick={() => setActiveTab('JSON')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'JSON'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSON Object (.json)</span>
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100 font-mono text-xs">
          <pre className="whitespace-pre-wrap leading-relaxed">{currentExport.content}</pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-mono">
            Filename: <span className="font-semibold text-slate-800">{currentExport.filename}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
