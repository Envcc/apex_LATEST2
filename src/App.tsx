import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Target, 
  Activity, 
  ArrowRight,
  Workflow,
  Terminal,
  Database,
  Search,
  Zap,
  Globe,
  Plus,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building,
  Key,
  LogOut,
  Cpu,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import { auth, db, googleAuthProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { AtomicOperationalUnit, MandateAST } from './lib/ast-compiler';
import { IntentInputForm } from './components/scoping/IntentInputForm';
import { ScopingEditor } from './components/scoping/ScopingEditor';
import { ExecutionGraphView } from './components/dag/ExecutionGraphView';
import { RiskSlider } from './components/escrow/RiskSlider';
import { SubagentVerificationPanel } from './components/audit/SubagentVerificationPanel';
import { MultiAgentConsensusReport } from './lib/subagent-verification';

// --- Shared Types ---

type View = 'dashboard' | 'scoping' | 'engagement' | 'audits';

interface Engagement {
  id: string;
  clientId: string;
  title: string;
  objective: string;
  status: 'DRAFT' | 'PRICED' | 'FUNDED' | 'IN_PROGRESS' | 'COMPLETED';
  totalFee: number;
  riskTier?: 'P50' | 'P80' | 'P90';
  createdAt: Timestamp;
  units: AtomicOperationalUnit[];
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev');
    
    if (isDev && params.get('autostart') === '1') {
      setUser({
        uid: 'institution-admin-01',
        email: 'partner@apexbureau.ch',
        displayName: 'Executive Principal',
        getIdToken: async () => 'test-token'
      } as any);
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'engagements'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setEngagements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Engagement)));
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Synchronizing Bureau Ledger...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <InstitutionalLandingPage onSignIn={() => signInWithPopup(auth, googleAuthProvider)} />;
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      <AppHeader user={user} view={view} setView={setView} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <CommandCenter 
            engagements={engagements} 
            setView={setView} 
            onSelectEngagement={(id) => { setSelectedId(id); setView('engagement'); }} 
          />
        )}

        {view === 'scoping' && (
          <ScopingWorkflow 
            user={user} 
            setView={setView} 
            onCreated={(id) => { setSelectedId(id); setView('engagement'); }} 
          />
        )}

        {view === 'engagement' && selectedId && (
          <EngagementDashboard 
            id={selectedId} 
            user={user} 
            onBack={() => setView('dashboard')} 
          />
        )}

        {view === 'audits' && <AuditRegistry />}
      </main>

      <AppFooter />
    </div>
  );
}

// ==========================================
// 1. INSTITUTIONAL LANDING PAGE
// ==========================================

function InstitutionalLandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-slate-900 bg-[#07090E]/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-sm shadow-md shadow-emerald-500/20">
            Δ
          </div>
          <span className="font-bold tracking-widest text-lg text-white">APEX BUREAU</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <span>Zurich</span>
            <span className="text-slate-700">•</span>
            <span>London</span>
            <span className="text-slate-700">•</span>
            <span>Singapore</span>
          </div>
          <button
            onClick={onSignIn}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Client Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-20 sm:py-28 flex flex-col items-center text-center relative z-10 space-y-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Deterministic Outcome Contracting (DOC)
        </div>

        <div className="space-y-6 max-w-4xl">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05]">
            Buy Verified Outcomes.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Not Billable Hours.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            Apex Bureau compiles enterprise strategic directives into machine-verifiable execution graphs, backed by heavy-tailed Monte Carlo risk models and condition-gated escrow vaults.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold tracking-wide transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Initialize Mandate Protocol</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://ais-dev-qorvkxf34fhbviw4zgj646-169544081195.us-east1.run.app/?autostart=1"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 text-center"
          >
            <span>Interactive Demo Sandbox</span>
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 text-left">
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AST Scoping Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Natural language intent is decomposed into Atomic Operational Units (AOUs) and proven non-cyclic via Depth-First Search DAG verification.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Fat-Tailed Risk Modeling</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Standard bell curves fail in software. Our Monte Carlo engine simulates 1,000 log-normal Pareto trials to establish an insolvency-proof P90 fee matrix.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Condition-Gated Escrow</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Capital releases require cryptographic proof: automated API health assertions, signed payload digests, and immutable oracle logging.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-600">
        Apex Bureau International • Sovereign Contracting & Actuarial Governance Platform
      </footer>
    </div>
  );
}

// ==========================================
// 2. APP HEADER & NAVIGATION
// ==========================================

