import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Ambiguity {
  word: string;
  reason: string;
  suggestion: string;
}

const AMBIGUOUS_TERMS: Record<string, string> = {
  secure: 'Specify compliance framework (ISO 27001, SOC2, or Swiss Banking Standard).',
  global: 'Define target regions or availability zones (e.g. Zurich, London, Singapore).',
  fast: 'Quantify latency requirements (e.g., <50ms failover replication).',
  scalable: 'Define peak load throughput bounds (e.g. 50,000 req/sec).',
  efficient: 'Specify memory/CPU utilization ceiling limits.',
  easy: 'Define user integration API specification.',
  seamless: 'Specify SLA availability (e.g. 99.999% uptime guarantee).',
};

const SAMPLE_DIRECTIVES = [
  {
    label: "Swiss Air-Gapped Custody Vault",
    text: "Deploy an air-gapped secure cold storage infrastructure in Zurich with ISO 27001 compliance, sub-50ms disaster recovery failover, and dual-key multi-sig attestation."
  },
  {
    label: "Cloud Database Migration",
    text: "Migrate multi-region PostgreSQL legacy cluster to AWS Aurora with zero downtime, automated failover verification, and 100% SHA-256 payload integrity validation."
  },
  {
    label: "Institutional Payment API",
    text: "Build an ISO 20022 compliant institutional cross-border payment gateway with sub-100ms processing, automated sanity verification, and REST HTTP 200 status endpoints."
  }
];

export function IntentInputForm({ 
  value, 
  onChange, 
  onCompile, 
  isCompiling 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onCompile: () => void;
  isCompiling?: boolean;
}) {
  const [ambiguities, setAmbiguities] = useState<Ambiguity[]>([]);
  const [score, setScore] = useState(100);

  useEffect(() => {
    if (!value.trim()) {
      setAmbiguities([]);
      setScore(100);
      return;
    }

    const found: Ambiguity[] = [];
    const words = value.toLowerCase().split(/\W+/);
    
    Object.entries(AMBIGUOUS_TERMS).forEach(([term, suggestion]) => {
      if (words.includes(term)) {
        found.push({ word: term, reason: 'Subjective adjective detected.', suggestion });
      }
    });

    setAmbiguities(found);
    setScore(Math.max(20, 100 - found.length * 15));
  }, [value]);

  return (
    <div className="space-y-6">
      {/* Sample Directives */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Preset Executive Directives</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DIRECTIVES.map((sd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(sd.text)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{sd.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Target Outcome Directive
          </label>

          {value.trim() && (
            <div className={cn(
              "px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all",
              score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
              score >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
              "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifiability Score: {score}%</span>
            </div>
          )}
        </div>

        <div className="relative">
          <textarea
            className={cn(
              "w-full bg-slate-950 border rounded-xl p-4 text-slate-200 focus:outline-none transition-all h-40 text-sm leading-relaxed font-sans placeholder:text-slate-600",
              ambiguities.length > 0 ? "border-amber-500/40 focus:border-amber-500" : "border-slate-800 focus:border-emerald-500"
            )}
            placeholder="Describe your desired outcome in plain language (e.g., 'Deploy a fault-tolerant multi-region payment vault with ISO 27001 audit logging, automated REST health assertions, and sub-50ms disaster failover')."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>

      {ambiguities.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
            Ambiguity Clarifications ({ambiguities.length} Subjective Terms Found)
          </span>
          <div className="grid gap-2">
            {ambiguities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-amber-400">Term: "{a.word}"</div>
                  <div className="text-slate-300">{a.suggestion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Parsing</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>DFS Non-Cyclic Engine</span>
          </div>
        </div>

        <button
          onClick={onCompile}
          disabled={!value.trim() || isCompiling}
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
        >
          {isCompiling ? (
            <>
              <div className="absolute inset-0 bg-slate-950/20 animate-pulse" />
              <div className="relative z-10 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                <span>Compiling AST & Graph Topology...</span>
              </div>
            </>
          ) : (
            <>
              <span>Compile Outcome Execution Spec</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {isCompiling && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Lexical Invariant Analysis</span>
            <span className="text-emerald-500">Processing...</span>
          </div>
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out_infinite]" />
          </div>
          <style>{`
            @keyframes progress {
              0% { width: 0%; left: 0%; }
              50% { width: 40%; left: 30%; }
              100% { width: 0%; left: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
