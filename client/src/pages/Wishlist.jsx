import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineSearch, HiOutlineBookmark } from 'react-icons/hi';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/stamps/me/wishlist');
      setWishlist(data);
    } catch { toast.error('Failed to load wishlist'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (stampId) => {
    try {
      await API.post('/stamps/me/wishlist', { stampId });
      setWishlist(prev => prev.filter(s => s._id !== stampId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const filtered = wishlist.filter(s =>
    !search ||
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>My Wishlist</h1>
          <p>{wishlist.length} stamps saved</p>
        </div>
        <Link to="/stamps" className="btn btn-primary">Browse Catalog</Link>
      </div>

      {/* Search */}
      <div className="search-input-wrapper" style={{ maxWidth: 400, marginBottom: '1.5rem' }}>
        <HiOutlineSearch className="search-icon" />
        <input className="form-input" placeholder="Search wishlist..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineBookmark style={{ fontSize: '3rem' }} /></div>
          <h3>{search ? 'No matches found' : 'Wishlist is empty'}</h3>
          <p>Browse the stamp catalog and bookmark stamps you want to find or trade for.</p>
          <Link to="/stamps" className="btn btn-primary mt-2">Browse Stamps</Link>
        </div>
      ) : (
        <div className="stamps-grid">
          {filtered.map(stamp => (
            <div className="card stamp-card" key={stamp._id} style={{ position: 'relative' }}>
              {/* Remove button */}
              <button
                onClick={() => handleRemove(stamp._id)}
                style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 2,
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: 'rgba(239,68,68,0.9)', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                }}
                title="Remove from wishlist"
              >
                <HiOutlineX />
              </button>

              <Link to={`/stamps/${stamp._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                    <span className={`badge ${
                      stamp.rarity === 'Rare' ? 'badge-warning' :
                      stamp.rarity === 'Very Rare' ? 'badge-error' :
                      stamp.rarity === 'Unique' ? 'badge-rare' : 'badge-info'
                    }`}>{stamp.rarity}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Owner: {stamp.owner?.name}
                  </div>
                  {stamp.estimatedValue > 0 && (
                    <div style={{ fontWeight: 700, color: 'var(--accent-400)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                      ₹{stamp.estimatedValue.toLocaleString()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
