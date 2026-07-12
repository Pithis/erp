/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceType = 'Event Management' | 'Photography' | 'Editing' | 'Digital Marketing' | 'Web Development';

export type UserRole = 'HR Staff' | 'Operations Staff' | 'Creative/Technical Staff' | 'Stakeholder';

export type EmployeeRole = 'Photographer' | 'Editor' | 'Digital Marketer' | 'Web Developer' | 'HR Specialist' | 'Operations Manager';

export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed';

export type TaskStatus = 'Assigned' | 'In Progress' | 'Pending Review' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type InventoryItemStatus = 'Available' | 'Checked Out' | 'Maintenance';

export type PayrollStatus = 'Pending' | 'Approved' | 'Paid';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  email: string;
  baseSalary: number;
  isFreelancer: boolean;
  status: 'Active' | 'Onboarding';
  joinedDate: string;
}

export interface Project {
  id: string;
  name: string;
  serviceType: ServiceType;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  clientName: string;
  budget: number;
  completionPercentage: number;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  assignedTo: string; // Employee ID
  assignedName: string; // Employee Name
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  deliverables?: {
    link?: string;
    notes?: string;
    fileName?: string;
  };
  submissionDate?: string;
  reviewerNotes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Camera' | 'Lighting' | 'Audio' | 'Decor' | 'Workstation';
  status: InventoryItemStatus;
  checkedOutTo?: string; // Employee ID
  checkedOutName?: string; // Employee Name
  checkedOutDate?: string;
  checkedOutFor?: string; // Project ID
  projectName?: string;
  serialNumber: string;
}

export interface ScheduleEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'Shoot' | 'Editing' | 'Sprint' | 'Meeting' | 'Client Event';
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  month: string; // e.g. "July 2026"
  basePay: number;
  bonus: number;
  deduction: number;
  status: PayrollStatus;
  completedTasksCount: number;
  bonusReason?: string;
}

export interface Notification {
  id: string;
  type: 'System' | 'PriorityAlert';
  title: string;
  message: string;
  timestamp: string; // ISO string
  projectName?: string;
  sender: string;
  isRead: boolean;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  ipAddress: string;
  gpsLocation: string;
  status: 'On Time' | 'Late' | 'Regularized' | 'Pending Regularization';
  isApproved: boolean;
  overtimeHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Annual Leave' | 'Maternity/Paternity' | 'Comp-Off';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Declined';
  requestedAt: string;
}

export interface HelpDeskTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  category: 'Payroll Query' | 'IT Support' | 'Equipment' | 'Leaves & Benefits' | 'Complaint';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  slaDeadline: string;
  createdAt: string;
}

export interface PerformanceAppraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  okrGoal: string;
  kpiScore: number;
  selfAppraisal: string;
  managerAppraisal: string;
  peerFeedback: string;
  competencyAssessment: string;
}

export interface EmployeeDetails {
  employeeId: string;
  personalPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  skills: string[];
  certifications: string[];
  department: string;
  jobTitle: string;
  reportsTo: string;
  customFields: Array<{ name: string; value: string }>;
  offboardingChecklist?: {
    exitInterviewDone: boolean;
    assetsReturned: boolean;
    accessRevoked: boolean;
    clearanceApproved: boolean;
    exitDate?: string;
  };
}

export interface EngagementPoll {
  question: string;
  options: Array<{ text: string; votes: number }>;
  userVotedIndex?: number;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

