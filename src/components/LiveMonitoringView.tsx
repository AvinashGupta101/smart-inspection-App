import React, { useState } from 'react';
import {
  Radio,
  AlertTriangle,
  Flame,
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  Volume2,
  Wind,
  Power,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Code2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Site, TelemetryReading } from '../types';
import { TelemetryEvent } from '../services/telemetry';

interface LiveMonitoringViewProps {
  sites?: Site[];
  telemetry?: Record<string, TelemetryReading>;
  telemetryEvents?: TelemetryEvent[];
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  onTriggerTestAnomaly?: (siteId: string) => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  sites = [],
  telemetry = {},
  telemetryEvents = [],
  isSimulating = true,
  onToggleSimulation = () => {},
  onTriggerTestAnomaly = (_siteId: string) => {},
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [showJsonPayload, setShowJsonPayload] = useState(false);

  const activeTelemetry = telemetry[selectedSiteId] || Object.values(telemetry)[0] || null;
  const activeSite = sites.find(s => s.id === selectedSiteId) || sites[0] || null;

  return (
    <div className="space-y-6 pb-16">
      {/* Explicit Required Banner: SIMULATED DEMO FEED */}
      <div className="bg-amber-500 text-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-amber-600 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-widest uppercase bg-slate-950 text-amber-400 px-2 py-0.5 rounded">
                SIMULATED DEMO FEED — NO LIVE HARDWARE CONNECTED
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
              Industrial IoT Telemetry Simulation Engine. Pre-configured for MQTT broker, ESP32/ESP8266 microcontrollers, and Modbus/PLC hardware integration.
            </p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 ${
              isSimulating
                ? 'bg-slate-950 text-white hover:bg-slate-800'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pause Telemetry</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white" />
                <span>Resume Feed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Site Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Select Facility:
        </span>
        {sites.map(site => {
          const isSelected = site.id === selectedSiteId;
          const siteTelem = telemetry[site.id];
          const hasAlert = siteTelem && siteTelem.alerts && siteTelem.alerts.length > 0;

          return (
            <button
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasAlert ? 'bg-red-500 animate-ping' : isSelected ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
              />
              <span>{site.name}</span>
            </button>
          );
        })}
      </div>

      {/* Live Sensors Grid */}
      {activeTelemetry && (
        <div className="space-y-6">
          {/* Facility Status Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{activeTelemetry.siteName}</h3>
                <span className="text-xs font-mono text-slate-400">Node ID: {activeSite?.siteId}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Last broadcast: <span className="font-mono font-bold text-slate-700">{activeTelemetry.lastUpdated}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTriggerTestAnomaly(activeTelemetry.siteId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                title="Inject an artificial thermal and vibration anomaly to test safety threshold escalations"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Simulate Sensor Spike</span>
              </button>

              <button
                onClick={() => setShowJsonPayload(!showJsonPayload)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>MQTT JSON</span>
              </button>
            </div>
          </div>

          {/* MQTT / JSON Preview Drawer */}
          {showJsonPayload && (
            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span>MQTT TOPIC: telemetry/industrial/{activeSite?.siteId.toLowerCase()}/sensors</span>
                <span className="text-[10px] text-orange-400 font-bold">READY FOR ESP32 / PLC</span>
              </div>
              <pre className="overflow-x-auto">
                {JSON.stringify(
                  {
                    topic: `telemetry/industrial/${activeSite?.siteId.toLowerCase()}`,
                    node_id: activeSite?.siteId,
                    timestamp: new Date().toISOString(),
                    payload: {
                      temperature_c: activeTelemetry.temperature,
                      humidity_pct: activeTelemetry.humidity,
                      vibration_mms: activeTelemetry.vibration,
                      noise_db: activeTelemetry.noise,
                      voc_gas_ppm: activeTelemetry.gasPpm,
                      equipment_running: activeTelemetry.equipmentRunning,
                      emergency_stop_armed: activeTelemetry.emergencyStopArmed,
                      alerts: activeTelemetry.alerts,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {/* 5 Industrial Sensor Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Temperature */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                activeTelemetry.temperature > 40
                  ? 'bg-red-50/50 border-red-300 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Temperature
                </span>
                <Thermometer
                  className={`w-4 h-4 ${
                    activeTelemetry.temperature > 40 ? 'text-red-600' : 'text-orange-500'
                  }`}
                />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {activeTelemetry.temperature}°C
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Baseline: 22-35°C</span>
                <span
                  className={`font-bold ${
                    activeTelemetry.temperature > 40 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {activeTelemetry.temperature > 40 ? 'HIGH' : 'NORMAL'}
                </span>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Relative Humidity
                </span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {activeTelemetry.humidity}%
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Target: 40-65%</span>
                <span className="font-bold text-emerald-600">OPTIMAL</span>
              </div>
            </div>

            {/* Vibration */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                activeTelemetry.vibration > 4.5
                  ? 'bg-red-50/50 border-red-300 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vibration ISO
                </span>
                <Activity
                  className={`w-4 h-4 ${
                    activeTelemetry.vibration > 4.5 ? 'text-red-600' : 'text-purple-600'
                  }`}
                />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {activeTelemetry.vibration} <span className="text-sm font-normal text-slate-400">mm/s</span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Limit: &lt;4.5 mm/s</span>
                <span
                  className={`font-bold ${
                    activeTelemetry.vibration > 4.5 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {activeTelemetry.vibration > 4.5 ? 'EXCEEDED' : 'ZONE A'}
                </span>
              </div>
            </div>

            {/* Acoustic Noise */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Acoustic Noise
                </span>
                <Volume2 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {activeTelemetry.noise} <span className="text-sm font-normal text-slate-400">dB</span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>OSHA: 85 dB</span>
                <span
                  className={`font-bold ${
                    activeTelemetry.noise > 85 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {activeTelemetry.noise > 85 ? 'HEARING PPE' : 'SAFE'}
                </span>
              </div>
            </div>

            {/* Air / VOC Gas */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  VOC & Gas PPM
                </span>
                <Wind className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {activeTelemetry.gasPpm} <span className="text-sm font-normal text-slate-400">ppm</span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Alarm: &gt;20 ppm</span>
                <span
                  className={`font-bold ${
                    activeTelemetry.gasPpm > 20 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {activeTelemetry.gasPpm > 20 ? 'VENTILATE' : 'CLEAR'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Safety Alerts on this Site */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Active Machine Interlocks & Safety Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <Power className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Equipment Running</div>
                  <span className="text-[10px] text-emerald-600 font-bold">Motor & VFD Operational</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Emergency Stop Circuit</div>
                  <span className="text-[10px] text-blue-600 font-bold">Armed & Monitored (Dual Loop)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <Cpu className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Modbus / PLC Bridge</div>
                  <span className="text-[10px] text-slate-500 font-bold">Simulator Socket Active</span>
                </div>
              </div>
            </div>

            {activeTelemetry && activeTelemetry.alerts && activeTelemetry.alerts.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                <span className="font-bold block">Current Threshold Alarms:</span>
                {activeTelemetry.alerts.map((al, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    <span>{al}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Telemetry Stream Log Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Live Sensor Event Feed
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {telemetryEvents.length === 0 ? (
                <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                  Monitoring sensor streams in background. Normal baselines reported.
                </div>
              ) : (
                telemetryEvents.map(evt => (
                  <div
                    key={evt.id}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                      evt.level === 'CRITICAL'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500">{evt.timestamp}</span>
                      <span className="font-bold">{evt.siteName}</span>
                      <span>•</span>
                      <span>{evt.message}</span>
                    </div>
                    <span className="font-mono font-bold">{evt.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
