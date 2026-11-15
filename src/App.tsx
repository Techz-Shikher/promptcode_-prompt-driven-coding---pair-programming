import React, { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ProblemPanel } from './components/ProblemPanel';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { PromptEngineeringBar } from './components/PromptEngineeringBar';
import { RealtimeStepsPanel } from './components/RealtimeStepsPanel';
import { TestResultsPanel } from './components/TestResultsPanel';
import { InteractiveCodeReview } from './components/InteractiveCodeReview';
import { LiveChatDrawer } from './components/LiveChatDrawer';
import { PromptAcademyModal } from './components/PromptAcademyModal';
import { PromptOptimizerModal } from './components/PromptOptimizerModal';
import { ProblemImporterModal } from './components/ProblemImporterModal';
import { MasterChecklistModal } from './components/MasterChecklistModal';
import { PromptCompareModal } from './components/PromptCompareModal';
import { PromptDebuggerModal } from './components/PromptDebuggerModal';
import { CodingAssistantModal } from './components/CodingAssistantModal';
import { PromptAnalyticsModal } from './components/PromptAnalyticsModal';
import { SqlAndApiAssistantModal } from './components/SqlAndApiAssistantModal';
import { MultiModelRoutingModal } from './components/MultiModelRoutingModal';
import { LeaderboardAndCommunityModal } from './components/LeaderboardAndCommunityModal';
import { QuantumAndResearchModal } from './components/QuantumAndResearchModal';
import { DevIntegrationsModal } from './components/DevIntegrationsModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { WorkflowHistoryModal } from './components/WorkflowHistoryModal';
import { CollaborationRoomsModal, RoomSummary } from './components/CollaborationRoomsModal';
import { MASTER_CHECKLIST, loadChecklistOverrides } from './data/masterChecklist';
import { PROBLEMS } from './data/problems';
import { loadStoredCustomProblems } from './utils/customProblems';
import {
  ProblemProgress,
  loadStoredProblemProgress,
} from './utils/problemProgress';
import {
  Problem,
  ProblemCategory,
  SupportedLanguage,
  ChatMessage,
  PromptExecutionResult,
  CodeReviewResult,
  TestCase,
  TestCaseExecutionResult,
} from './types';
import { sounds } from './utils/sounds';
import { savePromptVersion } from './utils/promptVersions.js';
import { appendWorkflowRun, createWorkflowId, deleteWorkflow as deleteLocalWorkflow, loadWorkflows, saveWorkflow as saveLocalWorkflow } from './utils/workflows.js';
import type { WorkflowRecord } from './utils/workflows.js';

