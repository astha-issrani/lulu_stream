import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await axios.get(`/api/videos/${id}`);
        setVideo(data.video);
      } catch (err) {
        setError('Video not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: 120 }}>
      <h2>{error}</h2>
      <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  return (
    <div className="page-wrapper video-player-page">
      <div className="container">
        <div className="player-layout">

          {/* Video Player */}
          <div className="player-main">
            <div className="video-wrapper">
              <video
                controls
                autoPlay
                src={video.video_url}
                poster={video.thumbnail_url}
                className="video-el"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="video-info-box">
              <h1 className="video-heading">{video.title}</h1>
              <div className="video-meta-row">
                <div className="meta-stats">
                  <span>👁 {Number(video.views).toLocaleString()} views</span>
                  <span>💰 ${parseFloat(video.earnings || 0).toFixed(3)} earned</span>
                  <span>📅 {new Date(video.created_at).toLocaleDateString()}</span>
                </div>
                {video.is_premium && (
                  <span className="badge badge-blue">⭐ PREMIUM</span>
                )}
              </div>

              <div className="video-divider" />

              <div className="video-author-row">
                <div className="author-avatar-lg">
                  {video.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="author-name">{video.username}</div>
                  <div className="author-label">Creator</div>
                </div>
              </div>

              {video.description && (
                <div className="video-description">
                  <p>{video.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="player-sidebar">
            <h3 className="sidebar-title">Your Earnings</h3>
            <div className="earnings-card">
              <div className="ec-row">
                <span>This video</span>
                <strong className="ec-green">${parseFloat(video.earnings || 0).toFixed(4)}</strong>
              </div>
              <div className="ec-row">
                <span>Total views</span>
                <strong>{Number(video.views).toLocaleString()}</strong>
              </div>
              <div className="ec-row">
                <span>Rate</span>
                <strong>$0.001 / view</strong>
              </div>
            </div>

            {user && user.id === video.user_id && (
              <div style={{ marginTop: 16 }}>
                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/dashboard')}
                >
                  📊 View Dashboard
                </button>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/')}
              >
                ← Back to Home
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;