import React from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { X, ShieldCheck, Activity, Flame, Scale, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({ isOpen, onClose }) => {
  const { state } = usePersonalState();
  if (!isOpen) return null;

  const energy = state.energyModel;
  const delta = energy.targetChangeDelta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-heading">Energy Engine Transparency</h2>
              <p className="text-xs text-slate-400">How your target is calculated & why double-counting is prevented</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Target comparison hero */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Calorie Target</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-white font-heading">
                  {energy.adjustedDailyCalorieTarget.value.toLocaleString()} kcal
                </span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-md ${delta >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                  {delta >= 0 ? `+${delta}` : delta} kcal adjusted
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400">Baseline Target:</span>
              <span className="font-semibold text-slate-200">{state.goals.baselineCalorieTarget} kcal</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-brand-400">{energy.adjustedDailyCalorieTarget.value} kcal</span>
            </div>
          </div>

          {/* Critical Anti Double Counting Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-300">Protected Against Activity Double-Counting</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {energy.avoidedDoubleCountingExplanation} We calculate baseline resting burn separately and only add genuine net exertion above sedentary expectations.
              </p>
            </div>
          </div>

          {/* Step-by-step breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center justify-between">
              <span>Deterministic Audit Breakdown</span>
              <span className="font-normal lowercase text-slate-500 font-mono text-[11px]">{energy.methodology}</span>
            </h3>

            <div className="space-y-2.5">
              {energy.explanationSteps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{step.factor}</span>
                      <ProvenanceBadge
                        infoType={idx === 1 ? 'ESTIMATED' : 'CALCULATED'}
                        source={idx === 1 ? state.connectedDevice.name : 'NutriPilot Core Engine'}
                        confidence="high"
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.explanation}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-200 font-mono shrink-0">
                    {step.deltaKcal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Target stability rules */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Scale className="w-4 h-4 text-brand-400" />
              <span>Target Stability & Smoothing Model</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NutriPilot avoids reactionary shifts (like instantly jumping your goal by 450 calories after a short walk). A dampening algorithm smooths day-to-day expenditure to prevent overeating on active days or unnecessary starvation on rest days.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 px-6 py-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
