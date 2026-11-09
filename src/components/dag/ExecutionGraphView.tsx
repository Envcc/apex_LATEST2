import React, { useState } from 'react';
import { AtomicOperationalUnit, ExitCriterion } from '../../lib/ast-compiler';
import { Clock, ShieldCheck, CheckCircle2, ChevronRight, Layers, AlertCircle, X, Shield, Cpu, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  units: AtomicOperationalUnit[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function ExecutionGraphView({ units, selectedId, onSelect }: Props) {
  const [activeNode, setActiveNode] = useState<AtomicOperationalUnit | null>(null);
  const [showTechnicalHashes, setShowTechnicalHashes] = useState(false);

  // Compute dependency mapping
  const getParentIndices = (dependsOn?: string[]) => {
    if (!dependsOn || dependsOn.length === 0) return [];
    return dependsOn
      .map(id => units.findIndex(u => u.id === id))
      .filter(idx => idx !== -1)
      .map(idx => `AOU ${(idx + 1).toString().padStart(2, '0')}`);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Compiled Execution Topology (DAG)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic execution workflow. Each node represents an independent Atomic Operational Unit (AOU).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">{units.length} Atomic Nodes</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">DFS Non-Cyclic Verified</span>
          </div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit, idx) => {
          const isSelected = selectedId === unit.id || activeNode?.id === unit.id;
          const isCompleted = unit.status === 'COMPLETED';
          const isInProgress = unit.status === 'IN_PROGRESS';
          const parents = getParentIndices(unit.dependsOn);

          return (
            <div
              key={unit.id}
              onClick={() => {
                setActiveNode(unit);
                if (onSelect) onSelect(unit.id);
              }}
              className={cn(
                "p-5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group",
                isSelected
                  ? "bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/30"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50",
                isCompleted && "border-emerald-500/40 bg-emerald-950/10"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      AOU {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    {parents.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Requires {parents.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-medium animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Executing</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">Pending</span>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors mb-2">
                  {unit.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
                  {unit.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{unit.estimatedHours}h effort</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{unit.exitCriteria.length} Assertion {unit.exitCriteria.length === 1 ? 'Proof' : 'Proofs'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Inspection Modal/Drawer */}
      {activeNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#07090E] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveNode(null)}
              className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  AOU Node Detail
                </span>
                <span className="text-xs font-mono text-slate-500">UUID: {activeNode.id}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">{activeNode.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">{activeNode.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Effort Horizon</span>
                <span className="text-sm font-bold text-white font-mono">{activeNode.estimatedHours} Hours</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Complexity Multiplier</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{activeNode.complexityScalar || 1.0}x Scalar</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Status</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{activeNode.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Programmatic Exit Assertions ({activeNode.exitCriteria.length})</span>
                </h4>

                <button
                  onClick={() => setShowTechnicalHashes(!showTechnicalHashes)}
                  className="text-[11px] font-mono text-slate-400 hover:text-emerald-300 transition-colors"
                >
                  {showTechnicalHashes ? 'Hide Raw Cryptographic Hashes' : 'Show Technical Hashes'}
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {activeNode.exitCriteria.map((c: ExitCriterion, i: number) => (
                  <div key={c.id || i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400 uppercase font-mono text-[11px]">{c.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Assertion #{i + 1}</span>
                    </div>
                    <div className="text-slate-200 font-mono text-[11px] truncate">{c.assertionEndpoint}</div>

                    {showTechnicalHashes && c.expectedPayloadHash && (
                      <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500 truncate">
                        SHA-256 Digest: {c.expectedPayloadHash}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveNode(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Inspection Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
