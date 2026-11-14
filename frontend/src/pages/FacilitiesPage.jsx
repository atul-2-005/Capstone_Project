import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { facilityApi, bookingApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  Building2,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  AlertCircle,
  ShieldCheck,
  Calendar as CalendarIcon,
  Ban,
  Search,
  ChevronRight,
  Info,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Trash2,
  Check
} from 'lucide-react';

export default function FacilitiesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-bookings' | 'all-bookings'

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Facility & Slots
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Admin Add Facility Modal
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    description: '',
    location: '',
    capacity: 50,
    status: 'AVAILABLE',
    bookingRules: '',
  });
  const [facilityError, setFacilityError] = useState('');
  const [submittingFacility, setSubmittingFacility] = useState(false);

  // Bookings Lists
  const [myBookings, setMyBookings] = useState([]);
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingAllBookings, setLoadingAllBookings] = useState(false);

  // Filter/Search inside tables
  const [adminBookingSearch, setAdminBookingSearch] = useState('');

  const role = user?.role || 'STUDENT';

  useEffect(() => {
    fetchFacilities();
    if (activeTab === 'my-bookings') {
      fetchMyBookings();
    } else if (activeTab === 'all-bookings') {
      fetchAllBookings();
    }
  }, [activeTab]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await facilityApi.getAll();
      const list = res.data || [];
      setFacilities(list);
      if (list.length > 0 && !selectedFacility) {
        setSelectedFacility(list[0]);
        loadSlots(list[0].id, selectedDate);
      }
    } catch (err) {
      console.error("Failed to load facilities", err);
      toast.error("Failed to load facilities directory");
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (facilityId, date) => {
    setLoadingSlots(true);
    try {
      const res = await facilityApi.getAvailability(facilityId, date);
      setAvailabilitySlots(res.data || []);
    } catch (err) {
      console.error("Failed to load availability slots", err);
      toast.error("Failed to load schedule slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchMyBookings = async () => {
    setLoadingMyBookings(true);
    try {
      const res = await bookingApi.getMyBookings();
      setMyBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch my bookings", err);
      toast.error("Failed to fetch personal reservations");
    } finally {
      setLoadingMyBookings(false);
    }
  };

  const fetchAllBookings = async () => {
    setLoadingAllBookings(true);
    try {
      const res = await bookingApi.getAll();
      setAllBookings(res.data?.content || res.data || []);
    } catch (err) {
      console.error("Failed to fetch all bookings", err);
      toast.error("Failed to fetch master booking log");
    } finally {
      setLoadingAllBookings(false);
    }
  };

  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility);
    loadSlots(facility.id, selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (selectedFacility) {
      loadSlots(selectedFacility.id, newDate);
    }
  };

  const openBookModalWithSlot = (slot) => {
    if (!slot.available) return;
    setBookingStart(slot.startTime.substring(0, 16));
    setBookingEnd(slot.endTime.substring(0, 16));
    setBookingError('');
    setBookingSuccess('');
    setShowBookingModal(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setSubmittingBooking(true);

    try {
      await bookingApi.create({
        facilityId: selectedFacility.id,
        startTime: bookingStart,
        endTime: bookingEnd,
        purpose: bookingPurpose.trim(),
      });
      setBookingSuccess('Booking confirmed successfully!');
      toast.success(`Facility ${selectedFacility.name} reserved successfully!`);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingPurpose('');
        setBookingSuccess('');
        loadSlots(selectedFacility.id, selectedDate);
        if (activeTab === 'my-bookings') fetchMyBookings();
      }, 1000);
    } catch (err) {
      // Handles 409 CONFLICT or bad request
      const msg = err.response?.data?.message || 'Failed to create booking. Please check for scheduling conflicts.';
      setBookingError(msg);
      toast.error(msg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.cancel(bookingId);
      toast.success("Reservation cancelled successfully");
      if (activeTab === 'my-bookings') fetchMyBookings();
      if (activeTab === 'all-bookings') fetchAllBookings();
      if (selectedFacility) loadSlots(selectedFacility.id, selectedDate);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Failed to cancel: " + msg);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingApi.approve(bookingId);
      toast.success("Booking approved successfully");
      fetchAllBookings();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Failed to approve booking: " + msg);
    }
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setFacilityError('');
    setSubmittingFacility(true);

    try {
      await facilityApi.create({
        ...facilityForm,
        capacity: parseInt(facilityForm.capacity),
      });
      toast.success(`Campus facility "${facilityForm.name}" created successfully!`);
      setShowAddFacilityModal(false);
      setFacilityForm({
        name: '',
        description: '',
        location: '',
        capacity: 50,
        status: 'AVAILABLE',
        bookingRules: '',
      });
      fetchFacilities();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create facility';
      setFacilityError(msg);
      toast.error(msg);
    } finally {
      setSubmittingFacility(false);
    }
  };

  const handleDeleteFacility = async (facilityId, facilityName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${facilityName}" from campus facilities?`)) return;

    try {
      await facilityApi.delete(facilityId);
      toast.success(`Facility "${facilityName}" removed.`);
      if (selectedFacility?.id === facilityId) {
        setSelectedFacility(null);
      }
      fetchFacilities();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Failed to delete facility: " + msg);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const filteredAdminBookings = allBookings.filter((b) => {
    if (!adminBookingSearch) return true;
    const q = adminBookingSearch.toLowerCase();
    return (
      b.facilityName?.toLowerCase().includes(q) ||
      b.studentName?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Facility Reservations</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Auto Overlap Prevention
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Book seminar halls, computing labs, and collaborative study suites with real-time transactional conflict checks.
          </p>
        </div>

        {/* Tab Controls & Add Facility Button for Admin */}
        <div className="flex flex-wrap items-center gap-2">
          {role === 'ADMIN' && (
            <button
              onClick={() => setShowAddFacilityModal(true)}
              className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Facility</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'browse'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Browse & Book</span>
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'my-bookings'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>My Bookings</span>
              {myBookings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold">
                  {myBookings.length}
                </span>
              )}
            </button>
            {role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('all-bookings')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all-bookings'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>All Bookings (Admin)</span>
                {allBookings.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded-full text-[10px] font-bold">
                    {allBookings.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: BROWSE & BOOK */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Facilities Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Campus Facility
              </h2>
              <span className="text-xs text-slate-400">
                {facilities.length} Facilities Available
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CardSkeleton count={3} />
              </div>
            ) : facilities.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Facilities Available"
                description="Campus administration has not listed any facilities for booking yet."
                actionLabel={role === 'ADMIN' ? 'Add Campus Facility' : undefined}
                onAction={role === 'ADMIN' ? () => setShowAddFacilityModal(true) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map((f) => {
                  const isSelected = selectedFacility?.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleSelectFacility(f)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md translate-y-[-2px]'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-colors ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              f.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            {f.status}
                          </span>
                          {role === 'ADMIN' && (
                            <button
                              onClick={(e) => handleDeleteFacility(f.id, f.name, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Facility"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-3.5">{f.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{f.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center text-slate-600">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {f.location}
                        </span>
                        <span className="flex items-center font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {f.capacity} seats
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px] font-bold text-indigo-600">
                          <span className="flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                            Viewing Schedule Below
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Availability Scheduler Visualizer */}
          {selectedFacility && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-extrabold uppercase">
                      2. Live Time Slots
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedFacility.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Select an open green slot to initiate reservation. Overlap prevention automatically validates your window.
                  </p>
                </div>

                {/* Date Picker & Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
                    <button
                      onClick={() => handleDateChange(todayStr)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        selectedDate === todayStr ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleDateChange(tomorrowStr)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        selectedDate === tomorrowStr ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5 border border-slate-200 rounded-lg px-2.5 py-1 bg-white">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={todayStr}
                      className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Slot Legend */}
              <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                  <span>Available Window</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
                  <span>Reserved / Booked</span>
                </span>
              </div>

              {/* Slots Grid */}
              {loadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-shimmer" />
                  ))}
                </div>
              ) : availabilitySlots.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No slot information available for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availabilitySlots.map((slot, index) => {
                    const startStr = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <button
                        key={index}
                        disabled={!slot.available}
                        onClick={() => openBookModalWithSlot(slot)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between ${
                          slot.available
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs cursor-pointer group active:scale-95'
                            : 'bg-rose-50/40 border-rose-200/80 text-rose-800 opacity-70 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 w-full">
                          <Clock className={`w-3 h-3 ${slot.available ? 'text-emerald-500' : 'text-rose-400'}`} />
                          <span className={`w-1.5 h-1.5 rounded-full ${slot.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        </div>
                        <span className="text-xs font-bold block">{startStr} – {endStr}</span>
                        <div className="mt-2 pt-1 border-t border-slate-200/40 w-full">
                          <span className={`text-[10px] font-bold ${
                            slot.available ? 'text-emerald-700 group-hover:underline' : 'text-rose-600'
                          }`}>
                            {slot.available ? 'Reserve Slot' : 'Occupied'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BOOKINGS */}
      {activeTab === 'my-bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Facility Reservations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Track your upcoming and historical campus facility bookings</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {myBookings.length} total
            </span>
          </div>

          {loadingMyBookings ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={5} />
            </div>
          ) : myBookings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No Reservations Yet"
              description="You have not booked any campus facilities yet. Explore available spaces and reserve a slot."
              actionLabel="Browse Available Facilities"
              onAction={() => setActiveTab('browse')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Facility</th>
                    <th className="px-6 py-3.5">Date & Window</th>
                    <th className="px-6 py-3.5">Purpose / Event</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{b.facilityName}</p>
                            <p className="text-[11px] text-slate-400">Ref: #{b.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="font-semibold text-slate-800">{new Date(b.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate font-medium">
                        {b.purpose}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-xs transition-colors hover:shadow-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL BOOKINGS (ADMIN) */}
      {activeTab === 'all-bookings' && role === 'ADMIN' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Master Campus Reservation Register</h3>
              <p className="text-xs text-slate-400 mt-0.5">Audit log of all student and institutional reservations</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={adminBookingSearch}
                onChange={(e) => setAdminBookingSearch(e.target.value)}
                placeholder="Search facility, student..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {loadingAllBookings ? (
            <div className="p-6">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : filteredAdminBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No reservation records match your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Facility</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Time Window</th>
                    <th className="px-6 py-3.5">Purpose</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{b.facilityName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {b.studentName?.charAt(0) || 'U'}
                          </div>
                          <span className="font-semibold text-slate-800">{b.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="font-medium text-slate-800">{new Date(b.startTime).toLocaleDateString()}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate">{b.purpose}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleApproveBooking(b.id)}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  New Reservation
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedFacility?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Conflict Alert */}
            {bookingError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block">Scheduling Conflict Detected</span>
                  {bookingError}
                </div>
              </div>
            )}

            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{bookingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingStart}
                    onChange={(e) => setBookingStart(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingEnd}
                    onChange={(e) => setBookingEnd(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Purpose / Project Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  placeholder="State the academic purpose, team/club name, equipment needed..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {selectedFacility?.bookingRules && (
                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/60 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Facility Guidelines:</span>
                    {selectedFacility.bookingRules}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submittingBooking ? 'Validating Overlap...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Facility Modal */}
      {showAddFacilityModal && role === 'ADMIN' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Campus Facilities Management
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Campus Facility
                </h3>
              </div>
              <button
                onClick={() => setShowAddFacilityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {facilityError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{facilityError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFacility} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Facility Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Mechanical Robotics Testing Arena"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Seating Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={facilityForm.capacity}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, capacity: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={facilityForm.status}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Campus Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={facilityForm.location}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Science & Technology Block 4, Ground Floor"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Facility Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={facilityForm.description}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe technical equipment, projection screens, sound systems, etc..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Booking Rules & Requirements
                </label>
                <input
                  type="text"
                  value={facilityForm.bookingRules}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, bookingRules: e.target.value }))}
                  placeholder="e.g. Safety goggles required. Max booking 2 hours."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFacilityModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFacility}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submittingFacility ? 'Creating...' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
