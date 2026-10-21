import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineHeart, HiOutlineChatAlt, HiOutlineEye,
  HiOutlineSearch, HiOutlineBookmark, HiOutlinePhotograph, HiOutlineTrash
} from 'react-icons/hi';

const CATEGORIES = ['All', 'General', 'Identification', 'Valuation', 'Trading', 'News', 'Events', 'Showcase'];

const Forum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (activeCategory === 'Bookmarked') {
        const { data } = await API.get('/forum/me/bookmarks');
        setPosts(data);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        const params = { page, limit: 10 };
        if (activeCategory !== 'All') params.category = activeCategory;
        if (search) params.search = search;
        const { data } = await API.get('/forum', { params });
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page, activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleLike = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to like posts'); return; }
    try {
      await API.put(`/forum/${postId}/like`);
      fetchPosts();
    } catch { toast.error('Failed to like post'); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const catColors = {
    'General': 'badge-info', 'Identification': 'badge-primary', 'Valuation': 'badge-accent',
    'Trading': 'badge-success', 'News': 'badge-warning', 'Events': 'badge-error', 'Showcase': 'badge-rare'
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Community Forum</h1>
          <p>{total} discussions by philatelists</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowNewPost(true)}>
            <HiOutlinePlus /> New Discussion
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat); setPage(1); }}
          >
            {cat === 'Identification' ? '🔍 Identification Help' : cat}
          </button>
        ))}
        {user && (
          <button
            className={`tab ${activeCategory === 'Bookmarked' ? 'active' : ''}`}
            onClick={() => { setActiveCategory('Bookmarked'); setPage(1); }}
          >
            🔖 Bookmarked
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper" style={{ maxWidth: 500 }}>
          <HiOutlineSearch className="search-icon" />
          <input
            className="form-input"
            placeholder="Search discussions, identification requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </form>

      {/* Posts */}
      {loading ? (
        <div className="loading-page"><div className="spinner"></div><p>Loading discussions...</p></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No discussions yet</h3>
          <p>
            {activeCategory === 'Bookmarked'
              ? 'You have not bookmarked any discussions yet.'
              : 'Be the first to start a discussion or ask for stamp identification help!'}
          </p>
          {user && activeCategory !== 'Bookmarked' && (
            <button className="btn btn-primary mt-2" onClick={() => setShowNewPost(true)}>
              <HiOutlinePlus /> Start First Discussion
            </button>
          )}
        </div>
      ) : (
        <>
          {posts.map(post => (
            <Link to={`/forum/${post._id}`} key={post._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card forum-post-card" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                {post.isPinned && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--accent-400)', fontSize: '0.8rem', fontWeight: 600 }}>
                    📌 Pinned Post
                  </div>
                )}
                <div className="post-header">
                  <div className="post-avatar">
                    {post.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="post-author-info">
                    <h4>{post.author?.name}</h4>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <span className={`badge ${catColors[post.category] || 'badge-info'}`}>
                    {post.category === 'Identification' ? '🔍 Identification' : post.category}
                  </span>
                </div>

                <h3>{post.title}</h3>
                
                <p className="post-content">{post.content}</p>

                {post.image && (
                  <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', maxWidth: 320, maxHeight: 180, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div className="post-actions">
                  <button className={`post-action-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
                    onClick={(e) => handleLike(e, post._id)}>
                    <HiOutlineHeart /> {post.likes?.length || 0}
                  </button>
                  <span className="post-action-btn">
                    <HiOutlineChatAlt /> {post.comments?.length || 0} Comments
                  </span>
                  <span className="post-action-btn">
                    <HiOutlineEye /> {post.views || 0} Views
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pn = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pn > totalPages) return null;
                return (
                  <button key={pn} className={page === pn ? 'active' : ''} onClick={() => setPage(pn)}>{pn}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
            </div>
          )}
        </>
      )}

      {showNewPost && (
        <NewPostModal
          defaultCategory={activeCategory !== 'All' && activeCategory !== 'Bookmarked' ? activeCategory : 'General'}
          onClose={() => setShowNewPost(false)}
          onSuccess={() => { setShowNewPost(false); fetchPosts(); }}
        />
      )}
    </div>
  );
};

const NewPostModal = ({ defaultCategory = 'General', onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: defaultCategory,
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploading(true);
    try {
      const res = await API.post('/uploads/stamp', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(p => ({ ...p, image: res.data.url }));
      toast.success('Stamp photo uploaded!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/forum', formData);
      toast.success('Post created successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2>New Forum Discussion</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Discussion Title *</label>
              <input className="form-input" value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                required placeholder="e.g., Can someone help identify this 1930s Indian airmail stamp?" />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                {['General', 'Identification', 'Valuation', 'Trading', 'News', 'Events', 'Showcase'].map(c => (
                  <option key={c} value={c}>
                    {c === 'Identification' ? '🔍 Stamp Identification Help' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-textarea" value={formData.content}
                onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                required placeholder="Share your insights, question, watermark details, or post a request for help..."
                style={{ minHeight: 140 }} />
            </div>

            {/* Stamp Photo Upload for Identification */}
            <div className="form-group">
              <label className="form-label">Attach Stamp Photo (for identification / showcase)</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <HiOutlinePhotograph /> {uploading ? 'Uploading...' : 'Upload Stamp Photo'}
                </button>
                {formData.image && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setFormData(p => ({ ...p, image: '' }))}
                  >
                    <HiOutlineTrash /> Remove
                  </button>
                )}
              </div>

              {formData.image && (
                <div style={{ marginTop: '0.75rem', width: 140, height: 140, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Forum;
