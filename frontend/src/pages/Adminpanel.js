import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Adminpanel.css';

// ── Stat Card ──
const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="admin-stat-card" style={{ '--accent': color }}>
    <div className="asc-icon">{icon}</div>
    <div className="asc-info">
      <div className="asc-label">{label}</div>
      <div className="asc-value">{value}</div>
      {sub && <div className="asc-sub">{sub}</div>}
    </div>
  </div>
);

// ── Badge ──
const RoleBadge = ({ role }) => {
  const map = { admin: ['#ff6b35','👑'], moderator: ['#7c5cfc','🛡'], user: ['#4f8ef7','👤'] };
  const [color, icon] = map[role] || map.user;
  return <span className="role-badge" style={{ background: `${color}22`, color }}>{icon} {role}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    active: '#00e5a0', inactive: '#ff5050', pending: '#f59e0b',
    approved: '#00e5a0', rejected: '#ff5050', paid: '#4f8ef7', banned: '#ff5050',
    unread: '#f59e0b', read: '#8892a4', resolved: '#00e5a0'
  };
  return <span className="status-badge" style={{ background: `${map[status] || '#8892a4'}22`, color: map[status] || '#8892a4' }}>{status}</span>;
};

// ══════════════════════════════
// TABS
// ══════════════════════════════

