import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineSwitchHorizontal, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineClock, HiOutlinePlus,
  HiOutlineChatAlt, HiOutlineStar, HiOutlinePaperAirplane
} from 'react-icons/hi';

const statusColors = {
  pending: 'badge-warning',
  accepted: 'badge-success',
  rejected: 'badge-error',
  cancelled: 'badge-info',
  completed: 'badge-primary'
};

const statusIcons = {
  pending: <HiOutlineClock />,
  accepted: <HiOutlineCheckCircle />,
  rejected: <HiOutlineXCircle />,
  cancelled: <HiOutlineXCircle />,
  completed: <HiOutlineCheckCircle />
};

const Trades = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trades, setTrades] = useState([]);
  const [myStamps, setMyStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showNewTrade, setShowNewTrade] = useState(false);

  // Expanded chat pane per trade: { [tradeId]: boolean }
  const [expandedChat, setExpandedChat] = useState({});
  const [chatMessage, setChatMessage] = useState({});
  const [sendingMsg, setSendingMsg] = useState({});

  // Review modal state
  const [reviewTrade, setReviewTrade] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check URL params for pre-filling a trade from stamp detail
  const prefillStampId = searchParams.get('stampId');
  const prefillReceiverId = searchParams.get('receiverId');
  const prefillReceiverName = searchParams.get('receiverName');

  useEffect(() => {
    if (prefillReceiverId && prefillStampId) {
      setShowNewTrade(true);
    }
  }, [prefillReceiverId, prefillStampId]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all' && activeTab !== 'incoming' && activeTab !== 'outgoing') {
        params.status = activeTab;
      }
      const { data } = await API.get('/trades', { params });
      setTrades(data);
    } catch {
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStamps = async () => {
    try {
      const { data } = await API.get(`/stamps/user/${user._id}`);
      setMyStamps(data);
    } catch { }
  };

  useEffect(() => {
    fetchTrades();
  }, [activeTab]);

  useEffect(() => {
    if (user) fetchMyStamps();
  }, [user]);

  const handleStatusUpdate = async (tradeId, status) => {
    try {
      await API.put(`/trades/${tradeId}/status`, { status });
      toast.success(`Trade ${status}`);
      fetchTrades();
      if (status === 'completed') {
        const tr = trades.find(t => t._id === tradeId);
        if (tr) setReviewTrade(tr);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update trade');
    }
  };

  const handleSendMessage = async (tradeId) => {
    const text = chatMessage[tradeId];
    if (!text || !text.trim()) return;

    setSendingMsg(p => ({ ...p, [tradeId]: true }));
    try {
      const { data } = await API.post(`/trades/${tradeId}/messages`, { text });
      setChatMessage(p => ({ ...p, [tradeId]: '' }));
      // Update local trade messages
      setTrades(prev => prev.map(t => {
        if (t._id === tradeId) {
          return { ...t, messages: data };
        }
        return t;
      }));
      toast.success('Message sent!');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingMsg(p => ({ ...p, [tradeId]: false }));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTrade) return;
    setSubmittingReview(true);
    try {
      await API.post(`/trades/${reviewTrade._id}/review`, {
        rating: reviewRating,
        feedback: reviewFeedback
      });
      toast.success('Collector review submitted!');
      setReviewTrade(null);
      setReviewFeedback('');
      fetchTrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const incomingTrades = trades.filter(t => t.receiver?._id === user?._id);
  const outgoingTrades = trades.filter(t => t.initiator?._id === user?._id);
  const displayTrades = activeTab === 'incoming' ? incomingTrades
    : activeTab === 'outgoing' ? outgoingTrades : trades;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Stamp Trading Hub</h1>
          <p>Exchange and negotiate rare stamps with collectors nationwide</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewTrade(true)}>
          <HiOutlinePlus /> New Trade Offer
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Trades', value: trades.length, color: 'purple' },
          { label: 'Pending', value: trades.filter(t => t.status === 'pending').length, color: 'gold' },
          { label: 'Accepted', value: trades.filter(t => t.status === 'accepted').length, color: 'green' },
          { label: 'Completed', value: trades.filter(t => t.status === 'completed').length, color: 'blue' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}><HiOutlineSwitchHorizontal /></div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'all', label: 'All Trades' },
          { key: 'incoming', label: `Incoming (${incomingTrades.length})` },
          { key: 'outgoing', label: `Outgoing (${outgoingTrades.length})` },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'completed', label: 'Completed' },
        ].map(t => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner"></div><p>Loading trades...</p></div>
      ) : displayTrades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <h3>No trades in this view</h3>
          <p>Connect with other collectors and initiate your first philately exchange.</p>
          <button className="btn btn-primary mt-2" onClick={() => setShowNewTrade(true)}>
            <HiOutlinePlus /> Propose a Trade
          </button>
        </div>
      ) : (
        displayTrades.map(trade => {
          const isInitiator = trade.initiator?._id === user._id;
          const isReceiver = trade.receiver?._id === user._id;
          const isChatOpen = expandedChat[trade._id];

          return (
            <div className="card trade-card" key={trade._id} style={{ marginBottom: '1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'white', fontSize: '1rem'
                  }}>
                    {trade.initiator?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>{trade.initiator?.name}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>➔</span>
                    <span style={{ fontWeight: 600 }}>{trade.receiver?.name}</span>
                  </div>
                  {isInitiator && (
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-elevated)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>
                      You Proposed
                    </span>
                  )}
                  {isReceiver && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.15)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', color: 'var(--primary-400)' }}>
                      Incoming Request
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(trade.createdAt)}</span>
                  <span className={`badge ${statusColors[trade.status]}`}>
                    {statusIcons[trade.status]} {trade.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stamps Exchange Visual */}
              <div className="trade-stamps">
                {/* Offering Column */}
                <div className="trade-stamp-list">
                  <h4>Offered by {trade.initiator?.name}</h4>
                  {trade.offeredStamps?.length > 0 ? (
                    trade.offeredStamps.map(s => (
                      <div key={s._id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)', marginBottom: '0.5rem',
                        border: '1px solid var(--border-color)'
                      }}>
                        {s.image ? (
                          <img src={s.image} alt={s.title} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 4, background: '#0b0f19' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 4, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📮</div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.country} · {s.year} {s.denomination ? `· ${s.denomination}` : ''}</div>
                        </div>
                      </div>
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No stamps specified</p>}
                </div>

                {/* Exchange Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--bg-elevated)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-400)', fontSize: '1.4rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    ⇌
                  </div>
                </div>

                {/* Requesting Column */}
                <div className="trade-stamp-list">
                  <h4>Requested from {trade.receiver?.name}</h4>
                  {trade.requestedStamps?.length > 0 ? (
                    trade.requestedStamps.map(s => (
                      <div key={s._id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)', marginBottom: '0.5rem',
                        border: '1px solid var(--border-color)'
                      }}>
                        {s.image ? (
                          <img src={s.image} alt={s.title} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 4, background: '#0b0f19' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 4, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📮</div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.country} · {s.year} {s.denomination ? `· ${s.denomination}` : ''}</div>
                        </div>
                      </div>
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Open negotiation</p>}
                </div>
              </div>

              {/* Review Display if completed */}
              {trade.review && trade.review.rating && (
                <div style={{
                  marginTop: '1rem', padding: '0.85rem', background: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--accent-400)', fontSize: '1rem' }}>
                      {'★'.repeat(trade.review.rating)}{'☆'.repeat(5 - trade.review.rating)}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      Collector Rating by {trade.review.reviewer?.name || 'Collector'}
                    </span>
                  </div>
                  {trade.review.feedback && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      "{trade.review.feedback}"
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons & Trade Lifecycle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {trade.status === 'pending' && isReceiver && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(trade._id, 'accepted')}>
                        <HiOutlineCheckCircle /> Accept Trade Offer
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(trade._id, 'rejected')}>
                        <HiOutlineXCircle /> Decline Offer
                      </button>
                    </>
                  )}

                  {trade.status === 'pending' && isInitiator && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(trade._id, 'cancelled')}>
                      Cancel Offer
                    </button>
                  )}

                  {trade.status === 'accepted' && (
                    <button className="btn btn-accent btn-sm" onClick={() => handleStatusUpdate(trade._id, 'completed')}>
                      <HiOutlineCheckCircle /> Mark as Completed
                    </button>
                  )}

                  {trade.status === 'completed' && !trade.review?.rating && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setReviewTrade(trade)}>
                      <HiOutlineStar /> Leave Rating & Review
                    </button>
                  )}
                </div>

                {/* Toggle Chat / In-app messaging */}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setExpandedChat(p => ({ ...p, [trade._id]: !p[trade._id] }))}
                >
                  <HiOutlineChatAlt />
                  {isChatOpen ? 'Hide Negotiation Chat' : `Chat / Negotiation (${trade.messages?.length || 0})`}
                </button>
              </div>

              {/* In-App Trade Chat & Negotiation Drawer */}
              {isChatOpen && (
                <div style={{
                  marginTop: '1rem', padding: '1rem', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                    💬 In-App Trade Negotiation Thread
                  </h4>

                  <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem', paddingRight: '0.5rem' }}>
                    {trade.messages?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No messages yet. Send a message to discuss condition, exchange terms, or shipping.</p>
                    ) : (
                      trade.messages.map((m, mIdx) => {
                        const isMe = m.sender?._id === user._id;
                        return (
                          <div
                            key={mIdx}
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '80%',
                              background: isMe ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                              border: `1px solid ${isMe ? 'var(--primary-500)' : 'var(--border-color)'}`,
                              borderRadius: 'var(--radius-md)',
                              padding: '0.5rem 0.75rem'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isMe ? 'var(--primary-400)' : 'var(--accent-400)', marginBottom: '0.2rem' }}>
                              {m.sender?.name || 'Collector'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{m.text}</div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Send chat message input */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="form-input"
                      placeholder="Type a message or counter proposal..."
                      value={chatMessage[trade._id] || ''}
                      onChange={e => setChatMessage(p => ({ ...p, [trade._id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(trade._id); }}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSendMessage(trade._id)}
                      disabled={sendingMsg[trade._id]}
                    >
                      <HiOutlinePaperAirplane /> Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* New Trade Modal */}
      {showNewTrade && (
        <NewTradeModal
          myStamps={myStamps}
          prefillReceiverId={prefillReceiverId}
          prefillReceiverName={prefillReceiverName}
          prefillStampId={prefillStampId}
          onClose={() => {
            setShowNewTrade(false);
            setSearchParams({});
          }}
          onSuccess={() => {
            setShowNewTrade(false);
            setSearchParams({});
            fetchTrades();
          }}
        />
      )}

      {/* Collector Rating & Review Modal */}
      {reviewTrade && (
        <div className="modal-overlay" onClick={() => setReviewTrade(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2>Collector Review</h2>
              <button className="modal-close" onClick={() => setReviewTrade(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Rate your exchange experience with <strong>{reviewTrade.initiator?._id === user._id ? reviewTrade.receiver?.name : reviewTrade.initiator?.name}</strong>:
                </p>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.8rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{ color: star <= reviewRating ? 'var(--accent-400)' : 'var(--text-muted)', transition: 'color 0.2s' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Feedback</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Fast delivery, stamp exactly as described, great packaging..."
                    value={reviewFeedback}
                    onChange={e => setReviewFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setReviewTrade(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NewTradeModal = ({
  myStamps,
  prefillReceiverId,
  prefillReceiverName,
  prefillStampId,
  onClose,
  onSuccess
}) => {
  const [collectors, setCollectors] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(prefillReceiverId || '');
  const [receiverSearch, setReceiverSearch] = useState(prefillReceiverName || '');
  const [message, setMessage] = useState('');
  const [selectedOffered, setSelectedOffered] = useState([]);
  const [availableTradeStamps, setAvailableTradeStamps] = useState([]);
  const [selectedRequested, setSelectedRequested] = useState(prefillStampId ? [prefillStampId] : []);
  const [loading, setLoading] = useState(false);

  // Fetch collectors
  useEffect(() => {
    const loadCollectors = async () => {
      try {
        const { data } = await API.get('/auth/collectors');
        setCollectors(data);
        if (prefillReceiverId) {
          setSelectedReceiver(prefillReceiverId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCollectors();
  }, [prefillReceiverId]);

  // Fetch stamps available for trade
  useEffect(() => {
    const loadStamps = async () => {
      try {
        const { data } = await API.get('/stamps', { params: { forTrade: true, limit: 50 } });
        setAvailableTradeStamps(data.stamps);
      } catch (err) {
        console.error(err);
      }
    };
    loadStamps();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceiver) {
      toast.error('Please select a recipient collector');
      return;
    }
    if (selectedOffered.length === 0 && selectedRequested.length === 0) {
      toast.error('Please select at least one stamp to offer or request');
      return;
    }

    setLoading(true);
    try {
      await API.post('/trades', {
        receiver: selectedReceiver,
        offeredStamps: selectedOffered,
        requestedStamps: selectedRequested,
        message
      });
      toast.success('Trade offer sent successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send trade offer');
    } finally {
      setLoading(false);
    }
  };

  const toggleStamp = (id, list, setList) => {
    setList(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filteredCollectors = collectors.filter(c =>
    c.name.toLowerCase().includes(receiverSearch.toLowerCase()) ||
    c.username?.toLowerCase().includes(receiverSearch.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <h2>Create New Trade Offer</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Collector Selector */}
            <div className="form-group">
              <label className="form-label">Recipient Collector *</label>
              {prefillReceiverName ? (
                <div style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontWeight: 600, color: 'var(--primary-400)' }}>
                  Trading with {prefillReceiverName}
                </div>
              ) : (
                <>
                  <input
                    className="form-input"
                    placeholder="Search collector by name..."
                    value={receiverSearch}
                    onChange={e => setReceiverSearch(e.target.value)}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <select
                    className="form-select"
                    value={selectedReceiver}
                    onChange={e => setSelectedReceiver(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a Collector --</option>
                    {filteredCollectors.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} (@{c.username || 'user'}) {c.location ? `· ${c.location}` : ''}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* My Stamps to Offer */}
            <div className="form-group">
              <label className="form-label">
                Your Stamps to Offer ({selectedOffered.length} selected)
              </label>
              {myStamps.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  You don't have any stamps in your collection yet. Add stamps to your collection first to offer them.
                </p>
              ) : (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem', maxHeight: 180, overflowY: 'auto', padding: '0.5rem',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)'
                }}>
                  {myStamps.map(s => {
                    const isSelected = selectedOffered.includes(s._id);
                    return (
                      <div
                        key={s._id}
                        onClick={() => toggleStamp(s._id, selectedOffered, setSelectedOffered)}
                        style={{
                          padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          background: isSelected ? 'rgba(99,102,241,0.18)' : 'var(--bg-elevated)',
                          border: `1px solid ${isSelected ? 'var(--primary-500)' : 'transparent'}`,
                          display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? 'var(--primary-400)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.country} · {s.year}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stamps to Request */}
            <div className="form-group">
              <label className="form-label">
                Available Stamps to Request ({selectedRequested.length} selected)
              </label>
              {availableTradeStamps.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No other stamps are currently flagged for trade.</p>
              ) : (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem', maxHeight: 180, overflowY: 'auto', padding: '0.5rem',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)'
                }}>
                  {availableTradeStamps.map(s => {
                    const isSelected = selectedRequested.includes(s._id);
                    return (
                      <div
                        key={s._id}
                        onClick={() => toggleStamp(s._id, selectedRequested, setSelectedRequested)}
                        style={{
                          padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          background: isSelected ? 'rgba(245,158,11,0.18)' : 'var(--bg-elevated)',
                          border: `1px solid ${isSelected ? 'var(--accent-500)' : 'transparent'}`,
                          display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? 'var(--accent-400)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.owner?.name} · {s.country}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Initial Negotiation Message */}
            <div className="form-group">
              <label className="form-label">Offer Note / Message</label>
              <textarea
                className="form-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in trading these stamps. Let me know if you are open to exchange..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting Offer...' : 'Send Trade Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Trades;
