import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineLocationMarker, HiOutlineCollection } from 'react-icons/hi';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collection');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get(`/auth/profile/${username}`);
        setProfile(data);
        const stampsRes = await API.get(`/stamps/user/${data._id}`);
        setStamps(stampsRes.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!profile) return (
    <div className="empty-state">
      <div className="empty-icon">👤</div>
      <h3>Profile not found or private</h3>
      <Link to="/collectors" className="btn btn-primary mt-2">Browse Collectors</Link>
    </div>
  );

  return (
    <div>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large" style={{ fontSize: '2rem' }}>
          {profile.avatar ? (
            <img src={profile.avatar.startsWith('/uploads') ? `http://localhost:5000${profile.avatar}` : profile.avatar}
              alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : profile.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>{profile.name}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{profile.username}</span>
          </div>
          {profile.location && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <HiOutlineLocationMarker />{profile.location}
            </div>
          )}
          {profile.bio && <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem', maxWidth: 500 }}>{profile.bio}</p>}
          {profile.collectingInterests?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              {profile.collectingInterests.map((interest, i) => (
                <span key={i} style={{ padding: '0.2rem 0.65rem', background: 'rgba(99,102,241,0.12)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--primary-300)' }}>
                  {interest}
                </span>
              ))}
            </div>
          )}
          <div className="profile-stats" style={{ marginTop: '1rem' }}>
            <div className="profile-stat">
              <div className="stat-number">{stamps.length}</div>
              <div className="stat-label">Stamps</div>
            </div>
            <div className="profile-stat">
              <div className="stat-number">{stamps.filter(s => s.isForTrade).length}</div>
              <div className="stat-label">For Trade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>
          <HiOutlineCollection /> Collection ({stamps.length})
        </button>
      </div>

      {stamps.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 0' }}>
          <p>{profile.name} hasn't added any stamps yet.</p>
        </div>
      ) : (
        <div className="stamps-grid">
          {stamps.map(stamp => (
            <Link to={`/stamps/${stamp._id}`} key={stamp._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card stamp-card">
                {stamp.image ? (
                  <div className="stamp-card-image">
                    <img src={stamp.image.startsWith('/uploads') ? `http://localhost:5000${stamp.image}` : stamp.image} alt={stamp.title} />
                  </div>
                ) : (
                  <div className="stamp-card-placeholder">📮</div>
                )}
                <div className="stamp-card-body">
                  <h3>{stamp.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{stamp.country} · {stamp.year}</div>
                  <div className="stamp-meta">
                    <span className="badge badge-primary">{stamp.category}</span>
                    {stamp.isForTrade && <span className="badge badge-success">For Trade</span>}
                  </div>
                  {stamp.estimatedValue > 0 && (
                    <div style={{ fontWeight: 700, color: 'var(--accent-400)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                      ₹{stamp.estimatedValue.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
