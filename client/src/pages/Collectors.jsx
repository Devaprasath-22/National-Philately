import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineCollection } from 'react-icons/hi';

const Collectors = () => {
  const { user } = useAuth();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [interests, setInterests] = useState('');

  const fetchCollectors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (interests) params.interests = interests;
      const { data } = await API.get('/auth/collectors', { params });
      setCollectors(data.filter(c => c._id !== user?._id));
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCollectors(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCollectors();
  };

  // Get unique interest tags from all collectors
  const allInterests = [...new Set(
    collectors.flatMap(c => c.collectingInterests || [])
  )].slice(0, 12);

  return (
    <div>
      <div className="page-header">
        <h1>Discover Collectors</h1>
        <p>Find philatelists with similar interests and build your network</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <HiOutlineSearch className="search-icon" />
          <input className="form-input" placeholder="Search by name, username or location..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input className="form-input" style={{ width: 220 }}
          placeholder="Interests (e.g. Gandhi, Birds)"
          value={interests} onChange={e => setInterests(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Popular Interests Tags */}
      {allInterests.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem' }}>Filter by:</span>
          {allInterests.map((interest, i) => (
            <button key={i}
              onClick={() => { setInterests(interest); fetchCollectors(); }}
              style={{
                padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--primary-500)', background: 'transparent',
                color: 'var(--primary-300)', cursor: 'pointer', fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}>
              {interest}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-page"><div className="spinner"></div></div>
      ) : collectors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No collectors found</h3>
          <p>Try different search terms or interests.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {collectors.map(collector => (
            <Link to={`/collectors/${collector.username}`} key={collector._id}
              style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '1.25rem' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.2rem', color: 'white', overflow: 'hidden'
                  }}>
                    {collector.avatar ? (
                      <img src={collector.avatar.startsWith('/uploads') ? `http://localhost:5000${collector.avatar}` : collector.avatar}
                        alt={collector.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : collector.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{collector.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>@{collector.username}</div>
                    {collector.location && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                        <HiOutlineLocationMarker style={{ flexShrink: 0 }} />{collector.location}
                      </div>
                    )}
                  </div>
                </div>
                {collector.bio && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {collector.bio}
                  </p>
                )}
                {collector.collectingInterests?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.6rem' }}>
                    {collector.collectingInterests.slice(0, 4).map((int, i) => (
                      <span key={i} style={{ padding: '0.15rem 0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', color: 'var(--primary-300)' }}>
                        {int}
                      </span>
                    ))}
                    {collector.collectingInterests.length > 4 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{collector.collectingInterests.length - 4} more</span>
                    )}
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <HiOutlineCollection /> Joined {new Date(collector.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collectors;
