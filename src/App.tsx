import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ChevronRight, 
  Target, 
  BarChart3, 
  Lock, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Database,
  Globe,
  Settings,
  User as UserIcon,
  ArrowUpRight
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleAuthProvider 
} from './lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

// --- UI Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
      ghost: 'hover:bg-slate-800/50 text-slate-400 hover:text-white',
      outline: 'border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-base'
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-xl', className)}>
    {children}
  </div>
);

const Badge = ({ children, status }: { children: React.ReactNode, status: string }) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-slate-800 text-slate-400',
    SCOPING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PRICED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    FUNDED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    VERIFYING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    RELEASED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border', styles[status] || styles.DRAFT)}>
      {children}
    </span>
  );
};

// --- App Screens ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<any[]>([]);
  const [view, setView] = useState<'dashboard' | 'create' | 'engagement'>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setUser({
        uid: 'test-user-123',
        email: 'test@apexbureau.com',
        displayName: 'Test Client',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
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
      setEngagements(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <Header user={user} setView={setView} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Dashboard engagements={engagements} setView={setView} setSelectedId={setSelectedId} />
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <ScopingEngine user={user} setView={setView} setSelectedId={setSelectedId} />
            </motion.div>
          )}

          {view === 'engagement' && selectedId && (
            <motion.div
              key="engagement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <EngagementView id={selectedId} setView={setView} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function LandingPage() {
  const login = () => signInWithPopup(auth, googleAuthProvider);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]" />
      
      <nav className="p-8 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-bold tracking-tighter text-2xl">
          <Shield className="text-cyan-500 w-8 h-8" />
          APEX BUREAU
        </div>
        <Button variant="ghost" onClick={login}>Client Access</Button>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-24 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold tracking-[0.2em] text-cyan-500 mb-8 uppercase">
              International Contractor of Outcomes
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              ABSOLUTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DETERMINISTIC</span> EXECUTION.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-12">
              Apex Bureau replaces vague service level agreements with a deterministic operational architecture. 
              Clients do not purchase labor or effort; they purchase absolute, guaranteed results.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={login} className="px-10">Initiate Protocol</Button>
              <Button size="lg" variant="ghost" className="border border-slate-800">Review Methodology</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Header({ user, setView }: { user: User, setView: any }) {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 font-bold tracking-tighter text-xl text-white"
          >
            <Shield className="text-cyan-500 w-6 h-6" />
            APEX BUREAU
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button onClick={() => setView('dashboard')} className="hover:text-white transition">Dashboard</button>
            <button className="hover:text-white transition">Escrow</button>
            <button className="hover:text-white transition">Audits</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 pr-3 rounded-full border border-slate-800">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
            <span className="text-xs font-semibold">{user.displayName?.split(' ')[0]}</span>
          </div>
          <button onClick={() => signOut(auth)} className="p-2 text-slate-500 hover:text-red-400 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ engagements, setView, setSelectedId }: { engagements: any[], setView: any, setSelectedId: any }) {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white">COMMAND CENTER</h2>
          <p className="text-slate-500 mt-2">Overseeing active outcome-based engagements.</p>
        </div>
        <Button onClick={() => setView('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Engagement
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Active Engagements" value={engagements.filter(e => e.status !== 'COMPLETED').length} icon={Target} color="text-cyan-500" />
        <StatCard title="Capital in Escrow" value="$1.2M" icon={Lock} color="text-purple-500" />
        <StatCard title="Verifiable Proofs" value="48" icon={CheckCircle2} color="text-emerald-500" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          RECENT ENGAGEMENTS
        </h3>
        {engagements.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="text-xl font-bold text-white">No Active Mandates</h4>
              <p className="text-slate-500 text-sm">Initiate a new outcome contract to deploy the Bureau's resources.</p>
              <Button onClick={() => setView('create')} variant="outline">Initialize Protocol</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {engagements.map(e => (
              <button 
                key={e.id}
                onClick={() => { setSelectedId(e.id); setView('engagement'); }}
                className="text-left"
              >
                <Card className="p-4 hover:border-cyan-500/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/10 transition">
                        <Database className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-cyan-400 transition">{e.title}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{e.id.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Fee Matrix</div>
                        <div className="font-mono text-sm text-slate-300">${Number(e.totalFee || 0).toLocaleString()}</div>
                      </div>
                      <Badge status={e.status}>{e.status}</Badge>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition" />
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="p-6 relative group">
      <div className={cn('absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity', color)}>
        <Icon className="w-12 h-12" />
      </div>
      <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{title}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </Card>
  );
}

function ScopingEngine({ user, setView, setSelectedId }: any) {
  const [objective, setObjective] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [aous, setAous] = useState<any[]>([]);
  const [costData, setCostData] = useState<any>(null);

  const compile = async () => {
    setIsCompiling(true);
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch('/api/scope', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ objective })
      });
      const data = await res.json();
      setAous(data);

      const costRes = await fetch('/api/cost', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ aous: data, zone: 'EU-WEST' })
      });
      setCostData(await costRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompiling(false);
    }
  };

  const createEngagement = async () => {
    const docRef = await addDoc(collection(db, 'engagements'), {
      clientId: user.uid,
      title: objective.slice(0, 40) + '...',
      objective,
      status: 'PRICED',
      totalFee: costData.p90,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    for (const aou of aous) {
      await addDoc(collection(db, `engagements/${docRef.id}/aous`), {
        ...aou,
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
    }

    setSelectedId(docRef.id);
    setView('engagement');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white">INITIATE SCOPING</h2>
        <p className="text-slate-500 mt-2">Define the target outcome to generate a deterministic work breakdown structure.</p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Outcome Directive</label>
          <textarea 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-cyan-500 outline-none transition h-32 text-lg"
            placeholder="e.g., Deploy an air-gapped secure cold storage infrastructure in Switzerland with ISO 27001 compliance and sub-second failover."
            value={objective}
            onChange={e => setObjective(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={compile} 
            disabled={isCompiling || !objective}
            className="gap-2"
          >
            {isCompiling ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Compiling Graph...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                Initialize Scoping Engine
              </>
            )}
          </Button>
        </div>
      </Card>

      {aous.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Atomic Units" value={aous.length} icon={Database} color="text-blue-500" />
            <StatCard title="Projected Duration" value={aous.reduce((s, a) => s + a.estimatedHours, 0) + ' hrs'} icon={Clock} color="text-amber-500" />
            <StatCard title="Monte Carlo P90 Fee" value={`$${Math.round(costData?.p90 || 0).toLocaleString()}`} icon={BarChart3} color="text-cyan-500" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">DETERMINISTIC WBS</h3>
            <div className="grid gap-3">
              {aous.map((aou, i) => (
                <Card key={i} className="p-5 border-l-4 border-l-cyan-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{aou.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{aou.description}</p>
                      <div className="flex gap-2 mt-4">
                        {Object.keys(aou.exitCriteria).map((c, ci) => (
                          <div key={ci} className="text-[10px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Resource Allocation</div>
                      <div className="text-sm font-mono text-cyan-400">{aou.estimatedHours}h</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h4 className="font-bold text-white">Ready for Engagement</h4>
                <p className="text-sm text-slate-500">Seal this outcome directive and initialize the escrow vault.</p>
              </div>
            </div>
            <Button size="lg" onClick={createEngagement}>Lock Engagement Contract</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EngagementView({ id, setView }: { id: string, setView: any }) {
  const [engagement, setEngagement] = useState<any>(null);
  const [aous, setAous] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'engagements', id), (d) => {
      setEngagement({ id: d.id, ...d.data() });
    });
    const unsubAous = onSnapshot(collection(db, `engagements/${id}/aous`), (s) => {
      setAous(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub(); unsubAous(); };
  }, [id]);

  if (!engagement) return null;

  const fundEscrow = async () => {
    await updateDoc(doc(db, 'engagements', id), { status: 'FUNDED', updatedAt: serverTimestamp() });
  };

  const startWork = async () => {
    await updateDoc(doc(db, 'engagements', id), { status: 'IN_PROGRESS', updatedAt: serverTimestamp() });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <button onClick={() => setView('dashboard')} className="text-xs text-cyan-500 hover:text-cyan-400 mb-4 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 rotate-180" />
            Back to Command Center
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-white">{engagement.title}</h2>
            <Badge status={engagement.status}>{engagement.status}</Badge>
          </div>
          <p className="text-slate-500 max-w-2xl">{engagement.objective}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Contracted Value</div>
          <div className="text-4xl font-black text-cyan-400 font-mono">${Number(engagement.totalFee || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <MiniStat label="Start Date" value={engagement.createdAt ? format(engagement.createdAt.toDate(), 'MMM dd, yyyy') : '...'} />
        <MiniStat label="Geographic Zone" value="EU-WEST (Frankfurt)" />
        <MiniStat label="Escrow Vault" value={engagement.status === 'FUNDED' || engagement.status === 'IN_PROGRESS' ? 'LOCKED' : 'OPEN'} />
        <MiniStat label="Compliance" value="ISO 27001 / SOC2" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-500" />
            EXECUTION PIPELINE
          </h3>
          <div className="space-y-3">
            {aous.map((aou, i) => (
              <Card key={aou.id} className="p-6 relative group">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-black text-slate-800">{(i + 1).toString().padStart(2, '0')}</div>
                    <div>
                      <h4 className="font-bold text-white">{aou.title}</h4>
                      <p className="text-sm text-slate-500">{aou.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Weight</div>
                      <div className="text-sm font-mono text-slate-300">{aou.estimatedHours}h</div>
                    </div>
                    <Badge status={aou.status}>{aou.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            FINANCIAL ARCHITECTURE
          </h3>
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Escrow Status</span>
                <span className={cn('font-bold', engagement.status === 'FUNDED' ? 'text-emerald-500' : 'text-amber-500')}>
                  {engagement.status === 'FUNDED' || engagement.status === 'IN_PROGRESS' ? 'LOCKED' : 'AWAITING FUNDING'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Released Capital</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-0" />
              </div>
            </div>

            {engagement.status === 'PRICED' && (
              <Button onClick={fundEscrow} className="w-full py-4 text-lg">Deploy Capital to Escrow</Button>
            )}
            {engagement.status === 'FUNDED' && (
              <Button onClick={startWork} className="w-full py-4 text-lg">Initiate Deployment</Button>
            )}
            
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
              Secured by Tripartite Institutional Escrow
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/30 border-dashed">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Bureau Directive</h4>
            <p className="text-sm text-slate-500 italic leading-relaxed">
              "The operational architecture for this engagement is locked. Performance obligations are tied to cryptographic Proof-of-Outcome (PoO) triggers."
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string, value: string }) {
  return (
    <Card className="p-4 bg-slate-900/30">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </Card>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-900 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 font-bold tracking-tighter text-slate-500">
          <Shield className="w-5 h-5" />
          APEX BUREAU
        </div>
        <div className="flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
          <a href="#" className="hover:text-cyan-500 transition">Methodology</a>
          <a href="#" className="hover:text-cyan-500 transition">Legal</a>
          <a href="#" className="hover:text-cyan-500 transition">Network Status</a>
        </div>
        <div className="text-[10px] text-slate-700 font-mono">
          © 2026 APEX BUREAU INTERNATIONAL · EST. 2024
        </div>
      </div>
    </footer>
  );
}
