import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    isPremium: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/videos', {
        title: form.title,
        description: form.description,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl || null,
        isPremium: form.isPremium,
      });

      setSuccess('Video uploaded successfully!');
      setTimeout(() => navigate(`/video/${data.video.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper upload-page">
      <div className="container">
        <div className="upload-container animate-fade-up">
          <h1 className="upload-title">Upload <span className="gradient-text">Video</span></h1>
          <p className="upload-subtitle">Share your content and start earning money</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="Give your video an engaging title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Video URL *</label>
              <input
                type="url"
                name="videoUrl"
                className="input-field"
                placeholder="https://your-video-hosting.com/video.mp4"
                value={form.videoUrl}
                onChange={handleChange}
                required
              />
              <small className="field-hint">Paste the direct URL to your video file (MP4, WebM, etc.)</small>
            </div>

            <div className="form-group">
              <label>Thumbnail URL</label>
              <input
                type="url"
                name="thumbnailUrl"
                className="input-field"
                placeholder="https://example.com/thumbnail.jpg (optional)"
                value={form.thumbnailUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="input-field textarea"
                placeholder="Describe your video content..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="toggle-group">
              <div className="toggle-info">
                <strong>Premium Content</strong>
                <p>Restrict this video to premium subscribers only and earn more per view.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={form.isPremium}
                  onChange={handleChange}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="upload-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '📤 Upload Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;