export default function App() {
  // Custom Problems Library State
  const [customProblems, setCustomProblems] = useState<Problem[]>(() => loadStoredCustomProblems());
  const allProblems = [...PROBLEMS, ...customProblems];

  // Problem Completion & Test Progress State
  const [problemProgress] = useState<Record<string, ProblemProgress>>(() =>
    loadStoredProblemProgress()
  );

  // Category & Problems
  const [activeCategory, setActiveCategory] = useState<ProblemCategory>('solve');
  const filteredProblems = allProblems.filter((p) => p.category === activeCategory);
  const [activeProblem, setActiveProblem] = useState<Problem>(filteredProblems[0] || allProblems[0] || PROBLEMS[0]);

  // Code & Language
  const [language, setLanguage] = useState<SupportedLanguage>('typescript');
  const [code, setCode] = useState<string>(
    activeProblem.category === 'debug' && activeProblem.buggyCode
      ? activeProblem.buggyCode[language] || activeProblem.starterCode[language]
      : activeProblem.starterCode[language]
  );

  // Prompting & Execution
  const [prompt, setPrompt] = useState<string>('');
  const [isExecutingPrompt, setIsExecutingPrompt] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<PromptExecutionResult | null>(null);
  const [aiGeneratedCode, setAiGeneratedCode] = useState<string | null>(null);
  const [promptExecutionError, setPromptExecutionError] = useState<string | null>(null);

  // Pair Programming Collaboration
  const [activeRoom, setActiveRoom] = useState<RoomSummary | null>(null);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [roomStatus, setRoomStatus] = useState<'connected' | 'connecting' | 'offline'>('offline');
  const [roomMembers, setRoomMembers] = useState<Array<{ id: string; name: string; role?: string }>>([]);
  const roomSocketRef = useRef<WebSocket | null>(null);
  const roomRevisionRef = useRef(0);
  const roomVersionRef = useRef(0);
  const codeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live Chat
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Modals
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isAcademyOpen, setIsAcademyOpen] = useState<boolean>(false);
  const [academyFocusLessonId, setAcademyFocusLessonId] = useState<string | null>(null);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState<boolean>(false);
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);

  // Master Checklist & Lab Modals
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isPromptDebuggerOpen, setIsPromptDebuggerOpen] = useState<boolean>(false);
  const [isCodingAssistantOpen, setIsCodingAssistantOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isSqlApiOpen, setIsSqlApiOpen] = useState<boolean>(false);
  const [isMultiModelOpen, setIsMultiModelOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isQuantumOpen, setIsQuantumOpen] = useState<boolean>(false);
  const [isDevIntegrationsOpen, setIsDevIntegrationsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isWorkflowHistoryOpen, setIsWorkflowHistoryOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeModel, setActiveModel] = useState<string>(() => localStorage.getItem('promptcode.aiModel') || 'gemini-3.8-flash');
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>(() => loadWorkflows());
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowRecord['steps']>([
    { key: 'prompt', status: 'active' }, { key: 'code', status: 'pending' }, { key: 'tests', status: 'pending' },
  ]);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRecord['runHistory']>([]);
  const remoteWorkflowIds = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data?.user) setCurrentUser({ ...data.user, avatar: '' }); })
      .catch(() => { /* Account services may be unavailable until the server database is configured. */ });
    return () => { active = false; };
  }, []);

  const skipRoomCodeSyncRef = useRef(false);
  useEffect(() => {
    if (!activeRoom || !currentUser) { setRoomStatus('offline'); setRoomMembers([]); setChatMessages([]); roomSocketRef.current?.close(); roomSocketRef.current = null; return; }
    let alive = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 500;
    let socket: WebSocket | null = null;
    setRoomStatus('connecting');
    const connect = () => {
      if (!alive) return;
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${location.host}/api/rooms/${activeRoom.id}/socket`);
      roomSocketRef.current = socket;
      socket.onopen = () => { retryDelay = 500; setRoomStatus('connected'); };
      socket.onmessage = (event) => {
        let message: any;
        try { message = JSON.parse(event.data); } catch { return; }
        if (message.type === 'room:snapshot') {
          roomRevisionRef.current = Number(message.room.revision) || 0;
          setActiveRoom((room) => room ? { ...room, ...message.room } : room);
          setRoomMembers((message.members || []).map((member: any) => ({ ...member, online: (message.online || []).some((person: any) => person.id === member.id) })));
          setChatMessages((message.messages || []).map((item: any) => ({ id: item.id, sender: item.senderId === currentUser.id ? 'user' : 'peer', senderName: item.senderName, avatar: '', content: item.content, timestamp: new Date(item.createdAt).toLocaleTimeString() })));
          skipRoomCodeSyncRef.current = true;
          setCode(message.room.code || '');
          setLanguage(message.room.language);
        } else if (message.type === 'code:update' && message.userId !== currentUser.id) {
          roomRevisionRef.current = Number(message.revision) || roomRevisionRef.current;
          skipRoomCodeSyncRef.current = true;
          setCode(message.code);
          setLanguage(message.language);
        } else if (message.type === 'code:ack') roomRevisionRef.current = Number(message.revision) || roomRevisionRef.current;
        else if (message.type === 'code:conflict') {
          roomRevisionRef.current = Number(message.revision) || 0;
          skipRoomCodeSyncRef.current = true;
          setCode(message.code || ''); setLanguage(message.language);
        } else if (message.type === 'chat:message') {
          const item = message.message;
          setChatMessages((prior) => prior.some((entry) => entry.id === item.id) ? prior : [...prior, { id: item.id, sender: item.senderId === currentUser.id ? 'user' : 'peer', senderName: item.senderName, avatar: '', content: item.content, timestamp: new Date(item.createdAt).toLocaleTimeString() }]);
        } else if (message.type === 'presence:update') setRoomMembers((members) => members.map((member) => ({ ...member, online: message.online.some((person: any) => person.id === member.id) })));
        else if (message.type === 'member:role') setActiveRoom((room) => room ? { ...room, role: message.role } : room);
        else if (message.type === 'error') console.warn('Collaboration room:', message.error);
      };
      socket.onclose = () => {
        if (!alive) return;
        setRoomStatus('connecting');
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 10_000);
      };
      socket.onerror = () => socket?.close();
    };
    connect();
    return () => { alive = false; if (retryTimer) clearTimeout(retryTimer); socket?.close(); roomSocketRef.current = null; };
  }, [activeRoom?.id, currentUser?.id]);

  useEffect(() => {
    if (skipRoomCodeSyncRef.current) { skipRoomCodeSyncRef.current = false; return; }
    if (!activeRoom || roomStatus !== 'connected' || !roomSocketRef.current || roomSocketRef.current.readyState !== WebSocket.OPEN) return;
    if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
    const clientVersion = ++roomVersionRef.current;
    codeDebounceRef.current = setTimeout(() => {
      if (roomSocketRef.current?.readyState === WebSocket.OPEN)
        roomSocketRef.current.send(JSON.stringify({ type: 'code:update', code, language, baseRevision: roomRevisionRef.current, clientVersion }));
    }, 250);
    return () => { if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current); };
  }, [code, language, activeRoom?.id, roomStatus]);

  // Checklist Progress calculation
  const checklistOverrides = loadChecklistOverrides();
  const completedChecklistCount = MASTER_CHECKLIST.filter((i) => {
    return checklistOverrides[i.id] !== undefined
      ? checklistOverrides[i.id]
      : i.status === 'completed';
  }).length;

  // Sync custom problems updates
  const handleProblemsUpdated = () => {
    const updated = loadStoredCustomProblems();
    setCustomProblems(updated);
  };

  // Launch / Jump to Feature from Checklist
  const handleLaunchFeature = (actionKey: string) => {
    sounds.playPop(520);
    switch (actionKey) {
      case 'steps':
        setRightPanelTab('steps');
        break;
      case 'optimizer':
        setIsOptimizerOpen(true);
        break;
      case 'debug':
        handleSelectCategory('debug');
        break;
      case 'develop':
        handleSelectCategory('develop');
        break;
      case 'compare':
        setIsCompareOpen(true);
        break;
      case 'guide':
        setPrompt(activeProblem.recommendedPrompt);
        break;
      case 'analytics':
        setIsAnalyticsOpen(true);
        break;
      case 'importer-json':
        setIsImporterOpen(true);
        break;
      case 'review':
        setIsReviewOpen(true);
        if (!reviewResult) handleRunReview('Senior Staff Engineer');
        break;
      case 'tests':
        setRightPanelTab('tests');
        handleRunTests();
        break;
      case 'sql-api':
        setIsSqlApiOpen(true);
        break;
      case 'multi-model':
        setIsMultiModelOpen(true);
        break;
      case 'academy':
        setAcademyFocusLessonId(null);
        setIsAcademyOpen(true);
        break;
      case 'dev-integrations':
        setIsDevIntegrationsOpen(true);
        break;
      case 'leaderboard':
        setIsLeaderboardOpen(true);
        break;
      case 'quantum':
        setIsQuantumOpen(true);
        break;
      case 'driver-role':
        setIsRoomsOpen(true);
        break;
      case 'editor':
        setRightPanelTab('steps');
        break;
      case 'health':
        setIsDevIntegrationsOpen(true);
        break;
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'auth':
      case 'login':
        setIsAuthOpen(true);
        break;
      default:
        break;
    }
  };

  // Test Runner
  const [testCases, setTestCases] = useState<TestCase[]>(activeProblem.testCases);
  const [testResults, setTestResults] = useState<TestCaseExecutionResult[] | null>(null);
  const [testRunMessage, setTestRunMessage] = useState<string | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Right Panel Tab (steps | tests | assistant)
  const [rightPanelTab, setRightPanelTab] = useState<'steps' | 'tests' | 'assistant'>('steps');

  const buildWorkflowSnapshot = (id: string, title?: string): WorkflowRecord => ({
    id,
    title: title || activeProblem.title || 'Development workflow',
    problemId: activeProblem.id,
    problemTitle: activeProblem.title,
    mode: activeProblem.category,
    language,
    prompt,
    code,
    status: 'active',
    currentStep: Math.min(workflowSteps.findIndex((step) => step.status === 'active' || step.status === 'failed') < 0 ? Math.max(workflowSteps.length - 1, 0) : workflowSteps.findIndex((step) => step.status === 'active' || step.status === 'failed'), 20),
    steps: workflowSteps,
    runHistory: workflowRuns,
    progress: { executionResult, testResults, testCases, aiGeneratedCode, promptExecutionError, testRunMessage, reviewResult, reviewError },
  });

  const storeWorkflowSnapshot = (snapshot: WorkflowRecord) => {
    try {
      const saved = saveLocalWorkflow(snapshot);
      setWorkflows((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 30));
      return saved;
    } catch (error) {
      console.warn('Workflow snapshot could not be saved locally:', error);
      return null;
    }
  };

  const syncWorkflowSnapshot = async (snapshot: WorkflowRecord, create: boolean) => {
    if (!currentUser) return snapshot;
    try {
      const response = await fetch(create ? '/api/workflows' : `/api/workflows/${snapshot.id}`, {
        method: create ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: snapshot }),
      });
      if (!response.ok) return snapshot;
      const data = await response.json();
      const saved = data.workflow?.snapshot ? { ...data.workflow.snapshot, id: data.workflow.id, updatedAt: data.workflow.updatedAt } : snapshot;
      remoteWorkflowIds.current.add(saved.id);
      return saved as WorkflowRecord;
    } catch { return snapshot; }
  };

  const saveCurrentWorkflow = async () => {
    const isNew = !activeWorkflowId;
    const snapshot = buildWorkflowSnapshot(activeWorkflowId || createWorkflowId());
    const local = storeWorkflowSnapshot(snapshot);
    if (!local) return;
    setActiveWorkflowId(local.id);
    const synced = await syncWorkflowSnapshot(local, isNew || !remoteWorkflowIds.current.has(local.id));
    if (synced.id !== local.id) {
      deleteLocalWorkflow(local.id);
      setWorkflows((current) => [synced, ...current.filter((item) => item.id !== local.id && item.id !== synced.id)].slice(0, 30));
      setActiveWorkflowId(synced.id);
    }
  };

  const handleResumeWorkflow = (workflow: WorkflowRecord) => {
    if (activeWorkflowId && activeWorkflowId !== workflow.id) {
      const current = buildWorkflowSnapshot(activeWorkflowId);
      storeWorkflowSnapshot({ ...current, status: 'paused' });
    }
    const problem = allProblems.find((item) => item.id === workflow.problemId);
    if (problem) { setActiveProblem(problem); setActiveCategory(problem.category); }
    setLanguage(workflow.language as SupportedLanguage);
    setPrompt(workflow.prompt);
    setCode(workflow.code);
    setWorkflowSteps(workflow.steps);
    setWorkflowRuns(workflow.runHistory);
    setExecutionResult((workflow.progress?.executionResult as PromptExecutionResult | undefined) || null);
    setTestResults((workflow.progress?.testResults as TestCaseExecutionResult[] | undefined) || null);
    setTestCases((workflow.progress?.testCases as TestCase[] | undefined) || problem?.testCases || []);
    setAiGeneratedCode(workflow.progress?.aiGeneratedCode || null);
    setPromptExecutionError(workflow.progress?.promptExecutionError || null);
    setTestRunMessage(workflow.progress?.testRunMessage || null);
    setReviewResult((workflow.progress?.reviewResult as CodeReviewResult | undefined) || null);
    setReviewError(workflow.progress?.reviewError || null);
    setActiveWorkflowId(workflow.id);
    setRightPanelTab(workflow.steps.some((step) => step.key === 'tests' && (step.status === 'active' || step.status === 'failed')) ? 'tests' : 'steps');
    if (workflow.runHistory.at(-1)?.kind === 'review') setIsReviewOpen(true);
  };

  const removeWorkflow = async (id: string) => {
    deleteLocalWorkflow(id);
    setWorkflows((current) => current.filter((item) => item.id !== id));
    if (activeWorkflowId === id) setActiveWorkflowId(null);
    if (remoteWorkflowIds.current.has(id)) {
      remoteWorkflowIds.current.delete(id);
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const recordWorkflowRun = (kind: WorkflowRecord['runHistory'][number]['kind'], status: 'completed' | 'failed', summary: string, error = '', startedAt = new Date().toISOString(), metadata: Record<string, unknown> = {}, progressPatch: Partial<NonNullable<WorkflowRecord['progress']>> = {}) => {
    const now = new Date().toISOString();
    const nextSteps = workflowSteps.map((step) => ({ ...step }));
    const targetKey = kind === 'prompt' ? 'prompt' : kind === 'execution' ? 'tests' : 'code';
    const targetIndex = nextSteps.findIndex((step) => step.key === targetKey);
    if (targetIndex >= 0) {
      nextSteps[targetIndex] = { key: targetKey, status: status === 'failed' ? 'failed' : 'completed', ...(error ? { error } : {}) };
      if (status === 'completed' && kind === 'execution') {
        const codeIndex = nextSteps.findIndex((step) => step.key === 'code');
        if (codeIndex >= 0) nextSteps[codeIndex] = { key: 'code', status: 'completed' };
      }
      if (status === 'completed' && nextSteps[targetIndex + 1]) nextSteps[targetIndex + 1] = { key: nextSteps[targetIndex + 1].key, status: 'active' };
    }
    setWorkflowSteps(nextSteps);
    const base = buildWorkflowSnapshot(activeWorkflowId || createWorkflowId());
    base.progress = { ...base.progress, ...progressPatch };
    const updated = appendWorkflowRun({ ...base, steps: nextSteps }, { kind, status, startedAt, finishedAt: now, summary: summary.slice(0, 2000), error: error.slice(0, 4000), metadata });
    setWorkflowRuns(updated.runHistory);
    const saved = storeWorkflowSnapshot(updated);
    if (!saved) return;
    setActiveWorkflowId(saved.id);
    void (async () => {
      let synced = saved;
      const needsCreate = currentUser && !remoteWorkflowIds.current.has(saved.id);
      if (needsCreate) synced = await syncWorkflowSnapshot(saved, true);
      if (synced.id !== saved.id) {
        deleteLocalWorkflow(saved.id);
        setWorkflows((current) => [synced, ...current.filter((item) => item.id !== saved.id && item.id !== synced.id)].slice(0, 30));
        setActiveWorkflowId(synced.id);
      } else if (remoteWorkflowIds.current.has(saved.id)) {
        void syncWorkflowSnapshot(saved, false);
      }
      if (currentUser && remoteWorkflowIds.current.has(synced.id)) {
        await fetch(`/api/workflows/${synced.id}/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ run: { kind, status, startedAt, finishedAt: now, summary, error, metadata } }) }).catch(() => {});
      }
    })();
  };

  useEffect(() => {
    if (currentUser) {
      fetch('/api/workflows?limit=50').then(async (response) => response.ok ? response.json() : null).then((data) => {
        if (!Array.isArray(data?.workflows)) return;
        const remote = data.workflows.map((item: any) => ({ ...item.snapshot, id: item.id, updatedAt: item.updatedAt })) as WorkflowRecord[];
        remote.forEach((item) => remoteWorkflowIds.current.add(item.id));
        setWorkflows((local) => [...remote, ...local.filter((item) => !remote.some((saved) => saved.id === item.id))].slice(0, 30));
      }).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    if (!activeWorkflowId) return;
    const delay = remoteWorkflowIds.current.has(activeWorkflowId) ? 20_000 : 700;
    const timer = window.setTimeout(() => {
      const saved = storeWorkflowSnapshot(buildWorkflowSnapshot(activeWorkflowId));
      if (saved && remoteWorkflowIds.current.has(activeWorkflowId)) void syncWorkflowSnapshot(saved, false);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [activeWorkflowId, activeProblem, language, prompt, code, workflowSteps, workflowRuns, executionResult, testResults, testCases, aiGeneratedCode, promptExecutionError, testRunMessage, reviewResult, reviewError]);

  // Sync category changes
  const handleSelectCategory = (cat: ProblemCategory) => {
    setActiveCategory(cat);
    const newFiltered = allProblems.filter((p) => p.category === cat);
    if (newFiltered.length > 0) {
      handleSelectProblem(newFiltered[0]);
    }
  };

  // Sync problem changes
  const handleSelectProblem = (prob: Problem) => {
    if (activeWorkflowId) {
      const paused = { ...buildWorkflowSnapshot(activeWorkflowId), status: 'paused' as const };
      storeWorkflowSnapshot(paused);
      if (remoteWorkflowIds.current.has(activeWorkflowId)) void syncWorkflowSnapshot(paused, false);
      setActiveWorkflowId(null);
    }
    setActiveProblem(prob);
    const initialCode =
      prob.category === 'debug' && prob.buggyCode
        ? prob.buggyCode[language] || prob.starterCode[language]
        : prob.starterCode[language];
    setCode(initialCode);
    setTestCases(prob.testCases);
    setTestResults(null);
    setTestRunMessage(null);
    setExecutionResult(null);
    setAiGeneratedCode(null);
    setPrompt(prob.recommendedPrompt);
    setWorkflowSteps([{ key: 'prompt', status: 'active' }, { key: 'code', status: 'pending' }, { key: 'tests', status: 'pending' }]);
    setWorkflowRuns([]);
  };

  // Sync language changes
  const handleChangeLanguage = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const starter =
      activeProblem.category === 'debug' && activeProblem.buggyCode
        ? activeProblem.buggyCode[newLang] || activeProblem.starterCode[newLang]
        : activeProblem.starterCode[newLang];
    setCode(starter);
    setTestResults(null);
  };

  // Reset starter code
  const handleResetCode = () => {
    const starter =
      activeProblem.category === 'debug' && activeProblem.buggyCode
        ? activeProblem.buggyCode[language] || activeProblem.starterCode[language]
        : activeProblem.starterCode[language];
    setCode(starter);
    setTestResults(null);
  };

  // Execute Prompt
  const handleExecutePrompt = async (promptToExecute = prompt) => {
    if (!promptToExecute.trim() || isExecutingPrompt) return;

    const runStartedAt = new Date().toISOString();
    setIsExecutingPrompt(true);
    setPromptExecutionError(null);
    setRightPanelTab('steps');

    try {
      try {
        savePromptVersion(activeProblem.id, promptToExecute);
      } catch (error) {
        console.error('Could not save the prompt version:', error);
      }
      const response = await fetch('/api/prompt/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToExecute,
          problemTitle: activeProblem.title,
          problemContext: activeProblem.description,
          currentCode: code,
          language,
          mode: activeProblem.category,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Prompt execution is unavailable.');
      }
      setExecutionResult(data);
      if (data.generatedCode) {
        setAiGeneratedCode(data.generatedCode);
      }
      recordWorkflowRun('prompt', 'completed', 'Prompt run completed.', '', runStartedAt, data.providerMetadata || {}, { executionResult: data, aiGeneratedCode: data.generatedCode || null, promptExecutionError: null });
    } catch (err) {
      console.error('Prompt execution failed:', err);
      const message = err instanceof Error ? err.message : 'Prompt execution failed.';
      setPromptExecutionError(message);
      recordWorkflowRun('prompt', 'failed', 'Prompt run failed.', message, runStartedAt, {}, { promptExecutionError: message });
    } finally {
      setIsExecutingPrompt(false);
    }
  };

  // Apply AI Code to Editor
  const handleApplyAiCode = (newCode?: string) => {
    const targetCode = newCode || aiGeneratedCode;
    if (targetCode) {
      setCode(targetCode);
      setAiGeneratedCode(null);
    }
  };

  // Run Test Cases
  const handleRunTests = async () => {
    setTestResults(null);
    setTestRunMessage(null);
    setRightPanelTab('tests');
    if (isRunningTests) return;
    const runStartedAt = new Date().toISOString();
    setIsRunningTests(true);
    try {
      const response = await fetch('/api/execute/tests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, testCases }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Code execution is unavailable.');
      if (!Array.isArray(data.results) || data.results.length !== testCases.length
        || data.results.some((result: any) => typeof result.testCaseId !== 'string' || typeof result.passed !== 'boolean'
          || typeof result.actualOutput !== 'string' || typeof result.expectedOutput !== 'string'
          || !Number.isFinite(result.executionTimeMs) || !Number.isFinite(result.memoryMb) || typeof result.status !== 'string')) {
        throw new Error('The execution service returned an invalid result.');
      }
      setTestResults(data.results);
      setTestRunMessage(`Executed ${data.results.length} cases in an isolated ${data.provider} worker. Resource figures are provider reported.`);
      recordWorkflowRun('execution', 'completed', `Executed ${data.results.length} test cases.`, '', runStartedAt, { provider: data.provider }, { testResults: data.results, testRunMessage: `Executed ${data.results.length} cases in an isolated ${data.provider} worker. Resource figures are provider reported.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Code execution failed.';
      setTestRunMessage(message);
      recordWorkflowRun('execution', 'failed', 'Test execution failed.', message, runStartedAt, {}, { testRunMessage: message });
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleAddCustomTestCase = (input: string, expected: string) => {
    const newCase: TestCase = {
      id: `custom-${Date.now()}`,
      input,
      expected,
      label: `Custom Test ${testCases.length + 1}`,
    };
    setTestCases((prev) => [...prev, newCase]);
  };

  const handleRunReview = async (reviewerPersona: string) => {
    const runStartedAt = new Date().toISOString();
    setIsReviewLoading(true);
    setReviewError(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemTitle: activeProblem.title,
          reviewerPersona,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code review is unavailable.');
      setReviewResult(data);
      recordWorkflowRun('review', 'completed', 'Code review completed.', '', runStartedAt, data.providerMetadata || {}, { reviewResult: data, reviewError: null });
    } catch (error) {
      console.error('Review failed:', error);
      const message = error instanceof Error ? error.message : 'Code review failed.';
      setReviewError(message);
      recordWorkflowRun('review', 'failed', 'Code review failed.', message, runStartedAt, {}, { reviewError: message });
    } finally {
      setIsReviewLoading(false);
    }
  };

  const handleApplyLineFix = (lineNumber: number, replacement: string) => {
    const lines = code.split('\n');
    if (lineNumber > 0 && lineNumber <= lines.length) {
      lines[lineNumber - 1] = replacement;
      setCode(lines.join('\n'));
    }
  };

  const handleSendMessage = async (text: string) => {
    if (text.toLowerCase().includes('@ai') || text.toLowerCase().startsWith('/')) {
      try {
        const nextMessages = [...chatMessages, { id: `msg-${Date.now()}`, sender: 'user' as const, senderName: currentUser?.name || 'You', avatar: '', content: text, timestamp: 'Just now' }];
        setChatMessages(nextMessages);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages,
            currentCode: code,
            problemTitle: activeProblem.title,
            language,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Chat assistance is unavailable.');
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          senderName: 'PromptCode AI',
          avatar: '',
          content: data.reply,
          timestamp: 'Just now',
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        console.error('AI chat failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'AI chat failed.';
        setChatMessages((prev) => [...prev, {
          id: `ai-error-${Date.now()}`,
          sender: 'ai',
          senderName: 'PromptCode AI',
          avatar: '',
          content: errorMessage,
          timestamp: 'Just now',
        }]);
      }
    } else if (roomSocketRef.current?.readyState === WebSocket.OPEN) {
      roomSocketRef.current.send(JSON.stringify({ type: 'chat:send', content: text }));
    } else {
      setChatMessages((previous) => [...previous, { id: `room-offline-${Date.now()}`, sender: 'ai', senderName: 'PromptCode', avatar: '', content: 'Join a collaboration room to share chat messages.', timestamp: 'Now' }]);
    }
  };

  const handleSelectPracticeProblem = (probId: string, recommendedPrompt: string) => {
    const target = allProblems.find((p) => p.id === probId);
    if (target) {
      handleSelectProblem(target);
      setPrompt(recommendedPrompt);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050811] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenReview={() => {
          setIsReviewOpen(true);
          if (!reviewResult) handleRunReview('Senior Staff Engineer');
        }}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          setUnreadChatCount(0);
        }}
        unreadChatCount={unreadChatCount}
        onOpenAcademy={() => { setAcademyFocusLessonId(null); setIsAcademyOpen(true); }}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenImporter={() => setIsImporterOpen(true)}
        totalProblemsCount={allProblems.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenWorkflows={() => setIsWorkflowHistoryOpen(true)}
        onOpenRooms={() => setIsRoomsOpen(true)}
        onOpenSqlApi={() => setIsSqlApiOpen(true)}
        onOpenMultiModel={() => setIsMultiModelOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenQuantum={() => setIsQuantumOpen(true)}
        onOpenDevIntegrations={() => setIsDevIntegrationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        allProblems={allProblems}
        onSelectProblem={handleSelectProblem}
        userName={currentUser?.name || 'Guest Engineer'}
        userAvatar={currentUser?.avatar || ''}
        onRunTests={handleRunTests}
        isRunningTests={isRunningTests}
      />

      {activeRoom && <div className="flex items-center gap-3 border-b border-[#172033] bg-[#0b0f19] px-5 py-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${roomStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className="font-semibold text-slate-200">{activeRoom.title || 'Collaboration room'}</span>
        <span className="text-slate-400">{roomStatus === 'connected' ? 'Connected' : 'Reconnecting'} · {activeRoom.role}{activeRoom.role === 'viewer' ? ' (view only)' : ''}</span>
        <span className="ml-auto text-slate-400">{roomMembers.filter((member: any) => member.online).length} online</span>
        <button onClick={() => setIsRoomsOpen(true)} className="text-indigo-300 hover:text-white">Manage rooms</button>
      </div>}

      {/* Main 3-Column Bento/Card Grid with 12px Gaps */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 gap-3 bg-[#050811]">
        {/* Left Card: Problem Details Panel */}
        <div className="w-full lg:w-[320px] xl:w-[350px] h-1/3 lg:h-full shrink-0 rounded-2xl border border-[#172033] bg-[#0b0f19] shadow-xl overflow-hidden flex flex-col">
          <ProblemPanel
            problems={filteredProblems}
            activeProblem={activeProblem}
            onSelectProblem={handleSelectProblem}
            onUseRecommendedPrompt={(p) => setPrompt(p)}
            onOpenImporter={() => setIsImporterOpen(true)}
            problemProgress={problemProgress}
          />
        </div>

        {/* Center Column: Code Editor (Upper) + Prompt Studio (Lower) */}
        <div className="flex-1 flex flex-col h-2/3 lg:h-full min-w-0 gap-3 overflow-hidden">
          {/* Editor Rounded Card */}
          <div className="flex-[68] min-h-0 rounded-2xl border border-[#172033] bg-[#070b16] shadow-xl overflow-hidden flex flex-col">
            <CodeEditorPanel
              code={code}
              onChangeCode={setCode}
              language={language}
              onChangeLanguage={handleChangeLanguage}
              onResetCode={handleResetCode}
              readOnly={activeRoom?.role === 'viewer'}
              aiGeneratedCode={aiGeneratedCode}
              onApplyAiCode={() => handleApplyAiCode()}
              onDiscardAiCode={() => setAiGeneratedCode(null)}
              onToggleChat={() => setIsChatOpen(true)}
              onOpenCodingAssistant={() => setIsCodingAssistantOpen(true)}
              onQuickAskAi={() => {
                const quickPrompt = 'Explain this function and write the optimal solution';
                setPrompt(quickPrompt);
                void handleExecutePrompt(quickPrompt);
              }}
            />
          </div>

          {/* Prompt Studio Rounded Card */}
          <div className="flex-[32] min-h-[140px] rounded-2xl border border-[#172033] bg-[#0b0f19] shadow-xl overflow-hidden shrink-0 flex flex-col justify-center">
            <PromptEngineeringBar
              prompt={prompt}
              onChangePrompt={setPrompt}
              onExecutePrompt={handleExecutePrompt}
              isExecuting={isExecutingPrompt}
              onOptimizePrompt={() => setIsOptimizerOpen(true)}
              onDebugPrompt={() => setIsPromptDebuggerOpen(true)}
              category={activeProblem.category}
            />
          </div>
        </div>

        {/* Right Card: Real-Time Steps & AI Companion & Tests */}
        <div className="w-full lg:w-[380px] xl:w-[420px] h-full shrink-0 rounded-2xl border border-[#172033] bg-[#0b0f19] shadow-xl overflow-hidden flex flex-col">
          {rightPanelTab === 'tests' ? (
            <div className="h-full flex flex-col">
              {/* Tab Switcher */}
              <div className="px-4 py-2.5 border-b border-[#172033] bg-[#0c101d] flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    sounds.playPop(480);
                    setRightPanelTab('steps');
                  }}
                  className="px-3 py-1.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {activeProblem.category === 'debug'
                    ? 'Debugging Trace'
                    : activeProblem.category === 'develop'
                    ? 'Architecture Steps'
                    : 'Real-Time Steps'}
                </button>
                <button
                  onClick={() => {
                    sounds.playPop(500);
                    setRightPanelTab('tests');
                  }}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-[#3b1f63] text-purple-200 border border-purple-500/50 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Test Cases</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#112a20] text-emerald-400 border border-emerald-500/40">
                    {testCases.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setRightPanelTab('assistant');
                  }}
                  className="px-3 py-1.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  AI Assistant
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <TestResultsPanel
                  testCases={testCases}
                  testResults={testResults}
                  isRunning={isRunningTests}
                  statusMessage={testRunMessage}
                  onRunTests={handleRunTests}
                  onAddCustomTestCase={handleAddCustomTestCase}
                />
              </div>
            </div>
          ) : (
            <RealtimeStepsPanel
              executionResult={executionResult}
              executionError={promptExecutionError}
              isExecuting={isExecutingPrompt}
              onApplyCode={(c) => handleApplyAiCode(c)}
              onSelectQuickPrompt={(q) => {
                setPrompt(q);
                void handleExecutePrompt(q);
              }}
              activeRightTab={rightPanelTab}
              onChangeRightTab={setRightPanelTab}
              testCasesCount={testCases.length}
              category={activeProblem.category}
            />
          )}
        </div>
      </main>

      {/* Interactive Code Review Modal */}
      <InteractiveCodeReview
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        reviewResult={reviewResult}
        errorMessage={reviewError}
        isLoading={isReviewLoading}
        onRunReview={handleRunReview}
        onApplyLineFix={handleApplyLineFix}
      />

      {/* Live Chat Drawer */}
      <LiveChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        roomTitle={activeRoom?.title}
        connectionStatus={roomStatus}
      />

      <CollaborationRoomsModal isOpen={isRoomsOpen} onClose={() => setIsRoomsOpen(false)} onChoose={(room) => { setActiveRoom(room); if (room) setChatMessages([]); }} activeRoomId={activeRoom?.id} />

      {/* Prompt Engineering Academy Modal */}
      <PromptAcademyModal
        isOpen={isAcademyOpen}
        onClose={() => setIsAcademyOpen(false)}
        onSelectPracticeProblem={handleSelectPracticeProblem}
        isSignedIn={Boolean(currentUser)}
        onSignIn={() => setIsAuthOpen(true)}
        focusLessonId={academyFocusLessonId}
      />

      {/* Prompt Optimizer Modal */}
      <PromptOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        initialPrompt={prompt}
        problemId={activeProblem.id}
        category={activeProblem.category}
        problemTitle={activeProblem.title}
        onApplyOptimizedPrompt={(optPrompt) => {
          try {
            if (prompt.trim()) savePromptVersion(activeProblem.id, prompt);
            savePromptVersion(activeProblem.id, optPrompt);
          } catch (error) {
            console.error('Could not save prompt versions:', error);
          }
          setPrompt(optPrompt);
        }}
      />

      <PromptDebuggerModal
        isOpen={isPromptDebuggerOpen}
        onClose={() => setIsPromptDebuggerOpen(false)}
        prompt={prompt}
        category={activeProblem.category}
        problemTitle={activeProblem.title}
      />

      <CodingAssistantModal
        isOpen={isCodingAssistantOpen}
        onClose={() => setIsCodingAssistantOpen(false)}
        code={code}
        language={language}
        problemTitle={activeProblem.title}
        problemDescription={activeProblem.description}
        onApplyFix={(fix) => { setCode(fix); setIsCodingAssistantOpen(false); }}
      />

      {/* Problem Importer & Problem Bank Modal */}
      <ProblemImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onProblemSelected={handleSelectProblem}
        customProblems={customProblems}
        onProblemsUpdated={handleProblemsUpdated}
        activeProblem={activeProblem}
      />

      {/* 55-Module Master Checklist Modal */}
      <MasterChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        onLaunchFeature={handleLaunchFeature}
      />

      {/* Prompt Comparison & Versioning Modal */}
      <PromptCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        activeProblem={activeProblem}
        currentPrompt={prompt}
        code={code}
        language={language}
        onApplyPrompt={(p) => setPrompt(p)}
      />

      {/* Prompt Skill Analytics Modal */}
      <PromptAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        isSignedIn={Boolean(currentUser)}
        onSignIn={() => setIsAuthOpen(true)}
      />

      {/* SQL & API Assistant Modal */}
      <SqlAndApiAssistantModal
        isOpen={isSqlApiOpen}
        onClose={() => setIsSqlApiOpen(false)}
      />

      {/* Multi-Model Router & Multi-Agent Modal */}
      <MultiModelRoutingModal
        isOpen={isMultiModelOpen}
        onClose={() => setIsMultiModelOpen(false)}
        activeModel={activeModel}
        onSelectModel={(m) => { localStorage.setItem('promptcode.aiModel', m); setActiveModel(m); }}
      />

      {/* Leaderboard, Achievements & Community Modal */}
      <LeaderboardAndCommunityModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onApplyPrompt={(p) => setPrompt(p)}
        isSignedIn={Boolean(currentUser)}
        userId={currentUser?.id}
        onSignIn={() => setIsAuthOpen(true)}
        onOpenAcademy={(lessonId) => { setAcademyFocusLessonId(lessonId || null); setIsAcademyOpen(true); }}
      />

      {/* Quantum-Inspired & Qiskit Research Modal */}
      <QuantumAndResearchModal
        isOpen={isQuantumOpen}
        onClose={() => setIsQuantumOpen(false)}
      />

      {/* Developer Integrations & Health Suite Modal */}
      <DevIntegrationsModal
        isOpen={isDevIntegrationsOpen}
        onClose={() => setIsDevIntegrationsOpen(false)}
      />

      {/* IDE Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* User Account & Login Session Manager Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChanged={setCurrentUser}
      />

      <WorkflowHistoryModal
        isOpen={isWorkflowHistoryOpen}
        onClose={() => setIsWorkflowHistoryOpen(false)}
        workflows={workflows}
        hasCurrentWorkflow={Boolean(prompt.trim() || code.trim())}
        onSaveCurrent={saveCurrentWorkflow}
        onResume={handleResumeWorkflow}
        onDelete={(id) => { void removeWorkflow(id); }}
      />
    </div>
  );
}
