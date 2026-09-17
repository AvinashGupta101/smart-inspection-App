import {
  User,
  Site,
  Inspection,
  ChecklistItem,
  Issue,
  ActivityItem,
  ChecklistItemStatus,
  TelemetryReading,
} from '../types';
import { createInitialTelemetry } from './telemetry';

const STORAGE_KEYS = {
  USERS: 'smart_inspection_users',
  CURRENT_USER: 'smart_inspection_current_user',
  SITES: 'smart_inspection_sites',
  INSPECTIONS: 'smart_inspection_inspections',
  CHECKLISTS: 'smart_inspection_checklists',
  ISSUES: 'smart_inspection_issues',
  ACTIVITIES: 'smart_inspection_activities',
  TELEMETRY: 'smart_inspection_telemetry',
  VERSION: 'smart_inspection_version',
};

const CURRENT_VERSION = '1.0.1';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@smartinspect.io',
    role: 'ADMIN',
    organization: 'Apex Industrial Corp',
    phone: '+1 (555) 234-8901',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@smartinspect.io',
    role: 'INSPECTOR',
    organization: 'Apex Industrial Corp',
    phone: '+1 (555) 876-5432',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr-3',
    name: 'David Chen',
    email: 'david.chen@smartinspect.io',
    role: 'INSPECTOR',
    organization: 'Apex Industrial Corp',
    phone: '+1 (555) 345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@compliance-audit.org',
    role: 'VIEWER',
    organization: 'Global Audit Partners',
    phone: '+1 (555) 901-2345',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    siteId: 'SITE-101',
    name: 'Apex Refined Metals Plant 4',
    location: 'Pittsburgh, PA',
    address: '4200 Industry Parkway, Sector 3',
    manager: 'Robert Thorne',
    assignedInspectorId: 'usr-2',
    assignedInspectorName: 'Sarah Jenkins',
    startDate: '2023-03-15',
    expectedCompletionDate: '2027-12-31',
    description: 'Heavy smelting, molten alloy furnaces and CNC machining complex with high-voltage distribution.',
    status: 'Active',
    lastInspectionDate: '2026-09-10',
    complianceScore: 92,
  },
  {
    id: 'site-2',
    siteId: 'SITE-102',
    name: 'Harbor Crane Terminal B',
    location: 'Oakland, CA',
    address: '88 Berth Road, Pier 14 Docklands',
    manager: 'Maria Santos',
    assignedInspectorId: 'usr-3',
    assignedInspectorName: 'David Chen',
    startDate: '2022-08-01',
    expectedCompletionDate: '2028-06-30',
    description: 'Intermodal container logistics terminal with four 65-ton STS gantry cranes and automated guided vehicles.',
    status: 'Under Inspection',
    lastInspectionDate: '2026-09-14',
    complianceScore: 78,
  },
  {
    id: 'site-3',
    siteId: 'SITE-103',
    name: 'Metro Rail Tunnel Junction 7',
    location: 'Denver, CO',
    address: 'Subterranean Sector 7A, Milepost 18',
    manager: 'Kenneth Walsh',
    assignedInspectorId: 'usr-2',
    assignedInspectorName: 'Sarah Jenkins',
    startDate: '2024-01-10',
    expectedCompletionDate: '2026-11-20',
    description: 'Sub-surface transit rail expansion, high-pressure tunnel boring machines and ventilation shafts.',
    status: 'Critical Alert',
    lastInspectionDate: '2026-09-02',
    complianceScore: 64,
  },
  {
    id: 'site-4',
    siteId: 'SITE-104',
    name: 'Horizon Solar Substation Delta',
    location: 'Austin, TX',
    address: '1400 Sunridge Plateau, Highway 71',
    manager: 'Linda Zhang',
    assignedInspectorId: 'usr-3',
    assignedInspectorName: 'David Chen',
    startDate: '2023-11-01',
    expectedCompletionDate: '2029-05-01',
    description: '350MW utility-scale photovoltaic solar array, step-up transformers, and lithium iron phosphate BESS battery storage.',
    status: 'Active',
    lastInspectionDate: '2026-09-12',
    complianceScore: 98,
  },
];

