import { TelemetryReading, Site } from '../types';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  siteName: string;
  parameter: string;
  value: string | number;
  level: 'NORMAL' | 'WARN' | 'CRITICAL';
  message: string;
}

// Generates live fluctuating telemetry readings for active sites
export function createInitialTelemetry(sites: Site[]): Record<string, TelemetryReading> {
  const map: Record<string, TelemetryReading> = {};
  sites.forEach((site, index) => {
    const isWarn = site.status === 'Critical Alert';
    map[site.id] = {
      siteId: site.id,
      siteName: site.name,
      temperature: isWarn ? 42.8 : 24.5 + (index * 2.2),
      humidity: 52 + (index * 3),
      vibration: isWarn ? 5.8 : 1.2 + (index * 0.4),
      noise: isWarn ? 88.4 : 64.2 + (index * 3),
      gasPpm: isWarn ? 24.5 : 8.1 + (index * 2),
      equipmentRunning: site.status !== 'Inactive',
      emergencyStopArmed: true,
      alerts: isWarn ? ['Vibration exceeds ISO 10816 threshold', 'Ambient temperature +14% above baseline'] : [],
      lastUpdated: new Date().toLocaleTimeString(),
    };
  });
  return map;
}

// Tick function that simulates realistic sensor drift and triggerable spikes
export function tickTelemetry(
  prev: Record<string, TelemetryReading>,
  sites: Site[]
): { readings: Record<string, TelemetryReading>; newEvents: TelemetryEvent[] } {
  const updated: Record<string, TelemetryReading> = {};
  const newEvents: TelemetryEvent[] = [];

  sites.forEach(site => {
    const current = prev[site.id] || {
      siteId: site.id,
      siteName: site.name,
      temperature: 25.0,
      humidity: 50.0,
      vibration: 1.5,
      noise: 65.0,
      gasPpm: 10.0,
      equipmentRunning: true,
      emergencyStopArmed: true,
      alerts: [],
      lastUpdated: new Date().toLocaleTimeString(),
    };

    // Realistic random walk with dampening
    const tempDelta = (Math.random() - 0.49) * 0.4;
    const humDelta = (Math.random() - 0.49) * 0.6;
    const vibDelta = (Math.random() - 0.49) * 0.15;
    const noiseDelta = (Math.random() - 0.49) * 1.2;
    const gasDelta = (Math.random() - 0.49) * 0.3;

    let newTemp = Math.round((current.temperature + tempDelta) * 10) / 10;
    let newHum = Math.round(Math.min(95, Math.max(20, current.humidity + humDelta)) * 10) / 10;
    let newVib = Math.round(Math.max(0.2, current.vibration + vibDelta) * 100) / 100;
    let newNoise = Math.round(Math.min(110, Math.max(40, current.noise + noiseDelta)) * 10) / 10;
    let newGas = Math.round(Math.max(2, current.gasPpm + gasDelta) * 10) / 10;

    const alerts: string[] = [];
    if (newTemp > 40) alerts.push('Thermal warning: Temperature > 40°C');
    if (newVib > 4.5) alerts.push('Vibration anomaly: > 4.5 mm/s');
    if (newNoise > 85) alerts.push('Hearing protection threshold exceeded (>85 dB)');
    if (newGas > 20) alerts.push('VOC air contamination: > 20 ppm');

    if (alerts.length > 0 && Math.random() < 0.1) {
      newEvents.push({
        id: `telem-evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: new Date().toLocaleTimeString(),
        siteName: site.name,
        parameter: newTemp > 40 ? 'Temperature' : 'Vibration',
        value: newTemp > 40 ? `${newTemp}°C` : `${newVib} mm/s`,
        level: newTemp > 45 || newVib > 6 ? 'CRITICAL' : 'WARN',
        message: alerts[0],
      });
    }

    updated[site.id] = {
      ...current,
      temperature: newTemp,
      humidity: newHum,
      vibration: newVib,
      noise: newNoise,
      gasPpm: newGas,
      alerts,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  });

  return { readings: updated, newEvents };
}

export function generateAnomalyEvent(
  siteId: string,
  siteName: string
): { updatedTelemetry: TelemetryReading; event: TelemetryEvent } {
  const reading: TelemetryReading = {
    siteId,
    siteName,
    temperature: 46.2,
    humidity: 58.0,
    vibration: 6.4,
    noise: 92.5,
    gasPpm: 24.0,
    equipmentRunning: true,
    emergencyStopArmed: true,
    alerts: [
      'MANUAL TEST INJECTION: Severe vibration spike (6.4 mm/s)',
      'MANUAL TEST INJECTION: Thermal overload detected (46.2°C)',
    ],
    lastUpdated: new Date().toLocaleTimeString(),
  };

  const event: TelemetryEvent = {
    id: `anomaly-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    siteName,
    parameter: 'Vibration & Thermal',
    value: '6.4 mm/s / 46.2°C',
    level: 'CRITICAL',
    message: 'Manual diagnostic anomaly injected. Immediate safety interlock check required.',
  };

  return { updatedTelemetry: reading, event };
}
