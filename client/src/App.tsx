import { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Wand2,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { Header } from './components/Header.js';
import { RequirementInput } from './components/RequirementInput.js';
import { QualityAnalysisCard } from './components/QualityAnalysisCard.js';
import { DimensionTabs } from './components/DimensionTabs.js';
import { TestCaseCard } from './components/TestCaseCard.js';
import { TestCaseEditModal } from './components/TestCaseEditModal.js';
import { RefineSuiteModal } from './components/RefineSuiteModal.js';
import { ExportModal } from './components/ExportModal.js';
import { SavedSuitesDrawer } from './components/SavedSuitesDrawer.js';
import { KeySettingsModal } from './components/KeySettingsModal.js';
import { api, getStoredApiKey } from './services/api.js';
import {
  TestCase,
  TestDimension,
  RequirementQualityAnalysis,
  SystemHealth,
} from './types/index.js';

export function App() {
  // Requirement state
  const [requirement, setRequirement] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<TestDimension[]>([
    'POSITIVE',
    'NEGATIVE',
    'EDGE_CASE',
    'VALIDATION',
    'SECURITY',
  ]);

  // Generated Suite state
  const [suiteTitle, setSuiteTitle] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [qualityAnalysis, setQualityAnalysis] = useState<RequirementQualityAnalysis | null>(null);
  const [modelUsed, setModelUsed] = useState('');
  const [currentSuiteId, setCurrentSuiteId] = useState<string | null>(null);

  // Filters & Views
  const [dimensionFilter, setDimensionFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'MANUAL_QA' | 'GHERKIN_BDD'>('MANUAL_QA');

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isKeysOpen, setIsKeysOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(Boolean(getStoredApiKey()));

  // Saved Suites & Health
  const [savedSuites, setSavedSuites] = useState<any[]>([]);
  const [isLoadingSuites, setIsLoadingSuites] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [readiness, setReadiness] = useState<{ status: string; database: string; aiEngine: string } | null>(null);

  // Check health and load saved suites on mount
  useEffect(() => {
    checkHealth();
    loadSavedSuites();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const checkHealth = async () => {
    try {
      const [h, r] = await Promise.all([api.getHealth(), api.getReadiness()]);
      setHealth(h);
      setReadiness(r);
    } catch (e) {
      console.warn('Health check error:', e);
    }
  };

  const loadSavedSuites = async () => {
    setIsLoadingSuites(true);
    try {
      const list = await api.listSuites();
      setSavedSuites(list);
    } catch (e: any) {
      console.warn('Failed to load saved suites:', e.message);
    } finally {
      setIsLoadingSuites(false);
    }
  };

  const handleToggleDimension = (dim: TestDimension) => {
    if (selectedDimensions.includes(dim)) {
      if (selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter((d) => d !== dim));
      }
    } else {
      setSelectedDimensions([...selectedDimensions, dim]);
    }
  };

  // Generate Test Cases
  const handleGenerate = async () => {
    if (requirement.trim().length < 10) return;
    setIsLoading(true);
    setLoadingStage('Analyzing requirements & checking ambiguity...');

    try {
      setTimeout(() => setLoadingStage('Synthesizing multi-dimensional scenarios...'), 1200);
      setTimeout(() => setLoadingStage('Validating QA JSON schemas...'), 2400);

      const result = await api.generateTestCases(requirement, selectedDimensions);
      setSuiteTitle(result.title);
      setTestCases(result.testCases);
      setQualityAnalysis(result.qualityAnalysis);
      setModelUsed(result.modelUsed);
      setCurrentSuiteId(null);

      showNotification('success', `Generated ${result.testCases.length} comprehensive test cases!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to generate test cases.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Refine / Re-prompt with AI
  const handleRefine = async (feedbackPrompt: string) => {
    setIsLoading(true);
    setLoadingStage('Iterating on scenarios with QA feedback...');

    try {
      const result = await api.refineTestCases(requirement, testCases, feedbackPrompt);
      setSuiteTitle(result.title);
      setTestCases(result.testCases);
      setQualityAnalysis(result.qualityAnalysis);
      setModelUsed(result.modelUsed);
      setIsRefineOpen(false);

      showNotification('success', 'Test suite successfully refined with AI!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to refine test suite.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Save Suite to Database
  const handleSaveToDatabase = async () => {
    if (testCases.length === 0) return;
    setIsSaving(true);

    try {
      const payload = {
        title: suiteTitle || 'Ingested Requirement Test Suite',
        rawRequirement: requirement,
        modelUsed: modelUsed || 'gpt-4o-mini',
        qualityScore: qualityAnalysis?.completenessScore ?? 85,
        qualityFeedback: JSON.stringify(qualityAnalysis || {}),
        testCases,
      };

      let saved;
      if (currentSuiteId) {
        saved = await api.updateSuite(currentSuiteId, {
          title: suiteTitle,
          testCases,
        });
        showNotification('success', 'Test suite changes updated in database!');
      } else {
        saved = await api.saveSuite(payload);
        setCurrentSuiteId(saved.id || null);
        showNotification('success', 'Test suite saved to database successfully!');
      }

      await loadSavedSuites();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to persist test suite.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load Saved Suite from Drawer
  const handleSelectSuite = async (id: string) => {
    setIsLoading(true);
    try {
      const suite = await api.getSuite(id);
      setCurrentSuiteId(suite.id || null);
      setSuiteTitle(suite.title);
      setRequirement(suite.rawRequirement);
      setTestCases(suite.testCases);
      setModelUsed(suite.modelUsed);
      if (suite.qualityFeedback) {
        try {
          setQualityAnalysis(JSON.parse(suite.qualityFeedback));
        } catch {
          setQualityAnalysis(null);
        }
      }
      showNotification('success', `Loaded "${suite.title}" from database.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load test suite.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Saved Suite
  const handleDeleteSuite = async (id: string) => {
    try {
      await api.deleteSuite(id);
      if (currentSuiteId === id) {
        setCurrentSuiteId(null);
      }
      await loadSavedSuites();
      showNotification('success', 'Test suite deleted from database.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete test suite.');
    }
  };

  // Individual Test Case Management
  const handleSaveEditedCase = (updated: TestCase) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.testCaseId === updated.testCaseId ? updated : tc))
    );
    setEditingTestCase(null);
    showNotification('success', `Updated ${updated.testCaseId}`);
  };

  const handleDeleteCase = (testCaseId: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.testCaseId !== testCaseId));
    showNotification('success', `Deleted ${testCaseId}`);
  };

  const handleAddNewCase = () => {
    const newId = `TC-MAN-${String(testCases.length + 1).padStart(2, '0')}`;
    const newCase: TestCase = {
      testCaseId: newId,
      title: 'New Manual Test Scenario',
      description: 'Custom manual scenario added by QA engineer',
      dimension: 'POSITIVE',
      priority: 'MEDIUM',
      preconditions: 'System is ready',
      steps: ['Step 1: Perform custom manual action', 'Step 2: Inspect outcome'],
      expectedResult: 'System fulfills expected state change',
      status: 'DRAFT',
    };
    setTestCases([...testCases, newCase]);
    setEditingTestCase(newCase);
  };

  // Filter test cases
  const filteredCases = testCases.filter((tc) => {
    const matchesDim = dimensionFilter === 'ALL' || tc.dimension === dimensionFilter;
    const matchesPriority = priorityFilter === 'ALL' || tc.priority === priorityFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      tc.testCaseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDim && matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-rose-900 text-rose-100 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        health={health}
        readiness={readiness}
        savedCount={savedSuites.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenKeys={() => setIsKeysOpen(true)}
        hasCustomKey={hasCustomKey}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Requirement Ingestion (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <RequirementInput
              requirement={requirement}
              onChangeRequirement={setRequirement}
              selectedDimensions={selectedDimensions}
              onToggleDimension={handleToggleDimension}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              loadingStage={loadingStage}
            />

            {/* Ingestion Info Card */}
            <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 space-y-2">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-sky-600" />
                <span>Enterprise Ingestion Capabilities</span>
              </div>
              <p className="leading-relaxed">
                Supports freeform User Stories, Gherkin specifications, and PRDs. Ingested requirements are analyzed by the AI architect to infer acceptance boundaries, security vectors, and test assertions.
              </p>
            </div>
          </div>

          {/* Right Column: Generated Test Suite & Management (7 cols) */}
          <div className="lg:col-span-7">
            {testCases.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Ready to Synthesize Test Cases
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Select a sample template on the left or paste your software requirements to generate an enterprise-grade test suite covering Positive, Negative, Edge, Validation, and Security dimensions.
                </p>
              </div>
            ) : (
              /* Populated Suite View */
              <div>
                {/* Suite Header with Title & Action Buttons */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {suiteTitle || 'Generated Test Suite'}
                      </h2>
                      {currentSuiteId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Persisted in DB
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{testCases.length} Total Test Cases</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{modelUsed}</span>
                    </div>
                  </div>

                  {/* Suite Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleAddNewCase}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                      title="Add manual scenario"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Case</span>
                    </button>
                    <button
                      onClick={() => setIsRefineOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-semibold transition-colors"
                      title="Refine with AI re-prompt"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Refine</span>
                    </button>
                    <button
                      onClick={() => setIsExportOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                      title="Export to Markdown, Gherkin, CSV, JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={handleSaveToDatabase}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      title="Save to database"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Suite'}</span>
                    </button>
                  </div>
                </div>

                {/* AI Requirement Quality Analysis Linter */}
                {qualityAnalysis && <QualityAnalysisCard analysis={qualityAnalysis} />}

                {/* Filter Tabs & Search */}
                <DimensionTabs
                  testCases={testCases}
                  selectedFilter={dimensionFilter}
                  onSelectFilter={setDimensionFilter}
                  selectedPriority={priorityFilter}
                  onSelectPriority={setPriorityFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  viewMode={viewMode}
                  onToggleViewMode={setViewMode}
                />

                {/* Test Case Cards List */}
                <div className="space-y-3">
                  {filteredCases.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                      No test cases match your selected filter criteria.
                    </div>
                  ) : (
                    filteredCases.map((tc, idx) => (
                      <TestCaseCard
                        key={tc.testCaseId}
                        testCase={tc}
                        index={idx}
                        onEdit={setEditingTestCase}
                        onDelete={handleDeleteCase}
                        viewMode={viewMode}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Test Case Modal */}
      <TestCaseEditModal
        testCase={editingTestCase}
        onSave={handleSaveEditedCase}
        onClose={() => setEditingTestCase(null)}
      />

      {/* Refine Suite Modal */}
      <RefineSuiteModal
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        onRefine={handleRefine}
        isLoading={isLoading}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        suiteTitle={suiteTitle || 'Test_Suite'}
        testCases={testCases}
        rawRequirement={requirement}
      />

      {/* Saved Suites Drawer */}
      <SavedSuitesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        suites={savedSuites}
        onSelectSuite={handleSelectSuite}
        onDeleteSuite={handleDeleteSuite}
        isLoading={isLoadingSuites}
      />

      {/* Key Settings Modal */}
      <KeySettingsModal
        isOpen={isKeysOpen}
        onClose={() => setIsKeysOpen(false)}
        onSaved={() => {
          setHasCustomKey(Boolean(getStoredApiKey()));
          checkHealth();
        }}
      />
    </div>
  );
}
export default App;
