import React, { useState } from 'react';
import { Lock, Shield, Check, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RiskMatrix {
  p50: number;
  p80: number;
  p90: number;
  p99?: number;
}

interface Props {
  riskMatrix: RiskMatrix;
  onAuthorize: (amount: number, tier: 'P50' | 'P80' | 'P90') => void;
  isAuthorizing?: boolean;
}

export function RiskSlider({ riskMatrix, onAuthorize, isAuthorizing }: Props) {
  const [tier, setTier] = useState<'P50' | 'P80' | 'P90'>('P90');

  const getAmount = () => {
    switch (tier) {
      case 'P50': return riskMatrix.p50;
      case 'P80': return riskMatrix.p80;
      case 'P90': return riskMatrix.p90;
    }
  };

  const getTierExplanation = () => {
    switch (tier) {
      case 'P50':
        return "Standard execution baseline. Assumes zero architectural revisions or external API dependency delays. Contractor absorbs initial variance.";
      case 'P80':
        return "Enterprise buffer tier. Covers 80% of real-world integration delays, third-party API rate limits, and multi-stage testing cycles.";
      case 'P90':
        return "Guaranteed Sovereign Ceiling (Recommended). 90% statistical boundary protecting against systemic delivery risks and black swans. Contractor absorbs 100% of cost overruns beyond this cap.";
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Monte Carlo Actuarial Fee Selection (Insolvency-Proof Pricing)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Choose your risk protection tier. Capital is locked in condition-gated custody and released only upon cryptographically verified proof.
          </p>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded bg-slate-950 text-emerald-400 border border-emerald-500/20 font-semibold self-start sm:self-auto">
          Underwriting: N=1,000 Pareto Trials
        </span>
      </div>

      {/* Visual Risk Buffer Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <span>Actuarial Risk Exposure Spectrum</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700" /> P50</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> P80</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> P90</span>
          </div>
        </div>
        <div className="relative h-6 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center px-1">
          {/* Progress Bar representing the cost tiers */}
          <div 
            className="absolute left-0 h-full bg-slate-800/40 border-r border-slate-700 transition-all duration-500"
            style={{ width: '50%' }}
          />
          <div 
            className="absolute left-0 h-full bg-cyan-500/10 border-r border-cyan-500/30 transition-all duration-500"
            style={{ width: '80%' }}
          />
          <div 
            className="absolute left-0 h-full bg-emerald-500/10 border-r border-emerald-500/40 transition-all duration-500"
            style={{ width: '90%' }}
          />
          
          {/* Active Indicator */}
          <div 
            className={cn(
              "absolute h-full w-1 transition-all duration-500 ease-out",
              tier === 'P50' ? "left-[50%] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" :
              tier === 'P80' ? "left-[80%] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" :
              "left-[90%] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
            )}
          />
          
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
            <span className="text-[9px] font-bold font-mono text-slate-600">P50</span>
            <span className="text-[9px] font-bold font-mono text-slate-600">P80</span>
            <span className="text-[9px] font-bold font-mono text-slate-600">P90</span>
            <span className="text-[9px] font-bold font-mono text-slate-600">P99</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-medium italic">
          The highlighted delta represents the Bureau's insolvency protection buffer for the {tier} tier.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* P50 */}
        <button
          type="button"
          onClick={() => setTier('P50')}
          className={cn(
            "p-5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-4",
            tier === 'P50'
              ? "bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/20"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">P50 Base Target</span>
              {tier === 'P50' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mb-2">
              ${Math.round(riskMatrix.p50).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              Baseline scope execution. Zero buffer for unexpected third-party delays.
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
            Downside Risk: Standard
          </div>
        </button>

        {/* P80 */}
        <button
          type="button"
          onClick={() => setTier('P80')}
          className={cn(
            "p-5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-4",
            tier === 'P80'
              ? "bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/20"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">P80 Enterprise Buffer</span>
              {tier === 'P80' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mb-2">
              ${Math.round(riskMatrix.p80).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              Hedging multi-stage testing cycles and integration dependencies.
            </p>
          </div>
          <div className="text-[10px] font-mono text-cyan-400 pt-2 border-t border-slate-800/60">
            Downside Risk: Hedged (80%)
          </div>
        </button>

        {/* P90 */}
        <button
          type="button"
          onClick={() => setTier('P90')}
          className={cn(
            "p-5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-4",
            tier === 'P90'
              ? "bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/30"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>P90 Insolvency-Proof</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Recommended
                </span>
              </span>
              {tier === 'P90' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-2">
              ${Math.round(riskMatrix.p90).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              Guaranteed execution ceiling. 100% cost-overrun protection guaranteed by Bureau protocol.
            </p>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 font-semibold pt-2 border-t border-emerald-500/20">
            Downside Risk: Fully Guaranteed (90%)
          </div>
        </button>
      </div>

      {/* Dynamic Tier Explanation */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white uppercase font-mono mr-2">[{tier} Tier Rationale]:</span>
          {getTierExplanation()}
        </div>
      </div>

      {/* Escrow Lock Action Callout */}
      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-400 block font-mono">
            Selected Escrow Commitment ({tier} Tier)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              ${Math.round(getAmount()).toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">USD</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Condition-Gated Release • Zero Billable Hour Inflation</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAuthorize(getAmount(), tier)}
          disabled={isAuthorizing}
          className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-xl shadow-emerald-500/20 text-sm tracking-wide cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>{isAuthorizing ? 'Committing Capital to Custody Vault...' : 'Commit Escrow & Launch Mandate'}</span>
        </button>
      </div>
    </div>
  );
}
