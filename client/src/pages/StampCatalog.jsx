import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineFilter } from 'react-icons/hi';
import StampFormModal from '../components/StampFormModal';

const CATEGORIES = ['All', 'Definitive', 'Commemorative', 'Special', 'Miniature Sheet', 'First Day Cover', 'Postal Stationery', 'Revenue', 'Airmail', 'Other'];
const CONDITIONS = ['All', 'Mint', 'Used', 'Cancelled', 'First Day Cover', 'On Cover', 'Other'];
const RARITIES = ['All', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Unique'];

const StampCatalog = () => {
  const { user } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [rarity, setRarity] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStamps = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (condition !== 'All') params.condition = condition;
      if (rarity !== 'All') params.rarity = rarity;

      const { data } = await API.get('/stamps', { params });
      setStamps(data.stamps);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load stamps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStamps();
  }, [page, category, condition, rarity]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStamps();
  };

  const getRarityBadge = (rarityValue) => {
    const map = {
      'Common': 'badge-info',
      'Uncommon': 'badge-primary',
      'Rare': 'badge-accent',
      'Very Rare': 'badge-warning',
      'Unique': 'badge-rare'
    };
    return map[rarityValue] || 'badge-info';
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Stamp Catalog</h1>
          <p>{total} stamps in collection</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <HiOutlinePlus /> Add Stamp
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-input-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            className="form-input"
            placeholder="Search stamps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1); }}>
          {CONDITIONS.map(c => <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>)}
        </select>
        <select className="form-select" value={rarity} onChange={(e) => { setRarity(e.target.value); setPage(1); }}>
          {RARITIES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Rarities' : r}</option>)}
        </select>
      </div>

      {/* Stamps Grid */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Loading stamps...</p>
        </div>
      ) : stamps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📮</div>
          <h3>No stamps found</h3>
          <p>Try adjusting your filters or add the first stamp to the catalog.</p>
          {user && (
            <button className="btn btn-primary mt-2" onClick={() => setShowAddModal(true)}>
              <HiOutlinePlus /> Add First Stamp
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="stamps-grid">
            {stamps.map((stamp) => (
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
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {stamp.country} · {stamp.year}
                    </div>
                    <div className="stamp-meta">
                      <span className="badge badge-primary">{stamp.category}</span>
                      <span className={`badge ${getRarityBadge(stamp.rarity)}`}>{stamp.rarity}</span>
                      {stamp.isForTrade && (
                        <span className="badge badge-success">For Trade</span>
                      )}
                    </div>
                    {stamp.estimatedValue > 0 && (
                      <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--accent-400)', fontSize: '0.95rem' }}>
                        ₹{stamp.estimatedValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={page === pageNum ? 'active' : ''}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Stamp Modal */}
      {showAddModal && (
        <StampFormModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStamps();
          }}
        />
      )}
    </div>
  );
};

export default StampCatalog;
