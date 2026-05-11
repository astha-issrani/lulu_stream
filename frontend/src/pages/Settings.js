import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef(null);

  // Theme & Language state — loaded from localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'Dark');

  // Apply theme to body whenever it changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme.toLowerCase());
  }, [theme]);

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
  });

  const [notifications, setNotifications] = useState({
    emailViews: true,
    emailEarnings: true,
    emailNewFollower: false,
    pushViews: false,
    pushEarnings: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEarnings: false,
    allowComments: true,
    showOnline: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ── NEW: password-specific error/success ──
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Image must be under 2MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaveError('');
    try {
      let avatarUrl = user?.avatarUrl;

      if (avatarFile) {
        const reader = new FileReader();
        avatarUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(avatarFile);
        });
      }

      const { data } = await axios.put('/api/auth/profile', {
        username: profile.username,
        bio: profile.bio,
        avatarUrl,
      });

      updateUser({
        ...user,
        username: data.user.username,
        bio: data.user.bio,
        avatarUrl: data.user.avatar_url,
      });

      setSaved(true);
      setEditMode(false);
      setAvatarFile(null);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes.');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    setSaveError('');
    setProfile({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      website: user?.website || '',
      location: user?.location || '',
    });
  };

  // ── NEW: actual password change API call ──
  const handlePasswordSave = async () => {
    setPasswordError('');
    setPasswordSaved(false);

    const { currentPassword, newPassword, confirmPassword } = security;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      setPasswordSaved(true);
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleAppearanceSave = () => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme.toLowerCase());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const currentAvatar = avatarPreview || user?.avatarUrl;

  const tabs = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'privacy', icon: '🔒', label: 'Privacy' },
    { id: 'security', icon: '🛡️', label: 'Security' },
    { id: 'monetization', icon: '💰', label: 'Monetization' },
    { id: 'appearance', icon: '🎨', label: 'Appearance' },
  ];

  return (
    <div className="settings-page page-wrapper">
      <div className="container">
        <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Settings</h1>
            <p className="settings-subtitle">Manage your account preferences</p>
          </div>
          {activeTab === 'profile' && (
            editMode ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                <button className={`btn-primary save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
                  {saved ? '✓ Saved!' : '💾 Save Changes'}
                </button>
              </div>
            ) : (
              <button className="btn-secondary" onClick={() => setEditMode(true)}>
                ✏️ Edit Profile
              </button>
            )
          )}
        </div>

        {saveError && (
          <div style={{
            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
            color: '#ff7070', padding: '11px 16px', borderRadius: 8,
            fontSize: 14, marginBottom: 16
          }}>
            ❌ {saveError}
          </div>
        )}

        <div className="settings-layout">
          {/* Sidebar */}
          <aside className="settings-sidebar">
            <div className="settings-avatar-block">
              <div className="settings-avatar">
                {currentAvatar
                  ? <img src={currentAvatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : user?.username?.[0]?.toUpperCase() || 'U'
                }
              </div>
              <div>
                <strong>{user?.username}</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            <nav className="settings-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="settings-content">

            {/* ── PROFILE ── */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2>Profile Information</h2>
                <p className="section-desc">
                  {editMode ? 'Edit your public profile details below' : 'View your public profile details'}
                </p>

                <div className="avatar-upload-row">
                  <div className="big-avatar" style={{ overflow: 'hidden', position: 'relative' }}>
                    {currentAvatar
                      ? <img src={currentAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : user?.username?.[0]?.toUpperCase() || 'U'
                    }
                  </div>
                  <div>
                    {editMode ? (
                      <>
                        <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>
                          📷 Change Photo
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          style={{ display: 'none' }}
                          onChange={handleAvatarChange}
                        />
                        <p className="hint-text">JPG, PNG or GIF. Max 2MB.</p>
                        {avatarPreview && (
                          <p className="hint-text" style={{ color: 'var(--accent-green)' }}>
                            ✓ New photo selected
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="hint-text" style={{ marginTop: 0 }}>
                        Click <strong>Edit Profile</strong> to change your photo
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      className="input-field"
                      value={profile.username}
                      disabled={!editMode}
                      style={{ opacity: editMode ? 1 : 0.6, cursor: editMode ? 'text' : 'default' }}
                      onChange={e => setProfile({ ...profile, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      className="input-field"
                      type="email"
                      value={profile.email}
                      disabled
                      style={{ opacity: 0.6, cursor: 'default' }}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      className="input-field textarea"
                      rows={3}
                      placeholder="Tell viewers about yourself..."
                      value={profile.bio}
                      disabled={!editMode}
                      style={{ opacity: editMode ? 1 : 0.6, cursor: editMode ? 'text' : 'default' }}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      className="input-field"
                      placeholder="https://yoursite.com"
                      value={profile.website}
                      disabled={!editMode}
                      style={{ opacity: editMode ? 1 : 0.6, cursor: editMode ? 'text' : 'default' }}
                      onChange={e => setProfile({ ...profile, website: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      className="input-field"
                      placeholder="City, Country"
                      value={profile.location}
                      disabled={!editMode}
                      style={{ opacity: editMode ? 1 : 0.6, cursor: editMode ? 'text' : 'default' }}
                      onChange={e => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                </div>

                {!editMode && (
                  <div style={{
                    marginTop: 20, padding: '12px 16px',
                    background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)',
                    borderRadius: 8, fontSize: 13, color: 'var(--text-muted)'
                  }}>
                    💡 Click <strong style={{ color: 'var(--accent-blue)' }}>Edit Profile</strong> in the top right to make changes.
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <p className="section-desc">Choose what updates you want to receive</p>
                <div className="toggle-group-list">
                  <p className="toggle-category">Email Notifications</p>
                  {[
                    { key: 'emailViews', label: 'Video view milestones', desc: 'When your video hits 100, 1K, 10K views' },
                    { key: 'emailEarnings', label: 'Earnings updates', desc: 'Daily earnings summary to your inbox' },
                    { key: 'emailNewFollower', label: 'New followers', desc: 'When someone starts following you' },
                  ].map(item => (
                    <div className="toggle-row" key={item.key}>
                      <div>
                        <span className="toggle-label">{item.label}</span>
                        <span className="toggle-desc">{item.desc}</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={notifications[item.key]}
                          onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                  <p className="toggle-category" style={{ marginTop: 24 }}>Push Notifications</p>
                  {[
                    { key: 'pushViews', label: 'Live view count', desc: 'Real-time view notifications' },
                    { key: 'pushEarnings', label: 'Earnings alerts', desc: 'Instant payout notifications' },
                  ].map(item => (
                    <div className="toggle-row" key={item.key}>
                      <div>
                        <span className="toggle-label">{item.label}</span>
                        <span className="toggle-desc">{item.desc}</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={notifications[item.key]}
                          onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PRIVACY ── */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h2>Privacy & Visibility</h2>
                <p className="section-desc">Control who can see your content and activity</p>
                <div className="toggle-group-list">
                  {[
                    { key: 'profilePublic', label: 'Public profile', desc: 'Anyone can view your profile and videos' },
                    { key: 'showEarnings', label: 'Show earnings', desc: 'Display your earnings badge on your profile' },
                    { key: 'allowComments', label: 'Allow comments', desc: 'Let viewers comment on your videos' },
                    { key: 'showOnline', label: 'Show online status', desc: 'Let others know when you\'re active' },
                  ].map(item => (
                    <div className="toggle-row" key={item.key}>
                      <div>
                        <span className="toggle-label">{item.label}</span>
                        <span className="toggle-desc">{item.desc}</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={privacy[item.key]}
                          onChange={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Security</h2>
                <p className="section-desc">Keep your account safe</p>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Current Password</label>
                    <input className="input-field" type="password" placeholder="••••••••"
                      value={security.currentPassword}
                      onChange={e => setSecurity({ ...security, currentPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input className="input-field" type="password" placeholder="••••••••"
                      value={security.newPassword}
                      onChange={e => setSecurity({ ...security, newPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input className="input-field" type="password" placeholder="••••••••"
                      value={security.confirmPassword}
                      onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })} />
                  </div>
                </div>

                {/* ── Password feedback ── */}
                {passwordError && (
                  <div style={{
                    background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
                    color: '#ff7070', padding: '11px 16px', borderRadius: 8,
                    fontSize: 14, marginBottom: 16
                  }}>
                    ❌ {passwordError}
                  </div>
                )}
                {passwordSaved && (
                  <div style={{
                    background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)',
                    color: '#00e5a0', padding: '11px 16px', borderRadius: 8,
                    fontSize: 14, marginBottom: 16
                  }}>
                    ✅ Password changed successfully!
                  </div>
                )}

                {/* ── Change password button ── */}
                <button
                  className="btn-primary"
                  style={{ marginBottom: 28 }}
                  onClick={handlePasswordSave}
                >
                  🔐 Change Password
                </button>

                <div className="security-info-block">
                  {/* ── FIX: check user?.is_email_verified instead of hardcoding ✅ ── */}
                  <div className="security-info-item">
                    <span className="si-icon">
                      {user?.is_email_verified ? '✅' : '⚠️'}
                    </span>
                    <div>
                      <strong>
                        {user?.is_email_verified ? 'Email verified' : 'Email not verified'}
                      </strong>
                      <span>
                        {user?.is_email_verified
                          ? user?.email
                          : 'Please check your inbox for a verification link.'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="security-info-item">
                    <span className="si-icon">📱</span>
                    <div>
                      <strong>Two-factor authentication</strong>
                      <span>Not enabled — <button className="link-btn">Enable 2FA</button></span>
                    </div>
                  </div>
                  <div className="security-info-item danger">
                    <span className="si-icon">🗑️</span>
                    <div>
                      <strong>Delete account</strong>
                      <span>Permanently remove your account and all data</span>
                    </div>
                    <button className="btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── MONETIZATION ── */}
            {activeTab === 'monetization' && (
              <div className="settings-section">
                <h2>Monetization</h2>
                <p className="section-desc">Manage how you earn from your content</p>
                <div className="earn-rate-card">
                  <div className="earn-rate-left">
                    <span className="earn-icon">💸</span>
                    <div>
                      <strong>Current rate</strong>
                      <span>$0.001 per view</span>
                    </div>
                  </div>
                  <span className="badge badge-green">Active</span>
                </div>
                <div className="form-grid" style={{ marginTop: 24 }}>
                  <div className="form-group full-width">
                    <label>Payout Method</label>
                    <select className="input-field">
                      <option>PayPal</option>
                      <option>Bank Transfer</option>
                      <option>Crypto (USDT)</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>PayPal / Bank Email</label>
                    <input className="input-field" type="email" placeholder="payout@email.com" />
                  </div>
                  <div className="form-group full-width">
                    <label>Minimum Payout Threshold</label>
                    <select className="input-field">
                      <option>$10 (default)</option>
                      <option>$25</option>
                      <option>$50</option>
                      <option>$100</option>
                    </select>
                  </div>
                </div>
                <div className="premium-upgrade-card">
                  <span>⭐</span>
                  <div>
                    <strong>Go Premium — Earn 5x More</strong>
                    <p>Premium creators earn $0.005 per view + access to exclusive features</p>
                  </div>
                  <button className="btn-primary">Upgrade</button>
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2>Appearance</h2>
                <p className="section-desc">Customize your viewing experience</p>
                <div className="appearance-block">
                  <label className="appear-label">Theme</label>
                  <div className="theme-options">
                    {['Dark', 'Light', 'System'].map(t => (
                      <button
                        key={t}
                        className={`theme-btn ${t === theme ? 'active' : ''}`}
                        onClick={() => setTheme(t)}
                      >
                        <span>{t === 'Dark' ? '🌙' : t === 'Light' ? '☀️' : '💻'}</span>
                        {t}
                      </button>
                    ))}
                  </div>

                  <p className="theme-preview-hint">
                    {theme === 'Dark' && '🌙 Dark mode active — easy on the eyes'}
                    {theme === 'Light' && '☀️ Light mode active — bright and clean'}
                    {theme === 'System' && '💻 Follows your OS preference'}
                  </p>

                  <label className="appear-label" style={{ marginTop: 28 }}>Video Quality (default)</label>
                  <select className="input-field" style={{ maxWidth: 280 }}>
                    <option>Auto</option>
                    <option>1080p</option>
                    <option>720p</option>
                    <option>480p</option>
                    <option>360p</option>
                  </select>
                </div>
              </div>
            )}

            {/* Save button for non-profile, non-security tabs */}
            {activeTab !== 'profile' && activeTab !== 'security' && (
              <div className="settings-footer">
                <button
                  className={`btn-primary save-btn ${saved ? 'saved' : ''}`}
                  onClick={activeTab === 'appearance' ? handleAppearanceSave : () => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2500);
                  }}
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;