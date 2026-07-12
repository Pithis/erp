/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  Project, 
  Task, 
  InventoryItem, 
  ScheduleEntry, 
  PayrollRecord, 
  Notification, 
  UserRole,
  AttendanceLog,
  LeaveRequest,
  HelpDeskTicket,
  PerformanceAppraisal,
  EmployeeDetails,
  EngagementPoll,
  ForumPost
} from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_INVENTORY, 
  INITIAL_SCHEDULES, 
  INITIAL_PAYROLL, 
  INITIAL_NOTIFICATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_TICKETS,
  INITIAL_APPRAISALS,
  INITIAL_EMPLOYEE_DETAILS,
  INITIAL_POLL,
  INITIAL_FORUM_POSTS
} from './data';

import Header from './components/Header';
import HRDashboard from './components/HRDashboard';
import OperationsDashboard from './components/OperationsDashboard';
import CreativeDashboard from './components/CreativeDashboard';
import StakeholderDashboard from './components/StakeholderDashboard';
import InventoryModule from './components/InventoryModule';
import SchedulingModule from './components/SchedulingModule';
import Login from './components/Login';

import { Radio, ShieldAlert, X, Info } from 'lucide-react';
import { socketClient } from './services/socketClient';

export default function App() {
  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const mapDbRoleToUiRole = (dbRole: string): UserRole => {
    switch (dbRole) {
      case 'HR_STAFF':
        return 'HR Staff';
      case 'OPERATIONS_STAFF':
        return 'Operations Staff';
      case 'CREATIVE_SPECIALIST':
        return 'Creative/Technical Staff';
      case 'STAKEHOLDER':
        return 'Stakeholder';
      default:
        return 'Creative/Technical Staff';
    }
  };

  // Current active role & global view selection
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('erp_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return mapDbRoleToUiRole(parsed.role);
    }
    return 'HR Staff';
  });

  const getRequestHeaders = () => {
    const token = localStorage.getItem('erp_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(user));
    setCurrentUser(user);
    const uiRole = mapDbRoleToUiRole(user.role);
    setCurrentRole(uiRole);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.log('Logout API error:', err);
    }
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    socketClient.disconnect();
    setCurrentUser(null);
    setCurrentRole('HR Staff');
    setActiveTab('dashboard');
  };
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(socketClient.isConnected());
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('erp_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('erp_theme', nextTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  // Core ERP State variables with lazy initialization from localStorage
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('erp_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('erp_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('erp_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('erp_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [schedules, setSchedules] = useState<ScheduleEntry[]>(() => {
    const saved = localStorage.getItem('erp_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('erp_payroll');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('erp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // HR Extension States
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('erp_attendance_logs');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('erp_leave_requests');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [helpDeskTickets, setHelpDeskTickets] = useState<HelpDeskTicket[]>(() => {
    const saved = localStorage.getItem('erp_helpdesk_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [appraisals, setAppraisals] = useState<PerformanceAppraisal[]>(() => {
    const saved = localStorage.getItem('erp_appraisals');
    return saved ? JSON.parse(saved) : INITIAL_APPRAISALS;
  });

  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails[]>(() => {
    const saved = localStorage.getItem('erp_employee_details');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEE_DETAILS;
  });

  const [engagementPoll, setEngagementPoll] = useState<EngagementPoll>(() => {
    const saved = localStorage.getItem('erp_engagement_poll');
    return saved ? JSON.parse(saved) : INITIAL_POLL;
  });

  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('erp_forum_posts');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_POSTS;
  });

  // Transient Priority Alert Banner State
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string } | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('erp_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('erp_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('erp_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('erp_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('erp_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('erp_payroll', JSON.stringify(payroll));
  }, [payroll]);

  useEffect(() => {
    localStorage.setItem('erp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('erp_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('erp_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('erp_helpdesk_tickets', JSON.stringify(helpDeskTickets));
  }, [helpDeskTickets]);

  useEffect(() => {
    localStorage.setItem('erp_appraisals', JSON.stringify(appraisals));
  }, [appraisals]);

  useEffect(() => {
    localStorage.setItem('erp_employee_details', JSON.stringify(employeeDetails));
  }, [employeeDetails]);

  useEffect(() => {
    localStorage.setItem('erp_engagement_poll', JSON.stringify(engagementPoll));
  }, [engagementPoll]);

  useEffect(() => {
    localStorage.setItem('erp_forum_posts', JSON.stringify(forumPosts));
  }, [forumPosts]);

  // Sync state from server-side SQLite Database on load and when the current role or currentUser changes
  useEffect(() => {
    const loadAllDatabaseData = async () => {
      try {
        const headers = getRequestHeaders();
        
        // Fetch projects
        fetch('/api/projects', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setProjects(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Projects):', err));

        // Fetch tasks
        fetch('/api/tasks', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setTasks(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Tasks):', err));

        // Fetch schedules
        fetch('/api/schedule', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setSchedules(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Schedules):', err));

        // Fetch employees
        fetch('/api/employees', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setEmployees(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Employees):', err));

        // Fetch attendance
        fetch('/api/attendance', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setAttendanceLogs(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Attendance):', err));

        // Fetch leaves
        fetch('/api/leaves', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setLeaveRequests(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Leaves):', err));

        // Fetch tickets
        fetch('/api/tickets', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setHelpDeskTickets(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Tickets):', err));

        // Fetch appraisals
        fetch('/api/appraisals', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setAppraisals(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Appraisals):', err));

        // Fetch employee details
        fetch('/api/employee-details', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setEmployeeDetails(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Details):', err));

        // Fetch engagement poll
        fetch('/api/engagement-poll', { headers }).then(res => res.json()).then(data => {
          if (data && data.question) setEngagementPoll(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Poll):', err));

        // Fetch forum posts
        fetch('/api/forum-posts', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setForumPosts(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Forum):', err));

        // Fetch inventory from SQLite database
        fetch('/api/inventory', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setInventory(data);
        }).catch(err => console.log('SQLite Sync Bypassed (Inventory):', err));

        // Fetch audit logs from SQLite database (Stakeholder view only)
        if (currentRole === 'Stakeholder') {
          fetch('/api/audit-logs', { headers }).then(res => res.json()).then(data => {
            if (Array.isArray(data)) setAuditLogs(data);
          }).catch(err => console.log('SQLite Sync Bypassed (Audit Logs):', err));
        }

      } catch (err) {
        console.error('Failed to sync backend database:', err);
      }
    };

    loadAllDatabaseData();
  }, [currentRole, currentUser]);

  // Handle websocket connection lifetime based on user login session
  useEffect(() => {
    if (currentUser) {
      console.log('[App] Active user session detected. Connecting to authenticated socket...');
      socketClient.connect();
    } else {
      console.log('[App] No active session. Disconnecting socket.');
      socketClient.disconnect();
    }
  }, [currentUser]);

  // Subscribe to server websocket events
  useEffect(() => {
    // Sync current initial state
    setIsSocketConnected(socketClient.isConnected());

    const handleConnectionChange = (connected: boolean) => {
      setIsSocketConnected(connected);
    };

    const handleSystemAlert = (alert: any) => {
      console.log('[App] Real-time emergency alert received over WebSocket:', alert);
      
      const newNotification: Notification = {
        id: alert.id || `ALERT-${Date.now()}`,
        type: 'PriorityAlert',
        title: alert.title,
        message: alert.message,
        projectName: alert.projectName,
        timestamp: alert.timestamp || new Date().toISOString(),
        sender: alert.sender || 'Operations Staff',
        isRead: false
      };

      setNotifications(prev => [newNotification, ...prev]);
      setActiveToast({
        id: alert.id || `ALERT-${Date.now()}`,
        title: alert.title,
        message: alert.message
      });
    };

    // Auto-refresh lists when mutations happen on the server
    const handleSyncRefresh = (mutation: any) => {
      console.log('[App] Real-time mutation synced from server:', mutation);
    };

    socketClient.on('connection_change', handleConnectionChange);
    socketClient.on('system_alert_received', handleSystemAlert);
    socketClient.on('sync_data_refresh', handleSyncRefresh);

    return () => {
      socketClient.off('connection_change', handleConnectionChange);
      socketClient.off('system_alert_received', handleSystemAlert);
      socketClient.off('sync_data_refresh', handleSyncRefresh);
    };
  }, []);

  // ==========================================
  // CORE FUNCTIONS & STATE TRANSITIONS
  // ==========================================

  // Onboard new specialist
  const onboardEmployee = async (newEmp: Omit<Employee, 'id'>) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newEmp.name,
          role: newEmp.role,
          email: newEmp.email,
          baseSalary: newEmp.baseSalary,
          contractType: newEmp.isFreelancer ? 'FREELANCE' : 'FULL_TIME'
        })
      });
      if (res.ok) {
        const added = await res.json();
        setEmployees(prev => [...prev, added]);
      } else {
        const id = `E0${employees.length + 1}`;
        const employeeWithId: Employee = { ...newEmp, id };
        setEmployees(prev => [...prev, employeeWithId]);
      }
    } catch (err) {
      const id = `E0${employees.length + 1}`;
      const employeeWithId: Employee = { ...newEmp, id };
      setEmployees(prev => [...prev, employeeWithId]);
    }

    const id = `E0${employees.length + 1}`;
    // Create an empty payroll record for this employee
    const newPayrun: PayrollRecord = {
      id: `PAY0${payroll.length + 1}`,
      employeeId: id,
      employeeName: newEmp.name,
      role: newEmp.role,
      month: 'July 2026',
      basePay: newEmp.baseSalary,
      bonus: 0,
      deduction: 0,
      status: 'Pending',
      completedTasksCount: 0
    };
    setPayroll(prev => [...prev, newPayrun]);

    // System Notification
    const systemNotification: Notification = {
      id: `N${Date.now()}`,
      type: 'System',
      title: 'New Roster Member Onboarded',
      message: `${newEmp.name} has been enrolled as a ${newEmp.role} with a starting base payroll allocation.`,
      timestamp: new Date().toISOString(),
      sender: 'HR Staff',
      isRead: false
    };
    setNotifications(prev => [systemNotification, ...prev]);
  };

  // Update Payroll Records
  const updatePayrollRecord = (updatedRecord: PayrollRecord) => {
    setPayroll(prev => prev.map(p => p.id === updatedRecord.id ? updatedRecord : p));
  };

  // Task allocation & dynamic percentage updates
  const allocateTask = async (newTask: Omit<Task, 'id' | 'projectName' | 'assignedName'>) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId: newTask.projectId,
          title: newTask.title,
          priority: newTask.priority,
          assignedTo: newTask.assignedTo
        })
      });
      if (res.ok) {
        // reload tasks and projects from DB
        fetch('/api/tasks', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setTasks(data);
        });
        fetch('/api/projects', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setProjects(data);
        });
      } else {
        fallbackAllocateTask(newTask);
      }
    } catch (err) {
      fallbackAllocateTask(newTask);
    }
  };

  const fallbackAllocateTask = (newTask: Omit<Task, 'id' | 'projectName' | 'assignedName'>) => {
    const id = `T0${tasks.length + 1}`;
    const project = projects.find(p => p.id === newTask.projectId);
    const employee = employees.find(e => e.id === newTask.assignedTo);

    const taskWithMetadata: Task = {
      ...newTask,
      id,
      projectName: project?.name || 'Unknown Project',
      assignedName: employee?.name || 'Unassigned'
    };

    const updatedTasks = [...tasks, taskWithMetadata];
    setTasks(updatedTasks);
    recalculateProjectPercentage(newTask.projectId, updatedTasks);
  };

  // Complete / update task status
  const updateTaskStatus = async (taskId: string, status: Task['status'], payload?: any) => {
    try {
      const headers = getRequestHeaders();
      const bodyPayload: any = { status };
      if (payload) {
        if (typeof payload === 'string') {
          bodyPayload.reviewerNotes = payload;
        } else if (typeof payload === 'object') {
          bodyPayload.deliverable = {
            fileUrl: payload.link || '',
            previewProxy: payload.link || '',
            designerNotes: payload.notes || ''
          };
        }
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        // reload tasks and projects from DB to get updated dynamic percentage
        fetch('/api/tasks', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setTasks(data);
        });
        fetch('/api/projects', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setProjects(data);
        });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Error: ${data.error || 'Failed to update task status.'}`);
      }
    } catch (err) {
      fallbackTaskUpdate(taskId, status, payload);
    }
  };

  const fallbackTaskUpdate = (taskId: string, status: Task['status'], payload?: any) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const oldTask = tasks[taskIndex];
    const updatedTask = {
      ...oldTask,
      status,
      ...(payload && typeof payload === 'string' ? { reviewerNotes: payload } : {}),
      ...(payload && typeof payload === 'object' ? { deliverables: payload, submissionDate: new Date().toISOString().split('T')[0] } : {})
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    setTasks(updatedTasks);

    // Dynamic payroll task integration:
    // If a task becomes completed, we increment completedTasksCount for the respective payroll record!
    if (status === 'Completed' && oldTask.status !== 'Completed') {
      setPayroll(prev => prev.map(p => {
        if (p.employeeId === oldTask.assignedTo && p.month === 'July 2026') {
          return {
            ...p,
            completedTasksCount: p.completedTasksCount + 1,
            // Automatically grant a small early delivery bonus if priority was High
            ...(oldTask.priority === 'High' ? { 
              bonus: p.bonus + 100, 
              bonusReason: p.bonusReason ? `${p.bonusReason}; high-priority deliverable completed` : 'High-priority task bonus' 
            } : {})
          };
        }
        return p;
      }));

      // Trigger automatic completion update
      recalculateProjectPercentage(oldTask.projectId, updatedTasks);
    }
  };

  // Dynamic percentage aggregation
  const recalculateProjectPercentage = (projectId: string, currentTasks: Task[]) => {
    const projTasks = currentTasks.filter(t => t.projectId === projectId);
    if (projTasks.length === 0) return;

    const completed = projTasks.filter(t => t.status === 'Completed').length;
    const completionPercentage = Math.round((completed / projTasks.length) * 100);

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextStatus = completionPercentage === 100 ? 'Completed' : p.status;
        return {
          ...p,
          completionPercentage,
          status: nextStatus as any
        };
      }
      return p;
    }));
  };

  // Inventory asset checkouts
  const checkoutItem = async (itemId: string, employeeId: string, projectId: string) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`/api/inventory/${itemId}/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ employeeId, projectId })
      });
      if (res.ok) {
        fetch('/api/inventory', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setInventory(data);
        });
      } else {
        fallbackCheckout(itemId, employeeId, projectId);
      }
    } catch (err) {
      fallbackCheckout(itemId, employeeId, projectId);
    }
  };

  const fallbackCheckout = (itemId: string, employeeId: string, projectId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const project = projects.find(p => p.id === projectId);

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'Checked Out',
          checkedOutTo: employeeId,
          checkedOutName: employee?.name || 'Staff',
          checkedOutDate: new Date().toISOString().split('T')[0],
          checkedOutFor: projectId,
          projectName: project?.name || 'Project Stream'
        };
      }
      return item;
    }));
  };

  // Inventory returns
  const checkinItem = async (itemId: string) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`/api/inventory/${itemId}/return`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        fetch('/api/inventory', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setInventory(data);
        });
      } else {
        fallbackCheckin(itemId);
      }
    } catch (err) {
      fallbackCheckin(itemId);
    }
  };

  const fallbackCheckin = (itemId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'Available',
          checkedOutTo: undefined,
          checkedOutName: undefined,
          checkedOutDate: undefined,
          checkedOutFor: undefined,
          projectName: undefined
        };
      }
      return item;
    }));
  };

  // Change maintenance status tags
  const updateItemStatus = async (itemId: string, status: InventoryItem['status']) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`/api/inventory/${itemId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetch('/api/inventory', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setInventory(data);
        });
      } else {
        fallbackStatusUpdate(itemId, status);
      }
    } catch (err) {
      fallbackStatusUpdate(itemId, status);
    }
  };

  const fallbackStatusUpdate = (itemId: string, status: InventoryItem['status']) => {
    setInventory(prev => prev.map(item => item.id === itemId ? { ...item, status } : item));
  };

  // Add inventory asset
  const addItem = async (item: Omit<InventoryItem, 'id' | 'status'>) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          serialNumber: item.serialNumber
        })
      });
      if (res.ok) {
        fetch('/api/inventory', { headers }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setInventory(data);
        });
      } else {
        fallbackAddItem(item);
      }
    } catch (err) {
      fallbackAddItem(item);
    }
  };

  const fallbackAddItem = (item: Omit<InventoryItem, 'id' | 'status'>) => {
    const id = `INV0${inventory.length + 1}`;
    setInventory(prev => [...prev, { ...item, id, status: 'Available' }]);
  };

  // Allocate schedule slot
  const addSchedule = (newSched: Omit<ScheduleEntry, 'id' | 'employeeName' | 'projectName'>) => {
    const id = `S0${schedules.length + 1}`;
    const employee = employees.find(e => e.id === newSched.employeeId);
    const project = projects.find(p => p.id === newSched.projectId);

    const scheduleWithMetadata: ScheduleEntry = {
      ...newSched,
      id,
      employeeName: employee?.name || 'Staff Member',
      projectName: project?.name || 'Project Stream'
    };

    setSchedules(prev => [...prev, scheduleWithMetadata]);
  };

  // Priority Incident Alert & Notification Engine
  const triggerPriorityNotification = (projectName: string, title: string, message: string) => {
    const alertId = `ALERT-${Date.now()}`;
    const alert: Notification = {
      id: alertId,
      type: 'PriorityAlert',
      title,
      message,
      projectName,
      timestamp: new Date().toISOString(),
      sender: 'Operations Staff',
      isRead: false
    };

    setNotifications(prev => [alert, ...prev]);

    // Active instant banner toast display
    setActiveToast({
      id: alertId,
      title,
      message
    });
  };

  // Dismiss Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // ==========================================
  // HR STATE MUTATIONS (FULL-STACK PERSISTED)
  // ==========================================
  const addAttendanceLog = async (log: AttendanceLog) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify(log)
      });
      if (res.ok) {
        const added = await res.json();
        setAttendanceLogs(prev => [added, ...prev]);
      } else {
        setAttendanceLogs(prev => [log, ...prev]);
      }
    } catch (err) {
      setAttendanceLogs(prev => [log, ...prev]);
    }
  };

  const updateAttendanceLog = async (updated: AttendanceLog) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`/api/attendance/${updated.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const saved = await res.json();
        setAttendanceLogs(prev => prev.map(l => l.id === saved.id ? saved : l));
      } else {
        setAttendanceLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
      }
    } catch (err) {
      setAttendanceLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
    }
  };

  const addLeaveRequest = async (req: LeaveRequest) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
      });
      if (res.ok) {
        const added = await res.json();
        setLeaveRequests(prev => [added, ...prev]);
      } else {
        setLeaveRequests(prev => [req, ...prev]);
      }
    } catch (err) {
      setLeaveRequests(prev => [req, ...prev]);
    }
  };

  const updateLeaveRequest = async (requestId: string, status: LeaveRequest['status']) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`/api/leaves/${requestId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const saved = await res.json();
        setLeaveRequests(prev => prev.map(r => r.id === saved.id ? saved : r));
      } else {
        setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      }
    } catch (err) {
      setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    }
  };

  const addHelpDeskTicket = async (ticket: HelpDeskTicket) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify(ticket)
      });
      if (res.ok) {
        const added = await res.json();
        setHelpDeskTickets(prev => [added, ...prev]);
      } else {
        setHelpDeskTickets(prev => [ticket, ...prev]);
      }
    } catch (err) {
      setHelpDeskTickets(prev => [ticket, ...prev]);
    }
  };

  const updateHelpDeskTicket = async (ticketId: string, status: HelpDeskTicket['status']) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const saved = await res.json();
        setHelpDeskTickets(prev => prev.map(t => t.id === saved.id ? saved : t));
      } else {
        setHelpDeskTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      }
    } catch (err) {
      setHelpDeskTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    }
  };

  const addAppraisal = async (appr: PerformanceAppraisal) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/appraisals', {
        method: 'POST',
        headers,
        body: JSON.stringify(appr)
      });
      if (res.ok) {
        const added = await res.json();
        setAppraisals(prev => [added, ...prev]);
      } else {
        setAppraisals(prev => [appr, ...prev]);
      }
    } catch (err) {
      setAppraisals(prev => [appr, ...prev]);
    }
  };

  const updateEmployeeDetails = async (details: EmployeeDetails) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/employee-details', {
        method: 'POST',
        headers,
        body: JSON.stringify(details)
      });
      if (res.ok) {
        const saved = await res.json();
        setEmployeeDetails(prev => prev.map(d => d.employeeId === saved.employeeId ? saved : d));
      } else {
        setEmployeeDetails(prev => {
          const exists = prev.some(d => d.employeeId === details.employeeId);
          if (exists) {
            return prev.map(d => d.employeeId === details.employeeId ? details : d);
          } else {
            return [...prev, details];
          }
        });
      }
    } catch (err) {
      setEmployeeDetails(prev => {
        const exists = prev.some(d => d.employeeId === details.employeeId);
        if (exists) {
          return prev.map(d => d.employeeId === details.employeeId ? details : d);
        } else {
          return [...prev, details];
        }
      });
    }
  };

  const castVote = async (optionIndex: number) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/engagement-poll/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ optionIndex })
      });
      if (res.ok) {
        const saved = await res.json();
        setEngagementPoll(saved);
      } else {
        setEngagementPoll(prev => {
          const updatedOptions = prev.options.map((opt, idx) => {
            if (idx === optionIndex) return { ...opt, votes: opt.votes + 1 };
            return opt;
          });
          return { ...prev, options: updatedOptions, userVotedIndex: optionIndex };
        });
      }
    } catch (err) {
      setEngagementPoll(prev => {
        const updatedOptions = prev.options.map((opt, idx) => {
          if (idx === optionIndex) return { ...opt, votes: opt.votes + 1 };
          return opt;
        });
        return { ...prev, options: updatedOptions, userVotedIndex: optionIndex };
      });
    }
  };

  const addForumPost = async (content: string, authorName: string, authorRole: string) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch('/api/forum-posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, authorName, authorRole })
      });
      if (res.ok) {
        const added = await res.json();
        setForumPosts(prev => [added, ...prev]);
      } else {
        const newPost: ForumPost = {
          id: `FORUM-${Date.now()}`,
          authorName,
          authorRole,
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
        };
        setForumPosts(prev => [newPost, ...prev]);
      }
    } catch (err) {
      const newPost: ForumPost = {
        id: `FORUM-${Date.now()}`,
        authorName,
        authorRole,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
      };
      setForumPosts(prev => [newPost, ...prev]);
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-600 font-sans selection:bg-indigo-600 selection:text-white pb-12" id="app-root">
      {/* Dynamic Instant Broadcaster Toast Alert */}
      {activeToast && (
        <div 
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500 overflow-hidden animate-slide-in p-5 space-y-3"
          id="system-toast-alert"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 animate-ping shrink-0 text-white" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase">Stakeholders Alert Broadcast</span>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm">{activeToast.title}</h4>
            <p className="text-xs text-white/90 leading-relaxed mt-1">{activeToast.message}</p>
          </div>
          <div className="text-[10px] text-white/70 font-mono text-right">
            Dispatched to HR, Operations, Clients & Management
          </div>
        </div>
      )}

      {/* Main Console Header */}
      <Header 
        currentRole={currentRole} 
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Role Identity Notice */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Info className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Logged in as: <strong className="text-gray-950">{currentUser.name}</strong> ({currentRole}).</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            <span>SYS STATUS: {isSocketConnected ? 'STABLE REAL-TIME' : 'STABLE OFFLINE-MODE'}</span>
          </div>
        </div>

        {/* Global Tab Routers */}
        {activeTab === 'dashboard' && (
          <div>
            {currentRole === 'HR Staff' && (
              <HRDashboard 
                employees={employees} 
                payroll={payroll} 
                schedules={schedules}
                tasks={tasks}
                onboardEmployee={onboardEmployee}
                updatePayrollRecord={updatePayrollRecord}
                attendanceLogs={attendanceLogs}
                updateAttendanceLog={updateAttendanceLog}
                leaveRequests={leaveRequests}
                updateLeaveRequest={updateLeaveRequest}
                helpDeskTickets={helpDeskTickets}
                updateHelpDeskTicket={updateHelpDeskTicket}
                appraisals={appraisals}
                addAppraisal={addAppraisal}
                employeeDetails={employeeDetails}
                updateEmployeeDetails={updateEmployeeDetails}
                engagementPoll={engagementPoll}
                forumPosts={forumPosts}
                addForumPost={addForumPost}
              />
            )}
            {currentRole === 'Operations Staff' && (
              <OperationsDashboard 
                projects={projects}
                tasks={tasks}
                employees={employees}
                allocateTask={allocateTask}
                updateTaskStatus={updateTaskStatus}
                triggerPriorityNotification={triggerPriorityNotification}
              />
            )}
            {currentRole === 'Creative/Technical Staff' && (
              <CreativeDashboard 
                employees={employees}
                tasks={tasks}
                inventory={inventory}
                schedules={schedules}
                updateTaskStatus={updateTaskStatus}
                attendanceLogs={attendanceLogs}
                addAttendanceLog={addAttendanceLog}
                updateAttendanceLog={updateAttendanceLog}
                leaveRequests={leaveRequests}
                addLeaveRequest={addLeaveRequest}
                helpDeskTickets={helpDeskTickets}
                addHelpDeskTicket={addHelpDeskTicket}
                appraisals={appraisals}
                employeeDetails={employeeDetails}
                updateEmployeeDetails={updateEmployeeDetails}
                engagementPoll={engagementPoll}
                castVote={castVote}
                forumPosts={forumPosts}
                addForumPost={addForumPost}
                defaultStaffId={currentUser.id}
              />
            )}
            {currentRole === 'Stakeholder' && (
              <StakeholderDashboard 
                projects={projects}
                payroll={payroll}
                employees={employees}
                notifications={notifications}
                auditLogs={auditLogs}
              />
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryModule 
            inventory={inventory}
            employees={employees}
            projects={projects}
            checkoutItem={checkoutItem}
            checkinItem={checkinItem}
            updateItemStatus={updateItemStatus}
            addItem={addItem}
          />
        )}

        {activeTab === 'scheduling' && (
          <SchedulingModule 
            schedules={schedules}
            employees={employees}
            projects={projects}
            addSchedule={addSchedule}
          />
        )}
      </main>
    </div>
  );
}
