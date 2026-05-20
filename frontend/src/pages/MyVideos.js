import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './MyVideos.css';

const MyVideos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');

  const fetchVideos = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/videos/user/${user.id}`);
      setVideos(data.videos || []);
    } catch (err) {
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

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

  const groupByDate = (vids) => {
    const groups = {};
    vids.forEach(v => {
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
    <div className="my-videos-page">
      <div className="my-videos-container">

        {/* Header */}
        <div className="my-videos-header">
          <div>
            <h1 className="my-videos-title">
              🎬 My <span className="gradient-text">Videos</span>
            </h1>
            <p className="my-videos-subtitle">
              {videos.length} video{videos.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <button className="btn-upload" onClick={() => navigate('/upload')}>
            + Upload Video
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="my-videos-error">
            ❌ {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="my-videos-spinner-wrap">
            <div className="my-videos-spinner" />
          </div>

        /* Empty State */
        ) : videos.length === 0 ? (
          <div className="my-videos-empty">
            <div className="my-videos-empty-icon">🎬</div>
            <h3>No videos yet</h3>
            <p>Upload your first video and start earning!</p>
          </div>

        /* Video Groups */
        ) : (
          Object.entries(grouped).map(([date, dayVideos]) => (
            <div key={date} className="mv-date-group">

              {/* Date header */}
              <div className="mv-date-header">
                <span className="mv-date-label">📅 {date}</span>
                <div className="mv-date-divider" />
                <span className="mv-date-count">
                  {dayVideos.length} video{dayVideos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Video list */}
              <div className="mv-video-list">
                {dayVideos.map(video => (
                  <div key={video.id} className="mv-video-card">

                    {/* Thumbnail */}
                    <Link to={`/video/${video.id}`} className="mv-thumbnail-link">
                      {video.thumbnail_url
                        ? <img src={video.thumbnail_url} alt={video.title} />
                        : '▶'}
                    </Link>

                    {/* Info */}
                    <div className="mv-video-info">
                      <Link to={`/video/${video.id}`} className="mv-video-title-link">
                        <div className="mv-video-title">{video.title}</div>
                      </Link>
                      <div className="mv-video-meta">
                        <span>👁 {Number(video.views || 0).toLocaleString()} views</span>
                        <span className="mv-meta-earnings">
                          💰 ${parseFloat(video.earnings || 0).toFixed(4)}
                        </span>
                        <span>
                          🕐 {new Date(video.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {video.is_premium && (
                          <span className="mv-badge-premium">⭐ PREMIUM</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mv-video-actions">
                      <Link to={`/video/${video.id}`} className="mv-btn-play">
                        ▶ Play
                      </Link>
                      <button
                        className="mv-btn-delete"
                        onClick={() => handleDelete(video.id, video.title)}
                        disabled={deleting === video.id}
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