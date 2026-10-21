import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  HiOutlineCollection, HiOutlineSwitchHorizontal,
  HiOutlineBookmark, HiOutlineGlobe, HiOutlineCurrencyRupee,
  HiOutlineChartBar, HiOutlinePlus
} from 'react-icons/hi';

const RARITY_COLORS = {
  Common: '#3b82f6', Uncommon: '#6366f1', Rare: '#f59e0b',
  'Very Rare': '#f97316', Unique: '#a78bfa'
};
const CONDITION_COLORS = {
  Mint: '#10b981', Used: '#64748b', Cancelled: '#ef4444',
  'First Day Cover': '#f59e0b', 'On Cover': '#6366f1', Other: '#94a3b8'
};

const CollectionDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentStamps, setRecentStamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, stampsRes] = await Promise.all([
          API.get('/stamps/me/stats'),
          API.get(`/stamps/user/${user._id}`)
        ]);
        setStats(statsRes.data);
        setRecentStamps(stampsRes.data.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) return <div className="loading-page"><div className="spinner"></div><p>Loading dashboard...</p></div>;

  const maxCat = stats?.byCategory?.[0]?.count || 1;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>My Collection Dashboard</h1>
          <p>Overview of your philately collection</p>
        </div>
        <Link to="/stamps" className="btn btn-primary">
          <HiOutlinePlus /> Add Stamp
        </Link>
      </div>

      {/* Top Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Stamps', value: stats?.totalStamps || 0, icon: <HiOutlineCollection />, color: 'purple' },
          { label: 'For Trade', value: stats?.forTradeCount || 0, icon: <HiOutlineSwitchHorizontal />, color: 'gold' },
          { label: 'Wanted', value: stats?.wantedCount || 0, icon: <HiOutlineBookmark />, color: 'blue' },
          {
            label: 'Est. Value',
            value: `₹${(stats?.totalValue || 0).toLocaleString()}`,
            icon: <HiOutlineCurrencyRupee />, color: 'green'
          }
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <h3 style={{ fontSize: typeof s.value === 'string' ? '1.4rem' : '1.8rem' }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* By Category */}
        <div className="card">
          <div className="card-header"><h3><HiOutlineChartBar style={{ display: 'inline', marginRight: 6 }} /> By Category</h3></div>
          <div className="card-body">
            {stats?.byCategory?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No stamps yet</p>}
            {stats?.byCategory?.map((item, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>{item._id}</span><span style={{ fontWeight: 700 }}>{item.count}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, transition: 'width 1s ease',
                    width: `${Math.round((item.count / maxCat) * 100)}%`,
                    background: `linear-gradient(90deg, var(--primary-500), var(--accent-400))`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Rarity */}
        <div className="card">
          <div className="card-header"><h3>💎 By Rarity</h3></div>
          <div className="card-body">
            {stats?.byRarity?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No stamps yet</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {stats?.byRarity?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: RARITY_COLORS[item._id] || '#64748b', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{item._id}</span>
                  <span style={{ fontWeight: 700, color: RARITY_COLORS[item._id] || 'var(--text-secondary)' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Condition */}
        <div className="card">
          <div className="card-header"><h3>📋 By Condition</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {stats?.byCondition?.map((item, i) => (
                <div key={i} style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: `${CONDITION_COLORS[item._id] || '#64748b'}20`,
                  border: `1px solid ${CONDITION_COLORS[item._id] || '#64748b'}40`,
                  color: CONDITION_COLORS[item._id] || 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: 600
                }}>
                  {item._id} <span style={{ marginLeft: 6, opacity: 0.8 }}>({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="card">
          <div className="card-header"><h3><HiOutlineGlobe style={{ display: 'inline', marginRight: 6 }} /> Top Countries</h3></div>
          <div className="card-body">
            {stats?.byCountry?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span>{item._id}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Stamps */}
      {recentStamps.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Recently Added Stamps</h3>
            <Link to="/profile" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="card-body">
            <div className="stamps-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {recentStamps.map(stamp => (
                <Link to={`/stamps/${stamp._id}`} key={stamp._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card stamp-card" style={{ margin: 0 }}>
                    {stamp.image ? (
                      <div className="stamp-card-image" style={{ height: 160 }}>
                        <img src={stamp.image.startsWith('/uploads') ? `http://localhost:5000${stamp.image}` : stamp.image} alt={stamp.title} />
                      </div>
                    ) : (
                      <div className="stamp-card-placeholder" style={{ height: 160 }}>📮</div>
                    )}
                    <div className="stamp-card-body" style={{ padding: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.9rem' }}>{stamp.title}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{stamp.country} · {stamp.year}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats?.totalStamps === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📮</div>
          <h3>Your collection is empty</h3>
          <p>Start adding stamps to see your collection analytics here.</p>
          <Link to="/stamps" className="btn btn-primary mt-2"><HiOutlinePlus /> Add Your First Stamp</Link>
        </div>
      )}
    </div>
  );
};

export default CollectionDashboard;