export const STANDARD_CHECKLIST_TEMPLATES: Array<{
  category: 'Safety' | 'Electrical' | 'Equipment' | 'Environment';
  title: string;
  description: string;
}> = [
  // Safety
  { category: 'Safety', title: 'PPE available & verified', description: 'Hard hats, high-vis vests, steel-toe boots and eye protection properly worn.' },
  { category: 'Safety', title: 'Emergency exits accessible', description: 'All egress routes, emergency fire doors and panic bars clear of obstructions.' },
  { category: 'Safety', title: 'Fire extinguisher available', description: 'Class ABC extinguishers properly charged, inspected tags within date, unblocked.' },
  { category: 'Safety', title: 'Safety signs installed', description: 'Hazard warnings, arc flash, confined space and lockout/tagout plaques legible.' },
  { category: 'Safety', title: 'Work area safe', description: 'Slip/trip hazards eliminated, floor markings distinct, proper temporary railing.' },
  // Electrical
  { category: 'Electrical', title: 'Wiring properly insulated', description: 'Conduits, cable trays and flexible cords free from chafing or bare conductors.' },
  { category: 'Electrical', title: 'Distribution panel protected', description: 'Panel dead-front covers secured, 36-inch clearance maintained in front of boards.' },
  { category: 'Electrical', title: 'Earthing & grounding verified', description: 'Earth bonding straps continuity tested, resistance beneath 5 ohms.' },
  { category: 'Electrical', title: 'No exposed live wires', description: 'Terminal boxes sealed, cable glands fastened, no exposed busbars.' },
  { category: 'Electrical', title: 'Electrical equipment checked', description: 'Portable power tools PAT-tested, GFCI/RCD trip tests verified.' },
  // Equipment
  { category: 'Equipment', title: 'Equipment working within specs', description: 'Motors, hydraulics, pumps and transmissions operate without abnormal vibration.' },
  { category: 'Equipment', title: 'Maintenance record available', description: 'Log books signed, preventive maintenance schedule up to date.' },
  { category: 'Equipment', title: 'Emergency stop working', description: 'E-stop mushroom buttons, pull cords and interlocks physically tested.' },
  { category: 'Equipment', title: 'Safety guards installed', description: 'Belt, gear, nip point and blade guards firmly anchored in place.' },
  { category: 'Equipment', title: 'Equipment condition checked', description: 'Structural welds, hydraulic lines, fluid reservoirs and fasteners intact.' },
  // Environment
  { category: 'Environment', title: 'Waste disposal maintained', description: 'Industrial and hazardous chemical waste sorted in labelled secondary containers.' },
  { category: 'Environment', title: 'No major leakage', description: 'Pumps, pipelines, valves and sumps clean with zero oil/glycol seepage.' },
  { category: 'Environment', title: 'Work area clean', description: 'Housekeeping standards met, scrap materials cleared from walkways.' },
  { category: 'Environment', title: 'Environmental safety maintained', description: 'Spill kits fully stocked, runoff drains protected from sediment.' },
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1',
    inspectionId: 'INSP-2024-001',
    title: 'High-Voltage Electrical & Arc Flash Inspection',
    siteId: 'site-1',
    siteName: 'Apex Refined Metals Plant 4',
    inspectorId: 'usr-2',
    inspectorName: 'Sarah Jenkins',
    date: '2026-09-10',
    dueDate: '2026-09-18',
    type: 'Electrical Inspection',
    status: 'In Progress',
    priority: 'High',
    description: 'Quarterly arc flash boundary verification, infrared thermal scan of 13.8kV switchgear, and safety ground verification.',
    completionPercentage: 79,
  },
  {
    id: 'insp-2',
    inspectionId: 'INSP-2024-002',
    title: 'Heavy Gantry Crane Structural & Cable Inspection',
    siteId: 'site-2',
    siteName: 'Harbor Crane Terminal B',
    inspectorId: 'usr-3',
    inspectorName: 'David Chen',
    date: '2026-09-14',
    dueDate: '2026-09-15',
    type: 'Equipment Inspection',
    status: 'Completed',
    priority: 'Critical',
    description: 'Comprehensive non-destructive testing of main hoist wire ropes, spreader bar interlocks, and emergency brake calipers.',
    completionPercentage: 100,
    submittedAt: '2026-09-14T16:30:00Z',
    result: 'Pass',
    findingsSummary: 'All hoist cables within allowable wear tolerances. Emergency brakes tested under simulated full load.',
  },
  {
    id: 'insp-3',
    inspectionId: 'INSP-2024-003',
    title: 'Subterranean Ventilation & Tunnel Fire Safety',
    siteId: 'site-3',
    siteName: 'Metro Rail Tunnel Junction 7',
    inspectorId: 'usr-2',
    inspectorName: 'Sarah Jenkins',
    date: '2026-09-02',
    dueDate: '2026-09-09',
    type: 'Safety Inspection',
    status: 'Overdue',
    priority: 'Critical',
    description: 'Tunnel exhaust fan redundancy test, emergency oxygen refuges inspection, and deluge sprinkler pressure verification.',
    completionPercentage: 37,
  },
  {
    id: 'insp-4',
    inspectionId: 'INSP-2024-004',
    title: 'Routine Q3 Machinery & Pressure Vessel Audit',
    siteId: 'site-4',
    siteName: 'Horizon Solar Substation Delta',
    inspectorId: 'usr-3',
    inspectorName: 'David Chen',
    date: '2026-09-16',
    dueDate: '2026-09-24',
    type: 'Routine Inspection',
    status: 'Pending',
    priority: 'Medium',
    description: 'Scheduled audit of transformer nitrogen blanket pressure, SF6 gas levels, and battery rack seismic anchors.',
    completionPercentage: 0,
  },
];

