import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineHeart, HiOutlineEye,
  HiOutlineTrash, HiOutlineChatAlt2, HiOutlineBookmark,
  HiOutlineFlag, HiOutlineReply
} from 'react-icons/hi';

const ForumPostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Replies state: { [commentId]: string }
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  const fetchPost = async () => {
    try {
      const { data } = await API.get(`/forum/${id}`);
      setPost(data);
    } catch {
      toast.error('Post not found');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like'); return; }
    try {
      await API.put(`/forum/${id}/like`);
      fetchPost();
    } catch { toast.error('Failed to update like'); }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error('Please login to bookmark'); return; }
    try {
      const { data } = await API.put(`/forum/${id}/bookmark`);
      toast.success(data.bookmarked ? 'Discussion bookmarked!' : 'Bookmark removed');
      fetchPost();
    } catch { toast.error('Failed to bookmark'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await API.post(`/forum/${id}/comments`, { content: comment });
      setComment('');
      fetchPost();
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await API.post(`/forum/${id}/comments/${commentId}/reply`, { content: replyText });
      setReplyText('');
      setActiveReplyId(null);
      fetchPost();
      toast.success('Reply added!');
    } catch {
      toast.error('Failed to submit reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      const { data } = await API.post(`/forum/${id}/report`, {
        reason: reportReason,
        details: reportDetails
      });
      toast.success(data.message || 'Report submitted to moderators');
      setShowReportModal(false);
      setReportDetails('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report post');
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/forum/${id}`);
      toast.success('Post deleted');
      navigate('/forum');
    } catch { toast.error('Failed to delete'); }
  };

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!post) return null;

  const isLiked = user && post.likes?.includes(user._id);
  const isBookmarked = user && post.bookmarks?.includes(user._id);
  const canDelete = user && (post.author?._id === user._id || user.role === 'admin');

  const catColors = {
    'General': 'badge-info', 'Identification': 'badge-primary', 'Valuation': 'badge-accent',
    'Trading': 'badge-success', 'News': 'badge-warning', 'Events': 'badge-error', 'Showcase': 'badge-rare'
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft /> Back to Discussions
        </button>

        {user && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${isBookmarked ? 'btn-primary' : 'btn-ghost'}`}
              onClick={handleBookmark}
            >
              <HiOutlineBookmark /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button
              className="btn btn-ghost btn-sm text-muted"
              onClick={() => setShowReportModal(true)}
              title="Report post to moderators"
            >
              <HiOutlineFlag /> Report
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          {/* Post Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="post-avatar" style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1.1rem', color: 'white', flexShrink: 0
              }}>
                {post.author?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{post.author?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(post.createdAt)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${catColors[post.category] || 'badge-info'}`}>
                {post.category === 'Identification' ? '🔍 Stamp Identification' : post.category}
              </span>
              {canDelete && (
                <button className="btn btn-danger btn-sm btn-icon" onClick={handleDelete} title="Delete post">
                  <HiOutlineTrash />
                </button>
              )}
            </div>
          </div>

          {/* Post Content */}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
            {post.title}
          </h1>

          {post.image && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
              <img
                src={post.image}
                alt={post.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: 460,
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '1.02rem' }}>
            {post.content}
          </p>

          {/* Post Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)'
          }}>
            <button
              className={`post-action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              style={{ fontSize: '0.95rem', gap: '0.5rem' }}
            >
              <HiOutlineHeart /> {post.likes?.length || 0} {isLiked ? 'Liked' : 'Like'}
            </button>
            <span className="post-action-btn" style={{ fontSize: '0.95rem' }}>
              <HiOutlineChatAlt2 /> {post.comments?.length || 0} Comments
            </span>
            <span className="post-action-btn" style={{ fontSize: '0.95rem' }}>
              <HiOutlineEye /> {post.views} Views
            </span>
            {post.bookmarks?.length > 0 && (
              <span className="post-action-btn" style={{ fontSize: '0.95rem' }}>
                <HiOutlineBookmark /> {post.bookmarks.length} Bookmarks
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card">
        <div className="card-header">
          <h3>💬 Comments & Replies ({post.comments?.length || 0})</h3>
        </div>
        <div className="card-body">
          {/* Add Comment */}
          {user ? (
            <form onSubmit={handleComment} style={{ marginBottom: '1.75rem' }}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Join the discussion or offer your identification expertise..."
                  required
                  style={{ minHeight: 90 }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div style={{
              padding: '1rem', background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
              color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem'
            }}>
              <a href="/login" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Sign in</a> to join the discussion
            </div>
          )}

          {/* Comment List */}
          <div className="comments-section">
            {post.comments?.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              [...post.comments].map((c) => (
                <div className="comment" key={c._id} style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="comment-avatar">
                      {c.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-body" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5>{c.author?.name}</h5>
                        <div className="comment-date">{formatDate(c.createdAt)}</div>
                      </div>
                      <p style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>{c.content}</p>

                      {user && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                          onClick={() => {
                            setActiveReplyId(activeReplyId === c._id ? null : c._id);
                            setReplyText('');
                          }}
                        >
                          <HiOutlineReply /> Reply
                        </button>
                      )}

                      {/* Reply input */}
                      {activeReplyId === c._id && (
                        <form onSubmit={(e) => handleReplySubmit(e, c._id)} style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid var(--primary-500)' }}>
                          <input
                            className="form-input"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Reply to ${c.author?.name}...`}
                            required
                            style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={replySubmitting} style={{ fontSize: '0.8rem' }}>
                              {replySubmitting ? 'Sending...' : 'Send Reply'}
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveReplyId(null)} style={{ fontSize: '0.8rem' }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Nested Replies */}
                      {c.replies?.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', borderLeft: '2px solid rgba(99, 102, 241, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {c.replies.map((reply, rIdx) => (
                            <div key={rIdx} style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{reply.author?.name}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(reply.createdAt)}</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>Report Discussion</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Help keep the National Philately community welcoming and accurate. Tell us why you are reporting this post.
                </p>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select
                    className="form-select"
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                  >
                    <option>Inappropriate Content</option>
                    <option>Spam or Commercial Promotion</option>
                    <option>Suspected Counterfeit or Fraud</option>
                    <option>Harassment or Abuse</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Details (Optional)</label>
                  <textarea
                    className="form-textarea"
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    placeholder="Provide any details to help moderators review..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={reporting}>
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPostDetail;
