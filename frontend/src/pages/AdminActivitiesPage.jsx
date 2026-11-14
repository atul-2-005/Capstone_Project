import React, { useState, useEffect } from 'react';
import { activityApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  Activity,
  Clock,
  User,
  Shield,
  Search,
  RefreshCw,
  FileText,
  CheckCircle,
  Tag,
  Filter,
  Layers,
  Sparkles,
  Terminal,
  X
} from 'lucide-react';

export default function AdminActivitiesPage() {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await activityApi.getRecent();
      setActivities(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter((a) => {
    if (actionFilter && a.action !== actionFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.userName?.toLowerCase().includes(q) ||
      a.action?.toLowerCase().includes(q) ||
      a.details?.toLowerCase().includes(q) ||
      a.entityType?.toLowerCase().includes(q)
    );
  });

  const uniqueActions = Array.from(new Set(activities.map((a) => a.action).filter(Boolean)));

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
      case 'CREATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ASSIGN':
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STATUS_UPDATE':
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RESOLVE':
      case 'RESOLVED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'DELETE':
      case 'CANCEL':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit & Activity Stream</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live Immutable Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance activity log capturing all maintenance workflows, role actions, and facility reservations.
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 hover:border-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Audit Events</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{activities.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Actors</span>
          <p className="text-xl font-extrabold text-indigo-700 mt-0.5">
            {new Set(activities.map((a) => a.userName)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Categories</span>
          <p className="text-xl font-extrabold text-sky-700 mt-0.5">{uniqueActions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log Integrity</span>
          <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
            MongoDB Verified
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity stream by user, ticket, or action..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Action Types</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Activity Events"
            description="No system audit records match your query or filter criteria."
          />
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map((logItem) => (
              <div key={logItem.id} className="relative flex items-start space-x-3 text-xs">
                {/* Timeline Node */}
                <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-50 shadow-xs" />

                <div className="bg-slate-50/90 border border-slate-200/70 hover:border-slate-300 rounded-2xl p-4 flex-1 space-y-2 transition-all hover:shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {logItem.userName?.charAt(0) || 'U'}
                      </div>
                      <span className="font-bold text-slate-900">{logItem.userName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          logItem.userRole === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-800'
                            : logItem.userRole === 'STAFF'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {logItem.userRole}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {new Date(logItem.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed pl-1">
                    {logItem.details}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/40">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border text-[10px] ${getActionColor(logItem.action)}`}>
                      {logItem.action}
                    </span>
                    <span className="flex items-center text-slate-500">
                      <Terminal className="w-3 h-3 mr-1 text-slate-400" />
                      Target: <strong className="ml-1 text-slate-700">{logItem.entityType}</strong>
                    </span>
                    {logItem.entityId && (
                      <span className="text-slate-400 font-mono text-[10px]">
                        #{logItem.entityId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
