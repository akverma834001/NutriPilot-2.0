import React, { useState } from 'react';
import { InformationType, SourceType, ConfidenceLevel } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface ProvenanceBadgeProps {
  infoType: InformationType;
  source?: string;
  sourceType?: SourceType;
  confidence?: ConfidenceLevel;
  timestamp?: string;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  infoType,
  source = 'NutriPilot Core',
  sourceType,
  confidence = 'high',
  timestamp,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStyle = () => {
    switch (infoType) {
      case 'MEASURED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CALCULATED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ESTIMATED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PREDICTED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border flex items-center gap-1 transition-all ${getStyle()} ${className}`}
        title="Click or hover to inspect data provenance"
      >
        <span>{infoType}</span>
        <Info className="w-2.5 h-2.5 opacity-60" />
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-1.5 w-60 p-2.5 text-xs rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-200 border border-slate-700/60 shadow-xl backdrop-blur-md pointer-events-none animate-fade-in">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold mb-1 pb-1 border-b border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Data Provenance</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Classification:</span>
              <span className="font-semibold">{infoType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="font-medium text-slate-200 truncate max-w-[130px]" title={source}>{source}</span>
            </div>
            {sourceType && (
              <div className="flex justify-between">
                <span className="text-slate-400">Origin Type:</span>
                <span className="font-mono text-[10px] text-slate-300">{sourceType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Confidence:</span>
              <span className={`font-semibold capitalize ${confidence === 'high' ? 'text-emerald-400' : confidence === 'medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                {confidence}
              </span>
            </div>
            {timestamp && (
              <div className="flex justify-between">
                <span className="text-slate-400">Captured:</span>
                <span className="text-slate-400">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
