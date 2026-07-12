/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project, PayrollRecord, Notification, Employee } from '../types';
import { AreaChart, TrendingUp, DollarSign, PieChart, ShieldAlert, CheckCircle2, ArrowUpRight, BarChart2 } from 'lucide-react';

interface StakeholderDashboardProps {
  projects: Project[];
  payroll: PayrollRecord[];
  employees: Employee[];
  notifications: Notification[];
  auditLogs?: any[];
}

export default function StakeholderDashboard({
  projects,
  payroll,
  employees,
  notifications,
  auditLogs = []
}: StakeholderDashboardProps) {
  // Financial Calculations
  const totalProjectRevenue = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalPayrollOutlay = payroll.reduce((acc, p) => acc + p.basePay + p.bonus - p.deduction, 0);
  const netEarnings = totalProjectRevenue - totalPayrollOutlay;
  const netProfitMargin = totalProjectRevenue > 0 ? ((netEarnings / totalProjectRevenue) * 100).toFixed(1) : '0';

  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Review').length;

  const priorityAlerts = notifications.filter(n => n.type === 'PriorityAlert');

  return (
    <div className="space-y-6" id="stakeholder-dashboard-root">
      {/* Financial Overview Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Gross Contract Value</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="font-sans font-bold text-xl text-gray-950">${totalProjectRevenue.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Across {projects.length} accounts</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Operational Cost (Payroll)</span>
            <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="font-sans font-bold text-xl text-gray-950">${totalPayrollOutlay.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-1">Salaries, freelance fees, and bonuses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Net Operating Surplus</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <AreaChart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="font-sans font-bold text-xl text-gray-950">${netEarnings.toLocaleString()}</h3>
            <p className="text-[10px] text-indigo-600 font-medium flex items-center gap-0.5 mt-1">
              <span>Retained agency capital surplus</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Project Profit Margin</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="font-sans font-bold text-xl text-gray-950">{netProfitMargin}%</h3>
            <p className="text-[10px] text-purple-600 font-medium mt-1">High creative margin efficiency</p>
          </div>
        </div>
      </div>

      {/* Charts & Priority alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project budgets and Completion Charts */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-semibold text-gray-950 text-sm">Portfolio Revenue Breakdown & Progress</h3>
              <p className="text-xs text-gray-500">A visual audit of budget weight versus active deliverable completeness.</p>
            </div>
            <BarChart2 className="h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-4 pt-2">
            {projects.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-600 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span className="text-[10px] text-gray-400">({p.serviceType})</span>
                  </div>
                  <div className="font-mono text-gray-900 font-semibold">
                    ${p.budget.toLocaleString()} <span className="text-gray-400 font-normal">| {p.completionPercentage}% Done</span>
                  </div>
                </div>

                {/* Double Bar chart - Budget weight & Completion */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-gray-400 font-mono mb-1">Budget Allocation</div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                        style={{ width: `${(p.budget / 45000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-gray-400 font-mono mb-1">Milestone Progress</div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className="h-full bg-gray-950 rounded-full transition-all duration-300" 
                        style={{ width: `${p.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority alerts log for stakeholders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-4 w-4" />
            <h3 className="font-sans font-semibold text-gray-950 text-sm">Priority Alerting Log</h3>
          </div>
          <p className="text-xs text-gray-500">
            Real-time scope modifications, location shifts, and timeline changes sent to all stakeholders.
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {priorityAlerts.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No priority alerts currently dispatched.</p>
            ) : (
              priorityAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      CRITICAL SHIFT
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-sans font-semibold text-xs text-red-950">{alert.title}</h4>
                  <p className="text-[11px] text-red-900 leading-relaxed font-sans">{alert.message}</p>
                  <div className="text-[9px] text-gray-400 font-mono">
                    Dispatcher: {alert.sender}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Security Audit Ledger */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <ShieldAlert className="h-4 w-4" />
          <h3 className="font-sans font-semibold text-gray-950 text-sm">Security Audit Trail Ledger</h3>
        </div>
        <p className="text-xs text-gray-500">
          Real-time record of all state modifications (POST, PUT, DELETE) captured dynamically on server execution.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">User</th>
                <th className="py-2.5">Action</th>
                <th className="py-2.5">IP Address</th>
                <th className="py-2.5">Route</th>
                <th className="py-2.5">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {(!auditLogs || auditLogs.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400 italic">
                    No database state changes logged in the current audit register.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-gray-950">{log.user?.name || 'System / Guest'}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{(log.user?.role || 'SYSTEM').replace('_', ' ')}</div>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.actionType === 'POST' ? 'bg-emerald-50 text-emerald-700' :
                        log.actionType === 'PUT' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[10px] text-gray-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-2.5 font-mono text-[10px] text-gray-600 truncate max-w-[150px]" title={log.route}>
                      {log.route}
                    </td>
                    <td className="py-2.5 text-[11px] text-gray-600 max-w-[300px] truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
