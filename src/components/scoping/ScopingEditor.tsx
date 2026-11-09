import React from 'react';
import { AtomicOperationalUnit, ExitCriterion } from '../../lib/ast-compiler';
import { ShieldCheck, Clock, Layers, Globe, Edit3, Cpu, Plus, Trash2, HelpCircle } from 'lucide-react';

interface Props {
  units: AtomicOperationalUnit[];
  onChange: (units: AtomicOperationalUnit[]) => void;
}

export function ScopingEditor({ units, onChange }: Props) {
  const updateUnit = (id: string, updates: Partial<AtomicOperationalUnit>) => {
    onChange(units.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const updateCriterion = (unitId: string, criterionId: string, updates: Partial<ExitCriterion>) => {
    onChange(units.map(u => {
      if (u.id === unitId) {
        return {
          ...u,
          exitCriteria: u.exitCriteria.map(c => c.id === criterionId ? { ...c, ...updates } : c)
        };
      }
      return u;
    }));
  };

  const addCriterion = (unitId: string) => {
    const newCriterion: ExitCriterion = {
      id: crypto.randomUUID(),
      type: 'API_ENDPOINT',
      assertionEndpoint: 'https://api.apexbureau.ch/verify/status',
      expectedStatusCode: 200,
      expectedPayloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };
    onChange(units.map(u => u.id === unitId ? { ...u, exitCriteria: [...u.exitCriteria, newCriterion] } : u));
  };

  const removeCriterion = (unitId: string, criterionId: string) => {
    onChange(units.map(u => {
      if (u.id === unitId) {
        return {
          ...u,
          exitCriteria: u.exitCriteria.filter(c => c.id !== criterionId)
        };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-400">
            <Edit3 className="w-4 h-4" />
            <span>Human Scoping Binding & Verification Matrix</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Refine task specifications, duration estimates, and assertion criteria before committing capital to escrow.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Inline Executive Edit Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {units.map((unit, idx) => (
          <div 
            key={unit.id} 
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    AOU {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <input 
                    className="bg-transparent text-white font-bold text-base sm:text-lg border-b border-slate-800 hover:border-slate-700 focus:border-emerald-500 outline-none w-full transition-colors font-sans py-0.5"
                    value={unit.title}
                    onChange={(e) => updateUnit(unit.id, { title: e.target.value })}
                    placeholder="Operational Unit Title"
                  />
                </div>
                <textarea 
                  className="bg-slate-950/70 text-slate-300 text-xs sm:text-sm w-full resize-none h-20 outline-none border border-slate-800 p-3 rounded-lg focus:border-emerald-500/50 leading-relaxed font-sans placeholder:text-slate-600"
                  value={unit.description}
                  onChange={(e) => updateUnit(unit.id, { description: e.target.value })}
                  placeholder="Detailed functional specification & execution deliverable..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-800/60">
              {/* Effort & Complexity */}
              <div className="md:col-span-4 space-y-3">
                <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Effort & Risk Multiplier</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Estimated Hours</label>
                    <input 
                      type="number"
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-emerald-500 outline-none w-full"
                      value={unit.estimatedHours}
                      onChange={(e) => updateUnit(unit.id, { estimatedHours: Math.max(1, Number(e.target.value)) })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Complexity Scalar Preset</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: '1.0 Std', val: 1.0 },
                        { label: '1.3 Mod', val: 1.3 },
                        { label: '1.8 High', val: 1.8 },
                        { label: '2.5 Crit', val: 2.5 },
                      ].map(preset => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => updateUnit(unit.id, { complexityScalar: preset.val })}
                          className={`px-2 py-1 rounded text-[11px] font-mono transition-colors border cursor-pointer ${
                            unit.complexityScalar === preset.val
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exit Assertions */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Programmatic Exit Assertions</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addCriterion(unit.id)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Assertion</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {unit.exitCriteria.map((c) => (
                    <div key={c.id} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <select 
                          className="bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400 uppercase tracking-wide rounded px-2.5 py-1 outline-none cursor-pointer"
                          value={c.type}
                          onChange={(e) => updateCriterion(unit.id, c.id, { type: e.target.value as any })}
                        >
                          <option value="API_ENDPOINT">REST API Endpoint (HTTP 200)</option>
                          <option value="CONTAINER_EXIT">Docker Sandbox Container Exit Code 0</option>
                          <option value="CRYPTO_HASH">Git Commit Tree SHA-256 Digest</option>
                          <option value="HUMAN_AUDIT">Dual-Key Executive Multi-Sig</option>
                        </select>

                        {unit.exitCriteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCriterion(unit.id, c.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <input 
                          className="sm:col-span-12 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                          placeholder="Assertion Endpoint URL (e.g. https://api.client.ch/health)"
                          value={c.assertionEndpoint}
                          onChange={(e) => updateCriterion(unit.id, c.id, { assertionEndpoint: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
