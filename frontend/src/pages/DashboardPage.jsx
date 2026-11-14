import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, requestApi, bookingApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  CalendarDays,
  PlusCircle,
  TrendingUp,
  Users,
  AlertTriangle,
  Building,
  ArrowUpRight,
  Shield,
  Search,
  Sparkles,
  ArrowRight,
  Compass,
  Activity,
  CheckCheck,
  Wrench,
  GraduationCap,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-slate-700/80 shadow-xl text-xs">
        <p className="font-semibold text-slate-200">{label}</p>
        <div className="mt-1 space-y-0.5">
          {payload.map((entry, idx) => (
            <p key={idx} className="flex items-center space-x-1.5" style={{ color: entry.color || '#818cf8' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || '#818cf8' }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState(null);
  const [studentRequests, setStudentRequests] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [staffAssigned, setStaffAssigned] = useState([]);

  const role = user?.role || 'STUDENT';

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (role === 'ADMIN') {
        const res = await dashboardApi.getAdminStats();
        setAdminStats(res.data);
      } else if (role === 'STAFF') {
        const res = await requestApi.getAssignedRequests();
        setStaffAssigned(res.data || []);
      } else {
        const [reqRes, bookRes] = await Promise.all([
          requestApi.getMyRequests(),
          bookingApi.getMyBookings(),
        ]);
        setStudentRequests(reqRes.data || []);
        setStudentBookings(bookRes.data || []);
      }
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
          <TableSkeleton rows={4} cols={4} />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. ADMIN EXECUTIVE DASHBOARD
  // =========================================================================
  if (role === 'ADMIN') {
    const deptChartData = adminStats?.requestsByDepartment
      ? Object.entries(adminStats.requestsByDepartment).map(([dept, total]) => ({ dept, total }))
      : [];

    const statusChartData = adminStats?.requestsByStatus
      ? Object.entries(adminStats.requestsByStatus).map(([name, value]) => ({ name, value }))
      : [];

    return (
      <div className="space-y-6">
        {/* Admin Header with Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Operations Room</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase">
                  Central Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time metrics, technician allocation, and campus-wide service telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => navigate('/requests')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center space-x-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Triage Requests</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Staff Directory
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-premium p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Complaints</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{adminStats?.totalRequests || 45}</h3>
              <div className="flex items-center text-[11px] text-indigo-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+8.2% this week</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <ClipboardList className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          <div className="card-premium p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Assignment</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{adminStats?.pendingRequests || 15}</h3>
              <div className="flex items-center text-[11px] text-amber-600 font-semibold mt-1">
                <Clock className="w-3 h-3 mr-1" />
                <span>Requires staff routing</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          <div className="card-premium p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Tickets</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{adminStats?.resolvedRequests || 18}</h3>
              <div className="flex items-center text-[11px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <span>Avg SLA: 4.2 hours</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          <div className="card-premium p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Facility Bookings</p>
              <h3 className="text-2xl font-extrabold text-sky-600 mt-1">{adminStats?.activeBookings || 8}</h3>
              <div className="flex items-center text-[11px] text-sky-600 font-semibold mt-1">
                <CalendarDays className="w-3 h-3 mr-1" />
                <span>Across 5 campus halls</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100">
              <Building className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-indigo-600" />
                  Service Requests by Department
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Workload distribution across university units</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="total" name="Requests" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                  Monthly Incident & Resolution Velocity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">6-month incoming volume vs resolved backlog</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adminStats?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="requests" name="Incoming Complaints" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Distribution & Staff Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Donut */}
          <div className="card-premium p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Status Distribution</h3>
              <p className="text-xs text-slate-400 mb-3">Lifecycle stage breakdown</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              {statusChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span className="truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Workload Table */}
          <div className="lg:col-span-2 card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" />
                  Staff Capacity & Productivity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Assigned workboard load per university department technician</p>
              </div>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center"
              >
                <span>View Full Team</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Technician</th>
                    <th className="pb-3 font-semibold">Active Queue</th>
                    <th className="pb-3 font-semibold">Total Resolved</th>
                    <th className="pb-3 font-semibold">Capacity</th>
                    <th className="pb-3 text-right font-semibold">System State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(adminStats?.staffWorkload || []).map((staff, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-slate-800 flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                          {staff.staffName?.charAt(0)}
                        </div>
                        <span>{staff.staffName}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold text-[11px] border border-amber-200/60">
                          {staff.assignedCount} active
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-emerald-600">
                        {staff.resolvedCount} tasks
                      </td>
                      <td className="py-3 w-36">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (staff.assignedCount / 8) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center text-emerald-600 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                          Online
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. STAFF WORKBENCH DASHBOARD
  // =========================================================================
  if (role === 'STAFF') {
    const pendingCount = staffAssigned.filter((r) => r.status === 'ASSIGNED').length;
    const inProgressCount = staffAssigned.filter((r) => r.status === 'IN_PROGRESS').length;
    const resolvedCount = staffAssigned.filter((r) => r.status === 'RESOLVED').length;

    return (
      <div className="space-y-6">
        {/* Staff Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight">Technician Service Workboard</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Staff Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Active tickets assigned to you across university academic and residential complexes
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/requests')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 shrink-0"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Open All Requests</span>
          </button>
        </div>

        {/* Staff Metric Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-premium p-5 flex items-center justify-between border-l-4 border-l-amber-500">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Triage</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</h3>
              <span className="text-[11px] text-amber-700 font-medium">Assigned, not started</span>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          <div className="card-premium p-5 flex items-center justify-between border-l-4 border-l-indigo-500">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress Work</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{inProgressCount}</h3>
              <span className="text-[11px] text-indigo-600 font-medium">Under active technician repair</span>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <ClipboardList className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          <div className="card-premium p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved By You</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</h3>
              <span className="text-[11px] text-emerald-600 font-medium">Completed & resolution notes filed</span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* Assigned Requests Table */}
        <div className="card-premium overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Your Priority Workboard</h3>
              <p className="text-[11px] text-slate-400">Click any ticket to update progress, inspect location, or add resolution notes</p>
            </div>
            <span className="text-xs font-bold text-indigo-600">
              {staffAssigned.length} Total Assigned
            </span>
          </div>

          {staffAssigned.length === 0 ? (
            <EmptyState
              icon={CheckCheck}
              title="No pending tasks in your queue"
              description="You have completed all assigned university maintenance requests! Great job."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Ticket</th>
                    <th className="px-6 py-3.5">Issue & Location</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Current Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffAssigned.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {req.requestNumber}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 line-clamp-1">{req.title}</p>
                        <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {req.location}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/requests/${req.id}`);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] transition-colors"
                        >
                          Resolve & Update →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. STUDENT PORTAL DASHBOARD
  // =========================================================================
  const submittedCount = studentRequests.length;
  const inProgressCount = studentRequests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  const resolvedCount = studentRequests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
  const activeBookingsCount = studentBookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner with Emerald / Indigo SaaS Gradient */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg overflow-hidden border border-indigo-500/20">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Student Service Hub
            </span>
            <span className="text-xs text-indigo-200">CampusConnect v2.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-2 leading-relaxed">
            Quickly submit campus maintenance issues, reserve seminar rooms and computer labs with atomic overlap protection, or browse recovered items.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/requests/new')}
              className="inline-flex items-center px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 text-indigo-600" />
              <span>Submit New Complaint</span>
            </button>
            <button
              onClick={() => navigate('/facilities')}
              className="inline-flex items-center px-4 py-2.5 bg-indigo-900/60 hover:bg-indigo-900 text-white rounded-xl text-xs font-semibold border border-indigo-400/30 transition-all hover:bg-indigo-900/80"
            >
              <CalendarDays className="w-4 h-4 mr-1.5 text-indigo-300" />
              <span>Reserve Facility</span>
            </button>
            <button
              onClick={() => navigate('/lost-found')}
              className="inline-flex items-center px-4 py-2.5 bg-indigo-900/60 hover:bg-indigo-900 text-white rounded-xl text-xs font-semibold border border-indigo-400/30 transition-all hover:bg-indigo-900/80"
            >
              <Search className="w-4 h-4 mr-1.5 text-indigo-300" />
              <span>Lost & Found Hub</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitted Tickets</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{submittedCount}</h3>
            <span className="text-[11px] text-slate-500 font-medium">All historical tickets</span>
          </div>
          <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        <div className="card-premium p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Under Active Repair</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{inProgressCount}</h3>
            <span className="text-[11px] text-indigo-600 font-medium">Assigned to technician</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
            <Clock className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        <div className="card-premium p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Issues</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Repairs completed</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        <div className="card-premium p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reserved Slots</p>
            <h3 className="text-2xl font-extrabold text-sky-600 mt-1">{activeBookingsCount}</h3>
            <span className="text-[11px] text-sky-600 font-medium">Upcoming campus bookings</span>
          </div>
          <div className="w-11 h-11 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100">
            <CalendarDays className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>
      </div>

      {/* Recent Requests and Upcoming Bookings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Service Requests (2 cols) */}
        <div className="lg:col-span-2 card-premium overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Your Recent Service Requests</h3>
              <p className="text-[11px] text-slate-400">Track real-time progress and technician notes</p>
            </div>
            <button
              onClick={() => navigate('/requests')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center"
            >
              <span>View All ({studentRequests.length})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {studentRequests.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No service requests yet"
                description="Have an issue with lab equipment, classroom AC, or hostel facilities? Submit a ticket and our technicians will resolve it."
                actionLabel="Create Service Request"
                onAction={() => navigate('/requests/new')}
              />
            ) : (
              studentRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/requests/${req.id}`)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-indigo-600">{req.requestNumber}</span>
                      <span className="text-xs font-bold text-slate-800 truncate">{req.title}</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {req.location}
                      </span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Facility Bookings (1 col) */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-indigo-600" />
                Upcoming Facility Reservations
              </h3>
            </div>

            {studentBookings.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CalendarDays className="w-9 h-9 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-700">No upcoming bookings</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Need a seminar hall or research lab?</p>
                <button
                  onClick={() => navigate('/facilities')}
                  className="mt-3 inline-flex items-center text-xs text-indigo-600 font-bold hover:underline"
                >
                  Browse Campus Facilities →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {studentBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{b.facilityName}</p>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{b.purpose}</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-medium">
                      <span>{new Date(b.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/facilities')}
            className="w-full mt-4 py-2.5 text-xs font-bold text-center text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200 transition-colors"
          >
            Explore & Book Campus Facilities
          </button>
        </div>
      </div>
    </div>
  );
}
