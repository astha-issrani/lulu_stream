import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyVideos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get(`/api/videos/user/${user.id}`);
      setVideos(data.videos || []);
    } catch (err) {
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, [user.id]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/videos/${id}`);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert('Failed to delete video.');
    } finally {
      setDeleting('');
    }
  };

  // Group videos by date
  const groupByDate = (videos) => {
    const groups = {};
    videos.forEach(v => {
      const date = new Date(v.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(v);
    });
    return groups;
  };

  const grouped = groupByDate(videos);

  return (
    <div className="page-wrapper" style={{ paddingTop: 'calc(var(--nav-height) + 32px)', paddingBottom: 80 }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
              🎬 My <span className="gradient-text">Videos</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              {videos.length} video{videos.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/upload')}>
            + Upload Video
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
            color: '#ff7070', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14
          }}>
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="spinner" />
          </div>
        ) : videos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No videos yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Upload your first video and start earning!
            </p>
            <button className="btn-primary" onClick={() => navigate('/upload')}>
              + Upload Now
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dayVideos]) => (
            <div key={date} style={{ marginBottom: 40 }}>
              {/* Date header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.6px'
                }}>
                  📅 {date}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {dayVideos.length} video{dayVideos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Video cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dayVideos.map(video => (
                  <div key={video.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '14px 18px',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Thumbnail */}
                    <Link to={`/video/${video.id}`} style={{
                      width: 120, height: 68, borderRadius: 8, overflow: 'hidden',
                      background: 'var(--bg-secondary)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, color: 'var(--text-muted)', textDecoration: 'none'
                    }}>
                      {video.thumbnail_url
                        ? <img src={video.thumbnail_url} alt={video.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '▶'
                      }
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/video/${video.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          marginBottom: 6
                        }}>
                          {video.title}
                        </div>
                      </Link>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>👁 {Number(video.views || 0).toLocaleString()} views</span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                          💰 ${parseFloat(video.earnings || 0).toFixed(4)}
                        </span>
                        <span>🕐 {new Date(video.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}</span>
                        {video.is_premium && (
                          <span style={{
                            background: 'rgba(79,142,247,0.15)', color: 'var(--accent-blue)',
                            padding: '1px 8px', borderRadius: 50, fontSize: 11, fontWeight: 700
                          }}>⭐ PREMIUM</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Link
                        to={`/video/${video.id}`}
                        style={{
                          background: 'rgba(79,142,247,0.1)', color: 'var(--accent-blue)',
                          border: '1px solid rgba(79,142,247,0.2)', padding: '7px 14px',
                          borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: 5
                        }}
                      >
                        ▶ Play
                      </Link>
                      <button
                        onClick={() => handleDelete(video.id, video.title)}
                        disabled={deleting === video.id}
                        style={{
                          background: 'rgba(255,80,80,0.08)', color: '#ff7070',
                          border: '1px solid rgba(255,80,80,0.2)', padding: '7px 14px',
                          borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'Outfit, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 5
                        }}
                      >
                        {deleting === video.id ? '...' : '🗑 Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyVideos;