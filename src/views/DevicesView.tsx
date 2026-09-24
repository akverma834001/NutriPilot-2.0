import React, { useState } from 'react';
import { usePersonalState } from '../context/PersonalStateContext';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { BleWearableService } from '../services/BleService';
import {
  Watch,
  RefreshCw,
  Power,
  Check,
  Sliders,
  AlertTriangle,
  Activity,
  Heart,
  Moon,
  Footprints,
  Flame,
  Navigation as NavigationIcon,
  Bluetooth,
  Radio,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Smartphone
} from 'lucide-react';

export const DevicesView: React.FC = () => {
  const {
    state,
    syncWearable,
    connectDevice,
    connectRealBluetoothWatch,
    disconnectDevice,
    togglePermission,
    isPhonePedometerActive,
    isPhoneMoving,
    liveMagnitude,
    pedometerError,
    startPhonePedometer,
    stopPhonePedometer,
    addSteps
  } = usePersonalState();

  const [isPairingDemo, setIsPairingDemo] = useState(false);
  const [pairingStep, setPairingStep] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Real BLE Bluetooth States
  const [isSearchingBle, setIsSearchingBle] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);
  const [bleSuccessMsg, setBleSuccessMsg] = useState<string | null>(null);

  const device = state.connectedDevice;
  const isConnected = device.connected;
  const isRealBle = device.provider === 'bluetooth_ble' || device.isRealHardware;
  const bleSupported = BleWearableService.isSupported();

  // Real Bluetooth Pairing Handler
  const handleConnectRealBluetooth = async () => {
    setBleError(null);
    setBleSuccessMsg(null);
    setIsSearchingBle(true);

    try {
      const res = await connectRealBluetoothWatch();
      if (res.success) {
        setBleSuccessMsg(`Successfully connected to ${res.deviceName || 'Bluetooth Watch'}! Live steps and heart rate are now streaming.`);
      } else {
        setBleError(res.error || 'Bluetooth pairing was cancelled or timed out.');
      }
    } catch (err: any) {
      setBleError(err.message || 'Failed to connect via Bluetooth.');
    } finally {
      setIsSearchingBle(false);
    }
  };

  // Simulated Demo Pairing Handler
  const handlePairDemoWatch = async (provider: string = 'demo') => {
    setIsPairingDemo(true);
    setBleError(null);
    setPairingStep('Searching for nearby devices...');
    await new Promise((r) => setTimeout(r, 500));

    setPairingStep('Device found: NutriPilot Demo Watch...');
    await new Promise((r) => setTimeout(r, 500));

    setPairingStep('Requesting heart rate & pedometer permissions...');
    await new Promise((r) => setTimeout(r, 500));

    setPairingStep('Synchronizing device metrics...');
    await new Promise((r) => setTimeout(r, 500));

    await connectDevice(provider);
    setIsPairingDemo(false);
    setPairingStep('');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWearable();
    setIsSyncing(false);
  };

  const permissionsList = [
    { key: 'steps' as const, label: 'Steps & Pedometer', icon: Footprints, desc: 'Daily step cadence and distance' },
    { key: 'heartRate' as const, label: 'Continuous Heart Rate', icon: Heart, desc: 'PPG resting, current and peak BPM' },
    { key: 'workoutHistory' as const, label: 'Workout Sessions', icon: Activity, desc: 'Strength, cardio, and HIIT logs' },
    { key: 'activeEnergy' as const, label: 'Active Energy Burn', icon: Flame, desc: 'Device-estimated movement calories' },
    { key: 'sleep' as const, label: 'Sleep & Rest Analysis', icon: Moon, desc: 'Sleep duration and consistency' },
    { key: 'distance' as const, label: 'Distance & Stride', icon: NavigationIcon, desc: 'Outdoor route and walking distance' }
  ];

  const providers = [
    { id: 'demo', name: 'NutriPilot Demo Watch', desc: 'Demo watch with live steps and heart rate for instant testing', recommended: true },
    { id: 'apple_health', name: 'Apple Health', desc: 'Apple Watch & HealthKit sync' },
    { id: 'health_connect', name: 'Google Health Connect', desc: 'Android & Google Health Connect (Pixel, Samsung, Fitbit)' },
    { id: 'fitbit', name: 'Fitbit', desc: 'Fitbit activity and heart rate tracking' },
    { id: 'garmin', name: 'Garmin Connect', desc: 'Garmin running and workout tracking' },
    { id: 'samsung_health', name: 'Samsung Health', desc: 'Galaxy Watch health sync' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">
              Wearable & Sensor Sync
            </span>
            <span className="text-slate-600">•</span>
            {isConnected ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {device.name} Connected
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Ready to Pair</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
            Connect Your Watch & Devices
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect your smartwatch via Bluetooth or use your phone's built-in motion sensor to count genuine steps.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Device Now'}</span>
            </button>
            <button
              type="button"
              onClick={disconnectDevice}
              className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-750 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>

      {/* REAL BLUETOOTH HERO CARD (USER REQUEST) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border-2 border-blue-500/40 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border-2 border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
              <Bluetooth className={`w-8 h-8 ${isSearchingBle ? 'animate-bounce text-blue-300' : ''}`} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Smartwatch Sync
                </span>
                {bleSupported ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Bluetooth Ready
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Browser BLE Disabled
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white font-heading">
                Connect Your Smartwatch or Fitness Band
              </h2>

              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Connect directly to your Apple Watch, Garmin, Polar, Galaxy Watch, Mi Band, or heart rate monitor to stream genuine heart rate and steps directly into your nutrition plan.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={handleConnectRealBluetooth}
              disabled={isSearchingBle}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2.5"
            >
              <Radio className={`w-4 h-4 ${isSearchingBle ? 'animate-spin' : ''}`} />
              <span>{isSearchingBle ? 'Searching Nearby Devices...' : 'Search & Connect Real Watch'}</span>
            </button>
            <span className="text-[10px] text-slate-400 text-center">
              Requires Chrome, Edge, or Opera on Windows / Android / Mac
            </span>
          </div>
        </div>

        {/* Real BLE Error Notification */}
        {bleError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 text-xs text-rose-300 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-semibold">Bluetooth Notice:</strong>
                <span>{bleError}</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: Ensure Bluetooth is enabled in Windows Settings and your watch or heart rate monitor is turned on, in pairing mode, or broadcasting HR.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBleError(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real BLE Success Notification */}
        {bleSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{bleSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setBleSuccessMsg(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* PHONE ACCELEROMETER MOTION PEDOMETER CARD */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
              <Smartphone className={`w-8 h-8 ${isPhonePedometerActive ? 'animate-bounce text-emerald-300' : ''}`} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PHONE ACCELEROMETER SENSOR
                </span>
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${isPhonePedometerActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${isPhonePedometerActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  {isPhonePedometerActive ? 'Sensor Active & Counting' : 'Sensor on Standby'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Count Real Steps via Phone
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Uses the browser's hardware motion sensor (<code className="text-brand-300 font-mono">DeviceMotionEvent</code>) with peak-valley detection to count footsteps in real-time as you move.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={async () => {
                if (isPhonePedometerActive) {
                  stopPhonePedometer();
                } else {
                  await startPhonePedometer();
                }
              }}
              className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                isPhonePedometerActive
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 scale-[1.02]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isPhonePedometerActive ? 'Stop Phone Sensor' : 'Start Phone Motion Sensor'}</span>
            </button>
          </div>
        </div>

        {/* Live Motion Sensor Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
            <span className="text-slate-400 text-[11px] block">Steps Counted:</span>
            <span className="text-lg font-extrabold text-white font-heading">
              {state.activity.steps.value.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
            <span className="text-slate-400 text-[11px] block">Phone Motion Sensor:</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {liveMagnitude} <span className="text-xs text-slate-400">m/s²</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750">
            <span className="text-slate-400 text-[11px] block">Motion Status:</span>
            <span className={`text-xs font-bold ${isPhoneMoving ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isPhoneMoving ? 'Walking / Moving' : 'Stationary'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Quick Add Steps:</span>
            <div className="flex items-center gap-1 mt-1">
              <button
                type="button"
                onClick={() => addSteps(10)}
                className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-650 text-slate-200 text-[11px] font-semibold"
                title="Add 10 steps"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => addSteps(50)}
                className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-650 text-slate-200 text-[11px] font-semibold"
                title="Add 50 steps"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => addSteps(200)}
                className="px-2 py-0.5 rounded bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-[11px] font-bold border border-brand-500/30"
                title="Add 200 steps"
              >
                +200
              </button>
            </div>
          </div>
        </div>

        {pedometerError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{pedometerError} (Use simulation buttons above to test step counting on PC browsers without physical accelerometers)</span>
          </div>
        )}
      </div>

      {/* SIMULATED PAIRING PROGRESS IF DEMO PAIRING */}
      {isPairingDemo && (
        <div className="p-6 rounded-2xl bg-brand-500/10 border-2 border-brand-500/40 shadow-xl space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-brand-400 animate-spin" />
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Pairing Demo Watch in Progress...
              </h3>
              <p className="text-xs text-brand-300 font-mono">{pairingStep}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED DEVICE ACTIVE STATUS CARD */}
      {isConnected ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isRealBle
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              }`}>
                {isRealBle ? <Bluetooth className="w-7 h-7" /> : <Watch className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-heading">{device.name}</h3>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connected
                  </span>
                  {isRealBle && (
                    <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                      Real BLE Hardware
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRealBle
                    ? 'Active Web Bluetooth LE GATT connection • Real-time continuous sensor stream'
                    : 'Demo wearable data • High-fidelity sensor simulation'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-300 bg-slate-850 px-4 py-2 rounded-xl border border-slate-750">
              <div>
                <span className="text-slate-400 block text-[10px]">Current Heart Rate:</span>
                <span className="font-extrabold text-rose-400 text-sm flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 animate-pulse" />
                  {state.activity.currentHeartRate.value} BPM
                </span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[10px]">Last Sync:</span>
                <span className="font-bold text-white">
                  {state.dataFreshnessMinutes === 0 ? 'Just now' : `${state.dataFreshnessMinutes} min ago`}
                </span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[10px]">Battery:</span>
                <span className="font-bold text-emerald-400">{device.batteryLevel || 84}%</span>
              </div>
            </div>
          </div>

          {/* Device Permissions Configuration (Requirement #9) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                <h4 className="text-sm font-bold text-white font-heading">
                  Sensor Access Permissions
                </h4>
              </div>
              <span className="text-xs text-slate-400">Toggle permissions to test permission state handling</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissionsList.map((perm) => {
                const Icon = perm.icon;
                const isEnabled = device.permissions[perm.key];
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isEnabled
                        ? 'bg-slate-850 border-slate-750'
                        : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isEnabled ? 'text-brand-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.desc}</div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs transition-colors ${
                        isEnabled
                          ? 'bg-brand-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-500 border border-slate-750'
                      }`}
                    >
                      {isEnabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* CONNECT SCREEN IF NO WATCH CONNECTED */
        <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-750 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 mx-auto">
            <Watch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-heading">
              No Wearable Currently Connected
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Connect your real smartwatch via Bluetooth above or pair the NutriPilot Demo Watch below to simulate realistic activity telemetry.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConnectRealBluetooth}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Bluetooth className="w-4 h-4" />
              <span>Connect via Real Bluetooth</span>
            </button>
            <button
              type="button"
              onClick={() => handlePairDemoWatch('demo')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs"
            >
              Pair Demo Watch (Simulated)
            </button>
          </div>
        </div>
      )}

      {/* PROVIDER CARDS LIST (Requirement #7, #8) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">
          All Available Wearable Integrations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {providers.map((p) => {
            const isThisConnected = isConnected && device.provider === p.id;
            return (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-850/80 border border-slate-750 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    {p.recommended && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                        Primary Demo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">
                    {isThisConnected ? '● Active stream' : 'Ready to pair'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePairDemoWatch(p.id)}
                    disabled={isThisConnected || isPairingDemo}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isThisConnected
                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                        : 'bg-slate-800 hover:bg-brand-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isThisConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
