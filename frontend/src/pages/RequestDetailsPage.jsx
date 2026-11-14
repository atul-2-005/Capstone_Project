import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { requestApi, commentApi, userApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Skeleton } from '../components/Skeleton';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  User,
  Building,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  Shield,
  Wrench,
  Check,
  AlertCircle,
  X,
  FileCheck,
  ArrowUpRight
} from 'lucide-react';

const LIFECYCLE_STEPS = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function RequestDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Staff Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [statusError, setStatusError] = useState('');

  // Admin Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Admin Change Priority Modal
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [newPriority, setNewPriority] = useState('');
  const [priorityReason, setPriorityReason] = useState('');
  const [priorityError, setPriorityError] = useState('');
  const [submittingPriority, setSubmittingPriority] = useState(false);

  const role = user?.role || 'STUDENT';

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await requestApi.getById(id);
      setRequest(res.data);
      setNewStatus(res.data.status);
      setNewPriority(res.data.priority);
    } catch (err) {
      console.error("Failed to load request", err);
      toast.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await commentApi.addComment(id, { comment: commentText.trim() });
      setCommentText('');
      toast.success('Comment posted successfully');
      fetchRequestDetails();
    } catch (err) {
      console.error("Failed to add comment", err);
      toast.error('Could not post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const res = await userApi.getStaffMembers();
      setStaffList(res.data || []);
      if (res.data?.length > 0) {
        setSelectedStaffId(res.data[0].id.toString());
      }
      setShowAssignModal(true);
    } catch (err) {
      console.error("Failed to load staff list", err);
      toast.error("Could not fetch technicians list");
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const staff = staffList.find((s) => s.id.toString() === selectedStaffId);
    if (!staff) return;

    try {
      await requestApi.assign(id, {
        staffId: staff.id,
        staffName: staff.name,
        departmentId: staff.departmentId,
        departmentName: staff.departmentName,
        notes: assignNotes,
      });
      setShowAssignModal(false);
      toast.success(`Request assigned to ${staff.name}`);
      fetchRequestDetails();
    } catch (err) {
      console.error("Failed to assign request", err);
      toast.error('Assignment failed');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusError('');

    if (newStatus === 'RESOLVED' && !resolutionNotes.trim()) {
      setStatusError('Resolution notes are mandatory when marking an issue as RESOLVED');
      return;
    }

    try {
      await requestApi.updateStatus(id, {
        status: newStatus,
        resolutionNotes: resolutionNotes.trim(),
        comment: statusComment.trim(),
      });
      setShowStatusModal(false);
      toast.success(`Ticket status updated to ${newStatus}`);
      fetchRequestDetails();
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    setPriorityError('');
    setSubmittingPriority(true);

    try {
      await requestApi.updatePriority(id, {
        priority: newPriority,
        reason: priorityReason.trim() || 'Admin priority adjustment',
      });
      setShowPriorityModal(false);
      toast.success(`Priority updated to ${newPriority}`);
      fetchRequestDetails();
    } catch (err) {
      setPriorityError(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setSubmittingPriority(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="card-premium p-12 text-center text-slate-500 space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-slate-400" />
        <p className="text-sm font-bold text-slate-700">Service Request Not Found</p>
        <p className="text-xs text-slate-400">The ticket reference does not exist or access is restricted.</p>
        <button
          onClick={() => navigate('/requests')}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(request.status);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 card-premium p-6">
        <div className="flex items-start space-x-3.5">
          <button
            onClick={() => navigate('/requests')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {request.requestNumber}
              </span>
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{request.title}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>{request.location}</span>
              <span className="mx-2">•</span>
              <span>Submitted by {request.studentName} on {new Date(request.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons based on role */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(role === 'STAFF' || role === 'ADMIN') && (
            <button
              onClick={() => {
                setNewStatus(request.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED');
                setShowStatusModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Update Status / Resolve</span>
            </button>
          )}

          {role === 'ADMIN' && (
            <>
              <button
                onClick={() => {
                  setNewPriority(request.priority);
                  setPriorityReason('');
                  setPriorityError('');
                  setShowPriorityModal(true);
                }}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Change Priority</span>
              </button>

              <button
                onClick={handleOpenAssignModal}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{request.assignedStaffId ? 'Reassign Staff' : 'Assign Staff'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Lifecycle Progression</h3>
          <span className="text-xs font-semibold text-slate-600">
            Current Stage: <span className="text-indigo-600 font-bold">{request.status}</span>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight ${
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details and Metadata 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description, Resolution, Image, Comments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {request.description}
              </p>
            </div>

            {request.imageUrl && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attached Image Evidence</h3>
                <img
                  src={request.imageUrl}
                  alt="Incident attachment"
                  className="rounded-2xl max-h-72 w-full object-cover border border-slate-100 shadow-xs"
                />
              </div>
            )}

            {request.resolutionNotes && (
              <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 shadow-xs">
                <h3 className="text-xs font-bold text-emerald-800 flex items-center mb-1.5">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Technician Resolution Notes
                </h3>
                <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap">
                  {request.resolutionNotes}
                </p>
                {request.resolvedAt && (
                  <p className="text-[10px] text-emerald-700 mt-2 font-medium">
                    Resolved at: {new Date(request.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* MongoDB Comments Section */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-indigo-600" />
                Technician & Student Conversation Feed
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                {request.comments?.length || 0} messages
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {!request.comments || request.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No comments yet. Technicians and students can leave updates here.
                </p>
              ) : (
                request.comments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{c.authorName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            c.authorRole === 'STAFF'
                              ? 'bg-amber-100 text-amber-800'
                              : c.authorRole === 'ADMIN'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.authorRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="pt-3 flex items-center space-x-2 border-t border-slate-100">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post an update, reply, or clarification..."
                className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center shadow-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata & Audit Timeline (1 col) */}
        <div className="space-y-6">
          <div className="card-premium p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Metadata</h3>

            <div className="text-xs space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Category</span>
                <span className="font-semibold text-slate-800">{request.category?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Priority</span>
                <PriorityBadge priority={request.priority} />
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Location</span>
                <span className="font-semibold text-slate-800 text-right">{request.location}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Submitted By</span>
                <span className="font-semibold text-slate-800">{request.studentName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-semibold text-slate-800">{request.departmentName || 'Campus Wide'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Assigned Tech</span>
                <span className="font-semibold text-indigo-600">
                  {request.assignedStaffName || 'Unassigned'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium">Created Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(request.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="card-premium p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Log & State Transitions</h3>
            <div className="space-y-3 text-xs">
              {!request.history || request.history.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No prior history</p>
              ) : (
                request.history.map((h) => (
                  <div key={h.id} className="relative pl-4 border-l-2 border-indigo-200/80 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{h.action}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{h.comments}</p>
                    <p className="text-[10px] text-indigo-600 font-semibold">By: {h.performedByName}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Update Service Request Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Lifecycle Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="ASSIGNED">ASSIGNED (In Queue)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Technician at location)</option>
                  <option value="RESOLVED">RESOLVED (Problem fixed and verified)</option>
                  <option value="CLOSED">CLOSED (Completed & archival)</option>
                  <option value="REJECTED">REJECTED (Invalid or out of scope)</option>
                </select>
              </div>

              {newStatus === 'RESOLVED' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mandatory Resolution Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document exact steps taken (e.g. replaced AP cable, cleared AC drainage trap, replaced fluorescent lamp)..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Log Note / Comment</label>
                <input
                  type="text"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Optional log entry for request history..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                  Confirm Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Assign Staff Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Assign Request to University Staff</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Technician / Staff Member</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.departmentName || 'General Maintenance'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Directive / Notes</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Please inspect before evening laboratory session"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                  Assign Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Change Priority Modal */}
      {showPriorityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Priority Management
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Change Request Priority
                </h3>
              </div>
              <button
                onClick={() => setShowPriorityModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {priorityError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{priorityError}</span>
              </div>
            )}

            <form onSubmit={handlePrioritySubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="LOW">LOW - Minor inconvenience</option>
                  <option value="MEDIUM">MEDIUM - Standard maintenance</option>
                  <option value="HIGH">HIGH - Urgent classroom / academic impact</option>
                  <option value="URGENT">URGENT - Immediate safety hazard or network blackout</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  required
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  placeholder="e.g. Escalated due to upcoming midterm exam in this lab"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPriorityModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPriority}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submittingPriority ? 'Updating...' : 'Update Priority'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
