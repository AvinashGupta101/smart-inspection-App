export type UserRole = 'ADMIN' | 'INSPECTOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
  phone?: string;
  active: boolean;
  firebaseUid?: string;
}

export type SiteStatus = 'Active' | 'Inactive' | 'Under Inspection' | 'Completed' | 'Critical Alert';

export interface Site {
  id: string;
  siteId: string;
  name: string;
  location: string;
  address: string;
  manager: string;
  assignedInspectorId: string;
  assignedInspectorName: string;
  startDate: string;
  expectedCompletionDate: string;
  description: string;
  status: SiteStatus;
  lastInspectionDate?: string;
  complianceScore?: number; // 0 - 100
}

export type InspectionType =
  | 'Safety Inspection'
  | 'Electrical Inspection'
  | 'Equipment Inspection'
  | 'Construction Inspection'
  | 'Quality Inspection'
  | 'Environmental Inspection'
  | 'Routine Inspection';

export type InspectionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ChecklistItemStatus = 'Pass' | 'Fail' | 'Not Applicable' | 'Pending';

export interface ChecklistItem {
  id: string;
  inspectionId: string;
  category: 'Safety' | 'Electrical' | 'Equipment' | 'Environment';
  title: string;
  description: string;
  status: ChecklistItemStatus;
  remarks: string;
  evidencePhotoUrl?: string;
  evidencePhotoName?: string;
}

export interface Inspection {
  id: string;
  inspectionId: string;
  title: string;
  siteId: string;
  siteName: string;
  inspectorId: string;
  inspectorName: string;
  date: string;
  dueDate: string;
  type: InspectionType;
  status: InspectionStatus;
  priority: PriorityLevel;
  description: string;
  completionPercentage: number;
  submittedAt?: string;
  result?: 'Pass' | 'Conditional Pass' | 'Fail';
  findingsSummary?: string;
}

export type IssueCategory =
  | 'Safety'
  | 'Electrical'
  | 'Equipment'
  | 'Construction'
  | 'Quality'
  | 'Environment'
  | 'Other';

export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface IssueComment {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  text: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  issueId: string;
  title: string;
  description: string;
  siteId: string;
  siteName: string;
  relatedInspectionId?: string;
  relatedInspectionTitle?: string;
  relatedChecklistItemId?: string;
  category: IssueCategory;
  priority: PriorityLevel;
  status: IssueStatus;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
  evidenceUrl?: string;
  evidenceName?: string;
  comments: IssueComment[];
}

export interface ActivityItem {
  id: string;
  type: 'site' | 'inspection' | 'issue' | 'checklist' | 'system';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface TelemetryReading {
  siteId: string;
  siteName: string;
  temperature: number; // Celsius
  humidity: number; // %
  vibration: number; // mm/s
  noise: number; // dB
  gasPpm: number; // ppm
  equipmentRunning: boolean;
  emergencyStopArmed: boolean;
  alerts: string[];
  lastUpdated: string;
}

export type ReportType =
  | 'Daily Inspection Report'
  | 'Weekly Inspection Report'
  | 'Monthly Inspection Report'
  | 'Site Compliance Report'
  | 'Issue Summary Report';

export interface ReportFilter {
  type: ReportType;
  siteId: string;
  inspectorId: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
}

export type AppTab =
  | 'dashboard'
  | 'sites'
  | 'inspections'
  | 'issues'
  | 'reports'
  | 'monitoring'
  | 'users'
  | 'settings'
  | 'profile';

export type NavTab = AppTab;
export type ActivityLog = ActivityItem;
export type IssuePriority = PriorityLevel;
