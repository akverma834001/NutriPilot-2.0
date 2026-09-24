import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { FOURTEEN_DAY_HISTORY } from '../data/mockHistoricalData';
import {
  TrendingUp,
  Scale,
  Calendar,
  Flame,
  Activity,
  Moon,
  Droplets,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const ProgressView: React.FC = () => {
  const { state } = usePersonalState();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [activeChart, setActiveChart] = useState<'weight' | 'calories' | 'protein' | 'steps' | 'sleep'>('weight');

  // Slice history based on range
  const chartData = timeRange === '7D'
    ? FOURTEEN_DAY_HISTORY.slice(7)
    : FOURTEEN_DAY_HISTORY;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-mono">
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold font-mono">
              Longitudinal Analytics
            </span>
            <span className="text-slate-600">•</span>
            <ProvenanceBadge infoType="CALCULATED" source="Multi-day Trajectory" confidence="high" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Progress & Longitudinal Trends
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Smooth trends and rolling averages prevent reactive over-correction from single-day fluctuations.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex bg-slate-850 p-1 rounded-xl border border-slate-750 text-xs font-semibold">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === r
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Metric Selector Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { key: 'weight', label: 'Weight Trend & Rolling Avg', icon: Scale },
          { key: 'calories', label: 'Calories vs Target', icon: Flame },
          { key: 'protein', label: 'Protein Adherence', icon: TrendingUp },
          { key: 'steps', label: 'Daily Steps', icon: Activity },
          { key: 'sleep', label: 'Sleep Consistency', icon: Moon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeChart === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveChart(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-semibold transition-all ${
                isActive
                  ? 'bg-slate-800 text-brand-400 border-slate-700 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Chart Container */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        {/* CHART 1: WEIGHT TREND WITH 7-DAY ROLLING AVERAGE */}
        {activeChart === 'weight' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Weight Trend (Daily Scale vs 7-Day Rolling Average)
                </h3>
                <p className="text-xs text-slate-400">
                  Rolling average dampens daily water, sodium & bowel fluctuations to reveal true lean tissue trend.
                </p>
              </div>
              <ProvenanceBadge infoType="CALCULATED" source="Weight Filter" confidence="high" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#64748b" fontSize={11} unit="kg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    name="Daily Scale Weight"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rollingAvgKg"
                    name="7-Day Rolling Average"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <p>
                <strong>Scientific Principle:</strong> Daily weight shifts of ±0.8 kg are usually water/glycogen retention from carbohydrate intake or workout inflammation. We use the rolling trend to guide caloric surplus.
              </p>
            </div>
          </div>
        )}

        {/* CHART 2: CALORIES VS TARGET */}
        {activeChart === 'calories' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Daily Calories Consumed vs Dynamic Target
                </h3>
                <p className="text-xs text-slate-400">
                  Comparing actual intake against activity-adjusted caloric needs.
                </p>
              </div>
              <ProvenanceBadge infoType="CALCULATED" source="Energy Accounting" confidence="high" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="kcal" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="caloriesConsumed" name="Calories Consumed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="calorieTarget" name="Calorie Target" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: PROTEIN ADHERENCE */}
        {activeChart === 'protein' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Protein Adherence (130g Daily Target)
                </h3>
                <p className="text-xs text-slate-400">
                  Daily grams of protein logged vs 1.9g/kg lean muscle gain target.
                </p>
              </div>
              <ProvenanceBadge infoType="CALCULATED" source="Macro Engine" confidence="high" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="g" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="proteinConsumedG" name="Protein Consumed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="proteinTargetG" name="Target (130g)" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 4: DAILY STEPS */}
        {activeChart === 'steps' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Daily Step Volume
                </h3>
                <p className="text-xs text-slate-400">
                  Measured by connected wearable pedometer.
                </p>
              </div>
              <ProvenanceBadge infoType="MEASURED" source="Wearable Sensor" confidence="high" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="steps" name="Steps Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 5: SLEEP DURATION */}
        {activeChart === 'sleep' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Sleep Duration (Hours)
                </h3>
                <p className="text-xs text-slate-400">
                  Tracked by wearable sleep accelerometer.
                </p>
              </div>
              <ProvenanceBadge infoType="MEASURED" source="Sleep Sensor" confidence="high" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[5, 10]} stroke="#64748b" fontSize={11} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sleepHours"
                    name="Sleep Hours"
                    stroke="#818cf8"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
