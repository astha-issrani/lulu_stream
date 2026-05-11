import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Earnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [topVideos, setTopVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, historyRes, topRes] = await Promise.all([
        axios.get('/api/earnings'),
        axios.get('/api/earnings/history'),
        axios.get('/api/earnings/top-videos'),
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data.history || []);
      setTopVideos(topRes.data.videos || []);
    } catch (err) {
      console.error('Earnings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'history', label: '📋 History' },
    { id: 'top', label: '🏆 Top Videos' },
  ];

  const statCards = stats ? [
    { icon: '💰', label: 'Total Earnings', value: `$${parseFloat(stats.totalEarnings || 0).toFixed(4)}`, color: '#00e5a0', bg: 'rgba(0,229,160,0.1)' },
    { icon: '📈', label: "Today's Earnings", value: `$${parseFloat(stats.todayEarnings || 0).toFixed(4)}`, color: '#4f8ef7', bg: 'rgba(79,142,247,0.1)',
      sub: stats.percentChange !== 0 ? `${stats.percentChange > 0 ? '▲' : '▼'} ${Math.abs(stats.percentChange)}% vs yesterday` : 'Same as yesterday',
      subColor: stats.percentChange > 0 ? '#00e5a0' : stats.percentChange < 0 ? '#ff5050' : '#8892a4'
    },
    { icon: '📅', label: 'This Week', value: `$${parseFloat(stats.weeklyEarnings || 0).toFixed(4)}`, color: '#7c5cfc', bg: 'rgba(124,92,252,0.1)' },
    { icon: '👁', label: 'Total Views', value: Number(stats.totalViews || 0).toLocaleString(), color: '#ff6b35', bg: 'rgba(255,107,53,0.1)' },
  ] : [];

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-wrapper" style={{ paddingTop: 'calc(var(--nav-height) + 32px)', paddingBottom: 80 }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
              📊 Full <span className="gradient-text">Analytics</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              Track your earnings and performance
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 14
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: card.bg, color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {card.value}
                </div>
                {card.sub && (
                  <div style={{ fontSize: 11, color: card.subColor, marginTop: 2 }}>{card.sub}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Earnings rate info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
          background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)',
          borderRadius: 12, marginBottom: 28, flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 20 }}>💸</span>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Earning rate:</strong> $0.001 per view
            {user?.isPremium && <span style={{ color: '#00e5a0', marginLeft: 8 }}>⭐ Premium: $0.005 per view</span>}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Link to="/premium" style={{
              background: 'linear-gradient(135deg, #4f8ef7, #7c5cfc)',
              color: 'white', padding: '7px 16px', borderRadius: 50,
              fontSize: 13, fontWeight: 600, textDecoration: 'none'
            }}>
              ⭐ Upgrade to earn 5x more
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: 14, fontWeight: 600,
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', marginBottom: -1
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Earnings breakdown */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>💰 Earnings Breakdown</h3>
              {[
                { label: 'Today', value: stats?.todayEarnings || 0, color: '#4f8ef7' },
                { label: 'Yesterday', value: stats?.yesterdayEarnings || 0, color: '#7c5cfc' },
                { label: 'This Week', value: stats?.weeklyEarnings || 0, color: '#00e5a0' },
                { label: 'All Time', value: stats?.totalEarnings || 0, color: '#ff6b35' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>
                    ${parseFloat(item.value).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📈 Performance</h3>
              {[
                { label: 'Avg. earnings per video', value: topVideos.length > 0 ? `$${(parseFloat(stats?.totalEarnings || 0) / topVideos.length).toFixed(4)}` : '$0.0000' },
                { label: 'Avg. views per video', value: topVideos.length > 0 ? Math.round((stats?.totalViews || 0) / topVideos.length).toLocaleString() : '0' },
                { label: 'Earnings per 1000 views', value: stats?.totalViews > 0 ? `$${((parseFloat(stats?.totalEarnings || 0) / (stats?.totalViews || 1)) * 1000).toFixed(3)}` : '$0.000' },
                { label: 'Total videos', value: topVideos.length },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p>No earnings history yet. Upload videos to start earning!</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    {['Video', 'Type', 'Amount', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.video_title || '—'}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          background: item.type === 'premium' ? 'rgba(124,92,252,0.15)' : 'rgba(79,142,247,0.15)',
                          color: item.type === 'premium' ? '#7c5cfc' : '#4f8ef7',
                          padding: '2px 10px', borderRadius: 50, fontSize: 12, fontWeight: 600
                        }}>
                          {item.type || 'view'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700, color: '#00e5a0' }}>
                        +${parseFloat(item.amount).toFixed(4)}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Top Videos Tab */}
        {activeTab === 'top' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {topVideos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <p>No videos yet.</p>
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/upload')}>
                  + Upload Now
                </button>
              </div>
            ) : topVideos.map((v, i) => (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                borderBottom: i < topVideos.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? '#f59e0b' : i === 1 ? '#8892a4' : i === 2 ? '#ff6b35' : 'var(--text-muted)', width: 28 }}>
                  #{i + 1}
                </span>
                <div style={{ width: 64, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  {v.thumbnail_url
                    ? <img src={v.thumbnail_url} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '▶'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/video/${v.id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.title}
                  </Link>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👁 {Number(v.views).toLocaleString()} views</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#00e5a0' }}>${parseFloat(v.earnings || 0).toFixed(4)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>earned</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Earnings;