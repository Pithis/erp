/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScheduleEntry, Employee, Project } from '../types';
import { Calendar, Plus, Clock, AlertTriangle, Check, Layers, UserCheck } from 'lucide-react';

interface SchedulingModuleProps {
  schedules: ScheduleEntry[];
  employees: Employee[];
  projects: Project[];
  addSchedule: (schedule: Omit<ScheduleEntry, 'id' | 'employeeName' | 'projectName'>) => void;
}

export default function SchedulingModule({
  schedules,
  employees,
  projects,
  addSchedule
}: SchedulingModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-07-12');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleEntry['type']>('Shoot');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Conflict state
  const [collisionError, setCollisionError] = useState<string | null>(null);

  // Submit Schedule with Collision Checking
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !selectedProjectId || !scheduleTitle || !selectedDate) return;

    // COLLISION DETECTION: Check if the employee is already scheduled for ANY event on this specific date
    const conflictingBooking = schedules.find(
      s => s.employeeId === selectedEmployeeId && s.date === selectedDate
    );

    if (conflictingBooking) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      const proj = projects.find(p => p.id === conflictingBooking.projectId);
      setCollisionError(
        `COLLISION DETECTED: ${emp?.name} (${emp?.role}) is already scheduled for "${conflictingBooking.title}" on ${selectedDate}! Double-bookings are blocked to preserve staff availability.`
      );
      return;
    }

    // No collision: proceed to add
    setCollisionError(null);
    addSchedule({
      employeeId: selectedEmployeeId,
      projectId: selectedProjectId,
      title: scheduleTitle,
      date: selectedDate,
      type: scheduleType,
      startTime,
      endTime
    });

    // Reset Form
    setScheduleTitle('');
    setShowAddForm(false);
  };

  // Generate visual date grid for July 10th - July 16th, 2026
  const displayDates = [
    '2026-07-10',
    '2026-07-11',
    '2026-07-12',
    '2026-07-13',
    '2026-07-14',
    '2026-07-15',
    '2026-07-16'
  ];

  return (
    <div className="space-y-6" id="scheduling-module-root">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="font-sans font-bold tracking-tight text-gray-900 text-lg">Staff Allocation & Calendar Planner</h2>
          <p className="text-xs text-gray-500">Coordinate shoots, post-production sprints, and tech deliverables safely without double-booking.</p>
        </div>
        <button
          onClick={() => {
            setCollisionError(null);
            setShowAddForm(!showAddForm);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-lg transition-all self-start sm:self-center animate-fade-in"
          id="btn-trigger-schedule-form"
        >
          <Calendar className="h-4 w-4" />
          Plan Allocation Slot
        </button>
      </div>

      {/* Collision Alerts & Booking Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4" id="scheduling-form-drawer">
          <div className="text-xs font-mono text-gray-500 border-b border-gray-100 pb-1 uppercase tracking-wider">
            Create Allocation Record
          </div>

          {collisionError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start gap-3 text-xs leading-relaxed" id="collision-alert-banner">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <strong>Allocation Denied:</strong> {collisionError}
              </div>
            </div>
          )}

          <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="sched-title" className="block text-xs font-medium text-gray-700 mb-1">Appointment Title</label>
              <input
                id="sched-title"
                type="text"
                required
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="e.g. Model Shoot B"
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-950"
              />
            </div>

            <div>
              <label htmlFor="sched-employee" className="block text-xs font-medium text-gray-700 mb-1">Target Specialist</label>
              <select
                id="sched-employee"
                value={selectedEmployeeId}
                onChange={(e) => {
                  setCollisionError(null);
                  setSelectedEmployeeId(e.target.value);
                }}
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sched-proj" className="block text-xs font-medium text-gray-700 mb-1">Target Project</label>
              <select
                id="sched-proj"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sched-type" className="block text-xs font-medium text-gray-700 mb-1">Task Type</label>
              <select
                id="sched-type"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as any)}
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="Shoot">Shoot (Photography)</option>
                <option value="Editing">Editing (Video/Photo Post)</option>
                <option value="Sprint">Sprint (Web Dev/Marketing)</option>
                <option value="Meeting">Meeting (Consultations)</option>
                <option value="Client Event">Client Event</option>
              </select>
            </div>

            <div>
              <label htmlFor="sched-date" className="block text-xs font-medium text-gray-700 mb-1">Schedule Date</label>
              <input
                id="sched-date"
                type="date"
                required
                value={selectedDate}
                onChange={(e) => {
                  setCollisionError(null);
                  setSelectedDate(e.target.value);
                }}
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label htmlFor="sched-start" className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
              <input
                id="sched-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label htmlFor="sched-end" className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
              <input
                id="sched-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div className="flex items-end justify-end sm:col-span-1 pt-1">
              <button
                type="submit"
                className="w-full py-2 bg-gray-950 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="h-4 w-4" />
                Book Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gantt Timeline View - Grouped by dates */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {displayDates.map((dateStr) => {
          const dateObj = new Date(dateStr);
          const formattedDayName = dateObj.toLocaleDateString([], { weekday: 'short' });
          const formattedDayNum = dateObj.getDate();
          const isToday = dateStr === '2026-07-12';

          const dateSchedules = schedules.filter(s => s.date === dateStr);

          return (
            <div 
              key={dateStr} 
              className={`bg-white rounded-2xl border p-4 space-y-3 min-h-[350px] transition-all flex flex-col ${
                isToday ? 'border-gray-950 ring-2 ring-gray-950/10 shadow-sm' : 'border-gray-100 shadow-2xs'
              }`}
            >
              {/* Date Header */}
              <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                <div>
                  <h4 className={`font-sans font-bold text-sm ${isToday ? 'text-gray-950' : 'text-gray-800'}`}>
                    {formattedDayName} {formattedDayNum}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-mono">July 2026</p>
                </div>
                {isToday && (
                  <span className="text-[9px] font-mono font-bold bg-gray-950 text-white px-1.5 py-0.5 rounded uppercase">
                    TODAY
                  </span>
                )}
              </div>

              {/* Event Stack */}
              <div className="space-y-2 flex-grow overflow-y-auto">
                {dateSchedules.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-12 text-[11px] text-gray-300 font-sans italic">
                    No bookings
                  </div>
                ) : (
                  dateSchedules.map((item) => {
                    // Type color maps
                    const isShoot = item.type === 'Shoot';
                    const isEditing = item.type === 'Editing';
                    const isSprint = item.type === 'Sprint';

                    return (
                      <div 
                        key={item.id} 
                        className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 transition-all hover:scale-[1.01] ${
                          isShoot 
                            ? 'bg-purple-50/70 border-purple-100 text-purple-900' 
                            : isEditing 
                              ? 'bg-blue-50/70 border-blue-100 text-blue-900' 
                              : isSprint
                                ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                                : 'bg-gray-50 border-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="font-sans font-bold leading-snug">{item.title}</div>
                        <div className="text-[10px] opacity-85 font-sans flex items-center gap-0.5 font-medium">
                          <UserCheck className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.employeeName}</span>
                        </div>
                        <div className="text-[9px] opacity-70 font-mono flex items-center gap-0.5 font-medium">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative Legend */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500 font-sans">
        <span className="font-semibold text-gray-700">Department legend:</span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400" /> Photographers (Shoots)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Video Editors (Editing)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Developers / Marketers (Sprints)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> Admin Meetings
        </span>
      </div>
    </div>
  );
}
