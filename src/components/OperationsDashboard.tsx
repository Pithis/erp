/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Task, Employee, TaskPriority, ServiceType } from '../types';
import { AlertCircle, Clock, CheckSquare, Plus, Check, RefreshCw, Send, Radio, AlertTriangle } from 'lucide-react';

interface OperationsDashboardProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  allocateTask: (task: Omit<Task, 'id' | 'projectName' | 'assignedName'>) => void;
  updateTaskStatus: (id: string, status: Task['status'], payload?: any) => void;
  triggerPriorityNotification: (projectName: string, title: string, message: string) => void;
}

export default function OperationsDashboard({
  projects,
  tasks,
  employees,
  allocateTask,
  updateTaskStatus,
  triggerPriorityNotification
}: OperationsDashboardProps) {
  // Task allocation states
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || '');
  const [taskEmployeeId, setTaskEmployeeId] = useState(employees[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskDeadline, setTaskDeadline] = useState('');

  // Change Management states
  const [showChangeTrigger, setShowChangeTrigger] = useState(false);
  const [selectedChangeProject, setSelectedChangeProject] = useState(projects[0]?.id || '');
  const [changeType, setChangeType] = useState('Scope Shift');
  const [changeDetails, setChangeDetails] = useState('');

  // Submit Task Allocation
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskProjectId || !taskEmployeeId || !taskDeadline) return;

    allocateTask({
      projectId: taskProjectId,
      title: taskTitle,
      description: taskDesc,
      assignedTo: taskEmployeeId,
      status: 'Assigned',
      priority: taskPriority,
      deadline: taskDeadline
    });

    setTaskTitle('');
    setTaskDesc('');
    setTaskDeadline('');
    setShowAddTask(false);
  };

  // Submit Priority Change Notification
  const handleTriggerChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChangeProject || !changeDetails) return;

    const proj = projects.find(p => p.id === selectedChangeProject);
    if (proj) {
      const alertTitle = `CRITICAL CHANGE: ${changeType.toUpperCase()} - ${proj.name}`;
      triggerPriorityNotification(proj.name, alertTitle, changeDetails);
    }

    setChangeDetails('');
    setShowChangeTrigger(false);
  };

  // Calculate project statistics
  const activeProjectsCount = projects.filter(p => p.status !== 'Completed').length;
  const reviewTasksCount = tasks.filter(t => t.status === 'Pending Review').length;

  return (
    <div className="space-y-6" id="ops-dashboard-root">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Active Deliverable Streams</p>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">{activeProjectsCount} Ongoing Projects</h3>
            <p className="text-[10px] text-gray-500">Cross-departmental coordination live</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Review & Approval Queue</p>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">{reviewTasksCount} Tasks Pending</h3>
            <p className="text-[10px] text-amber-600 font-medium">Verify deliverables & log timesheets</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Tasks Complete Rate</p>
            <h3 className="font-sans font-bold text-lg text-gray-950 mt-0.5">
              {Math.round((tasks.filter(t => t.status === 'Completed').length / (tasks.length || 1)) * 100)}% Success
            </h3>
            <p className="text-[10px] text-emerald-600 font-medium">Aggregated project metrics active</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Projects and Real-Time Completion */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-sans font-semibold text-gray-950 text-sm">Real-Time Deliverables & Project Tracker</h3>
              <p className="text-xs text-gray-500">Live project completion percentages calculated from completed tasks.</p>
            </div>

            <div className="space-y-4">
              {projects.map((p) => {
                // calculate dynamic progress from task list for this project
                const projTasks = tasks.filter(t => t.projectId === p.id);
                const completedCount = projTasks.filter(t => t.status === 'Completed').length;
                const dynamicPercentage = projTasks.length > 0 
                  ? Math.round((completedCount / projTasks.length) * 100)
                  : p.completionPercentage;

                return (
                  <div key={p.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {p.serviceType}
                        </span>
                        <h4 className="font-sans font-semibold text-xs text-gray-950 mt-1">{p.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{p.clientName} | Budget: ${p.budget.toLocaleString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium mb-1">
                        <span>Progress Metric</span>
                        <span className="font-mono">{dynamicPercentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-550 ${
                            dynamicPercentage === 100 ? 'bg-emerald-500' : 'bg-gray-950'
                          }`} 
                          style={{ width: `${dynamicPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Reviews and approvals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-sans font-semibold text-gray-950 text-sm">Two-Way Verification Approval Queue</h3>
              <p className="text-xs text-gray-500">Examine creatives deliverables, notes, and verify completions.</p>
            </div>

            <div className="divide-y divide-gray-100">
              {tasks.filter(t => t.status === 'Pending Review').length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No deliverables currently in the verification queue.
                </div>
              ) : (
                tasks.filter(t => t.status === 'Pending Review').map((t) => (
                  <div key={t.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-gray-400 font-mono">{t.projectName}</div>
                        <h4 className="font-sans font-semibold text-xs text-gray-900 mt-0.5">{t.title}</h4>
                      </div>
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Pending Approval
                      </span>
                    </div>

                    <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100 space-y-2">
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Submitted Deliverables Info</div>
                      <p className="text-xs text-gray-700 leading-relaxed italic">
                        "{t.deliverables?.notes || 'No submitter notes provided'}"
                      </p>
                      {t.deliverables?.link && (
                        <div className="flex items-center gap-1 text-[11px] font-sans">
                          <span className="text-gray-400 font-medium">Link:</span>
                          <a 
                            href={t.deliverables.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-600 hover:underline truncate"
                          >
                            {t.deliverables.link}
                          </a>
                        </div>
                      )}
                      {t.deliverables?.fileName && (
                        <div className="text-[11px] font-mono text-gray-500">
                          Attachment: {t.deliverables.fileName}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Assigned to: <strong className="text-gray-900">{t.assignedName}</strong></span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTaskStatus(t.id, 'In Progress', 'Requested revisions. Please verify code variables or visual framing.')}
                          className="px-2.5 py-1 text-[10px] font-medium border border-gray-200 text-gray-600 hover:text-gray-900 bg-white rounded-md"
                        >
                          Request Revision
                        </button>
                        <button
                          onClick={() => updateTaskStatus(t.id, 'Completed')}
                          className="px-2.5 py-1 text-[10px] font-medium text-white bg-gray-950 hover:bg-gray-800 rounded-md flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Approve Completion
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Task Allocation & Critical Scope Shift Simulator */}
        <div className="space-y-6">
          {/* Allocate Tasks */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-semibold text-gray-950 text-sm">Task Allocation Tool</h3>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 border border-gray-100 transition-all"
                id="btn-toggle-add-task"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {showAddTask && (
              <form onSubmit={handleTaskSubmit} className="space-y-3" id="allocate-task-form">
                <div>
                  <label htmlFor="task-title-input" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Task Title</label>
                  <input
                    id="task-title-input"
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Set up Meta campaigns"
                    className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="task-desc-input" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    id="task-desc-input"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Provide specific deliverable expectations"
                    className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="task-proj-select" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Project</label>
                    <select
                      id="task-proj-select"
                      value={taskProjectId}
                      onChange={(e) => setTaskProjectId(e.target.value)}
                      className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-staff-select" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Assignee</label>
                    <select
                      id="task-staff-select"
                      value={taskEmployeeId}
                      onChange={(e) => setTaskEmployeeId(e.target.value)}
                      className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="task-priority-select" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                    <select
                      id="task-priority-select"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                      className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-deadline-input" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</label>
                    <input
                      id="task-deadline-input"
                      type="date"
                      required
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full text-xs font-sans px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gray-950 hover:bg-gray-800 text-xs font-medium text-white rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  Assign Deliverable Task
                </button>
              </form>
            )}
          </div>

          {/* Change Management Simulator */}
          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <Radio className="h-4 w-4 animate-ping shrink-0" />
              <h3 className="font-sans font-semibold text-gray-950 text-sm">Alert Dispatcher</h3>
            </div>
            <p className="text-xs text-gray-500">
              Trigger instant priority alerts for project delays, shoot location shifts, or budget reassignment.
            </p>

            <button
              onClick={() => setShowChangeTrigger(!showChangeTrigger)}
              className="w-full py-2 border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 rounded-lg flex items-center justify-center gap-1.5 transition-all"
              id="btn-toggle-priority-alert"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Simulate Priority Shift
            </button>

            {showChangeTrigger && (
              <form onSubmit={handleTriggerChangeSubmit} className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100" id="priority-alert-form">
                <div>
                  <label htmlFor="change-proj-select" className="block text-[10px] font-semibold text-red-800 uppercase tracking-wider mb-1">Target Project</label>
                  <select
                    id="change-proj-select"
                    value={selectedChangeProject}
                    onChange={(e) => setSelectedChangeProject(e.target.value)}
                    className="w-full text-xs font-sans px-2.5 py-1.5 border border-red-200 rounded-lg bg-white text-gray-950"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="change-type-select" className="block text-[10px] font-semibold text-red-800 uppercase tracking-wider mb-1">Shift Class</label>
                  <select
                    id="change-type-select"
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                    className="w-full text-xs font-sans px-2.5 py-1.5 border border-red-200 rounded-lg bg-white text-gray-950"
                  >
                    <option value="Scope Shift">Scope Expansion</option>
                    <option value="Timeline Delay">Timeline Shift</option>
                    <option value="Shoot Relocation">Shoot Relocation</option>
                    <option value="Resource Change">Resource Shift</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="change-details-input" className="block text-[10px] font-semibold text-red-800 uppercase tracking-wider mb-1">Incident Detail</label>
                  <textarea
                    id="change-details-input"
                    required
                    value={changeDetails}
                    onChange={(e) => setChangeDetails(e.target.value)}
                    placeholder="e.g. Venue switched to Studio A; reschedule gear checkouts"
                    className="w-full text-xs font-sans px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:border-red-500 bg-white text-gray-950 min-h-[60px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Radio className="h-3.5 w-3.5" />
                  Broadcast Priority Alert
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