export const INITIAL_CHECKLISTS: ChecklistItem[] = [
  // Items for INSP-1 (In Progress)
  ...STANDARD_CHECKLIST_TEMPLATES.map((item, index) => {
    let status: ChecklistItemStatus = 'Pass';
    let remarks = 'Inspected and verified to compliant standard.';
    let evidencePhotoUrl: string | undefined;

    if (index === 0) {
      remarks = 'All staff observed wearing NFPA 70E Arc-rated suit Category 4.';
      evidencePhotoUrl = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80';
    } else if (index === 5) {
      status = 'Fail';
      remarks = 'Conduit seal near sub-station B has weathered gasket exposing conductor insulation.';
      evidencePhotoUrl = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80';
    } else if (index > 14) {
      status = 'Pending';
      remarks = '';
    }

    return {
      id: `chk-1-${index + 1}`,
      inspectionId: 'insp-1',
      category: item.category,
      title: item.title,
      description: item.description,
      status,
      remarks,
      evidencePhotoUrl,
    };
  }),

  // Items for INSP-2 (Completed, all pass)
  ...STANDARD_CHECKLIST_TEMPLATES.map((item, index) => ({
    id: `chk-2-${index + 1}`,
    inspectionId: 'insp-2',
    category: item.category,
    title: item.title,
    description: item.description,
    status: (index === 7 ? 'Not Applicable' : 'Pass') as ChecklistItemStatus,
    remarks: index === 7 ? 'Not applicable for exterior gantry crane structure.' : 'Verified in compliance with OSHA 1910 standards.',
    evidencePhotoUrl: index === 10 ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' : undefined,
  })),

  // Items for INSP-3 (Overdue, partially filled)
  ...STANDARD_CHECKLIST_TEMPLATES.map((item, index) => {
    let status: ChecklistItemStatus = 'Pending';
    let remarks = '';
    if (index < 7) {
      status = index === 1 ? 'Fail' : 'Pass';
      remarks = index === 1 ? 'Emergency exit shaft 3 blocked by hydraulic slurry equipment.' : 'Checked and verified.';
    }
    return {
      id: `chk-3-${index + 1}`,
      inspectionId: 'insp-3',
      category: item.category,
      title: item.title,
      description: item.description,
      status,
      remarks,
      evidencePhotoUrl: index === 1 ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80' : undefined,
    };
  }),

  // Items for INSP-4 (Pending, all pending)
  ...STANDARD_CHECKLIST_TEMPLATES.map((item, index) => ({
    id: `chk-4-${index + 1}`,
    inspectionId: 'insp-4',
    category: item.category,
    title: item.title,
    description: item.description,
    status: 'Pending' as ChecklistItemStatus,
    remarks: '',
  })),
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'iss-1',
    issueId: 'ISS-042',
    title: 'Exposed 480V conduit junction with missing gasket',
    description: 'During electrical inspection at Substation B, conduit seal fitting was found deteriorated, exposing inner wire harness to industrial dust and moisture.',
    siteId: 'site-1',
    siteName: 'Apex Refined Metals Plant 4',
    relatedInspectionId: 'insp-1',
    relatedInspectionTitle: 'High-Voltage Electrical & Arc Flash Inspection',
    relatedChecklistItemId: 'chk-1-6',
    category: 'Electrical',
    priority: 'High',
    status: 'Open',
    assignedTo: 'usr-2',
    assignedToName: 'Sarah Jenkins',
    dueDate: '2026-09-20',
    createdAt: '2026-09-10T14:20:00Z',
    evidenceUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    evidenceName: 'conduit_junction_flaw.jpg',
    comments: [
      {
        id: 'comm-1',
        userId: 'usr-2',
        userName: 'Sarah Jenkins',
        role: 'INSPECTOR',
        text: 'Notified on-site maintenance supervisor. Replacement NEMA 4X gasket ordered.',
        createdAt: '2026-09-10T15:00:00Z',
      },
      {
        id: 'comm-2',
        userId: 'usr-1',
        userName: 'Marcus Vance',
        role: 'ADMIN',
        text: 'Approved emergency work order #8841. Ensure line is locked out before installation.',
        createdAt: '2026-09-11T09:15:00Z',
      },
    ],
  },
  {
    id: 'iss-2',
    issueId: 'ISS-043',
    title: 'Emergency exit hallway partially obstructed by pallets',
    description: 'Shaft 3 egress tunnel had three wooden pallets of surplus slurry pipes blocking 60% of minimum required corridor width.',
    siteId: 'site-3',
    siteName: 'Metro Rail Tunnel Junction 7',
    relatedInspectionId: 'insp-3',
    relatedInspectionTitle: 'Subterranean Ventilation & Tunnel Fire Safety',
    relatedChecklistItemId: 'chk-3-2',
    category: 'Safety',
    priority: 'Critical',
    status: 'In Progress',
    assignedTo: 'usr-2',
    assignedToName: 'Sarah Jenkins',
    dueDate: '2026-09-12',
    createdAt: '2026-09-02T11:45:00Z',
    evidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80',
    evidenceName: 'exit_obstruction.jpg',
    comments: [
      {
        id: 'comm-3',
        userId: 'usr-2',
        userName: 'Sarah Jenkins',
        role: 'INSPECTOR',
        text: 'Issued immediate cease-work order in quadrant 7 until pathway is completely cleared.',
        createdAt: '2026-09-02T12:00:00Z',
      },
    ],
  },
  {
    id: 'iss-3',
    issueId: 'ISS-044',
    title: 'Hydraulic fluid seepage near primary pump assembly',
    description: 'Minor continuous drip observed on main return manifold. Pressure loss not yet detected, but slip hazard and environmental breach risk present.',
    siteId: 'site-2',
    siteName: 'Harbor Crane Terminal B',
    category: 'Equipment',
    priority: 'Critical',
    status: 'Open',
    assignedTo: 'usr-3',
    assignedToName: 'David Chen',
    dueDate: '2026-09-19',
    createdAt: '2026-09-13T16:10:00Z',
    evidenceUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    evidenceName: 'pump_fluid_seep.jpg',
    comments: [],
  },
  {
    id: 'iss-4',
    issueId: 'ISS-045',
    title: 'Ground bonding strap corroded on substation tower 2',
    description: 'Copper braid ground conductor showed green oxide degradation with 12 ohm earth resistance measurement.',
    siteId: 'site-4',
    siteName: 'Horizon Solar Substation Delta',
    category: 'Electrical',
    priority: 'High',
    status: 'Resolved',
    assignedTo: 'usr-3',
    assignedToName: 'David Chen',
    dueDate: '2026-09-15',
    createdAt: '2026-09-08T10:00:00Z',
    resolvedAt: '2026-09-14T14:30:00Z',
    evidenceUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    evidenceName: 'ground_strap_repaired.jpg',
    comments: [
      {
        id: 'comm-4',
        userId: 'usr-3',
        userName: 'David Chen',
        role: 'INSPECTOR',
        text: 'Replaced with 4/0 AWG tinned copper strap and exothermic weld. Resistance measured 0.8 ohms.',
        createdAt: '2026-09-14T14:25:00Z',
      },
    ],
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'inspection',
    title: 'Inspection Completed',
    description: 'David Chen marked INSP-2024-002 as Passed (100% completed).',
    timestamp: '2026-09-14T16:30:00Z',
    userId: 'usr-3',
    userName: 'David Chen',
    severity: 'success',
  },
  {
    id: 'act-2',
    type: 'issue',
    title: 'Issue Resolved',
    description: 'ISS-045 Ground bonding strap was repaired and certified.',
    timestamp: '2026-09-14T14:30:00Z',
    userId: 'usr-3',
    userName: 'David Chen',
    severity: 'success',
  },
  {
    id: 'act-3',
    type: 'issue',
    title: 'Critical Issue Logged',
    description: 'ISS-044 Hydraulic fluid seepage created at Harbor Crane Terminal B.',
    timestamp: '2026-09-13T16:10:00Z',
    userId: 'usr-3',
    userName: 'David Chen',
    severity: 'critical',
  },
  {
    id: 'act-4',
    type: 'site',
    title: 'Critical Alert on Site',
    description: 'Site Metro Rail Tunnel Junction 7 status shifted to Critical Alert.',
    timestamp: '2026-09-11T09:00:00Z',
    userId: 'usr-1',
    userName: 'Marcus Vance',
    severity: 'warning',
  },
  {
    id: 'act-5',
    type: 'checklist',
    title: 'Checklist Item Failed',
    description: 'Conduit seal failed on High-Voltage Electrical Inspection.',
    timestamp: '2026-09-10T14:20:00Z',
    userId: 'usr-2',
    userName: 'Sarah Jenkins',
    severity: 'warning',
  },
];

