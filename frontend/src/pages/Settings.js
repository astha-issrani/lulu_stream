import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    website: '',
    location: '',
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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

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
        <div className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your account preferences</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <aside className="settings-sidebar">
            <div className="settings-avatar-block">
              <div className="settings-avatar">
                {user?.username?.[0]?.toUpperCase() || 'U'}
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
                <p className="section-desc">Update your public profile details</p>

                <div className="avatar-upload-row">
                  <div className="big-avatar">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <button className="btn-secondary">Change Photo</button>
                    <p className="hint-text">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Username</label>
                    <input className="input-field" value={profile.username}
                      onChange={e => setProfile({ ...profile, username: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="input-field" type="email" value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea className="input-field textarea" rows={3} placeholder="Tell viewers about yourself..."
                      value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input className="input-field" placeholder="https://yoursite.com"
                      value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input className="input-field" placeholder="City, Country"
                      value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <p className="section-desc">Choose what updates you want to receive</p>

                <div className="toggle-group">
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
                <div className="toggle-group">
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

                <div className="security-info-block">
                  <div className="security-info-item">
                    <span className="si-icon">✅</span>
                    <div>
                      <strong>Email verified</strong>
                      <span>{user?.email}</span>
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
                      <button key={t} className={`theme-btn ${t === 'Dark' ? 'active' : ''}`}>
                        <span>{t === 'Dark' ? '🌙' : t === 'Light' ? '☀️' : '💻'}</span>
                        {t}
                      </button>
                    ))}
                  </div>

                  <label className="appear-label" style={{ marginTop: 28 }}>Language</label>
                  <select className="input-field" style={{ maxWidth: 280 }}>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>

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

            {/* Save button */}
            <div className="settings-footer">
              <button className={`btn-primary save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;