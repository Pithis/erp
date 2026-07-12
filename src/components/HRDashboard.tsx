/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Employee, 
  EmployeeRole, 
  PayrollRecord, 
  ScheduleEntry, 
  Task, 
  AttendanceLog, 
  LeaveRequest, 
  HelpDeskTicket, 
  PerformanceAppraisal, 
  EmployeeDetails, 
  EngagementPoll, 
  ForumPost 
} from '../types';
import { 
  UserPlus, 
  Wallet, 
  Calendar, 
  Check, 
  DollarSign, 
  Award, 
  ArrowUpRight, 
  TrendingUp, 
  Users, 
  Activity, 
  Clock, 
  ShieldAlert, 
  CheckSquare, 
  HelpCircle, 
  Plus, 
  Trash, 
  Send, 
  User, 
  ThumbsUp, 
  MessageSquare, 
  AlertTriangle,
  MapPin,
  Laptop
} from 'lucide-react';

interface HRDashboardProps {
  employees: Employee[];
  payroll: PayrollRecord[];
  schedules: ScheduleEntry[];
  tasks: Task[];
  onboardEmployee: (employee: Omit<Employee, 'id'>) => void;
  updatePayrollRecord: (record: PayrollRecord) => void;
  attendanceLogs: AttendanceLog[];
  updateAttendanceLog: (log: AttendanceLog) => void;
  leaveRequests: LeaveRequest[];
  updateLeaveRequest: (requestId: string, status: LeaveRequest['status']) => void;
  helpDeskTickets: HelpDeskTicket[];
  updateHelpDeskTicket: (ticketId: string, status: HelpDeskTicket['status']) => void;
  appraisals: PerformanceAppraisal[];
  addAppraisal: (appraisal: PerformanceAppraisal) => void;
  employeeDetails: EmployeeDetails[];
  updateEmployeeDetails: (details: EmployeeDetails) => void;
  engagementPoll: EngagementPoll;
  forumPosts: ForumPost[];
  addForumPost: (content: string, authorName: string, authorRole: string) => void;
}

