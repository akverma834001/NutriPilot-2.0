import React from 'react';
import { InformationType } from '../types';
import { ProvenanceBadge } from './ProvenanceBadge';

interface MacroProgressBarProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  colorClass: string;
  gradientClass: string;
  infoType?: InformationType;
  source?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  consumed,
  target,
  unit,
  colorClass,
  gradientClass,
  infoType = 'CALCULATED',
  source = 'Macro Gap Engine',
  confidence = 'high'
}) => {
  const percentage = Math.min(100, Math.round((consumed / Math.max(1, target)) * 100));
  const remaining = Math.max(0, Math.round((target - consumed) * 10) / 10);
  const isOver = consumed > target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{label}</span>
          <ProvenanceBadge
            infoType={infoType}
            source={source}
            confidence={confidence}
          />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-slate-100 text-sm">
            {consumed.toLocaleString()}
          </span>
          <span className="text-slate-400 font-normal text-xs">
            / {target.toLocaleString()} {unit}
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${gradientClass} ${isOver ? 'ring-1 ring-amber-400' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span>{percentage}% achieved</span>
        <span className={remaining === 0 ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
          {remaining > 0 ? `${remaining} ${unit} remaining` : 'Target reached ✓'}
        </span>
      </div>
    </div>
  );
};
