import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  HiOutlinePencil, HiOutlineSave, HiOutlineX, HiOutlineCollection,
  HiOutlineKey, HiOutlineUser, HiOutlineLocationMarker
} from 'react-icons/hi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [myStamps, setMyStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collection');
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    collectingInterests: user?.collectingInterests?.join(', ') || '',
    avatar: user?.avatar || ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const { data } = await API.get(`/stamps/user/${user._id}`);
        setMyStamps(data);
      } catch { }
      finally { setLoading(false); }
    };
    if (user) fetchStamps();
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', {
        ...profileForm,
        collectingInterests: profileForm.collectingInterests.split(',').map(i => i.trim()).filter(Boolean)
      });
      updateUser(data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPw(true);
    try {
      await API.put('/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPw(false); }
  };

  const tradeableCount = myStamps.filter(s => s.isForTrade).length;

  return (
    <div>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>{user?.name}</h2>
            {user?.role === 'admin' && <span className="badge badge-accent">Admin</span>}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{user?.email}</div>
          {user?.location && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <HiOutlineLocationMarker /> {user.location}
            </div>
          )}
          {user?.bio && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem', maxWidth: 500 }}>{user.bio}</p>
          )}
          {user?.collectingInterests?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              {user.collectingInterests.map((interest, i) => (
                <span key={i} style={{
                  padding: '0.2rem 0.65rem', background: 'rgba(99,102,241,0.12)',
                  borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--primary-300)'
                }}>{interest}</span>
              ))}
            </div>
          )}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="stat-number">{myStamps.length}</div>
              <div className="stat-label">Stamps</div>
            </div>
            <div className="profile-stat">
              <div className="stat-number">{tradeableCount}</div>
              <div className="stat-label">For Trade</div>
            </div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => setEditing(!editing)}>
          {editing ? <><HiOutlineX /> Cancel</> : <><HiOutlinePencil /> Edit Profile</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>
          <HiOutlineCollection /> My Collection ({myStamps.length})
        </button>
        <button className={`tab ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>
          <HiOutlineUser /> Edit Profile
        </button>
        <button className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <HiOutlineKey /> Security
        </button>
      </div>

      {/* Collection Tab */}
      {activeTab === 'collection' && (
        loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : myStamps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📮</div>
            <h3>No stamps in your collection yet</h3>
            <p>Start cataloging your stamps to build your digital collection.</p>
            <Link to="/stamps" className="btn btn-primary mt-2">Browse & Add Stamps</Link>
          </div>
        ) : (
          <div className="stamps-grid">
            {myStamps.map(stamp => (
              <Link to={`/stamps/${stamp._id}`} key={stamp._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card stamp-card">
                  {stamp.image ? (
                    <div className="stamp-card-image">
                      <img src={stamp.image} alt={stamp.title} />
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
                      <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--accent-400)', fontSize: '0.9rem' }}>
                        ₹{stamp.estimatedValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* Edit Profile Tab */}
      {activeTab === 'edit' && (
        <div className="card">
          <div className="card-header"><h3>Edit Profile Information</h3></div>
          <div className="card-body">
            <form onSubmit={handleProfileSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={profileForm.location}
                    onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., New Delhi, India" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={profileForm.bio}
                  onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell others about your philately journey..." />
              </div>
              <div className="form-group">
                <label className="form-label">Collecting Interests (comma separated)</label>
                <input className="form-input" value={profileForm.collectingInterests}
                  onChange={e => setProfileForm(p => ({ ...p, collectingInterests: e.target.value }))}
                  placeholder="Indian Independence, British India, Gandhi, Aviation" />
              </div>
              <div className="form-group">
                <label className="form-label">Avatar URL</label>
                <input className="form-input" value={profileForm.avatar}
                  onChange={e => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <HiOutlineSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="card-header"><h3>Change Password</h3></div>
          <div className="card-body">
            <form onSubmit={handlePasswordChange} style={{ maxWidth: 460 }}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input className="form-input" type="password" value={pwForm.currentPassword}
                  onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input className="form-input" type="password" value={pwForm.newPassword}
                  onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  required placeholder="Minimum 6 characters" minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input className="form-input" type="password" value={pwForm.confirmPassword}
                  onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required placeholder="Repeat new password" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={changingPw}>
                <HiOutlineKey /> {changingPw ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