export default function HRDashboard({
  employees,
  payroll,
  schedules,
  tasks,
  onboardEmployee,
  updatePayrollRecord,
  attendanceLogs,
  updateAttendanceLog,
  leaveRequests,
  updateLeaveRequest,
  helpDeskTickets,
  updateHelpDeskTicket,
  appraisals,
  addAppraisal,
  employeeDetails,
  updateEmployeeDetails,
  engagementPoll,
  forumPosts,
  addForumPost
}: HRDashboardProps) {
  // Navigation internal tabs
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'timeoff' | 'tickets' | 'payroll' | 'engagement'>('directory');

  // Selected Employee Detail View
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(employees[0]?.id || null);

  // Onboarding Form States
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<EmployeeRole>('Photographer');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeSalary, setNewEmployeeSalary] = useState('');
  const [newEmployeeIsFreelancer, setNewEmployeeIsFreelancer] = useState(false);

  // Custom Field Form States
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // Performance appraisal OKR Form
  const [showAppraisalForm, setShowAppraisalForm] = useState(false);
  const [appraisalOkr, setAppraisalOkr] = useState('');
  const [appraisalScore, setAppraisalScore] = useState('90');
  const [appraisalManager, setAppraisalManager] = useState('');

  // Bonus Form States
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');

  // Forum announcement state
  const [announcementContent, setAnnouncementContent] = useState('');

  // Search/Filters
  const [dirSearch, setDirSearch] = useState('');
  const [dirRoleFilter, setDirRoleFilter] = useState('ALL');

  // Handle Onboard Submission
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName || !newEmployeeEmail || !newEmployeeSalary) return;

    onboardEmployee({
      name: newEmployeeName,
      role: newEmployeeRole,
      email: newEmployeeEmail,
      baseSalary: Number(newEmployeeSalary),
      isFreelancer: newEmployeeIsFreelancer,
      status: 'Onboarding',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    // Reset Form
    setNewEmployeeName('');
    setNewEmployeeEmail('');
    setNewEmployeeSalary('');
    setNewEmployeeIsFreelancer(false);
    setShowOnboardForm(false);
  };

  // Add Custom Field to Selected Employee Detail
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !newFieldName || !newFieldValue) return;

    const existingDetails = employeeDetails.find(d => d.employeeId === selectedEmployeeId) || {
      employeeId: selectedEmployeeId,
      personalPhone: '+1 (555) 231-1122',
      emergencyContactName: 'Next of Kin',
      emergencyContactPhone: '+1 (555) 231-9900',
      skills: ['Production Support'],
      certifications: [],
      department: 'Operations',
      jobTitle: 'Creative Specialist',
      reportsTo: 'Operations Manager',
      customFields: []
    };

    const updatedFields = [...(existingDetails.customFields || []), { name: newFieldName, value: newFieldValue }];
    
    updateEmployeeDetails({
      ...existingDetails,
      customFields: updatedFields
    });

    setNewFieldName('');
    setNewFieldValue('');
  };

  // Submit Performance Appraisal
  const handleAddAppraisalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !appraisalOkr || !appraisalManager) return;

    const targetEmp = employees.find(emp => emp.id === selectedEmployeeId);
    if (!targetEmp) return;

    const newAppr: PerformanceAppraisal = {
      id: `APR-${Date.now()}`,
      employeeId: selectedEmployeeId,
      employeeName: targetEmp.name,
      year: 2026,
      okrGoal: appraisalOkr,
      kpiScore: Number(appraisalScore),
      selfAppraisal: 'Achieved goals and supported critical shoots.',
      managerAppraisal: appraisalManager,
      peerFeedback: 'Highly collaborative and helpful team player.',
      competencyAssessment: 'Standard Competent Level'
    };

    addAppraisal(newAppr);
    setAppraisalOkr('');
    setAppraisalManager('');
    setShowAppraisalForm(false);
  };

  // Handle Bonus Submission
  const handleBonusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayrollId || !bonusAmount || !bonusReason) return;

    const record = payroll.find(p => p.id === selectedPayrollId);
    if (record) {
      updatePayrollRecord({
        ...record,
        bonus: Number(bonusAmount),
        bonusReason: bonusReason,
        status: 'Approved' // auto-approve after modification
      });
    }

    setSelectedPayrollId(null);
    setBonusAmount('');
    setBonusReason('');
  };

  // Approve Payroll Item
  const handleApprovePayroll = (id: string) => {
    const record = payroll.find(p => p.id === id);
    if (record) {
      updatePayrollRecord({
        ...record,
        status: record.status === 'Pending' ? 'Approved' : 'Paid'
      });
    }
  };

  // Regularize Attendance (Late check-in override)
  const handleRegularizeAttendance = (log: AttendanceLog) => {
    updateAttendanceLog({
      ...log,
      status: 'On Time',
      isApproved: true
    });
  };

  // Submit Firm announcement
  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementContent) return;
    addForumPost(announcementContent, 'HR Department Admin', 'HR Specialist');
    setAnnouncementContent('');
  };

  // Headcount & salary quick stats
  const totalPayroll = payroll.reduce((acc, curr) => acc + curr.basePay + curr.bonus - curr.deduction, 0);
  const totalPending = payroll.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.basePay + curr.bonus, 0);
  const onboardingCount = employees.filter(e => e.status === 'Onboarding').length;

  // Filter Directory list
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(dirSearch.toLowerCase()) || emp.email.toLowerCase().includes(dirSearch.toLowerCase());
    const matchesRole = dirRoleFilter === 'ALL' || emp.role === dirRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Selected Employee details derived
  const selectedEmp = employees.find(e => e.id === selectedEmployeeId);
  const selectedEmpDetails = employeeDetails.find(d => d.employeeId === selectedEmployeeId) || {
    employeeId: selectedEmployeeId || 'E01',
    personalPhone: '+1 (555) 100-2000',
    emergencyContactName: 'Next of Kin',
    emergencyContactPhone: '+1 (555) 100-3000',
    skills: ['General Production Support'],
    certifications: [],
    department: 'Operations & Media',
    jobTitle: selectedEmp?.role || 'Staff Member',
    reportsTo: 'Operations Manager',
    customFields: []
  };
  const selectedEmpAppraisals = appraisals.filter(a => a.employeeId === selectedEmployeeId);

  return (
    <div className="space-y-6" id="hr-dashboard-root">
      {/* Overview Analytics Bento Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Total Agency Headcount</span>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">{employees.length} Members</h3>
            <p className="text-[10px] text-indigo-600 font-medium">
              {onboardingCount} in transition onboarding
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Total Monthly Payrun</span>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">${totalPayroll.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500">Includes performance bonuses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50/70 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Unapproved payrolls</span>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">${totalPending.toLocaleString()}</h3>
            <p className="text-[10px] text-amber-600 font-medium">Requires compliance validation</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Avg Salary Level</span>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">
              ${Math.round(employees.reduce((acc, e) => acc + e.baseSalary, 0) / employees.length).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-500">Based on competitive contract rates</p>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex border border-gray-100 bg-gray-50 p-1.5 rounded-xl gap-2 text-xs font-semibold shadow-xs overflow-x-auto max-w-full whitespace-nowrap scrollbar-none" id="hr-dashboard-subtabs">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeSubTab === 'directory' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Users className="h-4 w-4" />
          Directory & Profiles
        </button>
        <button
          onClick={() => setActiveSubTab('timeoff')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeSubTab === 'timeoff' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Clock className="h-4 w-4" />
          Attendance & Time-Off Approvals
          {leaveRequests.filter(l => l.status === 'Pending').length > 0 && (
            <span className="bg-red-550 text-white font-mono font-bold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
              {leaveRequests.filter(l => l.status === 'Pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeSubTab === 'tickets' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Support Help Desk
          {helpDeskTickets.filter(t => t.status === 'Open').length > 0 && (
            <span className="bg-indigo-600 text-white font-mono font-bold px-1.5 py-0.5 rounded-full text-[9px]">
              {helpDeskTickets.filter(t => t.status === 'Open').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeSubTab === 'payroll' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Wallet className="h-4 w-4" />
          Enterprise Payroll Integration
        </button>
        <button
          onClick={() => setActiveSubTab('engagement')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeSubTab === 'engagement' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          eNPS & Forums Moderator
        </button>
      </div>

      {/* RENDER DIRECTORY TAB */}
      {activeSubTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-gray-950" id="dir-panel">
          <div className="lg:col-span-1 space-y-4">
            {/* Search/Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <div>
                <label htmlFor="search-dir" className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Search Directory</label>
                <input
                  id="search-dir"
                  type="text"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Filter name or email..."
                  className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
                />
              </div>

              <div>
                <label htmlFor="role-dir" className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Role Filter</label>
                <select
                  id="role-dir"
                  value={dirRoleFilter}
                  onChange={(e) => setDirRoleFilter(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg focus:outline-none bg-white cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Editor">Editor</option>
                  <option value="Web Developer">Web Developer</option>
                </select>
              </div>

              <button
                onClick={() => setShowOnboardForm(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Onboard New Employee
              </button>
            </div>

            {/* List Employees */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50/50 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                Staff Directory ({filteredEmployees.length} profiles)
              </div>
              <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      setSelectedEmployeeId(emp.id);
                      setShowAppraisalForm(false);
                    }}
                    className={`w-full text-left p-3.5 transition-all flex items-center justify-between gap-2 ${
                      selectedEmployeeId === emp.id ? 'bg-indigo-50/50 text-indigo-950 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-sans font-bold text-xs text-gray-900">{emp.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{emp.role}</div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                      emp.isFreelancer ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {emp.isFreelancer ? 'Freelance' : 'Full-Time'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedEmp ? (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-sans font-bold text-gray-950 text-lg leading-tight">{selectedEmp.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedEmp.email} | Joined {selectedEmp.joinedDate}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                        ID: {selectedEmp.id}
                      </span>
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {selectedEmp.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Contract Salary Rate</span>
                    <span className="text-lg font-bold text-gray-900">${selectedEmp.baseSalary.toLocaleString()}/mo</span>
                    <span className="text-[10px] text-gray-500 block">Status: {selectedEmp.status}</span>
                  </div>
                </div>

                {/* Sub info columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Core Personal Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Core Contact & Emergency details</h4>
                      <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-gray-500 block">Personal Phone:</span>
                          <strong>{selectedEmpDetails.personalPhone || '+1 (555) 304-2010'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Emergency Contact Name:</span>
                          <strong>{selectedEmpDetails.emergencyContactName || 'Carla Rivera'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Emergency Contact Phone:</span>
                          <strong>{selectedEmpDetails.emergencyContactPhone || '+1 (555) 304-9988'}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Technical Specialty Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEmpDetails.skills.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">No specific skills indexed yet.</span>
                        ) : (
                          selectedEmpDetails.skills.map((s, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Certifications & custom fields */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Certifications & Badges</h4>
                      <div className="space-y-1">
                        {selectedEmpDetails.certifications.length === 0 ? (
                          <span className="text-xs text-gray-400 italic block">No corporate badges verified.</span>
                        ) : (
                          selectedEmpDetails.certifications.map((c, i) => (
                            <div key={i} className="text-xs bg-emerald-50/50 text-emerald-800 border border-emerald-100/50 p-1.5 rounded flex items-center gap-1 font-sans">
                              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Custom fields section */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Custom Profile Fields</h4>
                      <div className="space-y-1 text-xs">
                        {selectedEmpDetails.customFields && selectedEmpDetails.customFields.length > 0 ? (
                          selectedEmpDetails.customFields.map((f, i) => (
                            <div key={i} className="flex justify-between p-1.5 bg-gray-50 border border-gray-100 rounded">
                              <span className="text-gray-500 font-medium">{f.name}:</span>
                              <strong className="text-gray-900">{f.value}</strong>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic block">No custom properties defined.</span>
                        )}
                      </div>

                      {/* Add Custom Field Form */}
                      <form onSubmit={handleAddCustomField} className="flex gap-2 pt-1" id="custom-field-form">
                        <input
                          type="text"
                          required
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          placeholder="Field (e.g. Desk)"
                          className="w-1/2 text-xs px-2 py-1 border border-gray-200 rounded"
                        />
                        <input
                          type="text"
                          required
                          value={newFieldValue}
                          onChange={(e) => setNewFieldValue(e.target.value)}
                          placeholder="Value (e.g. Desk B)"
                          className="w-1/2 text-xs px-2 py-1 border border-gray-200 rounded"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-[10px]"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Performance Evaluation Appraisal Logs */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">OKR Appraisals & Evaluations</h4>
                    <button
                      onClick={() => setShowAppraisalForm(!showAppraisalForm)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {showAppraisalForm ? 'Cancel Form' : 'Issue Performance Review'}
                    </button>
                  </div>

                  {showAppraisalForm && (
                    <form onSubmit={handleAddAppraisalSubmit} className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-3" id="appraisal-form">
                      <div className="text-[10px] font-mono text-indigo-700 uppercase tracking-wider font-semibold">Form: Year 2026 Appraisal</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="appr-score" className="block text-[10px] font-medium text-gray-600 mb-1">KPI Performance Score (out of 100)</label>
                          <input
                            id="appr-score"
                            type="number"
                            required
                            min="1"
                            max="100"
                            value={appraisalScore}
                            onChange={(e) => setAppraisalScore(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="appr-goal" className="block text-[10px] font-medium text-gray-600 mb-1">OKR Goal Definition</label>
                          <input
                            id="appr-goal"
                            type="text"
                            required
                            value={appraisalOkr}
                            onChange={(e) => setAppraisalOkr(e.target.value)}
                            placeholder="e.g. Refactor API endpoints, deliver promo photos"
                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="appr-eval" className="block text-[10px] font-medium text-gray-600 mb-1">Detailed Manager Appraisal Commentary</label>
                        <textarea
                          id="appr-eval"
                          required
                          value={appraisalManager}
                          onChange={(e) => setAppraisalManager(e.target.value)}
                          placeholder="Summarize developer output and delivery speed..."
                          className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded bg-white min-h-[50px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold"
                      >
                        File Completed Performance Appraisal
                      </button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {selectedEmpAppraisals.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No OKR reviews filed yet for {selectedEmp.name}.</p>
                    ) : (
                      selectedEmpAppraisals.map(a => (
                        <div key={a.id} className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span>Year 2026 Assessment</span>
                            <span className="text-indigo-600 font-mono">KPI Score: {a.kpiScore}/100</span>
                          </div>
                          <p className="text-gray-700 italic">"OKR: {a.okrGoal}"</p>
                          <p className="text-gray-500"><strong>Manager Feedback:</strong> {a.managerAppraisal}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-gray-400 bg-white border border-gray-100 rounded-2xl">
                Please select an employee profile from the directory on the left to inspect detail cards.
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER ATTENDANCE & TIMEOFF TAB */}
      {activeSubTab === 'timeoff' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-gray-950" id="timeoff-panel">
          {/* Leave Request approvals */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-sans font-bold text-gray-950 text-sm">Time-Off Leave Requests Approvals</h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Approve, reject, or manage casual/annual leave requests submitted by creative staff.</p>
            </div>

            <div className="space-y-3">
              {leaveRequests.length === 0 ? (
                <div className="text-center text-xs text-gray-500 py-6">No leave requests on file.</div>
              ) : (
                leaveRequests.map(req => (
                  <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{req.leaveType}</span>
                        <h4 className="font-sans font-bold text-xs text-gray-900 mt-0.5">{req.employeeName}</h4>
                        <span className="text-[10px] text-gray-500 block">{req.startDate} to {req.endDate}</span>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'Declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 italic">"Reason: {req.reason}"</p>

                    {req.status === 'Pending' && (
                      <div className="flex gap-2 justify-end border-t border-gray-200/50 pt-2">
                        <button
                          onClick={() => updateLeaveRequest(req.id, 'Declined')}
                          className="px-2.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 rounded"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => updateLeaveRequest(req.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-semibold text-white rounded"
                        >
                          Approve Request
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily attendance monitoring */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-sans font-bold text-gray-950 text-sm">Attendance Monitoring & Late Overrides</h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Audit check-in times. Override late arrival states to regularize employee profiles.</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto divide-y divide-gray-100">
              {attendanceLogs.map((log) => (
                <div key={log.id} className="py-3 first:pt-0 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-gray-900">{log.employeeName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Date: {log.date} | IP: {log.ipAddress}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        log.status === 'On Time' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
                    <span>Check In: <strong className="text-gray-900">{log.checkInTime}</strong></span>
                    <span>Check Out: <strong className="text-gray-900">{log.checkOutTime || 'Active Shift'}</strong></span>
                    {log.overtimeHours ? (
                      <span className="text-indigo-600 font-mono">OT: +{log.overtimeHours}h</span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="truncate max-w-[200px]">Verification: {log.gpsLocation}</span>
                    {log.status === 'Late' && !log.isApproved && (
                      <button
                        onClick={() => handleRegularizeAttendance(log)}
                        className="px-2 py-0.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-[10px] font-semibold"
                      >
                        Regularize Late State
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER SUPPORT TICKETS TAB */}
      {activeSubTab === 'tickets' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-gray-950 animate-fade-in" id="tickets-panel">
          <div>
            <h3 className="font-sans font-bold text-gray-950 text-sm">Help Desk Service Level Agreement (SLA) Portal</h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Solve employee grievances, equipment bugs, or salary queries under strict SLA deadlines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpDeskTickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400 col-span-2">All tickets resolved! Excellent support service level.</div>
            ) : (
              helpDeskTickets.map(tkt => {
                const isOverdue = new Date(tkt.slaDeadline) < new Date();
                return (
                  <div key={tkt.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-semibold">
                            {tkt.category}
                          </span>
                          <h4 className="font-sans font-bold text-xs text-gray-900 mt-1.5">{tkt.title}</h4>
                          <span className="text-[10px] text-gray-500 block">From: {tkt.employeeName} | Created {tkt.createdAt}</span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          tkt.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tkt.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">"{tkt.description}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">Severity: {tkt.priority}</span>
                        <span className={`h-2 w-2 rounded-full ${
                          tkt.priority === 'Critical' ? 'bg-red-500' :
                          tkt.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          SLA Due: {tkt.slaDeadline} {isOverdue && '(OVERDUE)'}
                        </span>
                        {tkt.status !== 'Resolved' && (
                          <button
                            onClick={() => updateHelpDeskTicket(tkt.id, 'Resolved')}
                            className="px-2.5 py-1 bg-gray-950 hover:bg-gray-800 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RENDER PAYROLL TAB */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-gray-950 animate-fade-in" id="payroll-panel">
          <div>
            <h3 className="font-sans font-bold text-gray-950 text-sm">Enterprise Payroll System Integration</h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Adjust compensation, process monthly bonus increments, and check payroll synchronization states.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 mb-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Payroll Ledger synchronization: <strong>Online & Calibrated with contract parameters</strong></span>
          </div>

          {/* Issue Performance Bonus Form Overlay */}
          {selectedPayrollId && (
            <form onSubmit={handleBonusSubmit} className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-3" id="bonus-issue-form">
              <div className="text-[10px] font-mono text-amber-800 uppercase tracking-wider font-semibold">Issue Performance Bonus Adjustments</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bonus-input" className="block text-[10px] font-medium text-gray-600 mb-1">Bonus Payout (USD)</label>
                  <input
                    id="bonus-input"
                    type="number"
                    required
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="bonus-reason-input" className="block text-[10px] font-medium text-gray-600 mb-1">Incentive Justification</label>
                  <input
                    id="bonus-reason-input"
                    type="text"
                    required
                    value={bonusReason}
                    onChange={(e) => setBonusReason(e.target.value)}
                    placeholder="e.g. Completed Glow Cosmetics Promo ahead of schedule"
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPayrollId(null)}
                  className="px-2.5 py-1 text-xs text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold"
                >
                  Apply & Recalculate Net
                </button>
              </div>
            </form>
          )}

          {/* List of Enterprise pay slips */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100">
              <thead className="bg-gray-50/50 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Staff Profile</th>
                  <th className="p-3">Base Pay</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net pay</th>
                  <th className="p-3">Justification</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.map(rec => {
                  const net = rec.basePay + rec.bonus - rec.deduction;
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-gray-900">{rec.employeeName}</td>
                      <td className="p-3 font-mono">${rec.basePay.toLocaleString()}</td>
                      <td className="p-3 font-mono text-emerald-600">+${rec.bonus.toLocaleString()}</td>
                      <td className="p-3 font-mono text-red-600">-${rec.deduction.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-gray-900">${net.toLocaleString()}</td>
                      <td className="p-3 text-gray-500 max-w-[150px] truncate italic">
                        {rec.bonusReason ? `"${rec.bonusReason}"` : '--'}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          rec.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedPayrollId(rec.id)}
                            className="px-2 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                          >
                            Adjust
                          </button>
                          {rec.status === 'Pending' && (
                            <button
                              onClick={() => handleApprovePayroll(rec.id)}
                              className="px-2 py-1 bg-gray-950 text-white rounded font-medium hover:bg-gray-800 text-[10px]"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER ENGAGEMENT & SURVEY TAB */}
      {activeSubTab === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-gray-950" id="engagement-panel">
          {/* Survey eNPS results */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-sans font-bold text-gray-950 text-sm">Real-Time Survey Polls eNPS</h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Track employee feedback percentages on critical company-wide operational proposals.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <div className="text-xs font-bold text-gray-900">{engagementPoll.question}</div>
              
              <div className="space-y-3">
                {engagementPoll.options.map((opt, idx) => {
                  const totalVotes = engagementPoll.options.reduce((acc, curr) => acc + curr.votes, 0);
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-700">
                        <span>{opt.text}</span>
                        <span className="font-mono font-bold text-indigo-600">{percentage}% ({opt.votes} votes)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-gray-400 text-center font-mono pt-1">
                Total Respondents: {engagementPoll.options.reduce((acc, curr) => acc + curr.votes, 0)} Anonymous Staff Members
              </div>
            </div>
          </div>

          {/* Announcement and moderator log stream */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-sans font-bold text-gray-950 text-sm">Forums Moderator & Firm Announcements</h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Post primary corporate notices or moderate creative comments logged under team discussions.</p>
            </div>

            {/* Post firm announcement */}
            <form onSubmit={handleAnnouncementSubmit} className="flex gap-2" id="announcement-form">
              <input
                type="text"
                required
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Post an official HR department notice or announcement to the discussion board..."
                className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Dispatch Notice
              </button>
            </form>

            <div className="space-y-3 divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
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

      {/* Onboarding Form Overlay Modal */}
      {showOnboardForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-gray-950 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="font-bold text-gray-900 text-sm font-sans flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-indigo-500" />
                Onboard New Creative/Technical Staff
              </h4>
              <button
                onClick={() => setShowOnboardForm(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3 text-xs" id="onboard-form">
              <div>
                <label htmlFor="onb-name" className="block font-medium text-gray-600 mb-1">Full Legal Name</label>
                <input
                  id="onb-name"
                  type="text"
                  required
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  placeholder="e.g. Liam Sterling"
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="onb-email" className="block font-medium text-gray-600 mb-1">Work Email</label>
                  <input
                    id="onb-email"
                    type="email"
                    required
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder="lsterling@agency.com"
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label htmlFor="onb-role" className="block font-medium text-gray-600 mb-1">Assigned Role</label>
                  <select
                    id="onb-role"
                    value={newEmployeeRole}
                    onChange={(e) => setNewEmployeeRole(e.target.value as EmployeeRole)}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded bg-white"
                  >
                    <option value="Photographer">Photographer</option>
                    <option value="Editor">Editor</option>
                    <option value="Web Developer">Web Developer</option>
                    <option value="HR Specialist">HR Specialist</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label htmlFor="onb-salary" className="block font-medium text-gray-600 mb-1">Contract Base Rate (USD/mo)</label>
                  <input
                    id="onb-salary"
                    type="number"
                    required
                    value={newEmployeeSalary}
                    onChange={(e) => setNewEmployeeSalary(e.target.value)}
                    placeholder="e.g. 5200"
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    id="onb-freelancer"
                    type="checkbox"
                    checked={newEmployeeIsFreelancer}
                    onChange={(e) => setNewEmployeeIsFreelancer(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="onb-freelancer" className="font-medium text-gray-600 cursor-pointer select-none">Freelance contract</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer mt-2"
              >
                Confirm Onboard & Dispatch Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
