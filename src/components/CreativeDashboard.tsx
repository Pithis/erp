/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Task, 
  Employee, 
  InventoryItem, 
  ScheduleEntry, 
  AttendanceLog, 
  LeaveRequest, 
  HelpDeskTicket, 
  PerformanceAppraisal, 
  EmployeeDetails, 
  EngagementPoll, 
  ForumPost 
} from '../types';
import { 
  CheckSquare, 
  Upload, 
  Briefcase, 
  Camera, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  Send, 
  User, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  HeartHandshake, 
  FileDown, 
  HelpCircle, 
  Award, 
  AlertCircle, 
  CalendarRange, 
  ThumbsUp, 
  Users, 
  Cpu, 
  Check, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface CreativeDashboardProps {
  employees: Employee[];
  tasks: Task[];
  inventory: InventoryItem[];
  schedules: ScheduleEntry[];
  updateTaskStatus: (id: string, status: Task['status'], payload?: any) => void;
  attendanceLogs: AttendanceLog[];
  addAttendanceLog: (log: AttendanceLog) => void;
  updateAttendanceLog: (log: AttendanceLog) => void;
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (req: LeaveRequest) => void;
  helpDeskTickets: HelpDeskTicket[];
  addHelpDeskTicket: (ticket: HelpDeskTicket) => void;
  appraisals: PerformanceAppraisal[];
  employeeDetails: EmployeeDetails[];
  updateEmployeeDetails: (details: EmployeeDetails) => void;
  engagementPoll: EngagementPoll;
  castVote: (optionIndex: number) => void;
  forumPosts: ForumPost[];
  addForumPost: (content: string, authorName: string, authorRole: string) => void;
  defaultStaffId?: string;
}

export default function CreativeDashboard({
  employees,
  tasks,
  inventory,
  schedules,
  updateTaskStatus,
  attendanceLogs,
  addAttendanceLog,
  updateAttendanceLog,
  leaveRequests,
  addLeaveRequest,
  helpDeskTickets,
  addHelpDeskTicket,
  appraisals,
  employeeDetails,
  updateEmployeeDetails,
  engagementPoll,
  castVote,
  forumPosts,
  addForumPost,
  defaultStaffId
}: CreativeDashboardProps) {
  const activeStaffId = defaultStaffId || 'E01';


  // Inner Dashboard Navigation Tabs
  const [innerTab, setInnerTab] = useState<'tasks' | 'ess' | 'dossier' | 'engagement'>('tasks');

  // Deliverables submission state
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Timesheet state
  const [timesheetHours, setTimesheetHours] = useState('');
  const [timesheetNotes, setTimesheetNotes] = useState('');
  const [timesheetProject, setTimesheetProject] = useState('P01');
  const [localTimesheetLogs, setLocalTimesheetLogs] = useState<Array<{ id: string, project: string, hours: number, notes: string, date: string }>>([
    { id: 'TS01', project: 'Apex Global Summit 2026', hours: 8, notes: 'Stage photography and raw backup', date: '2026-07-11' },
    { id: 'TS02', project: 'Bespoke Furniture E-Store', hours: 6.5, notes: 'Integrated stripe mock trigger with schema keys', date: '2026-07-10' }
  ]);

  // Leave Form State
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Sick Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Help Desk Ticket Form State
  const [ticketCategory, setTicketCategory] = useState<HelpDeskTicket['category']>('IT Support');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState<HelpDeskTicket['priority']>('Medium');

  // Emergency Contact Form State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Forum state
  const [forumContent, setForumContent] = useState('');

  // Payslip simulation modal state
  const [activePayslipId, setActivePayslipId] = useState<string | null>(null);

  // Derived states
  const activeStaff = employees.find(e => e.id === activeStaffId);
  const activeStaffDetails = employeeDetails.find(d => d.employeeId === activeStaffId) || {
    employeeId: activeStaffId,
    personalPhone: '+1 (555) 100-2000',
    emergencyContactName: 'Next of Kin',
    emergencyContactPhone: '+1 (555) 100-3000',
    skills: ['Photography', 'Lighting Design', 'Editing'],
    certifications: ['Creative Arts Certificate'],
    department: 'Media Production',
    jobTitle: activeStaff?.role || 'Creative Specialist',
    reportsTo: 'Operations Manager',
    customFields: []
  };

  const staffTasks = tasks.filter(t => t.assignedTo === activeStaffId);
  const checkedOutGear = inventory.filter(i => i.checkedOutTo === activeStaffId);
  const personalSchedules = schedules.filter(s => s.employeeId === activeStaffId);
  const personalAttendance = attendanceLogs.filter(a => a.employeeId === activeStaffId);
  const personalLeaves = leaveRequests.filter(l => l.employeeId === activeStaffId);
  const personalTickets = helpDeskTickets.filter(t => t.employeeId === activeStaffId);
  const personalAppraisal = appraisals.find(a => a.employeeId === activeStaffId);

  // Checking current attendance status for the simulated employee today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAttendance = personalAttendance.find(a => a.date === todayDateStr);

  // Handle Check-In
  const handleCheckIn = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    // Determine status (Late if after 09:00)
    const [hours, minutes] = timeStr.split(':').map(Number);
    const isLate = hours > 9 || (hours === 9 && minutes > 0);

    const newLog: AttendanceLog = {
      id: `ATT-${Date.now()}`,
      employeeId: activeStaffId,
      employeeName: activeStaff?.name || 'Staff Member',
      checkInTime: timeStr,
      date: todayDateStr,
      ipAddress: '192.168.1.182 (Web Browser Proxy)',
      gpsLocation: 'Lat: 34.0583, Long: -118.2415 (Simulated GPS Office)',
      status: isLate ? 'Late' : 'On Time',
      isApproved: false
    };

    addAttendanceLog(newLog);
  };

  // Handle Check-Out
  const handleCheckOut = () => {
    if (!todayAttendance) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Calculate simulated overtime hours if checkout is after 18:00
    const [hours, minutes] = timeStr.split(':').map(Number);
    let overtime = 0;
    if (hours >= 18) {
      overtime = (hours - 18) + (minutes / 60);
      overtime = Math.round(overtime * 10) / 10;
    }

    updateAttendanceLog({
      ...todayAttendance,
      checkOutTime: timeStr,
      overtimeHours: overtime > 0 ? overtime : undefined,
      isApproved: true // auto approved standard checkout
    });
  };

  // Handle Leave Apply
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return;

    const newReq: LeaveRequest = {
      id: `LV-${Date.now()}`,
      employeeId: activeStaffId,
      employeeName: activeStaff?.name || 'Staff Member',
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: 'Pending',
      requestedAt: todayDateStr
    };

    addLeaveRequest(newReq);
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
  };

  // Handle Help Ticket Submit
  const handleAddTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDescription) return;

    const slaDeadlineDate = new Date();
    slaDeadlineDate.setDate(slaDeadlineDate.getDate() + 3); // 3 days SLA

    const newTicket: HelpDeskTicket = {
      id: `TKT-${Date.now()}`,
      employeeId: activeStaffId,
      employeeName: activeStaff?.name || 'Staff Member',
      category: ticketCategory,
      title: ticketTitle,
      description: ticketDescription,
      priority: ticketPriority,
      status: 'Open',
      slaDeadline: slaDeadlineDate.toISOString().split('T')[0],
      createdAt: todayDateStr
    };

    addHelpDeskTicket(newTicket);
    setTicketTitle('');
    setTicketDescription('');
  };

  // Handle Emergency Contact Save
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployeeDetails({
      ...activeStaffDetails,
      emergencyContactName: emergencyName || activeStaffDetails.emergencyContactName,
      emergencyContactPhone: emergencyPhone || activeStaffDetails.emergencyContactPhone
    });
    setIsEditingContact(false);
  };

  // Handle Forum Post Submit
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumContent) return;
    addForumPost(forumContent, activeStaff?.name || 'Staff Member', activeStaff?.role || 'Editor');
    setForumContent('');
  };

  // Handle Deliverable Submit
  const handleDeliverableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTaskId) return;

    updateTaskStatus(submittingTaskId, 'Pending Review', {
      link: submissionLink || undefined,
      fileName: submissionFileName || undefined,
      notes: submissionNotes || undefined
    });

    setSubmittingTaskId(null);
    setSubmissionLink('');
    setSubmissionFileName('');
    setSubmissionNotes('');
  };

  // Add Timesheet Entry
  const handleAddTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timesheetHours || !timesheetNotes) return;

    const projName = timesheetProject === 'P01' ? 'Apex Global Summit 2026' : 'Bespoke Furniture E-Store';
    setLocalTimesheetLogs([
      {
        id: `TS-${Date.now()}`,
        project: projName,
        hours: Number(timesheetHours),
        notes: timesheetNotes,
        date: todayDateStr
      },
      ...localTimesheetLogs
    ]);

    setTimesheetHours('');
    setTimesheetNotes('');
  };

  // Simulated Leave Balances
  const totalLeaveBalances = {
    'Annual Leave': 15,
    'Casual Leave': 10,
    'Sick Leave': 8,
    'Maternity/Paternity': 30,
    'Comp-Off': 5
  };

  const approvedLeaveCount = (type: LeaveRequest['leaveType']) => {
    return personalLeaves
      .filter(l => l.leaveType === type && l.status === 'Approved')
      .reduce((acc, curr) => {
        const start = new Date(curr.startDate);
        const end = new Date(curr.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return acc + diffDays;
      }, 0);
  };

  return (
    <div className="space-y-6" id="creative-dashboard-root">
      {/* Profile Card */}
      <div className="bg-gray-950 text-white rounded-2xl p-5 border border-gray-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold border border-indigo-500">
            {activeStaff?.name.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Employee Self-Service (ESS) Dashboard</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="font-sans font-bold text-base leading-none">{activeStaff?.name}</h3>
              <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full font-medium">
                {activeStaff?.role}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] font-mono text-gray-450 uppercase tracking-wider hidden sm:block">
          Secure Email Session Active
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border border-gray-100 bg-gray-50 p-1.5 rounded-xl gap-2 text-xs font-semibold shadow-xs overflow-x-auto max-w-full whitespace-nowrap scrollbar-none" id="ess-inner-tabs">
        <button
          onClick={() => setInnerTab('tasks')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            innerTab === 'tasks' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          My Tasks & Timesheets
        </button>
        <button
          onClick={() => setInnerTab('ess')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            innerTab === 'ess' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Activity className="h-4 w-4" />
          Self-Service (Attendance & Leaves)
        </button>
        <button
          onClick={() => setInnerTab('dossier')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            innerTab === 'dossier' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <User className="h-4 w-4" />
          Dossier, Skills & Payslips
        </button>
        <button
          onClick={() => setInnerTab('engagement')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            innerTab === 'engagement' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          Hub Engagement & Polls
        </button>
      </div>

      {/* RENDER TASKS TAB */}
      {innerTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="tasks-panel">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white text-gray-950 rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
              <div>
                <h3 className="font-sans font-bold text-gray-950 text-sm">My Active Deliverables Task List</h3>
                <p className="text-xs text-gray-500">Track deadlines, transition work status, and submit direct code or visual links.</p>
              </div>

              <div className="space-y-4">
                {staffTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                    Excellent work! No deliverable tasks currently assigned to your account.
                  </div>
                ) : (
                  staffTasks.map((t) => (
                    <div key={t.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-mono text-indigo-600 uppercase tracking-wider">{t.projectName}</span>
                          <h4 className="font-sans font-bold text-xs text-gray-900 mt-0.5">{t.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                            t.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {t.priority}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'Pending Review' ? 'bg-amber-100 text-amber-800' :
                            t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-2">
                        <span>Deadline: <strong className="text-gray-700">{t.deadline}</strong></span>
                        {t.status === 'Assigned' && (
                          <button
                            onClick={() => updateTaskStatus(t.id, 'In Progress')}
                            className="px-2.5 py-1 bg-gray-950 hover:bg-gray-800 text-[10px] font-medium text-white rounded-md"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {(t.status === 'In Progress' || t.status === 'Assigned') && (
                          <button
                            onClick={() => setSubmittingTaskId(t.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-medium text-white rounded-md flex items-center gap-1"
                          >
                            <Upload className="h-3 w-3" />
                            Submit Deliverables
                          </button>
                        )}
                      </div>

                      {submittingTaskId === t.id && (
                        <form onSubmit={handleDeliverableSubmit} className="bg-white p-4 border border-indigo-100 rounded-xl mt-3 space-y-3" id={`deliverable-form-${t.id}`}>
                          <div className="text-[10px] font-mono text-indigo-700 uppercase tracking-wider font-semibold">
                            Submission Form & Review Metadata
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="sub-link" className="block text-[10px] font-medium text-gray-600 mb-1">Deliverable URL / Pull Request Link</label>
                              <input
                                id="sub-link"
                                type="url"
                                value={submissionLink}
                                onChange={(e) => setSubmissionLink(e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="sub-file" className="block text-[10px] font-medium text-gray-600 mb-1">Primary Deliverable File Name</label>
                              <input
                                id="sub-file"
                                type="text"
                                value={submissionFileName}
                                onChange={(e) => setSubmissionFileName(e.target.value)}
                                placeholder="e.g. index.tsx, promo.mp4"
                                className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="sub-notes" className="block text-[10px] font-medium text-gray-600 mb-1">Developer / Editor Commentary</label>
                            <textarea
                              id="sub-notes"
                              required
                              value={submissionNotes}
                              onChange={(e) => setSubmissionNotes(e.target.value)}
                              placeholder="Detail testing outcomes or color settings applied..."
                              className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 min-h-[50px]"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSubmittingTaskId(null)}
                              className="px-2.5 py-1.5 text-[10px] font-medium text-gray-500 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-medium text-white rounded-md flex items-center gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Submit for Approval Review
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Checked Out Physical Gear */}
            <div className="bg-white text-gray-950 p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-sans font-bold text-gray-950 text-sm flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-gray-900" />
                Assigned Gear Checkouts
              </h3>

              <div className="space-y-2">
                {checkedOutGear.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No inventory checkouts assigned to your profile currently.</p>
                ) : (
                  checkedOutGear.map((g) => (
                    <div key={g.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="font-sans font-semibold text-xs text-gray-900">{g.name}</div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                        <span>Serial: {g.serialNumber}</span>
                        <span>Checked: {g.checkedOutDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timesheet Logger Form */}
            <div className="bg-white text-gray-950 p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-sans font-bold text-gray-950 text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-900" />
                Timesheet Logger
              </h3>

              <form onSubmit={handleAddTimesheet} className="space-y-3" id="timesheet-form">
                <div>
                  <label htmlFor="ts-proj-select" className="block text-[10px] font-medium text-gray-600 mb-1">Deliverable Project Stream</label>
                  <select
                    id="ts-proj-select"
                    value={timesheetProject}
                    onChange={(e) => setTimesheetProject(e.target.value)}
                    className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="P01">Apex Global Summit 2026</option>
                    <option value="P03">Bespoke Furniture E-Store</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ts-hours-input" className="block text-[10px] font-medium text-gray-600 mb-1">Hours Logged</label>
                  <input
                    id="ts-hours-input"
                    type="number"
                    step="0.5"
                    required
                    value={timesheetHours}
                    onChange={(e) => setTimesheetHours(e.target.value)}
                    placeholder="e.g. 7.5"
                    className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="ts-notes-input" className="block text-[10px] font-medium text-gray-600 mb-1">Task Operations Description</label>
                  <input
                    id="ts-notes-input"
                    type="text"
                    required
                    value={timesheetNotes}
                    onChange={(e) => setTimesheetNotes(e.target.value)}
                    placeholder="Coding responsive sidebar views"
                    className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-gray-950 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  Log Timesheet Hours
                </button>
              </form>

              <div className="border-t border-gray-100 pt-3 space-y-2 max-h-[140px] overflow-y-auto">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Timesheet History</div>
                {localTimesheetLogs.map((log) => (
                  <div key={log.id} className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex justify-between font-sans font-semibold text-gray-900 text-[11px]">
                      <span className="truncate pr-1">{log.project}</span>
                      <span className="shrink-0 text-gray-500 font-mono">{log.hours}h</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate italic">"{log.notes}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER ESS TAB (ATTENDANCE & LEAVES & HELP TICKETS) */}
      {innerTab === 'ess' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-gray-950" id="ess-panel">
          {/* Attendance Section */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-gray-950 text-sm">Attendance Punch Portal</h3>
                  <p className="text-xs text-gray-500">Record web check-in/out with simulated GPS & IP location tracking.</p>
                </div>
                <Activity className="h-5 w-5 text-indigo-500 shrink-0" />
              </div>

              {/* Attendance Card Action */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Today's Date:</span>
                  <span className="text-xs font-mono font-bold text-gray-900">{todayDateStr}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span>Shift Hour Status:</span>
                  <span className="font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px]">9:00 AM - 6:00 PM</span>
                </div>

                {todayAttendance ? (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <strong>Checked In at:</strong> {todayAttendance.checkInTime} 
                        <span className="block text-[10px] text-emerald-700">Status: {todayAttendance.status}</span>
                      </div>
                    </div>
                    {todayAttendance.checkOutTime ? (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                        <div>
                          <strong>Checked Out at:</strong> {todayAttendance.checkOutTime}
                          {todayAttendance.overtimeHours && (
                            <span className="block text-[10px] text-blue-700">Calculated Overtime: +{todayAttendance.overtimeHours} hours</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckOut}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2"
                      >
                        Web Check-Out
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-4 w-4 animate-bounce" />
                    Secure Web Check-In
                  </button>
                )}

                <div className="text-[10px] text-gray-400 leading-snug border-t border-gray-100 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>IP Address:</span>
                    <span>192.168.1.182</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS Verification:</span>
                    <span className="truncate max-w-[140px]">Lat: 34.0583, Long: -118.2415</span>
                  </div>
                  <div className="text-center text-[9px] text-indigo-500 font-mono pt-1">
                    ✔ Face Verification, GPS Geofencing, & IP Active
                  </div>
                </div>
              </div>

              {/* Attendance Log history */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">My Log History</div>
                <div className="divide-y divide-gray-100 max-h-[140px] overflow-y-auto">
                  {personalAttendance.map((log) => (
                    <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-gray-900">{log.date}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          In: {log.checkInTime} | Out: {log.checkOutTime || '--'}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        log.status === 'On Time' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leave Section */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-gray-950 text-sm">Leave Portal & Balances</h3>
                  <p className="text-xs text-gray-500">Apply for sick, casual, or annual leaves and track approval status.</p>
                </div>
                <CalendarRange className="h-5 w-5 text-indigo-500 shrink-0" />
              </div>

              {/* Balance Grid */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                  <div className="text-gray-500 font-medium text-[10px]">Casual Leave</div>
                  <div className="text-lg font-bold text-amber-800 mt-1">
                    {totalLeaveBalances['Casual Leave'] - approvedLeaveCount('Casual Leave')} / {totalLeaveBalances['Casual Leave']} d
                  </div>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                  <div className="text-gray-500 font-medium text-[10px]">Sick Leave</div>
                  <div className="text-lg font-bold text-red-800 mt-1">
                    {totalLeaveBalances['Sick Leave'] - approvedLeaveCount('Sick Leave')} / {totalLeaveBalances['Sick Leave']} d
                  </div>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                  <div className="text-gray-500 font-medium text-[10px]">Annual Leave</div>
                  <div className="text-lg font-bold text-blue-800 mt-1">
                    {totalLeaveBalances['Annual Leave'] - approvedLeaveCount('Annual Leave')} / {totalLeaveBalances['Annual Leave']} d
                  </div>
                </div>
                <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                  <div className="text-gray-500 font-medium text-[10px]">Maternity/Paternity</div>
                  <div className="text-lg font-bold text-purple-800 mt-1">
                    {totalLeaveBalances['Maternity/Paternity'] - approvedLeaveCount('Maternity/Paternity')} / {totalLeaveBalances['Maternity/Paternity']} d
                  </div>
                </div>
              </div>

              {/* Apply Leave form */}
              <form onSubmit={handleApplyLeave} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100" id="apply-leave-form">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">Apply For Time-Off</div>
                
                <div>
                  <label htmlFor="leave-type" className="block text-[10px] font-medium text-gray-600 mb-1">Leave Category</label>
                  <select
                    id="leave-type"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Maternity/Paternity">Maternity/Paternity</option>
                    <option value="Comp-Off">Comp-Off (OT Exchange)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="leave-start" className="block text-[10px] font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      id="leave-start"
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="leave-end" className="block text-[10px] font-medium text-gray-600 mb-1">End Date</label>
                    <input
                      id="leave-end"
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="leave-reason" className="block text-[10px] font-medium text-gray-600 mb-1">Reason / Notes</label>
                  <input
                    id="leave-reason"
                    type="text"
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Brief description for HR approval..."
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-gray-950 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </form>

              {/* Leave History logs */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">My Requests</div>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {personalLeaves.length === 0 ? (
                    <div className="text-center text-[10px] text-gray-400">No leaves requested yet.</div>
                  ) : (
                    personalLeaves.map(l => (
                      <div key={l.id} className="text-xs p-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">{l.leaveType}</div>
                          <div className="text-[10px] text-gray-400">{l.startDate} to {l.endDate}</div>
                        </div>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          l.status === 'Declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HR Help Desk Portal */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-gray-950 text-sm">HR service tickets</h3>
                  <p className="text-xs text-gray-500">File complaints, payroll disputes, or equipment help tickets (SLA monitored).</p>
                </div>
                <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />
              </div>

              {/* Submit Ticket Form */}
              <form onSubmit={handleAddTicketSubmit} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100" id="raise-ticket-form">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">File Help Desk Ticket</div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="tkt-cat" className="block text-[10px] font-medium text-gray-600 mb-1">SLA Category</label>
                    <select
                      id="tkt-cat"
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as HelpDeskTicket['category'])}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="IT Support">IT Support</option>
                      <option value="Payroll Query">Payroll Query</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Leaves & Benefits">Leaves & Benefits</option>
                      <option value="Complaint">Complaint</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tkt-priority" className="block text-[10px] font-medium text-gray-600 mb-1">Severity</label>
                    <select
                      id="tkt-priority"
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as HelpDeskTicket['priority'])}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="tkt-title" className="block text-[10px] font-medium text-gray-600 mb-1">Ticket Subject</label>
                  <input
                    id="tkt-title"
                    type="text"
                    required
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    placeholder="e.g. Missing OT payout / Broken chair"
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="tkt-desc" className="block text-[10px] font-medium text-gray-600 mb-1">Detailed Description</label>
                  <textarea
                    id="tkt-desc"
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Specify descriptive details for faster service response..."
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white min-h-[50px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-gray-950 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  File Complaint Ticket
                </button>
              </form>

              {/* Tickets History logs */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">My Active Tickets</div>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {personalTickets.length === 0 ? (
                    <div className="text-center text-[10px] text-gray-400">No support tickets currently on file.</div>
                  ) : (
                    personalTickets.map(t => (
                      <div key={t.id} className="text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between font-bold text-gray-900 text-[11px]">
                          <span>[{t.category}] {t.title}</span>
                          <span className={`text-[9px] font-mono px-1 rounded ${
                            t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{t.description}</p>
                        <div className="flex justify-between items-center text-[9px] text-gray-400 mt-1.5 font-mono pt-1 border-t border-gray-200/50">
                          <span>Priority: {t.priority}</span>
                          <span>SLA Due: {t.slaDeadline}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DOSSIER & PAYROLL TAB */}
      {innerTab === 'dossier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-gray-950" id="dossier-panel">
          {/* Profile Details & Skills Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-gray-950 text-base">{activeStaffDetails.jobTitle}</h3>
                <p className="text-xs text-gray-500 font-mono">Dpt: {activeStaffDetails.department} | Reports: {activeStaffDetails.reportsTo}</p>
              </div>
            </div>

            {/* Skills database */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-indigo-500" />
                Specialty Skills Matrix
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeStaffDetails.skills.map((s, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">Active Certifications</div>
              <div className="space-y-1.5">
                {activeStaffDetails.certifications.map((c, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">
                <span>Emergency Contact details</span>
                <button
                  onClick={() => {
                    setEmergencyName(activeStaffDetails.emergencyContactName);
                    setEmergencyPhone(activeStaffDetails.emergencyContactPhone);
                    setIsEditingContact(!isEditingContact);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {isEditingContact ? 'Cancel' : 'Edit Contact'}
                </button>
              </div>

              {isEditingContact ? (
                <form onSubmit={handleSaveContact} className="space-y-2 pt-1" id="emergency-contact-form">
                  <div>
                    <label htmlFor="emer-name" className="block text-[9px] text-gray-500">Contact Name</label>
                    <input
                      id="emer-name"
                      type="text"
                      required
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="emer-phone" className="block text-[9px] text-gray-500">Contact Phone</label>
                    <input
                      id="emer-phone"
                      type="text"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-gray-900 text-white rounded text-[10px] font-medium"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="text-xs pt-1 space-y-1">
                  <div><strong>Name:</strong> {activeStaffDetails.emergencyContactName}</div>
                  <div><strong>Phone:</strong> {activeStaffDetails.emergencyContactPhone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Organizational Hierarchy visual block */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-gray-950 text-sm">Organizational Hierarchy</h3>
            <p className="text-xs text-gray-500">View team reporting lines and structural levels in Creative Agency.</p>

            <div className="space-y-3 relative pl-3 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              <div className="flex items-center gap-3 relative bg-gray-50 p-2 rounded-xl border border-gray-100">
                <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                  OM
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">David Miller</div>
                  <div className="text-[10px] text-gray-500">Operations Manager (Director Level)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative bg-gray-50 p-2 rounded-xl border border-gray-100 ml-4">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                  TL
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Sarah Jenkins</div>
                  <div className="text-[10px] text-gray-500">Lead Web Developer (Group Lead)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative bg-indigo-50 p-2 rounded-xl border border-indigo-100 ml-8 ring-2 ring-indigo-500/10">
                <div className="h-6 w-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  ME
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">{activeStaff?.name}</div>
                  <div className="text-[10px] text-indigo-600 font-medium">Your Simulator Profile ({activeStaff?.role})</div>
                </div>
              </div>
            </div>

            {/* Performance appraisal details */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">Annual Performance Appraisal (OKRs)</div>
              {personalAppraisal ? (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span>Year 2026 Appraisal</span>
                    <span className="text-indigo-600 font-mono">Score: {personalAppraisal.kpiScore}/100</span>
                  </div>
                  <p className="text-gray-600 italic">"OKR: {personalAppraisal.okrGoal}"</p>
                  <p className="text-gray-500"><strong>Manager Summary:</strong> {personalAppraisal.managerAppraisal}</p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">No appraisal record currently populated for this staff profile.</p>
              )}
            </div>
          </div>

          {/* Corporate Payroll Ledger & Payslips */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-gray-950 text-sm flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-indigo-500" />
                  Enterprise Payroll Integration
                </h3>
                <p className="text-xs text-gray-500">Download dynamic payroll slips integrated directly with the Enterprise Payroll Ledger.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Payroll API Status: <strong>Synced & Active</strong></span>
              </div>

              {/* Payslip list */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">My Synced Payslips</div>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Payslip - July 2026</div>
                      <div className="text-[10px] text-gray-500">Contract Rate: ${activeStaff?.baseSalary}/mo</div>
                    </div>
                    <button
                      onClick={() => setActivePayslipId('PAY-JUL-26')}
                      className="px-2 py-1 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-900 border border-gray-200 rounded flex items-center gap-1"
                    >
                      <FileDown className="h-3 w-3" />
                      View Slip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TEAM HUB & ENGAGEMENT */}
      {innerTab === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-gray-950" id="engagement-panel">
          {/* Employee Engagement eNPS Workplace Poll */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-gray-950 text-sm">Workplace eNPS & Survey Polls</h3>
                <p className="text-xs text-gray-500">Provide anonymous feedback and voice opinions on workplace proposals.</p>
              </div>
              <ThumbsUp className="h-5 w-5 text-indigo-500 shrink-0" />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="text-xs font-bold text-gray-900">{engagementPoll.question}</div>
              
              <div className="space-y-2 pt-1">
                {engagementPoll.options.map((opt, idx) => {
                  const totalVotes = engagementPoll.options.reduce((acc, curr) => acc + curr.votes, 0);
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const hasVoted = engagementPoll.userVotedIndex !== undefined;

                  return (
                    <div key={idx} className="space-y-1">
                      <button
                        disabled={hasVoted}
                        onClick={() => castVote(idx)}
                        className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all flex justify-between items-center ${
                          engagementPoll.userVotedIndex === idx 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' 
                            : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {hasVoted && <span className="font-mono text-[11px] font-bold text-indigo-600">{percentage}% ({opt.votes}v)</span>}
                      </button>
                      {hasVoted && (
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-indigo-600 h-1 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {engagementPoll.userVotedIndex !== undefined && (
                <div className="text-[10px] text-emerald-600 text-center font-semibold pt-1">
                  ✔ Thank you! Your response has been securely logged anonymously in the eNPS database.
                </div>
              )}
            </div>
          </div>

          {/* Forums & Discussion Board */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-sans font-bold text-gray-950 text-sm">Agency Discussion Forums</h3>
              <p className="text-xs text-gray-500">Collaborate, post tips, clean inventory warnings, or query general office topics.</p>
            </div>

            {/* Post to forum form */}
            <form onSubmit={handlePostSubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={forumContent}
                onChange={(e) => setForumContent(e.target.value)}
                placeholder="Share an announcement or post a topic to the forum..."
                className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Post
              </button>
            </form>

            {/* Forum post stream */}
            <div className="space-y-3 divide-y divide-gray-100 max-h-[250px] overflow-y-auto">
              {forumPosts.map(post => (
                <div key={post.id} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mb-1">
                    <span>
                      <strong className="text-gray-900 font-sans font-semibold text-xs">{post.authorName}</strong> ({post.authorRole})
                    </span>
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans">"{post.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Payslip print download overlay modal */}
      {activePayslipId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-gray-950 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm font-sans flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Synced Salary Pay Statement
                </h4>
                <p className="text-[10px] text-gray-400 font-mono">Statement ID: ERP-JUL-2026-X11</p>
              </div>
              <button
                onClick={() => setActivePayslipId(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-900"
              >
                Close Slip
              </button>
            </div>

            {/* Slip Mock details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg font-mono text-[11px]">
                <div>
                  <div className="text-gray-400 uppercase text-[9px]">Employee</div>
                  <div className="font-bold text-gray-900">{activeStaff?.name}</div>
                  <div className="text-gray-500">{activeStaff?.role}</div>
                </div>
                <div>
                  <div className="text-gray-400 uppercase text-[9px]">Bank Account</div>
                  <div className="font-bold text-gray-900">XXXX-XXXX-9912</div>
                  <div className="text-gray-500">Chase Business</div>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-b border-gray-100 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Contract Rate Pay:</span>
                  <span className="font-mono font-semibold">${activeStaff?.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Performance Incentive Bonus:</span>
                  <span className="font-mono">+ $150.00</span>
                </div>
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Withholding Tax & Benefits Deductions:</span>
                  <span className="font-mono">- $320.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span>Net Salary Disbursed (USD):</span>
                <span className="text-indigo-600 font-mono">${((activeStaff?.baseSalary || 0) + 150 - 320).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert('PDF paycheck statement generation completed. Starting download.');
                  setActivePayslipId(null);
                }}
                className="px-3.5 py-1.5 bg-gray-950 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                Download Statement PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
