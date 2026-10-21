import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash,
  HiOutlineGlobe, HiOutlineCalendar, HiOutlineTag,
  HiOutlineSwitchHorizontal, HiOutlineBookmark,
  HiOutlineSparkles, HiOutlineCheck
} from 'react-icons/hi';
import StampFormModal from '../components/StampFormModal';

const StampDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stamp, setStamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const fetchStamp = async () => {
    try {
      const { data } = await API.get(`/stamps/${id}`);
      setStamp(data);
    } catch (error) {
      toast.error('Stamp not found');
      navigate('/stamps');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/stamps/me/wishlist');
      setInWishlist(data.some(s => s._id === id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStamp();
  }, [id]);

  useEffect(() => {
    if (stamp && user) {
      checkWishlist();
    }
  }, [stamp, user]);

  const handleDelete = async () => {
    try {
      await API.delete(`/stamps/${id}`);
      toast.success('Stamp deleted');
      navigate('/stamps');
    } catch (error) {
      toast.error('Failed to delete stamp');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save to wishlist');
      return;
    }
    setWishlistLoading(true);
    try {
      const { data } = await API.post('/stamps/wishlist/toggle', { stampId: id });
      setInWishlist(data.added);
      toast.success(data.added ? 'Added to your wishlist!' : 'Removed from wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const rarityColors = {
    'Common': 'var(--info)', 'Uncommon': 'var(--primary-400)',
    'Rare': 'var(--accent-400)', 'Very Rare': 'var(--warning)', 'Unique': '#a78bfa'
  };

  if (loading) return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p>Loading stamp details...</p>
    </div>
  );

  if (!stamp) return null;

  const isOwner = user && stamp.owner?._id === user._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft /> Back to Catalog
        </button>

        {user && !isOwner && (
          <button
            className={`btn btn-sm ${inWishlist ? 'btn-primary' : 'btn-ghost'}`}
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
          >
            {inWishlist ? <HiOutlineCheck /> : <HiOutlineBookmark />}
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Column: Image and Owner */}
        <div>
          {stamp.image ? (
            <div style={{
              background: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'center'
            }}>
              <img
                src={stamp.image}
                alt={stamp.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: 460,
                  borderRadius: 'var(--radius-lg)',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : (
            <div style={{
              width: '100%',
              paddingBottom: '100%',
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '5rem', color: 'var(--text-muted)'
              }}>📮</div>
            </div>
          )}

          {/* Owner Card */}
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1.1rem', color: 'white'
              }}>
                {stamp.owner?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Collector
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                  {stamp.owner?.name}
                </div>
                {stamp.owner?.username && (
                  <Link
                    to={`/collectors/${stamp.owner.username}`}
                    style={{ fontSize: '0.8rem', color: 'var(--primary-400)', textDecoration: 'none' }}
                  >
                    @{stamp.owner.username} · View Profile
                  </Link>
                )}
                {stamp.owner?.location && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    📍 {stamp.owner.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontSize: '2.2rem',
                fontWeight: 700, lineHeight: 1.25, marginBottom: '0.75rem'
              }}>
                {stamp.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-primary">{stamp.category}</span>
                <span className="badge" style={{
                  background: `${rarityColors[stamp.rarity]}20`,
                  color: rarityColors[stamp.rarity]
                }}>{stamp.rarity}</span>
                <span className="badge badge-info">{stamp.condition}</span>
                {stamp.isForTrade && <span className="badge badge-success">Available for Trade</span>}
                {stamp.isWanted && <span className="badge badge-accent">⭐ Wanted by Collector</span>}
              </div>
            </div>

            {(isOwner || isAdmin) && (
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(true)}>
                  <HiOutlinePencil /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                  <HiOutlineTrash />
                </button>
              </div>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                {[
                  { icon: <HiOutlineGlobe />, label: 'Country', value: stamp.country },
                  { icon: <HiOutlineCalendar />, label: 'Year of Issue', value: stamp.year },
                  { icon: '📅', label: 'Issue Date', value: stamp.issueDate || 'Unspecified' },
                  { icon: '🏷️', label: 'Denomination', value: stamp.denomination || 'N/A' },
                  { icon: '🎨', label: 'Theme / Subject', value: stamp.theme || 'General' },
                  { icon: '📦', label: 'Quantity Owned', value: stamp.quantity ?? 1 },
                  {
                    icon: '₹', label: 'Estimated Value',
                    value: stamp.estimatedValue > 0 ? `₹${stamp.estimatedValue.toLocaleString()}` : 'Not Specified'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.label}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {stamp.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{stamp.description}</p>
            </div>
          )}

          {/* Tags */}
          {stamp.tags?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {stamp.tags.map((tag, idx) => (
                  <span key={idx} style={{
                    padding: '0.3rem 0.8rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)'
                  }}>#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Propose a Trade Action */}
          {stamp.isForTrade && user && !isOwner && (
            <Link
              to={`/trades?stampId=${stamp._id}&receiverId=${stamp.owner?._id}&receiverName=${encodeURIComponent(stamp.owner?.name || '')}`}
              className="btn btn-accent btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <HiOutlineSwitchHorizontal /> Propose a Trade with {stamp.owner?.name}
            </Link>
          )}
        </div>
      </div>

      {/* Edit Stamp Modal */}
      {showEditModal && (
        <StampFormModal
          stamp={stamp}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchStamp();
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Stamp?</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete <strong>"{stamp.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Stamp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StampDetail;
