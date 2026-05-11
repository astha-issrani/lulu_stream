import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, topRes, videosRes] = await Promise.all([
          axios.get('/api/earnings'),
          axios.get('/api/earnings/top-videos'),
          axios.get(`/api/videos/user/${user.id}`),
        ]);
        setStats(earningsRes.data);
        setTopVideos(topRes.data.videos || []);
        setRecentVideos(videosRes.data.videos?.slice(0, 5) || []);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="container">
        <div className="page-wrapper dashboard">
          <div className="container">
            {/* Header */}
            <div className="dash-header animate-fade-up">
              <div>
                <h1>Welcome back, <span className="gradient-text">{user.username}</span> 👋</h1>
                <p className="dash-subtitle">Here's how your content is performing</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/admin')}
                    style={{ background: 'linear-gradient(135deg, #ff6b35, #f59e0b)' }}
                  >
                    👑 Admin Panel
                  </button>
                )}
                <button className="btn-primary" onClick={() => navigate('/upload')}>
                  + Upload Video
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid animate-fade-up delay-1">
              <div className="stat-tile">
                <div className="stat-tile-icon" style={{ background: 'rgba(79,142,247,0.15)', color: '#4f8ef7' }}>💰</div>
                <div>
                  <div className="stat-tile-label">Total Earnings</div>
                  <div className="stat-tile-value">${parseFloat(stats?.totalEarnings || 0).toFixed(2)}</div>
                </div>
              </div>

              <div className="stat-tile">
                <div className="stat-tile-icon" style={{ background: 'rgba(0,229,160,0.15)', color: '#00e5a0' }}>📈</div>
                <div>
                  <div className="stat-tile-label">Today's Earnings</div>
                  <div className="stat-tile-value">
                    ${parseFloat(stats?.todayEarnings || 0).toFixed(2)}
                    {stats?.percentChange !== 0 && (
                      <span className={`pct-badge ${stats?.percentChange > 0 ? 'positive' : 'negative'}`}>
                        {stats?.percentChange > 0 ? '▲' : '▼'} {Math.abs(stats?.percentChange || 0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="stat-tile">
                <div className="stat-tile-icon" style={{ background: 'rgba(124,92,252,0.15)', color: '#7c5cfc' }}>👁</div>
                <div>
                  <div className="stat-tile-label">Total Views</div>
                  <div className="stat-tile-value">{Number(stats?.totalViews || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Clickable My Videos card */}
              <div
                className="stat-tile"
                onClick={() => navigate('/my-videos')}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="stat-tile-icon" style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }}>🎬</div>
                <div style={{ flex: 1 }}>
                  <div className="stat-tile-label">My Videos</div>
                  <div className="stat-tile-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{recentVideos.length}</span>
                    <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600 }}>View all →</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-two-col animate-fade-up delay-2">
              {/* Top Earning Videos */}
              <div className="dash-panel">
                <div className="panel-header">
                  <h3>🏆 Top Earning Videos</h3>
                  <Link to="/my-videos" className="btn-ghost">View All</Link>
                </div>
                {topVideos.length > 0 ? (
                  <div className="top-videos-list">
                    {topVideos.map((v, i) => (
                      <Link to={`/video/${v.id}`} key={v.id} className="top-video-row">
                        <span className="rank-num">#{i + 1}</span>
                        <div className="tv-thumb">
                          {v.thumbnail_url ? (
                            <img src={v.thumbnail_url} alt={v.title} />
                          ) : (
                            <div className="tv-thumb-placeholder">▶</div>
                          )}
                        </div>
                        <div className="tv-info">
                          <span className="tv-title">{v.title}</span>
                          <span className="tv-views">👁 {Number(v.views).toLocaleString()}</span>
                        </div>
                        <span className="tv-earnings">${parseFloat(v.earnings).toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="panel-empty">
                    <p>No videos yet.</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="dash-panel">
                <div className="panel-header">
                  <h3>⚡ Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  {[
                    { icon: '📤', label: 'Upload Video', desc: 'Share new content', path: '/upload' },
                    { icon: '📊', label: 'Full Analytics', desc: 'Detailed stats', path: '/earnings' },
                    { icon: '🎬', label: 'Manage Videos', desc: 'Edit & delete', path: '/my-videos' },
                    { icon: '⭐', label: 'Go Premium', desc: 'Unlock more features', path: '/premium' },
                    { icon: '🔗', label: 'API Docs', desc: 'Developer access', path: '/api-docs' },
                    { icon: '⚙️', label: 'Settings', desc: 'Profile & security', path: '/settings' },
                    ...(user.role === 'admin' || user.role === 'moderator'
                      ? [{ icon: '👑', label: 'Admin Panel', desc: 'Manage platform', path: '/admin' }]
                      : []
                    ),
                  ].map((action) => (
                    <Link to={action.path} key={action.path} className="quick-action-card">
                      <span className="qa-icon">{action.icon}</span>
                      <div>
                        <div className="qa-label">{action.label}</div>
                        <div className="qa-desc">{action.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;