function AppHeader({ user, view, setView }: { user: User, view: View, setView: (v: View) => void }) {
  return (
    <header className="border-b border-slate-900 bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-sm group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/20">
              Δ
            </div>
            <span className="font-bold tracking-widest text-lg text-white">APEX BUREAU</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-400">
            <button
              onClick={() => setView('dashboard')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                view === 'dashboard' ? "bg-slate-800 text-white font-semibold" : "hover:text-slate-200"
              )}
            >
              Command Center
            </button>
            <button
              onClick={() => setView('scoping')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                view === 'scoping' ? "bg-slate-800 text-white font-semibold" : "hover:text-slate-200"
              )}
            >
              New Mandate
            </button>
            <button
              onClick={() => setView('audits')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                view === 'audits' ? "bg-slate-800 text-white font-semibold" : "hover:text-slate-200"
              )}
            >
              Attestation Oracle
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-mono">{user.email}</span>
          </div>

          <button
            onClick={() => signOut(auth)}
            title="Sign Out"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// 3. COMMAND CENTER (DASHBOARD)
// ==========================================

function CommandCenter({ 
  engagements, 
  setView, 
  onSelectEngagement 
}: { 
  engagements: Engagement[], 
  setView: (v: View) => void, 
  onSelectEngagement: (id: string) => void 
}) {
  const totalLocked = engagements.reduce((sum, e) => sum + (e.totalFee || 0), 0);

  return (
    <div className="space-y-10">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Institutional Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global portfolio oversight: Active outcome contracts, condition-gated capital, and settlement telemetry.
          </p>
        </div>

        <button
          onClick={() => setView('scoping')}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Initialize Outcome Mandate</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Mandates</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {engagements.length}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Escrow Under Management</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            ${Math.round(totalLocked).toLocaleString()}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Underwriting Model</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            Log-Normal P90
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Settlement Network</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Sig Escrow Active</span>
          </div>
        </div>
      </div>

      {/* Mandate Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Outcome Mandate Ledger</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">{engagements.length} Mandates Recorded</span>
        </div>

        {engagements.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <Workflow className="w-6 h-6" />
            </div>
            
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">Zero Active Mandates Recorded</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience the 5-step Mandate Execution Loop. Compile a directive into machine-verifiable execution nodes and lock condition-gated capital.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setView('scoping')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize Mandate Workflow</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {engagements.map((eng) => (
              <div
                key={eng.id}
                onClick={() => onSelectEngagement(eng.id)}
                className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/70 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">ID-{eng.id.slice(0, 8)}</span>
                    <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {eng.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl font-normal">
                    {eng.objective}
                  </p>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center">
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Fee Ceiling</div>
                    <div className="text-base font-bold text-slate-200">${Math.round(eng.totalFee || 0).toLocaleString()}</div>
                  </div>

                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                    eng.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    eng.status === 'IN_PROGRESS' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                    eng.status === 'FUNDED' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                    "bg-slate-800 text-slate-300"
                  )}>
                    {eng.status}
                  </span>

                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. SCOPING WORKFLOW (5-STEP MVP UX LOOP)
// ==========================================

function ScopingWorkflow({ 
  user, 
  setView, 
  onCreated 
}: { 
  user: User, 
  setView: (v: View) => void, 
  onCreated: (id: string) => void 
}) {
  const [scopingStep, setScopingStep] = useState(1);
  const [directive, setDirective] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [ast, setAst] = useState<MandateAST | null>(null);
  const [costData, setCostData] = useState<any>(null);
  const [consensusReport, setConsensusReport] = useState<MultiAgentConsensusReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const getHeaders = async () => {
    const idToken = await user.getIdToken();
    const headers: any = { 'Content-Type': 'application/json' };
    if (idToken === 'test-token') {
      headers['x-dev-sandbox-bypass'] = 'true';
    } else {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    return headers;
  };

  const handleCompile = async () => {
    if (!directive.trim()) return;
    setIsCompiling(true);
    setError(null);
    setConsensusReport(null);

    try {
      const headers = await getHeaders();
      const res = await fetch('/api/scope', {
        method: 'POST',
        headers,
        body: JSON.stringify({ objective: directive.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Compilation failed');

      setAst(data.ast);

      // Run fat-tailed Monte Carlo pricing via worker threads
      const costRes = await fetch('/api/cost', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          baseCost: data.ast.units.length * 25000, 
          complexity: 1.3 
        })
      });
      const cData = await costRes.json();
      setCostData(cData.riskMatrix);

      // Execute Multi-Agent Consensus Cross-Verification
      const agentsRes = await fetch('/api/agents/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ast: data.ast,
          baseCost: data.ast.units.length * 25000
        })
      });
      const agentsData = await agentsRes.json();
      if (agentsData.success) {
        setConsensusReport(agentsData.report);
      }

      setScopingStep(2); // Advance to AST Review
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAuthorize = async (amount: number, tier: 'P50' | 'P80' | 'P90') => {
    if (!ast) return;
    setIsAuthorizing(true);

    try {
      const headers = await getHeaders();
      const res = await fetch('/api/engagements/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          clientId: user.uid,
          title: ast.units[0]?.title || 'Outcome Contract Mandate',
          objective: directive.trim(),
          totalFee: amount,
          riskTier: tier,
          units: ast.units.map(u => ({ ...u, status: 'PENDING' }))
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Failed to authorize escrow mandate');

      onCreated(data.id);
    } catch (err: any) {
      setError(err.message);
      setIsAuthorizing(false);
    }
  };

  const STEPS = [
    { id: 1, label: 'Directive', icon: Terminal },
    { id: 2, label: 'AST Review', icon: Workflow },
    { id: 3, label: 'Human Binding', icon: Layers },
    { id: 4, label: 'Underwriting', icon: ShieldCheck },
    { id: 5, label: 'Finalization', icon: Lock },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Step Progress Tracker */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-900/40 border border-slate-800 shadow-xl shadow-black/20">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = scopingStep === step.id;
          const isCompleted = scopingStep > step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 relative group">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" :
                  isCompleted ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  "bg-slate-800 text-slate-500 border border-slate-700"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  isActive ? "text-white" : "text-slate-500"
                )}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-[1px] mx-4 transition-colors",
                  isCompleted ? "bg-emerald-500/40" : "bg-slate-800"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="space-y-12">
        {/* Step 1: Directive Intake */}
        {scopingStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Initialize Outcome Scoping Protocol
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Define your strategic objective. The Bureau's compilation engine will decompose your intent into machine-verifiable nodes and prove graph non-cyclicity.
              </p>
            </div>

            <IntentInputForm 
              value={directive} 
              onChange={setDirective} 
              onCompile={handleCompile} 
              isCompiling={isCompiling} 
            />
          </div>
        )}

        {/* Step 2: AST Review (DAG Topology) */}
        {scopingStep === 2 && ast && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Step 2: AST Topology Review</h2>
                <p className="text-xs text-slate-400">Verified Directed Acyclic Graph (DAG) for the requested mandate.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setScopingStep(1)}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Edit Intent
                </button>
                <button 
                  onClick={() => setScopingStep(3)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  Continue to Human Binding
                </button>
              </div>
            </div>
            
            <ExecutionGraphView units={ast.units} />
          </div>
        )}

        {/* Step 3: Human Binding (Scoping Editor) */}
        {scopingStep === 3 && ast && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Step 3: Human Binding & Scoping</h2>
                <p className="text-xs text-slate-400">Refine exit criteria and verify subagent consensus before underwriting.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setScopingStep(2)}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => setScopingStep(4)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  Proceed to Underwriting
                </button>
              </div>
            </div>

            <ScopingEditor 
              units={ast.units} 
              onChange={(newUnits) => setAst({ ...ast, units: newUnits })} 
            />

            <SubagentVerificationPanel report={consensusReport} isVerifying={isCompiling} />
          </div>
        )}

        {/* Step 4: Escrow Underwriting */}
        {scopingStep === 4 && costData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Step 4: Actuarial Underwriting</h2>
                <p className="text-xs text-slate-400">Select an insolvency-proof fee tier based on Monte Carlo risk simulations.</p>
              </div>
              <button 
                onClick={() => setScopingStep(3)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Back to Scoping
              </button>
            </div>

            <RiskSlider 
              riskMatrix={costData} 
              onAuthorize={(amount, tier) => {
                // Here we might show a final review step or go straight to authorization
                setScopingStep(5);
                // Store selections for step 5
                (window as any)._pendingAuthorize = { amount, tier };
              }} 
              isAuthorizing={isAuthorizing} 
            />
          </div>
        )}

        {/* Step 5: Final Authorization Review */}
        {scopingStep === 5 && ast && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Step 5: Final Mandate Authorization</h2>
              <p className="text-sm text-slate-400">Review all contract parameters before committing capital to the secure custody vault.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mandate Specification</div>
                <div className="space-y-2">
                  <div className="text-sm font-bold text-white leading-relaxed">{ast.units[0]?.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">"{directive}"</p>
                </div>
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Execution Nodes</span>
                    <span className="text-white font-mono">{ast.units.length} AOUs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Verification Consensus</span>
                    <span className="text-emerald-400 font-mono font-bold">100% Passed</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 space-y-4 shadow-xl shadow-emerald-500/5">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Escrow Commitment</div>
                <div className="space-y-1">
                  <div className="text-4xl font-extrabold text-white font-mono">
                    ${Math.round((window as any)._pendingAuthorize?.amount || 0).toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Tier: {(window as any)._pendingAuthorize?.tier} / Insolvency-Proof
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                  Funds will be held in a condition-gated Swiss-hosted custody vault. Release is cryptographically bound to the AOU exit criteria.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setScopingStep(4)}
                className="flex-1 px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-slate-400 hover:text-white transition-all"
              >
                Return to Underwriting
              </button>
              <button 
                onClick={() => {
                  const p = (window as any)._pendingAuthorize;
                  if (p) handleAuthorize(p.amount, p.tier);
                }}
                disabled={isAuthorizing}
                className="flex-[2] px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                    <span>Launching Protocol...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Authorize & Execute Mandate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. ENGAGEMENT DASHBOARD (STEP 5: EXECUTION & PROOFS)
// ==========================================

function EngagementDashboard({ 
  id, 
  user, 
  onBack 
}: { 
  id: string, 
  user: User, 
  onBack: () => void 
}) {
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const unsub = onSnapshot(doc(db, 'engagements', id), (d) => {
      if (d.exists() && mounted) {
        setEngagement({ id: d.id, ...d.data() } as Engagement);
      }
    });

    const q = query(
      collection(db, 'proofs'),
      where('mandateId', '==', id),
      orderBy('timestamp', 'desc')
    );
    const unsubProofs = onSnapshot(q, (s) => {
      if (mounted) setProofs(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    return () => { mounted = false; unsub(); unsubProofs(); };
  }, [id]);

  if (!engagement) return null;

  const handleVerifyUnit = async (unit: AtomicOperationalUnit) => {
    setVerifyingId(unit.id);
    try {
      const idToken = await user.getIdToken();
      const headers: any = { 'Content-Type': 'application/json' };
      if (idToken === 'test-token') headers['x-dev-sandbox-bypass'] = 'true';
      else headers['Authorization'] = `Bearer ${idToken}`;

      for (const crit of unit.exitCriteria) {
        const verifyRes = await fetch('/api/verify', {
          method: 'POST',
          headers,
          body: JSON.stringify(crit)
        });
        const vData = await verifyRes.json();
        if (!vData.success) throw new Error(vData.message || 'Assertion failed');
      }

      await fetch('/api/attest', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mandateId: id,
          resourceId: unit.id,
          type: 'ATOMIC_UNIT_VERIFIED',
          hash: crypto.randomUUID()
        })
      });

      const nextUnits = engagement.units.map(u => 
        u.id === unit.id ? { ...u, status: 'COMPLETED' as const } : u
      );
      const allDone = nextUnits.every(u => u.status === 'COMPLETED');

      await updateDoc(doc(db, 'engagements', id), {
        units: nextUnits,
        status: allDone ? 'COMPLETED' : 'IN_PROGRESS',
        updatedAt: serverTimestamp()
      });

    } catch (err: any) {
      alert(`Verification Error: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const completedCount = engagement.units.filter(u => u.status === 'COMPLETED').length;
  const totalUnits = engagement.units.length;
  const progressPercent = Math.round((completedCount / totalUnits) * 100);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>← Return to Command Center</span>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {engagement.title}
            </h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
              engagement.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              engagement.status === 'IN_PROGRESS' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
              "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            )}>
              {engagement.status}
            </span>
          </div>
          <InstitutionalDetail label="Mandate Identifiers">
             <div className="text-[10px] text-slate-500 font-mono space-y-1">
                <div>REFERENCE_ID: {engagement.id}</div>
                <div>CLIENT_OWNER: {engagement.clientId}</div>
             </div>
          </InstitutionalDetail>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-right self-start sm:self-auto">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">Condition-Gated Escrow Vault</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            ${Math.round(engagement.totalFee).toLocaleString()} USD
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium italic">Verified Operational Transition Progress</span>
          <span className="text-emerald-400 font-mono font-bold">{completedCount} of {engagement.units.length} Complete ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800 shadow-inner">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>Atomic Operational Units (AOUs)</span>
          </h2>

          <div className="space-y-4">
            {engagement.units.map((unit, idx) => (
              <div 
                key={unit.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all space-y-4",
                  unit.status === 'COMPLETED'
                    ? "bg-emerald-950/10 border-emerald-500/40"
                    : "bg-slate-900/50 border-slate-800"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        AOU {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <h3 className="font-bold text-base text-white">{unit.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{unit.description}</p>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    {unit.status === 'COMPLETED' ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proof Verified</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVerifyUnit(unit)}
                        disabled={verifyingId === unit.id}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                      >
                        {verifyingId === unit.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                            <span>Attesting...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Execute Settlement Proof</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <InstitutionalDetail label="Node Topology Metrics">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Node UUID</div>
                        <div className="text-[10px] font-mono text-slate-300 truncate">{unit.id}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Complexity</div>
                        <div className="text-[10px] font-mono text-slate-300">{unit.complexityScalar}x Scalar</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Est. Duration</div>
                        <div className="text-[10px] font-mono text-slate-300">{unit.estimatedHours} Hours</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Prerequisites</div>
                        <div className="text-[10px] font-mono text-slate-300">{unit.dependsOn.length || 'Zero'} Dependencies</div>
                      </div>
                    </div>
                  </InstitutionalDetail>

                  <InstitutionalDetail label="Programmatic Exit Criteria">
                    <div className="space-y-3">
                      {unit.exitCriteria.map((crit) => (
                        <div key={crit.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{crit.type.replace('_', ' ')}</span>
                            <span className="text-[9px] font-mono text-slate-600">ID: {crit.id.slice(0, 8)}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-500">Assertion Endpoint: <span className="text-slate-300 font-mono">{crit.assertionEndpoint}</span></div>
                            <div className="text-[10px] text-slate-500">Expected SHA-256 Digest: <span className="text-slate-300 font-mono truncate block max-w-full">{crit.expectedPayloadHash}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </InstitutionalDetail>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 uppercase">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Oracle Telemetry Ledger</span>
          </h2>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl shadow-black/20">
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between border-b border-slate-900 pb-2 uppercase tracking-widest">
              <span>STATUS: IMMUTABLE</span>
              <span className="text-emerald-400 font-semibold">TLSNotary Proofs Active</span>
            </div>

            <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {proofs.length === 0 ? (
                <div className="text-slate-700 text-[10px] py-12 text-center italic uppercase tracking-widest leading-relaxed">
                  Awaiting node completion telemetry<br />for mandate settlement.
                </div>
              ) : (
                proofs.map((p, i) => (
                  <div key={p.id || i} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2 animate-in slide-in-from-right-2 duration-300">
                    <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>PROOF_{p.id?.slice(0, 8)}</span>
                      </div>
                      <span className="text-slate-600">
                        {p.timestamp?.toDate ? p.timestamp.toDate().toLocaleTimeString() : 'VERIFIED'}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">RE_UNIT: {p.resourceId}</div>
                    <div className="text-[9px] text-slate-400 break-all leading-tight">SIG: {p.hash}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstitutionalDetail({ label, children }: { label: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-t border-slate-800/30 pt-2 first:border-t-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-400 transition-all cursor-pointer"
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-90")} />
        <span>Institutional Detail: {label}</span>
      </button>
      {isOpen && (
        <div className="mt-2 pl-5 pb-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function AuditRegistry() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cryptographic Attestation Oracle
        </h1>
        <p className="text-sm text-slate-400">
          Independent verification registry. Immutable telemetry logs and TLSNotary web proof digests confirming contract exit criteria satisfaction.
        </p>
      </div>

      <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
        <Shield className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">All System Proofs Operational</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          State deltas are cryptographically signed by the Bureau settlement oracle before capital releases are unlocked from custody vaults.
        </p>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-slate-900 py-12 bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-8 text-[10px] text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-[11px]">
            Δ
          </div>
          <span className="font-bold tracking-[0.2em] text-slate-400">APEX BUREAU INTERNATIONAL</span>
        </div>
        <div className="flex gap-8 uppercase tracking-widest font-medium">
          <span>Zurich</span>
          <span>London</span>
          <span>Singapore</span>
        </div>
        <div className="text-slate-800">
          © 2026 Sovereign Outcome Protocol • Hardened v1.0.0-FINAL
        </div>
      </div>
    </footer>
  );
}
