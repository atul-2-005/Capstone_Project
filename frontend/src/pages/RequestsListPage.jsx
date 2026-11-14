import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  ClipboardList,
  Search,
  Filter,
  PlusCircle,
  Clock,
  ArrowUpDown,
  Tag,
  AlertCircle,
  MapPin,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
  { value: 'HOSTEL_MAINTENANCE', label: 'Hostel Maintenance' },
  { value: 'CLASSROOM_MAINTENANCE', label: 'Classroom Maintenance' },
  { value: 'ELECTRICAL_ISSUES', label: 'Electrical Issues' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'LIBRARY_SERVICES', label: 'Library Services' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
];

const STATUSES = ['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function RequestsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const role = user?.role || 'STUDENT';

  useEffect(() => {
    fetchRequests();
  }, [role, selectedCategory, selectedStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let res;
      if (role === 'ADMIN') {
        const params = {};
        if (selectedCategory !== 'ALL') params.category = selectedCategory;
        if (selectedStatus !== 'ALL') params.status = selectedStatus;
        if (search) params.search = search;
        res = await requestApi.getAll(params);
        setRequests(res.data?.content || res.data || []);
      } else if (role === 'STAFF') {
        res = await requestApi.getAssignedRequests();
        setRequests(res.data || []);
      } else {
        res = await requestApi.getMyRequests();
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = r.requestNumber?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchLoc = r.location?.toLowerCase().includes(q);
      const matchTech = r.assignedStaffName?.toLowerCase().includes(q);
      return matchNum || matchTitle || matchLoc || matchTech;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {role === 'ADMIN'
              ? 'University Service Tickets & Complaints'
              : role === 'STAFF'
              ? 'My Maintenance Workboard'
              : 'My Service Requests'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'ADMIN'
              ? 'Centrally oversee complaint queues, assign technicians, and monitor resolution timelines'
              : role === 'STAFF'
              ? 'Update repair states, inspect locations, and record resolution notes'
              : 'Submit campus issues, track ticket lifecycles, and communicate with university technicians'}
          </p>
        </div>

        {role === 'STUDENT' && (
          <button
            onClick={() => navigate('/requests/new')}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all shrink-0 hover:shadow"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Submit New Request</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search REQ#, title, location, technician..."
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No service requests found"
            description="No requests match your current search and filter combination. Try resetting filters."
            actionLabel={role === 'STUDENT' ? 'Create New Ticket' : undefined}
            onAction={role === 'STUDENT' ? () => navigate('/requests/new') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Issue & Location</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned To</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-indigo-600 shrink-0">
                      {req.requestNumber}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {req.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                        {req.location}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200/60">
                        {req.category?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {req.assignedStaffName ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{req.assignedStaffName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/requests/${req.id}`);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors shadow-2xs hover:text-indigo-600"
                      >
                        Inspect →
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