const OverviewTab = ({ stats }) => (
  <div className="tab-content">
    <h2 className="tab-title">📊 Dashboard Overview</h2>
    <div className="stats-grid-admin">
      <StatCard icon="👥" label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} color="#4f8ef7" sub={`+${stats?.newUsersThisWeek || 0} this week`} />
      <StatCard icon="🎬" label="Total Videos" value={stats?.totalVideos?.toLocaleString() || 0} color="#7c5cfc" sub={`+${stats?.newVideosThisWeek || 0} this week`} />
      <StatCard icon="💰" label="Total Earnings" value={`$${parseFloat(stats?.totalEarnings || 0).toFixed(2)}`} color="#00e5a0" />
      <StatCard icon="🚨" label="Pending Reports" value={stats?.pendingReports || 0} color="#ff6b35" />
      <StatCard icon="💸" label="Pending Withdrawals" value={stats?.pendingWithdrawals || 0} color="#f59e0b" />
      <StatCard icon="✉️" label="Unread Messages" value={stats?.unreadMessages || 0} color="#7c5cfc" />
    </div>
  </div>
);

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/users', {
        params: { page, limit: 15, search, role: roleFilter }
      });
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (id, ban) => {
    const reason = ban ? prompt('Ban reason:') : '';
    if (ban && !reason) return;
    setActionLoading(id);
    try {
      await axios.put(`/api/admin/users/${id}/ban`, { ban, reason });
      fetchUsers();
    } catch (e) { alert('Error: ' + e.response?.data?.message); }
    finally { setActionLoading(''); }
  };

  const handleRole = async (id, role) => {
    setActionLoading(id);
    try {
      await axios.put(`/api/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch (e) { alert('Error: ' + e.response?.data?.message); }
    finally { setActionLoading(''); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (e) { alert('Error'); }
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">👥 User Management</h2>
      <div className="table-controls">
        <input
          className="admin-search"
          placeholder="🔍 Search username or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="admin-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <span className="total-count">{total} users</span>
      </div>
      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th><th>Role</th><th>Status</th><th>Earnings</th>
                <th>Views</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={u.is_banned ? 'row-banned' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="uc-avatar">{u.username?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="uc-name">{u.username}</div>
                        <div className="uc-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td><StatusBadge status={u.is_banned ? 'banned' : 'active'} /></td>
                  <td className="td-green">${parseFloat(u.total_earnings || 0).toFixed(2)}</td>
                  <td>{Number(u.total_views || 0).toLocaleString()}</td>
                  <td className="td-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <select
                        className="role-select"
                        value={u.role}
                        disabled={actionLoading === u.id}
                        onChange={e => handleRole(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Mod</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className={`act-btn ${u.is_banned ? 'act-green' : 'act-orange'}`}
                        onClick={() => handleBan(u.id, !u.is_banned)}
                        disabled={actionLoading === u.id}
                      >
                        {u.is_banned ? '✅ Unban' : '🚫 Ban'}
                      </button>
                      <button className="act-btn act-red" onClick={() => handleDelete(u.id, u.username)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page} of {Math.ceil(total / 15) || 1}</span>
        <button className="pg-btn" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
};

const VideosTab = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/videos', { params: { page, limit: 15, search } });
      setVideos(data.videos);
      setTotal(data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/videos/${id}/status`, { status });
      fetchVideos();
    } catch (e) { alert('Error'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`/api/admin/videos/${id}`);
      fetchVideos();
    } catch (e) { alert('Error'); }
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">🎬 Video Management</h2>
      <div className="table-controls">
        <input className="admin-search" placeholder="🔍 Search title or creator..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <span className="total-count">{total} videos</span>
      </div>
      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Video</th><th>Creator</th><th>Views</th>
                <th>Earnings</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="video-cell">
                      <div className="vc-thumb">
                        {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" /> : '▶'}
                      </div>
                      <span className="vc-title">{v.title}</span>
                    </div>
                  </td>
                  <td className="td-muted">{v.username}</td>
                  <td>{Number(v.views).toLocaleString()}</td>
                  <td className="td-green">${parseFloat(v.earnings || 0).toFixed(2)}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="td-muted">{new Date(v.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className={`act-btn ${v.status === 'active' ? 'act-orange' : 'act-green'}`}
                        onClick={() => handleStatus(v.id, v.status === 'active' ? 'inactive' : 'active')}
                      >
                        {v.status === 'active' ? '⏸ Hide' : '▶ Show'}
                      </button>
                      <button className="act-btn act-red" onClick={() => handleDelete(v.id, v.title)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page} of {Math.ceil(total / 15) || 1}</span>
        <button className="pg-btn" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
};

const WithdrawalsTab = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/withdrawals', { params: { status: statusFilter } });
      setWithdrawals(data.withdrawals);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const handleWithdrawal = async (id, status) => {
    const note = status === 'rejected' ? prompt('Rejection reason:') : '';
    try {
      await axios.put(`/api/admin/withdrawals/${id}`, { status, adminNote: note });
      fetchWithdrawals();
    } catch (e) { alert('Error'); }
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">💸 Withdrawal Requests</h2>
      <div className="table-controls">
        <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr><td colSpan={7} className="td-empty">No {statusFilter} withdrawals</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w.id}>
                  <td>
                    <div className="uc-name">{w.username}</div>
                    <div className="uc-email">{w.email}</div>
                  </td>
                  <td className="td-green">${parseFloat(w.amount).toFixed(2)}</td>
                  <td className="td-muted">{w.method}</td>
                  <td className="td-muted" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.account_details}</td>
                  <td><StatusBadge status={w.status} /></td>
                  <td className="td-muted">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td>
                    {w.status === 'pending' && (
                      <div className="action-btns">
                        <button className="act-btn act-green" onClick={() => handleWithdrawal(w.id, 'approved')}>✅ Approve</button>
                        <button className="act-btn act-red" onClick={() => handleWithdrawal(w.id, 'rejected')}>❌ Reject</button>
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <button className="act-btn act-blue" onClick={() => handleWithdrawal(w.id, 'paid')}>💰 Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/reports');
      setReports(data.reports);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleReport = async (id, status) => {
    try {
      await axios.put(`/api/admin/reports/${id}`, { status });
      fetchReports();
    } catch (e) { alert('Error'); }
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">🚨 Video Reports</h2>
      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Video</th><th>Reporter</th><th>Reason</th><th>Description</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={6} className="td-empty">✅ No pending reports</td></tr>
              ) : reports.map(r => (
                <tr key={r.id}>
                  <td className="td-blue">{r.video_title}</td>
                  <td className="td-muted">{r.reporter_name || 'Anonymous'}</td>
                  <td><span className="reason-tag">{r.reason}</span></td>
                  <td className="td-muted">{r.description || '—'}</td>
                  <td className="td-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="act-btn act-green" onClick={() => handleReport(r.id, 'reviewed')}>✅ Resolve</button>
                      <button className="act-btn act-orange" onClick={() => handleReport(r.id, 'dismissed')}>🚫 Dismiss</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AuditTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/audit-logs')
      .then(({ data }) => setLogs(data.logs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actionColor = (action) => {
    if (action.includes('DELETE') || action.includes('BAN')) return '#ff5050';
    if (action.includes('GRANT') || action.includes('UNBAN')) return '#00e5a0';
    return '#4f8ef7';
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">📋 Audit Logs</h2>
      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="audit-list">
          {logs.map(log => (
            <div key={log.id} className="audit-row">
              <div className="audit-dot" style={{ background: actionColor(log.action) }} />
              <div className="audit-info">
                <span className="audit-action" style={{ color: actionColor(log.action) }}>{log.action}</span>
                <span className="audit-by">by {log.admin_name}</span>
                {log.details && <span className="audit-detail">— {log.details}</span>}
              </div>
              <div className="audit-time">{new Date(log.created_at).toLocaleString()}</div>
            </div>
          ))}
          {logs.length === 0 && <div className="td-empty">No audit logs yet.</div>}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════
// MESSAGES TAB (NEW)
// ══════════════════════════════

const MessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('unread');
  const [selected, setSelected] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/messages', { params: { status: statusFilter } });
      setMessages(data.messages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/messages/${id}`, { status });
      setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
      fetchMessages();
    } catch (e) { alert('Error updating message status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`/api/admin/messages/${id}`);
      setSelected(null);
      fetchMessages();
    } catch (e) { alert('Error deleting message'); }
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    // auto-mark as read when opened
    if (msg.status === 'unread') {
      try {
        await axios.put(`/api/admin/messages/${msg.id}`, { status: 'read' });
        fetchMessages();
      } catch (e) { /* silent fail */ }
    }
  };

  const subjectLabel = {
    general: 'General Inquiry', earnings: 'Earnings & Payments',
    upload: 'Upload Issues', account: 'Account Problem',
    dmca: 'DMCA / Copyright', other: 'Other'
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">✉️ Contact Messages</h2>
      <div className="table-controls">
        <select className="admin-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setSelected(null); }}>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
        <span className="total-count">{messages.length} messages</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {/* Message List */}
        <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? <div className="admin-loading"><div className="spinner" /></div> :
            messages.length === 0 ? (
              <div className="td-empty">No {statusFilter} messages</div>
            ) : messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                style={{
                  background: selected?.id === msg.id ? '#4f8ef720' : '#ffffff08',
                  border: `1px solid ${selected?.id === msg.id ? '#4f8ef7' : '#ffffff15'}`,
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{msg.name}</span>
                  <StatusBadge status={msg.status} />
                </div>
                <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 4 }}>{msg.email}</div>
                <div style={{ fontSize: 13, color: '#4f8ef7', marginBottom: 4 }}>
                  {subjectLabel[msg.subject] || msg.subject}
                </div>
                <div style={{ fontSize: 12, color: '#8892a4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: 11, color: '#555e6d', marginTop: 6 }}>
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))
          }
        </div>

        {/* Message Detail */}
        <div style={{ flex: 1 }}>
          {selected ? (
            <div style={{
              background: '#ffffff08', border: '1px solid #ffffff15',
              borderRadius: 12, padding: 24, height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: 18 }}>{selected.name}</h3>
                  <div style={{ color: '#8892a4', fontSize: 13, marginTop: 4 }}>{selected.email}</div>
                  <div style={{ color: '#4f8ef7', fontSize: 13, marginTop: 4 }}>
                    📂 {subjectLabel[selected.subject] || selected.subject}
                  </div>
                  <div style={{ color: '#555e6d', fontSize: 12, marginTop: 4 }}>
                    🕐 {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div style={{
                background: '#ffffff05', border: '1px solid #ffffff10',
                borderRadius: 8, padding: 16, minHeight: 120,
                color: '#c8d0dc', fontSize: 14, lineHeight: 1.7, marginBottom: 20
              }}>
                {selected.message}
              </div>

              <div className="action-btns">
                {selected.status !== 'resolved' && (
                  <button className="act-btn act-green" onClick={() => handleStatus(selected.id, 'resolved')}>
                    ✅ Mark Resolved
                  </button>
                )}
                {selected.status === 'unread' && (
                  <button className="act-btn act-blue" onClick={() => handleStatus(selected.id, 'read')}>
                    📖 Mark Read
                  </button>
                )}
                <a href={`mailto:${selected.email}?subject=Re: ${subjectLabel[selected.subject] || selected.subject}`}
                  className="act-btn act-orange" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  📧 Reply via Email
                </a>
                <button className="act-btn act-red" onClick={() => handleDelete(selected.id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#ffffff05', border: '1px dashed #ffffff15',
              borderRadius: 12, padding: 40, textAlign: 'center', color: '#555e6d'
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <div>Select a message to view it</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════
// MAIN ADMIN PANEL
// ══════════════════════════════

const TABS = [
  { id: 'overview',     label: '📊 Overview',    roles: ['admin', 'moderator'] },
  { id: 'users',        label: '👥 Users',        roles: ['admin', 'moderator'] },
  { id: 'videos',       label: '🎬 Videos',       roles: ['admin', 'moderator'] },
  { id: 'withdrawals',  label: '💸 Withdrawals',  roles: ['admin'] },
  { id: 'reports',      label: '🚨 Reports',      roles: ['admin', 'moderator'] },
  { id: 'messages',     label: '✉️ Messages',     roles: ['admin', 'moderator'] },
  { id: 'audit',        label: '📋 Audit Log',    roles: ['admin'] },
];

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      navigate('/');
      return;
    }
    axios.get('/api/admin/stats').then(({ data }) => setStats(data)).catch(console.error);
  }, [user, navigate, loading]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', fontSize: 20 }}>
      Loading...
    </div>
  );

  if (!user || !['admin', 'moderator'].includes(user.role)) return null;

  const availableTabs = TABS.filter(t => t.roles.includes(user.role));

  return (
    <div className="page-wrapper admin-panel">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span style={{ color: '#4f8ef7' }}>video</span>
              <span className="logo-badge">stream</span>
            </div>
            <div className="sidebar-role-badge">
              <RoleBadge role={user.role} />
            </div>
            <div className="sidebar-user">
              <div className="su-avatar">{user.username?.[0]?.toUpperCase()}</div>
              <div>
                <div className="su-name">{user.username}</div>
                <div className="su-label">Admin Panel</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.id === 'reports' && stats?.pendingReports > 0 && (
                  <span className="nav-badge">{stats.pendingReports}</span>
                )}
                {tab.id === 'withdrawals' && stats?.pendingWithdrawals > 0 && (
                  <span className="nav-badge">{stats.pendingWithdrawals}</span>
                )}
                {tab.id === 'messages' && stats?.unreadMessages > 0 && (
                  <span className="nav-badge">{stats.unreadMessages}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="btn-ghost sidebar-back" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {activeTab === 'overview'    && <OverviewTab stats={stats} />}
          {activeTab === 'users'       && <UsersTab />}
          {activeTab === 'videos'      && <VideosTab />}
          {activeTab === 'withdrawals' && <WithdrawalsTab />}
          {activeTab === 'reports'     && <ReportsTab />}
          {activeTab === 'messages'    && <MessagesTab />}
          {activeTab === 'audit'       && <AuditTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;