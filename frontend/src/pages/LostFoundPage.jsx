import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { lostFoundApi } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  Search,
  PlusCircle,
  Tag,
  MapPin,
  Calendar,
  Phone,
  CheckCircle,
  AlertCircle,
  Trash2,
  X,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Package,
  User,
  Clock,
  Edit2
} from 'lucide-react';

export default function LostFoundPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL'); // 'ALL' | 'LOST' | 'FOUND'
  const [search, setSearch] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    itemType: 'LOST',
    location: '',
    imageUrl: '',
    contactInfo: '',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    itemType: 'LOST',
    location: '',
    imageUrl: '',
    contactInfo: '',
  });
  const [editError, setEditError] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [itemTypeFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (itemTypeFilter !== 'ALL') params.itemType = itemTypeFilter;
      if (search) params.search = search;
      const res = await lostFoundApi.getAll(params);
      setItems(res.data?.content || res.data || []);
    } catch (err) {
      console.error("Failed to load lost & found", err);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      await lostFoundApi.create({
        ...formData,
        contactInfo: formData.contactInfo || user?.email,
      });
      toast.success(`${formData.itemType === 'LOST' ? 'Lost' : 'Found'} item posted to campus feed!`);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        itemType: 'LOST',
        location: '',
        imageUrl: '',
        contactInfo: '',
      });
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit item listing';
      setModalError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      itemType: item.itemType,
      location: item.location,
      imageUrl: item.imageUrl || '',
      contactInfo: item.contactInfo || '',
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSubmittingEdit(true);

    try {
      await lostFoundApi.update(editingItem.id, editFormData);
      toast.success("Item listing updated successfully!");
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update listing';
      setEditError(msg);
      toast.error(msg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleMarkClaimed = async (id) => {
    try {
      await lostFoundApi.updateStatus(id, 'CLAIMED');
      toast.success("Listing marked as Recovered / Claimed");
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Failed to update status: " + msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await lostFoundApi.delete(id);
      toast.success("Listing removed from feed");
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Failed to delete listing: " + msg);
    }
  };

  const filteredItems = items.filter((item) => {
    if (itemTypeFilter !== 'ALL' && item.itemType !== itemTypeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchCat;
    }
    return true;
  });

  const lostCount = items.filter((i) => i.itemType === 'LOST').length;
  const foundCount = items.filter((i) => i.itemType === 'FOUND').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Lost & Found Hub</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Community Moderated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Report misplaced belongings, browse found items, and claim recovered property across all campus buildings.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0 hover:translate-y-[-1px] active:scale-95"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, tags, buildings, or features..."
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

        {/* Tab Badges */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setItemTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              itemTypeFilter === 'ALL'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setItemTypeFilter('LOST')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
              itemTypeFilter === 'LOST'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Lost Items ({lostCount})</span>
          </button>
          <button
            onClick={() => setItemTypeFilter('FOUND')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
              itemTypeFilter === 'FOUND'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Found Items ({foundCount})</span>
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Items Found"
          description={
            search
              ? "No lost or found items matched your search query. Try another keyword or clear filters."
              : "No items reported in this category yet. Be the first to list a lost or found belonging."
          }
          actionLabel="Report Lost / Found Item"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isOwner = user && user.id === item.ownerId;
            const isAdmin = user && user.role === 'ADMIN';
            const isClaimed = item.status === 'CLAIMED' || item.status === 'RESOLVED';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.itemType === 'LOST'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        item.itemType === 'LOST' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                      {item.itemType}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isClaimed
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                      <Tag className="w-3 h-3 mr-1 text-slate-400" />
                      {item.category}
                    </span>
                    <span className="flex items-center text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {item.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center truncate max-w-[150px]">
                      <Phone className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                      {item.contactInfo || 'Campus Security'}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1 text-slate-400" />
                      {item.ownerName || 'Student'}
                    </span>
                  </div>

                  {/* Actions for owner or admin */}
                  {(isOwner || isAdmin) && (
                    <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-50">
                      {!isClaimed && (
                        <button
                          onClick={() => handleMarkClaimed(item.id)}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[10px] transition-colors flex items-center shadow-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark Recovered
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  New Listing
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Post Lost or Found Item
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* Type Switcher Cards */}
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`p-3 border rounded-xl text-center font-bold cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                    formData.itemType === 'LOST'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="itemType"
                    value="LOST"
                    checked={formData.itemType === 'LOST'}
                    onChange={() => setFormData((p) => ({ ...p, itemType: 'LOST' }))}
                    className="hidden"
                  />
                  <HelpCircle className="w-4 h-4 text-rose-600" />
                  <span>I Lost Something</span>
                </label>

                <label
                  className={`p-3 border rounded-xl text-center font-bold cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                    formData.itemType === 'FOUND'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="itemType"
                    value="FOUND"
                    checked={formData.itemType === 'FOUND'}
                    onChange={() => setFormData((p) => ({ ...p, itemType: 'FOUND' }))}
                    className="hidden"
                  />
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>I Found Something</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Casio Scientific Calculator or Student ID Card"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Academic Supplies">Academic Supplies</option>
                    <option value="Personal Belongings">Personal Belongings</option>
                    <option value="Cards & IDs">Cards & IDs</option>
                    <option value="Apparel & Bags">Apparel & Bags</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Main Library 2nd Floor"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description & Distinguishing Features <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Color, brand stickers, engraved initials, serial number snippet, or contents..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone / Email</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData((p) => ({ ...p, contactInfo: e.target.value }))}
                  placeholder={`Default: ${user?.email || 'Your campus email'}`}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Update Listing
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Item: {editingItem.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Academic Supplies">Academic Supplies</option>
                    <option value="Personal Belongings">Personal Belongings</option>
                    <option value="Cards & IDs">Cards & IDs</option>
                    <option value="Apparel & Bags">Apparel & Bags</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData((p) => ({ ...p, location: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone / Email</label>
                <input
                  type="text"
                  value={editFormData.contactInfo}
                  onChange={(e) => setEditFormData((p) => ({ ...p, contactInfo: e.target.value }))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
