import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers, HiOutlineCollection, HiOutlineChatAlt2,
  HiOutlineSwitchHorizontal, HiOutlineTrash, HiOutlineBan,
  HiOutlineCheckCircle, HiOutlineSearch, HiOutlineRefresh
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await API.get('/admin/users', {
        params: { page: userPage, limit: 15, search: userSearch }
      });
      setUsers(data.users);
      setUsersTotal(data.total);
      setUserTotalPages(data.totalPages);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, userPage]);

  const handleToggleActive = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle-active`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: <HiOutlineUsers />, color: 'purple', sub: `${stats.recentSignups} new this month` },
    { label: 'Total Stamps', value: stats.totalStamps, icon: <HiOutlineCollection />, color: 'gold', sub: 'Across all collections' },
    { label: 'Forum Posts', value: stats.totalPosts, icon: <HiOutlineChatAlt2 />, color: 'green', sub: 'Community discussions' },
    { label: 'Total Trades', value: stats.totalTrades, icon: <HiOutlineSwitchHorizontal />, color: 'blue', sub: `${stats.pendingTrades} pending` },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage and monitor the PhilatelyIndia community</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          User Management ({usersTotal || 0})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {statCards.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                  <div className="stat-info">
                    <h3>{s.value?.toLocaleString()}</h3>
                    <p>{s.label}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Stamps by Category */}
              <div className="card">
                <div className="card-header"><h3>📊 Stamps by Category</h3></div>
                <div className="card-body">
                  {stats?.stampsByCategory?.slice(0, 7).map((item, i) => {
                    const max = stats.stampsByCategory[0]?.count || 1;
                    const pct = Math.round((item.count / max) * 100);
                    return (
                      <div key={i} style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                          <span>{item._id}</span>
                          <span style={{ fontWeight: 600 }}>{item.count}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                            borderRadius: 4, transition: 'width 0.8s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Countries */}
              <div className="card">
                <div className="card-header"><h3>🌍 Top Countries</h3></div>
                <div className="card-body">
                  {stats?.topCountries?.slice(0, 7).map((item, i) => {
                    const max = stats.topCountries[0]?.count || 1;
                    const pct = Math.round((item.count / max) * 100);
                    return (
                      <div key={i} style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                          <span>{item._id}</span>
                          <span style={{ fontWeight: 600 }}>{item.count}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'linear-gradient(90deg, var(--accent-500), var(--success))',
                            borderRadius: 4, transition: 'width 0.8s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Users Info */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header"><h3>👥 Account Status</h3></div>
              <div className="card-body" style={{ display: 'flex', gap: '3rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>{stats?.activeUsers}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Users</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--error)' }}>{stats?.totalUsers - stats?.activeUsers}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Deactivated</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>{stats?.pendingTrades}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending Trades</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-400)' }}>{stats?.recentSignups}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Signups (30d)</div>
                </div>
              </div>
            </div>
          </>
        )
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ flex: 1, maxWidth: 400 }}>
              <HiOutlineSearch className="search-icon" />
              <input
                className="form-input"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setUserPage(1); fetchUsers(); } }}
              />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setUserPage(1); fetchUsers(); }}>
              <HiOutlineRefresh /> Refresh
            </button>
          </div>

          {usersLoading ? (
            <div className="loading-page"><div className="spinner"></div></div>
          ) : (
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '0.85rem 1.25rem', textAlign: 'left',
                        fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-info'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatDate(u.createdAt)}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        {u.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-primary'}`}
                              onClick={() => handleToggleActive(u._id)}
                              title={u.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {u.isActive ? <HiOutlineBan /> : <HiOutlineCheckCircle />}
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDeleteUser(u._id, u.name)} title="Delete user">
                              <HiOutlineTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {userTotalPages > 1 && (
                <div style={{ padding: '1rem' }}>
                  <div className="pagination">
                    <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}>←</button>
                    {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                      const pn = Math.max(1, Math.min(userPage - 2, userTotalPages - 4)) + i;
                      if (pn > userTotalPages) return null;
                      return (
                        <button key={pn} className={userPage === pn ? 'active' : ''} onClick={() => setUserPage(pn)}>{pn}</button>
                      );
                    })}
                    <button onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))} disabled={userPage === userTotalPages}>→</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
