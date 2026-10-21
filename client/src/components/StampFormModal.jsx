import { useState, useRef } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCloudUpload, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi';

const CATEGORIES = [
  'Definitive', 'Commemorative', 'Special', 'Miniature Sheet',
  'First Day Cover', 'Postal Stationery', 'Revenue', 'Airmail', 'Other'
];
const CONDITIONS = ['Mint', 'Used', 'Cancelled', 'First Day Cover', 'On Cover', 'Other'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Unique'];

const StampFormModal = ({ stamp = null, onClose, onSuccess }) => {
  const isEdit = Boolean(stamp && stamp._id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: stamp?.title || '',
    description: stamp?.description || '',
    country: stamp?.country || 'India',
    year: stamp?.year || new Date().getFullYear(),
    issueDate: stamp?.issueDate || '',
    denomination: stamp?.denomination || '',
    theme: stamp?.theme || '',
    category: stamp?.category || 'Commemorative',
    condition: stamp?.condition || 'Mint',
    rarity: stamp?.rarity || 'Common',
    quantity: stamp?.quantity ?? 1,
    estimatedValue: stamp?.estimatedValue || 0,
    image: stamp?.image || '',
    isForTrade: stamp?.isForTrade || false,
    isWanted: stamp?.isWanted || false,
    tags: Array.isArray(stamp?.tags) ? stamp.tags.join(', ') : (stamp?.tags || '')
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);
    try {
      const { data } = await API.post('/uploads/stamp', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: data.url }));
      toast.success('Stamp image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        year: parseInt(formData.year) || new Date().getFullYear(),
        quantity: parseInt(formData.quantity) || 1,
        estimatedValue: parseFloat(formData.estimatedValue) || 0,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };

      if (isEdit) {
        await API.put(`/stamps/${stamp._id}`, payload);
        toast.success('Stamp updated successfully!');
      } else {
        await API.post('/stamps', payload);
        toast.success('Stamp added to collection!');
      }

      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving stamp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Stamp Details' : 'Add New Stamp to Collection'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            
            {/* Image Upload Area */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Stamp Image</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: formData.image ? '160px 1fr' : '1fr', gap: '1rem', alignItems: 'center' }}>
                {formData.image && (
                  <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                    <img
                      src={formData.image}
                      alt="Stamp Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, image: '' }))}
                      style={{
                        position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.85)',
                        color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}
                      title="Remove image"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-elevated)',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', color: 'var(--primary-400)', marginBottom: '0.4rem' }}>
                    <HiOutlineCloudUpload style={{ display: 'inline' }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {uploading ? 'Uploading image...' : 'Click or Drag to Upload Actual Stamp Photo'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    PNG, JPG, WEBP up to 5MB
                  </div>
                </div>
              </div>

              {/* Or manual URL */}
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  className="form-input"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Or paste an image web URL..."
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Title & Description */}
            <div className="form-group">
              <label className="form-label">Stamp Title *</label>
              <input
                className="form-input"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Mahatma Gandhi 1948 Memorial Issue"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="History, watermark, perforation, or details about this stamp..."
                rows={3}
              />
            </div>

            {/* Country & Year */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country of Origin *</label>
                <input
                  className="form-input"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="e.g., India, Great Britain, USA"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year of Issue *</label>
                <input
                  className="form-input"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Issue Date & Denomination */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  className="form-input"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  placeholder="e.g., 15 August 1948"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Denomination</label>
                <input
                  className="form-input"
                  name="denomination"
                  value={formData.denomination}
                  onChange={handleChange}
                  placeholder="e.g., 10 Rps, 1½ Anna, 25c"
                />
              </div>
            </div>

            {/* Category & Theme */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Theme / Subject</label>
                <input
                  className="form-input"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  placeholder="e.g., Leaders, Flora & Fauna, Aviation"
                />
              </div>
            </div>

            {/* Condition & Rarity */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-select" name="condition" value={formData.condition} onChange={handleChange}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rarity Level</label>
                <select className="form-select" name="rarity" value={formData.rarity} onChange={handleChange}>
                  {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Quantity & Estimated Value */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity in Collection</label>
                <input
                  className="form-input"
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Value (₹ INR)</label>
                <input
                  className="form-input"
                  type="number"
                  name="estimatedValue"
                  min="0"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                className="form-input"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="independence, gandhi, memorial, rare"
              />
            </div>

            {/* Toggles: For Trade & Wanted */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', background: 'var(--bg-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="isForTrade"
                  name="isForTrade"
                  checked={formData.isForTrade}
                  onChange={handleChange}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                />
                <label htmlFor="isForTrade" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
                  🔄 Available for Trade
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="isWanted"
                  name="isWanted"
                  checked={formData.isWanted}
                  onChange={handleChange}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-500)', cursor: 'pointer' }}
                />
                <label htmlFor="isWanted" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
                  ⭐ Wanted / Wishlist Stamp
                </label>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
              {submitting ? 'Saving...' : isEdit ? 'Update Stamp' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StampFormModal;
