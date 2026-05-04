import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

// ── FAQ Item ──
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{question}</span>
        <span className="faq-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

// ── Video Card ──
const VideoCard = ({ video }) => (
  <Link to={`/video/${video.id}`} className="video-card card">
    <div className="video-thumbnail">
      {video.thumbnail_url ? (
        <img src={video.thumbnail_url} alt={video.title} />
      ) : (
        <div className="thumbnail-placeholder"><span>▶</span></div>
      )}
      {video.is_premium && <span className="premium-badge">PREMIUM</span>}
      <div className="play-overlay">
        <div className="play-btn-overlay">▶</div>
      </div>
    </div>
    <div className="video-meta">
      <h3 className="video-title">{video.title}</h3>
      <div className="video-stats">
        <span>👁 {Number(video.views).toLocaleString()}</span>
        <span>💰 ${parseFloat(video.earnings || 0).toFixed(2)}</span>
      </div>
      <div className="video-author">
        <div className="author-avatar-sm">{video.username?.[0]?.toUpperCase()}</div>
        <span>{video.username}</span>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersOnline] = useState(Math.floor(Math.random() * 500) + 1200);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await axios.get('/api/videos?limit=8&sort=popular');
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const features = [
    { icon: '▶', label: 'HLS Streaming' },
    { icon: '🗄', label: 'Unlimited Storage' },
    { icon: '⚡', label: 'Faster Encoding' },
    { icon: '%', label: 'Earn upto $35 per 10k Views', sub: '(Counted 3 Views per 24 hours)' },
    { icon: '🔗', label: 'Referral Rewards' },
    { icon: '☁', label: 'Upload via Browser, FTP, Remote, API & torrent' },
    { icon: '◎', label: 'No Bandwidth Limitation' },
    { icon: '18+', label: 'Legal Adult allowed' },
    { icon: '$', label: 'Payout within 24 hours' },
    { icon: '⚡', label: 'Subtitle support' },
    { icon: '⚡', label: 'Multi-language support' },
    { icon: '⚡', label: 'Extensive statistics' },
  ];

  const faqs = [
    {
      q: 'What is VideoStream?',
      a: 'VideoStream is a video hosting and reward platform where you can upload videos and earn money based on how many people watch them.',
    },
    {
      q: 'How to Upload videos in VideoStream?',
      a: 'Register an account, go to Upload page, paste your video URL and fill in the details. Your video will be live instantly.',
    },
    {
      q: 'Do you delete inactive videos?',
      a: 'Videos with no views in 90 days may be removed. Keep sharing your videos to maintain activity.',
    },
    {
      q: 'Is any bandwidth limitation?',
      a: 'No! VideoStream has no bandwidth limitation. Your viewers can watch as much as they want.',
    },
    {
      q: 'Can I upload adult content?',
      a: 'Legal adult content is allowed on our platform. All content must comply with applicable laws.',
    },
    {
      q: 'How many views are counted per day?',
      a: 'Up to 3 views per unique visitor per 24 hours are counted for earnings purposes.',
    },
  ];

  return (
    <div className="home">

      {/* ══════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════ */}
      <section className="hero-section">
        {/* Background */}
        <div className="hero-bg">
          <div className="bg-gradient-overlay" />
          <div className="bg-grid" />
          <div className="bg-orb orb-blue" />
          <div className="bg-orb orb-purple" />
        </div>

        <div className="hero-inner container">
          {/* Left */}
          <div className="hero-left">
            <div className="hero-online-badge">
              <span className="online-pulse" />
              {usersOnline.toLocaleString()} users online now
            </div>

            <h1 className="hero-h1">
              <span className="hero-num">#1</span>{' '}
              Video<br />
              streaming &amp; reward<br />
              Platform
            </h1>

            <p className="hero-sub">Make Money by sharing Videos online</p>

            <div className="hero-btns">
              {user ? (
                <>
                  <button className="btn-primary hero-cta-btn" onClick={() => navigate('/upload')}>
                    Upload Video →
                  </button>
                  <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                    My Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary hero-cta-btn">Get started →</Link>
                  <Link to="/login" className="btn-secondary">Sign In</Link>
                </>
              )}
            </div>

            <div className="hero-counters">
              <div className="hc-item">
                <strong>50K+</strong>
                <span>Creators</span>
              </div>
              <div className="hc-divider" />
              <div className="hc-item">
                <strong>$2M+</strong>
                <span>Paid Out</span>
              </div>
              <div className="hc-divider" />
              <div className="hc-item">
                <strong>120M+</strong>
                <span>Total Views</span>
              </div>
            </div>
          </div>

          {/* Right — floating stat cards */}
          <div className="hero-right">
            <div className="float-cards">

              {/* TOP Views card */}
              <div className="fc fc-views">
                <div className="fc-top">
                  <span className="fc-fire">🔥</span>
                  <span className="fc-title-sm">TOP Views</span>
                </div>
                <svg className="fc-chart" viewBox="0 0 140 50" fill="none">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline points="0,42 25,34 50,36 75,18 95,24 120,10 140,14"
                    stroke="#4f8ef7" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <polygon points="0,42 25,34 50,36 75,18 95,24 120,10 140,14 140,50 0,50"
                    fill="url(#cg)" />
                </svg>
                <div className="fc-country">
                  <strong>France</strong>
                  <span>Views: 80,326</span>
                </div>
              </div>

              {/* Users online */}
              <div className="fc fc-online">
                <div className="fc-row-inner">
                  <div className="fc-avatar-wrap">👤</div>
                  <div>
                    <div className="fc-sublabel">
                      Users Online Now <span className="online-dot-sm" />
                    </div>
                    <div className="fc-bignum">{usersOnline.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Play button */}
              <div className="fc fc-play">
                <div className="play-ring">▶</div>
              </div>

              {/* Earnings */}
              <div className="fc fc-earn">
                <div className="fc-row-inner">
                  <div className="fc-dollar">$</div>
                  <div style={{ flex: 1 }}>
                    <div className="fc-sublabel">Today's Earning</div>
                    <div className="fc-bignum">
                      {user ? `$${parseFloat(user.totalEarnings || 0).toFixed(2)}` : '$12.00'}
                    </div>
                  </div>
                  <div className="fc-trend">
                    ▲ 25%<br /><small>vs yesterday</small>
                  </div>
                </div>
              </div>

              {/* Storage ring */}
              <div className="fc fc-storage">
                <svg viewBox="0 0 56 56" width="56" height="56">
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4f8ef7" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="url(#rg)" strokeWidth="5"
                    strokeDasharray="92 46" strokeLinecap="round" transform="rotate(-90 28 28)" />
                </svg>
                <span className="fc-storage-label">Storage</span>
              </div>

              {/* Download */}
              <div className="fc fc-download">
                <span>⬇</span> Download
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 2 — FEATURES + VIDEOS
      ══════════════════════════════ */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Our features</h2>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon-wrap">
                  <span className="feature-icon-inner">{f.icon}</span>
                </div>
                <div>
                  <div className="feature-label">{f.label}</div>
                  {f.sub && <div className="feature-sub">{f.sub}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Trending videos */}
          {videos.length > 0 && (
            <div className="videos-block">
              <div className="vb-header">
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  🔥 Trending Videos
                </h2>
                <Link to="/explore" className="btn-ghost">View All →</Link>
              </div>

              {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : (
                <div className="videos-grid">
                  {videos.map((v) => <VideoCard key={v.id} video={v} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 3 — FAQ + FOOTER
      ══════════════════════════════ */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-icon">❓</div>
          <h2 className="section-title">Need to know</h2>

          <div className="faq-grid">
            {faqs.map((f, i) => (
              <FAQItem key={i} question={f.q} answer={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-left">
              <div className="footer-logo">
                <span className="logo-vs">video</span>
                <span className="logo-badge">stream</span>
              </div>
              <p>© 2024 VideoStream.<br />All rights reserved.</p>
            </div>

            <div className="footer-links">
              <Link to="#">Terms of service</Link>
              <Link to="/api-docs">API Documentation</Link>
              <Link to="#">Contact Us</Link>
            </div>

            <div className="footer-links">
              <Link to="/premium">Premium</Link>
              <Link to="/earn">Earn money</Link>
              <Link to="#">Link Checker</Link>
            </div>

            <div className="footer-logo-right">
              <span className="logo-vs">video</span>
              <span className="logo-badge">stream</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;