// Helper to broadcast custom state updates
function notifyChange() {
  window.dispatchEvent(new Event('smart_inspection_storage_update'));
}

export const StorageService = {
  init() {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.VERSION);
      if (version !== CURRENT_VERSION) {
        this.resetAll();
        return;
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SITES)) {
        localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(INITIAL_SITES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) {
        localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(INITIAL_INSPECTIONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CHECKLISTS)) {
        localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(INITIAL_CHECKLISTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
        localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      }
    } catch (e) {
      console.error('Failed to initialize local storage:', e);
    }
  },

  resetAll() {
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(INITIAL_SITES));
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(INITIAL_INSPECTIONS));
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(INITIAL_CHECKLISTS));
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    notifyChange();
  },

  // USERS
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },
  getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  },
  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    notifyChange();
  },
  addUser(user: User) {
    const list = this.getUsers();
    list.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    this.addActivity({
      type: 'system',
      title: 'New User Registered',
      description: `${user.name} (${user.role}) added to organization.`,
      severity: 'info',
    });
    notifyChange();
  },
  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyChange();
  },
  getChecklistItems(): ChecklistItem[] {
    return this.getChecklists();
  },
  resetDatabase(): void {
    this.resetAll();
  },
  getTelemetry(): Record<string, TelemetryReading> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TELEMETRY);
      return data ? JSON.parse(data) : createInitialTelemetry(this.getSites());
    } catch {
      return createInitialTelemetry(this.getSites());
    }
  },
  saveTelemetry(telem: Record<string, TelemetryReading>): void {
    localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(telem));
    notifyChange();
  },
  logActivity(
    title: string,
    description: string,
    userName?: string,
    siteId?: string,
    siteName?: string
  ): void {
    this.addActivity({
      type: 'system',
      title,
      description: siteName ? `[${siteName}] ${description}` : description,
      severity: 'info',
    });
  },

  // SITES
  getSites(): Site[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SITES);
      return data ? JSON.parse(data) : INITIAL_SITES;
    } catch {
      return INITIAL_SITES;
    }
  },
  saveSites(sites: Site[]) {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
    notifyChange();
  },
  addSite(site: Site) {
    const list = this.getSites();
    list.unshift(site);
    this.saveSites(list);
    this.addActivity({
      type: 'site',
      title: 'Site Added',
      description: `New industrial site ${site.name} (${site.siteId}) registered.`,
      severity: 'info',
    });
  },
  updateSite(updated: Site) {
    const list = this.getSites().map(s => (s.id === updated.id ? updated : s));
    this.saveSites(list);
    this.addActivity({
      type: 'site',
      title: 'Site Updated',
      description: `Site ${updated.name} details and status updated.`,
      severity: 'info',
    });
  },
  deleteSite(siteId: string) {
    const site = this.getSites().find(s => s.id === siteId);
    const list = this.getSites().filter(s => s.id !== siteId);
    this.saveSites(list);
    if (site) {
      this.addActivity({
        type: 'site',
        title: 'Site Removed',
        description: `Site ${site.name} removed from registry.`,
        severity: 'warning',
      });
    }
  },

  // INSPECTIONS
  getInspections(): Inspection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      return data ? JSON.parse(data) : INITIAL_INSPECTIONS;
    } catch {
      return INITIAL_INSPECTIONS;
    }
  },
  saveInspections(inspections: Inspection[]) {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
    notifyChange();
  },
  addInspection(inspection: Inspection): Inspection {
    const list = this.getInspections();
    list.unshift(inspection);
    this.saveInspections(list);

    // Also instantiate template checklists for this inspection
    const newChecklistItems: ChecklistItem[] = STANDARD_CHECKLIST_TEMPLATES.map((tmpl, idx) => ({
      id: `chk-${inspection.id}-${idx + 1}-${Date.now()}`,
      inspectionId: inspection.id,
      category: tmpl.category,
      title: tmpl.title,
      description: tmpl.description,
      status: 'Pending',
      remarks: '',
    }));
    const allChecklists = this.getChecklists();
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify([...allChecklists, ...newChecklistItems]));

    this.addActivity({
      type: 'inspection',
      title: 'Inspection Scheduled',
      description: `${inspection.title} (${inspection.inspectionId}) assigned to ${inspection.inspectorName}.`,
      severity: 'info',
    });
    return inspection;
  },
  updateInspection(updated: Inspection) {
    const list = this.getInspections().map(i => (i.id === updated.id ? updated : i));
    this.saveInspections(list);
  },
  deleteInspection(id: string) {
    const inspection = this.getInspections().find(i => i.id === id);
    const list = this.getInspections().filter(i => i.id !== id);
    this.saveInspections(list);
    const allChecklists = this.getChecklists().filter(c => c.inspectionId !== id);
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(allChecklists));
    if (inspection) {
      this.addActivity({
        type: 'inspection',
        title: 'Inspection Deleted',
        description: `Inspection ${inspection.inspectionId} for ${inspection.siteName} removed.`,
        severity: 'warning',
      });
    }
    notifyChange();
  },

  // CHECKLISTS
  getChecklists(): ChecklistItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      return data ? JSON.parse(data) : INITIAL_CHECKLISTS;
    } catch {
      return INITIAL_CHECKLISTS;
    }
  },
  getChecklistForInspection(inspectionId: string): ChecklistItem[] {
    return this.getChecklists().filter(c => c.inspectionId === inspectionId);
  },
  saveChecklistItems(items: ChecklistItem[]) {
    const all = this.getChecklists();
    const updatedMap = new Map(items.map(it => [it.id, it]));
    const newAll = all.map(it => (updatedMap.has(it.id) ? updatedMap.get(it.id)! : it));
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(newAll));
    notifyChange();
  },
  updateChecklistItem(item: ChecklistItem) {
    const all = this.getChecklists();
    const idx = all.findIndex(c => c.id === item.id);
    if (idx !== -1) {
      all[idx] = item;
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(all));
      notifyChange();
    }
  },

  // ISSUES
  getIssues(): Issue[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
      return data ? JSON.parse(data) : INITIAL_ISSUES;
    } catch {
      return INITIAL_ISSUES;
    }
  },
  saveIssues(issues: Issue[]) {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    notifyChange();
  },
  addIssue(issue: Issue) {
    const list = this.getIssues();
    list.unshift(issue);
    this.saveIssues(list);
    this.addActivity({
      type: 'issue',
      title: 'Issue Created',
      description: `${issue.issueId} (${issue.title}) marked as ${issue.priority} priority.`,
      severity: issue.priority === 'Critical' ? 'critical' : 'warning',
    });
  },
  updateIssue(updated: Issue) {
    const list = this.getIssues().map(i => (i.id === updated.id ? updated : i));
    this.saveIssues(list);
  },
  deleteIssue(id: string) {
    const issue = this.getIssues().find(i => i.id === id);
    const list = this.getIssues().filter(i => i.id !== id);
    this.saveIssues(list);
    if (issue) {
      this.addActivity({
        type: 'issue',
        title: 'Issue Deleted',
        description: `Issue ${issue.issueId} (${issue.title}) deleted.`,
        severity: 'info',
      });
    }
  },

  // ACTIVITIES
  getActivities(): ActivityItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },
  addActivity(item: Omit<ActivityItem, 'id' | 'timestamp' | 'userId' | 'userName'>) {
    const current = this.getCurrentUser();
    const fullItem: ActivityItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: current.id,
      userName: current.name,
    };
    const list = this.getActivities();
    list.unshift(fullItem);
    if (list.length > 50) list.pop();
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));
    notifyChange();
  },

  // BACKUP & RESTORE
  exportBackupJSON(): string {
    const payload = {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      users: this.getUsers(),
      sites: this.getSites(),
      inspections: this.getInspections(),
      checklists: this.getChecklists(),
      issues: this.getIssues(),
      activities: this.getActivities(),
    };
    return JSON.stringify(payload, null, 2);
  },
  importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.sites || !data.inspections || !data.issues) {
        throw new Error('Invalid backup schema');
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users || INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(data.sites));
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(data.inspections));
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(data.checklists || []));
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(data.issues));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities || []));
      notifyChange();
      return true;
    } catch (e) {
      console.error('Import backup failed:', e);
      return false;
    }
  },
};
