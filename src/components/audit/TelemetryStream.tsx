import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export function TelemetryStream({ proofs }: { proofs: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [proofs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Live Telemetry Stream</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-emerald-400 uppercase font-mono tracking-tighter">System Attested</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {proofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-slate-500">
            <Shield className="w-8 h-8 mb-2" />
            <span>Awaiting initial attestation signals...</span>
          </div>
        ) : (
          proofs.map((p, i) => (
            <div key={p.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-3">
                <span className="text-slate-600 shrink-0">
                  [{p.timestamp ? format(p.timestamp.toDate(), 'HH:mm:ss.SSS') : '...'}]:
                </span>
                <div className="flex-1 break-all">
                  <span className="text-cyan-500 font-bold uppercase mr-2">[{p.type}]</span>
                  <span className="text-slate-300">AOU_{p.resourceId.slice(0, 8)}: Verification </span>
                  <span className="text-emerald-500 font-bold">PASSED</span>
                  <div className="mt-1 text-slate-500 text-[9px] flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Attestation Hash: {p.hash}</span>
                    </div>
                    <div className="opacity-50">Signer: {p.signer}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 py-2 bg-slate-900/30 border-t border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-600">
        <span>ISO 27001 AUDIT SCOPE: ACTIVE</span>
        <span>EBPF_PROBE_V2.1.0</span>
      </div>
    </div>
  );
}
