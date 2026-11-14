import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { requestApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ClipboardList,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Tag,
  AlertTriangle,
  FileText,
  Image,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  { value: 'IT_SUPPORT', label: 'IT Support & Campus Network', icon: '💻' },
  { value: 'HOSTEL_MAINTENANCE', label: 'Hostel Maintenance', icon: '🛏️' },
  { value: 'CLASSROOM_MAINTENANCE', label: 'Classroom & Academic Block', icon: '🏫' },
  { value: 'ELECTRICAL_ISSUES', label: 'Electrical & Power Utilities', icon: '⚡' },
  { value: 'PLUMBING', label: 'Plumbing & Water Supply', icon: '🚰' },
  { value: 'LIBRARY_SERVICES', label: 'Library Facilities & Equipment', icon: '📚' },
  { value: 'TRANSPORT', label: 'Campus Shuttle & Transport', icon: '🚌' },
  { value: 'OTHER', label: 'Other Campus Facilities', icon: '🔧' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', desc: 'Minor inconvenience; no immediate urgency', border: 'border-slate-200' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Normal routine maintenance task', border: 'border-blue-200' },
  { value: 'HIGH', label: 'High', desc: 'Directly impacts coursework or lecture', border: 'border-amber-200' },
  { value: 'URGENT', label: 'Urgent', desc: 'Safety hazard or total lab network down', border: 'border-rose-200' },
];

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: 'IT_SUPPORT',
      priority: 'MEDIUM',
    },
  });

  const selectedPriority = watch('priority');

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      const res = await requestApi.create(data);
      toast.success(`Service request ${res.data.requestNumber} logged successfully!`);
      navigate(`/requests/${res.data.id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit service request. Please check inputs.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back and Page Header */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => navigate('/requests')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Campus Service Request</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log an issue for university maintenance technicians. You'll receive real-time updates as work proceeds.
          </p>
        </div>
      </div>

      <div className="card-premium p-6 sm:p-8 space-y-6">
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Issue Summary / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: 150, message: 'Title cannot exceed 150 characters' },
              })}
              placeholder="e.g. Cisco Access Point unresponsive in Alan Turing Lab 3"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            {errors.title && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.title.message}</p>}
          </div>

          {/* Category & Campus Location 2-col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Service Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('category', { required: 'Please select a category' })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  placeholder="e.g. Alan Turing Block, Floor 2, Lab 3"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.location && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.location.message}</p>}
            </div>
          </div>

          {/* Priority Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Urgency / Priority Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRIORITIES.map((p) => {
                const isSelected = selectedPriority === p.value;
                return (
                  <label
                    key={p.value}
                    className={`relative flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={p.value}
                      {...register('priority')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500 mr-2.5"
                    />
                    <div className="text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900">{p.label}</span>
                        {p.value === 'URGENT' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700">
                            HAZARD
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{p.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Please provide at least 10 characters explaining the problem' },
              })}
              placeholder="Describe the exact issue, symptoms observed, how many students are affected, and any safety concerns..."
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors leading-relaxed"
            />
            {errors.description && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.description.message}</p>}
          </div>

          {/* Image URL optional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Image Attachment (URL - Optional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                {...register('imageUrl')}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 hover:shadow"
            >
              {submitting ? 'Submitting to Queue...' : 'Submit Service Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
