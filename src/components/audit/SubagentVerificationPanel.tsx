import React from 'react';
import { MultiAgentConsensusReport } from '../../lib/subagent-verification';
import { ShieldCheck, CheckCircle2, XCircle, Activity, Lock, Cpu, Layers, Terminal } from 'lucide-react';

interface Props {
  report: MultiAgentConsensusReport | null;
  isVerifying?: boolean;
}

export function SubagentVerificationPanel({ report, isVerifying }: Props) {
  if (isVerifying) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Executing Multi-Agent Cross-Verification Suite...
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono">
          [ScopingArchitect] ➔ [InvariantValidator] ➔ [ActuarialUnderwriter] ➔ [OracleVerifier] ➔ [SettlementEscrow]
        </p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-400 tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Multi-Agent Consensus Verification Matrix</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous subagent attestations required prior to contract lock & escrow initialization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Signature: {report.consensusSignature}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            report.consensusPassed 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {report.overallStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {report.attestations.map((a) => (
          <div 
            key={a.agentName}
            className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
              a.status === 'VERIFIED'
                ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                : 'bg-red-950/20 border-red-900 text-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-white tracking-tight">{a.agentName}</span>
              {a.status === 'VERIFIED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-normal line-clamp-3">
              {a.details}
            </p>

            <div className="pt-2 border-t border-slate-900 text-[9px] text-slate-600 flex justify-between">
              <span>Digest:</span>
              <span className="text-slate-400 font-mono">{a.digest}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
