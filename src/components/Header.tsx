import React, { useState } from 'react';
import { UserRole, Notification } from '../types';
import { Bell, Shield, Layers, HelpCircle, Activity, RefreshCw, LogOut, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({
  currentRole,
  notifications,
  markNotificationAsRead,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  theme,
  toggleTheme
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const priorityAlertsCount = notifications.filter(n => n.type === 'PriorityAlert' && !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-4" id="app-header">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Brand Name & Tag */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-sans font-bold text-lg tracking-tight shadow-sm">
            E
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-gray-900 text-lg sm:text-xl">Enterprise People</h1>
            <p className="text-xs text-gray-500 font-sans font-medium">Unified HR & Operations Portal</p>
          </div>
        </div>

        {/* Global Toolbar & RBAC Role Switcher */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between sm:justify-end">
          {/* Main Action Tabs */}
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 text-xs font-medium overflow-x-auto max-w-full whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'dashboard' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
              }`}
              id="header-tab-dashboard"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'inventory' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
              }`}
              id="header-tab-inventory"
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'scheduling' ? 'bg-white text-gray-950 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-950'
              }`}
              id="header-tab-scheduling"
            >
              Scheduling
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer shadow-xs"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* User Info Badge & Log Out Button */}
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-gray-900">{currentUser.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-900 font-sans">{currentRole}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 text-gray-600 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-1 cursor-pointer"
                  title="Log Out"
                  id="logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}


            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg border transition-all ${
                  priorityAlertsCount > 0 
                    ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                    : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
                title="Notifications"
                id="notification-bell-btn"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
                    priorityAlertsCount > 0 ? 'bg-red-600' : 'bg-gray-950'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  id="notifications-dropdown-menu"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-sans font-semibold text-xs text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      Alert Center ({unreadCount} unread)
                    </h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-gray-400 hover:text-gray-950"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-500">
                        No notifications currently on file.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 transition-colors ${
                            !n.isRead ? 'bg-gray-50/70' : 'bg-white'
                          } ${n.type === 'PriorityAlert' ? 'border-l-4 border-red-500' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              n.type === 'PriorityAlert' 
                                ? 'bg-red-100 text-red-700 font-semibold' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {n.type === 'PriorityAlert' ? 'Priority Alert' : 'System'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="font-sans font-semibold text-xs text-gray-900 mb-1">{n.title}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed mb-2">{n.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-mono">
                              By: {n.sender} {n.projectName ? `| Project: ${n.projectName}` : ''}
                            </span>
                            {!n.isRead && (
                              <button
                                onClick={() => markNotificationAsRead(n.id)}
                                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
