import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Search,
  Users,
  Building2,
  Activity,
  LogOut,
  Menu,
  X,
  PlusCircle,
  GraduationCap,
  Shield,
  Wrench,
  User,
  ChevronDown,
  Sparkles,
  Command,
  CheckCircle2,
  Bell,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const role = user?.role || 'STUDENT';

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Submit Complaint', path: '/requests/new', icon: PlusCircle },
    { name: 'My Complaints', path: '/requests', icon: ClipboardList },
    { name: 'Facility Booking', path: '/facilities', icon: CalendarDays },
  ];

  const staffLinks = [
    { name: 'Staff Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Complaints', path: '/requests', icon: ClipboardList },
    { name: 'Campus Facilities', path: '/facilities', icon: CalendarDays },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Complaints', path: '/requests', icon: ClipboardList },
    { name: 'Campus Facilities', path: '/facilities', icon: CalendarDays },
  ];

  const navLinks = role === 'ADMIN' ? adminLinks : role === 'STAFF' ? staffLinks : studentLinks;

  const roleThemes = {
    STUDENT: {
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      tag: 'Student Portal',
      icon: GraduationCap,
      accent: 'emerald',
      bannerHighlight: 'from-emerald-600/20 to-indigo-600/20',
    },
    STAFF: {
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      tag: 'Staff Operations',
      icon: Wrench,
      accent: 'amber',
      bannerHighlight: 'from-amber-600/20 to-sky-600/20',
    },
    ADMIN: {
      badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      tag: 'Admin Central',
      icon: Shield,
      accent: 'indigo',
      bannerHighlight: 'from-indigo-600/20 to-violet-600/20',
    },
  };

  const theme = roleThemes[role] || roleThemes.STUDENT;
  const RoleIcon = theme.icon;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/70 overflow-hidden font-sans antialiased text-slate-800">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col transition-all duration-300 ease-in-out bg-slate-950 border-r border-slate-800/80 text-slate-300 relative z-20 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                  CampusConnect
                </h1>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase">
                  Higher Ed Ops
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800/60 transition-colors hidden lg:block"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Role Card in Sidebar */}
        {!sidebarCollapsed && (
          <div className="px-3.5 py-3 border-b border-slate-800/60">
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center space-x-3 shadow-inner">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <RoleIcon className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border ${theme.badgeBg}`}>
                    {role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                }`
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!sidebarCollapsed && <span className="ml-3 truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all border border-slate-800/60 ${
              sidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb / Context header */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">CampusConnect</span>
              <span>/</span>
              <span className="capitalize text-slate-600 font-medium">
                {location.pathname.replace('/', '') || 'Dashboard'}
              </span>
              <span className="hidden lg:inline-flex items-center ml-3 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Live Network Active
              </span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center space-x-3">
            {role === 'STUDENT' && (
              <button
                onClick={() => navigate('/requests/new')}
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/20 transition-all hover:shadow"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>New Request</span>
              </button>
            )}

            {/* Notification Bell Dropdown */}
            <NotificationDropdown />

            <div className="h-5 w-px bg-slate-200" />

            {/* Profile Menu Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Role: {role}
                      </span>
                      {user?.departmentName && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate">
                          {user.departmentName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Workspace</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/requests');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                      <span>Service Requests</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 px-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 z-20 animate-in slide-in-from-top-2">
            <div className="px-3 py-2 bg-slate-900 rounded-xl mb-3 flex items-center space-x-2 text-xs text-white">
              <span className={`w-2 h-2 rounded-full ${role === 'ADMIN' ? 'bg-indigo-400' : role === 'STAFF' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="font-bold">{user?.name}</span>
              <span className="text-slate-400 text-[10px]">({role})</span>
            </div>
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-sm ${
                    isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3.5 py-2.5 text-sm text-rose-400 hover:bg-slate-900 rounded-xl mt-3 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Main Content View with custom scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
