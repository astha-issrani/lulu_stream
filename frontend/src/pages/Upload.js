import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Upload.css';

const CLOUD_NAME = 'dnpy4ko1u';
const UPLOAD_PRESET = 'videostream_upload';
const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB chunks

const Upload = () => {
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    isPremium: false,
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [thumbUploaded, setThumbUploaded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // ── Standard upload for small files (<100MB) ──
  const uploadStandard = (file, resourceType, onProgress) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', resourceType);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText).secure_url);
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  // ── Chunked upload for large files (>=100MB) ──
  const uploadChunked = async (file, onProgress) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uniqueUploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let secureUrl = '';

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', 'video');

      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

      setUploadStatus(`Uploading chunk ${chunkIndex + 1} of ${totalChunks}...`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          headers: {
            'X-Unique-Upload-Id': uniqueUploadId,
            'Content-Range': contentRange,
          },
          body: formData,
        }
      );

      if (!response.ok && response.status !== 206) {
        const errText = await response.text();
        throw new Error(`Chunk ${chunkIndex + 1} failed: ${response.status} — ${errText}`);
      }

      const pct = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      onProgress(pct);

      // Last chunk returns the final response with secure_url
      if (chunkIndex === totalChunks - 1) {
        const data = await response.json();
        secureUrl = data.secure_url;
      }
    }

    return secureUrl;
  };

  const handleVideoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB hard cap
    if (file.size > maxSize) {
      setError('Video file must be under 100MB.');
      return;
    }

    setError('');
    setVideoFile(file);
    setVideoUploaded(false);
    setVideoProgress(0);
    setUploadingVideo(true);
    setUploadStatus('');

    try {
      let url;
      if (file.size >= 100 * 1024 * 1024) {
        // Large file — use chunked upload
        setUploadStatus('Large file detected — using chunked upload...');
        url = await uploadChunked(file, setVideoProgress);
      } else {
        // Small file — use standard upload
        setUploadStatus('Uploading...');
        url = await uploadStandard(file, 'video', setVideoProgress);
      }
      setForm(prev => ({ ...prev, videoUrl: url }));
      setVideoUploaded(true);
      setUploadStatus('');
    } catch (err) {
      console.error('Video upload error:', err);
      setError(`Video upload failed: ${err.message}`);
      setVideoFile(null);
      setUploadStatus('');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be under 5MB.');
      return;
    }

    setError('');
    setThumbFile(file);
    setThumbUploaded(false);
    setThumbProgress(0);
    setUploadingThumb(true);

    try {
      const url = await uploadStandard(file, 'image', setThumbProgress);
      setForm(prev => ({ ...prev, thumbnailUrl: url }));
      setThumbUploaded(true);
    } catch (err) {
      setError('Thumbnail upload failed. Please try again.');
      setThumbFile(null);
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.videoUrl) {
      setError('Please upload a video file first.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/videos', {
        title: form.title,
        description: form.description,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl || null,
        isPremium: form.isPremium,
      });

      setSuccess('Video uploaded successfully! Redirecting...');
      setTimeout(() => navigate(`/video/${data.video.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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

            {/* Title */}
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

            {/* Video File Upload */}
            <div className="form-group">
              <label>Video File *</label>
              <div
                className={`file-drop-zone ${videoUploaded ? 'uploaded' : ''} ${uploadingVideo ? 'uploading' : ''}`}
                onClick={() => !uploadingVideo && videoInputRef.current.click()}
              >
                {!videoFile ? (
                  <>
                    <div className="drop-icon">🎬</div>
                    <p className="drop-text">Click to select your video file</p>
                    <p className="drop-hint">MP4, WebM, MOV — Up to 2GB (chunked upload)</p>
                  </>
                ) : (
                  <div className="file-info">
                    <div className="file-name-row">
                      <span className="file-icon">🎬</span>
                      <span className="file-name">{videoFile.name}</span>
                      <span className="file-size">{formatFileSize(videoFile.size)}</span>
                    </div>

                    {uploadingVideo && (
                      <>
                        {uploadStatus && (
                          <div style={{ fontSize: 12, color: 'var(--accent-blue)', marginTop: 8, marginBottom: 4 }}>
                            {uploadStatus}
                          </div>
                        )}
                        <div className="progress-wrap">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${videoProgress}%` }} />
                          </div>
                          <span className="progress-pct">{videoProgress}%</span>
                        </div>
                      </>
                    )}

                    {videoUploaded && (
                      <div className="upload-done">
                        ✅ Uploaded to Cloudinary successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/mov,video/*"
                style={{ display: 'none' }}
                onChange={handleVideoFileChange}
              />
              {!videoFile && (
                <small className="field-hint">
                  Files under 100MB upload instantly. Larger files are split into chunks automatically.
                </small>
              )}
            </div>

            {/* Manual Video URL fallback */}
            {!videoUploaded && (
              <div className="form-group">
                <label>Video URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(or paste a direct link)</span></label>
                <input
                  type="url"
                  name="videoUrl"
                  className="input-field"
                  placeholder="https://your-video-hosting.com/video.mp4"
                  value={form.videoUrl}
                  onChange={handleChange}
                />
                <small className="field-hint">Paste a direct MP4/WebM URL if you're not uploading a file</small>
              </div>
            )}

            {/* Thumbnail Upload */}
            <div className="form-group">
              <label>Thumbnail <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <div
                className={`file-drop-zone thumb-drop ${thumbUploaded ? 'uploaded' : ''} ${uploadingThumb ? 'uploading' : ''}`}
                onClick={() => !uploadingThumb && thumbInputRef.current.click()}
              >
                {!thumbFile ? (
                  <>
                    <div className="drop-icon">🖼️</div>
                    <p className="drop-text">Click to upload thumbnail</p>
                    <p className="drop-hint">JPG, PNG — Max 5MB</p>
                  </>
                ) : (
                  <div className="file-info">
                    <div className="file-name-row">
                      {thumbUploaded
                        ? <img src={form.thumbnailUrl} alt="thumb preview" className="thumb-preview" />
                        : <span className="file-icon">🖼️</span>
                      }
                      <span className="file-name">{thumbFile.name}</span>
                      <span className="file-size">{formatFileSize(thumbFile.size)}</span>
                    </div>

                    {uploadingThumb && (
                      <div className="progress-wrap">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${thumbProgress}%` }} />
                        </div>
                        <span className="progress-pct">{thumbProgress}%</span>
                      </div>
                    )}

                    {thumbUploaded && (
                      <div className="upload-done">✅ Thumbnail uploaded</div>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleThumbFileChange}
              />
            </div>

            {/* Description */}
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

            {/* Premium Toggle */}
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

            {/* Actions */}
            <div className="upload-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={uploadingVideo || uploadingThumb}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || uploadingVideo || uploadingThumb || !form.videoUrl}
              >
                {loading
                  ? <span className="spinner" style={{ width: 18, height: 18 }} />
                  : uploadingVideo
                  ? `Uploading... ${videoProgress}%`
                  : '📤 Publish Video'
                }
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;