import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn, Sparkles, Loader2, Info } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(true);

  const demoAccounts = [
    {
      role: 'HR Specialist',
      email: 'hr@agency.com',
      badge: 'HR Staff',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      description: 'Manages employee records, payroll database, leave request approvals, performance appraisals.'
    },
    {
      role: 'Operations Manager',
      email: 'ops@agency.com',
      badge: 'Operations Staff',
      color: 'bg-blue-50 text-blue-700 border-blue-200/60',
      description: 'Handles project creations, task allocation, system alert broadcasts, milestone percentages.'
    },
    {
      role: 'Web Developer',
      email: 'sarah.j@creativeagency.com',
      badge: 'Creative/Technical Staff',
      color: 'bg-purple-50 text-purple-700 border-purple-200/60',
      description: 'Accesses personal task lists, logs project timesheets, registers attendance logs, reviews dossier & skills.'
    },
    {
      role: 'Lead Photographer',
      email: 'alex.r@creativeagency.com',
      badge: 'Creative/Technical Staff',
      color: 'bg-purple-50 text-purple-700 border-purple-200/60',
      description: 'Employee Self-Service (ESS) view, submits media deliverable links, checks out equipment gear.'
    },
    {
      role: 'Enterprise Stakeholder',
      email: 'stakeholder@agency.com',
      badge: 'Stakeholder',
      color: 'bg-amber-50 text-amber-700 border-amber-200/60',
      description: 'Tracks agency budget metrics, review logs, audits secure database ledger records.'
    }
  ];

  const handleDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('[Login Error]:', err);
      // Client-side fallback authentication if server is not reachable
      const matchedDemo = demoAccounts.find(d => d.email.toLowerCase() === email.toLowerCase());
      if (matchedDemo && password === 'password123') {
        let mappedRole = 'CREATIVE_SPECIALIST';
        if (matchedDemo.badge === 'HR Staff') mappedRole = 'HR_STAFF';
        else if (matchedDemo.badge === 'Operations Staff') mappedRole = 'OPERATIONS_STAFF';
        else if (matchedDemo.badge === 'Stakeholder') mappedRole = 'STAKEHOLDER';

        const mockUser = {
          id: email === 'sarah.j@creativeagency.com' ? 'E01' : email === 'alex.r@creativeagency.com' ? 'E02' : 'mock-uid',
          email: matchedDemo.email,
          name: email === 'sarah.j@creativeagency.com' ? 'Sarah Jenkins' : email === 'alex.r@creativeagency.com' ? 'Alex Rivera' : matchedDemo.role,
          role: mappedRole,
          contractType: 'FULL_TIME'
        };
        onLoginSuccess(mockUser, 'mock_jwt_token_fallback');
      } else {
        setError('Network error: Unable to connect to multi-service ERP server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-root">
      {/* Background decoration elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 animate-slide-in">
        
        {/* Brand Description Side */}
        <section className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise People v2.4</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 leading-tight">
              Unified <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">ERP Portal</span>
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto lg:mx-0">
              Integrate agency logistics, resource utilization rosters, live media deliverable queues, and automated audit logs in one clean terminal workspace.
            </p>
          </div>

          <div className="hidden lg:block border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 font-mono">
              <Info className="h-4 w-4 text-indigo-600" />
              Role-Based Redirection Matrix
            </h3>
            <ul className="text-xs text-gray-500 space-y-2.5 leading-relaxed">
              <li>• <strong className="text-gray-700">HR Staff:</strong> Triggers timesheet auditing, leaves registry and payroll payouts.</li>
              <li>• <strong className="text-gray-700">Operations:</strong> Dispatches project blueprints, task priorities and server Alerts.</li>
              <li>• <strong className="text-gray-700">Creative Staff (Developer):</strong> Opens direct Employee Self-Service dashboard.</li>
              <li>• <strong className="text-gray-700">Stakeholder:</strong> Generates budget summaries and immutable audit ledger.</li>
            </ul>
          </div>
        </section>

        {/* Login Form Side */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Glassmorphic Login Form */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 tracking-tight">Access Terminal</h2>
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2 animate-shake" id="login-error-message">
                <span className="font-bold shrink-0">Error:</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    autocomplete="username"
                    required
                    inputmode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.j@creativeagency.com"
                    className="w-full text-sm py-3 pl-11 pr-4 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Password</label>
                  <span className="text-[10px] text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors select-none">Forgot password?</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password-input"
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-sm py-3 pl-11 pr-4 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Secure Session...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Collapsible Demo Accounts Quick Autofill */}
          <div className="bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-3xl p-5 space-y-3 shadow-xs">
            <button 
              onClick={() => setShowDemoCreds(!showDemoCreds)}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors"
            >
              <span>Demo Accounts (Click to Autofill)</span>
              <span className="text-[10px] text-gray-400">{showDemoCreds ? 'Hide' : 'Show'}</span>
            </button>

            {showDemoCreds && (
              <div className="grid grid-cols-1 gap-2 pt-1.5 animate-fade-in">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => handleDemoClick(demo.email)}
                    className="p-3 bg-white hover:bg-indigo-50/20 border border-gray-200/65 rounded-2xl text-left transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{demo.role}</span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full font-mono shrink-0 ${demo.color}`}>
                          {demo.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{demo.description}</p>
                    </div>
                    <div className="text-[10px] font-mono text-gray-600 group-hover:text-indigo-600 transition-colors bg-slate-50 border border-gray-100 px-2 py-1 rounded-md shrink-0">
                      {demo.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
