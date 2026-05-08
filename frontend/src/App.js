import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import VideoPlayer from './pages/VideoPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/Adminpanel';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';

// Placeholder pages
const Earn = () => (
  <div className="page-wrapper" style={{ paddingTop: 120, textAlign: 'center' }}>
    <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
      How to <span className="gradient-text">Earn Money</span>
    </h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
      Upload videos and earn $0.001 per view. Premium content earns 5x more.
      Withdraw earnings to your bank or PayPal when you reach $10.
    </p>
  </div>
);

const Premium = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      color: '#8892a4',
      icon: '🎬',
      popular: false,
      features: [
        '$0.001 per view',
        'Upload up to 5 videos',
        'Basic analytics',
        'Standard quality streaming',
        'Community support',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      name: 'Creator',
      price: '$9.99',
      period: 'per month',
      color: '#4f8ef7',
      icon: '⚡',
      popular: true,
      features: [
        '$0.005 per view (5x more)',
        'Upload unlimited videos',
        'Advanced analytics & insights',
        'HD & 4K streaming',
        'Priority support',
        'Custom thumbnail upload',
        'Early access to features',
      ],
      cta: 'Get Started',
      disabled: false,
    },
    {
      name: 'Pro',
      price: '$24.99',
      period: 'per month',
      color: '#7c5cfc',
      icon: '👑',
      popular: false,
      features: [
        '$0.01 per view (10x more)',
        'Everything in Creator',
        'Dedicated account manager',
        'Revenue share boost',
        'API access',
        'White-label player',
        'Custom domain support',
        'Monthly payout (no threshold)',
      ],
      cta: 'Go Pro',
      disabled: false,
    },
  ];

  return (
    <div className="page-wrapper" style={{ paddingTop: 80, paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56, padding: '40px 24px 0' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.3)',
          borderRadius: 50, padding: '6px 16px', fontSize: 13, color: '#7c5cfc',
          fontWeight: 600, marginBottom: 20
        }}>
          ⭐ Premium Plans
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
          Earn <span className="gradient-text">More</span> from Your Content
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
          Upgrade your account to unlock higher earnings, better analytics, and exclusive creator tools.
        </p>
      </div>

      {/* Plans */}
      <div style={{
        display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
        padding: '0 24px', maxWidth: 1100, margin: '0 auto'
      }}>
        {plans.map(plan => (
          <div key={plan.name} style={{
            background: plan.popular
              ? 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,92,252,0.06))'
              : 'var(--bg-card)',
            border: `1.5px solid ${plan.popular ? plan.color : 'var(--border)'}`,
            borderRadius: 20,
            padding: '32px 28px',
            flex: '1 1 280px',
            maxWidth: 340,
            position: 'relative',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 20px 40px ${plan.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #4f8ef7, #7c5cfc)',
                color: 'white', fontSize: 12, fontWeight: 700,
                padding: '4px 16px', borderRadius: 50, whiteSpace: 'nowrap'
              }}>
                🔥 Most Popular
              </div>
            )}

            {/* Plan header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{plan.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: plan.color, marginBottom: 6 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span style={{ color: plan.color, fontSize: 16, flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button
              disabled={plan.disabled}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 50,
                border: plan.disabled ? '1.5px solid var(--border)' : 'none',
                background: plan.disabled
                  ? 'transparent'
                  : `linear-gradient(135deg, ${plan.color}, ${plan.name === 'Pro' ? '#00d4ff' : '#7c5cfc'})`,
                color: plan.disabled ? 'var(--text-muted)' : 'white',
                fontSize: 15,
                fontWeight: 700,
                cursor: plan.disabled ? 'default' : 'pointer',
                fontFamily: 'Outfit, sans-serif',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { if (!plan.disabled) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
        All plans include a 7-day free trial. Cancel anytime. No hidden fees.
      </p>
    </div>
  );
};

const ApiDocs = () => (
  <div className="page-wrapper" style={{ paddingTop: 120, textAlign: 'center' }}>
    <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
      <span className="gradient-text">API</span> Documentation
    </h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px' }}>
      Base URL: <code style={{ color: 'var(--accent-blue)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 4 }}>
        http://localhost:5000/api
      </code>
    </p>
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
      {[
        ['POST', '/auth/register', 'Create account'],
        ['POST', '/auth/login', 'Login'],
        ['GET', '/auth/me', 'Get current user (auth required)'],
        ['GET', '/videos', 'List all videos'],
        ['GET', '/videos/:id', 'Get single video'],
        ['POST', '/videos', 'Upload video (auth required)'],
        ['GET', '/earnings', 'Get earnings (auth required)'],
      ].map(([method, path, desc], index) => (
        <div key={`${method}-${index}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
          <span style={{ background: method === 'GET' ? 'rgba(0,229,160,0.15)' : 'rgba(79,142,247,0.15)', color: method === 'GET' ? 'var(--accent-green)' : 'var(--accent-blue)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, width: 44, textAlign: 'center' }}>{method}</span>
          <code style={{ color: 'var(--text-primary)', flex: 1 }}>{path}</code>
          <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const NotFound = () => (
  <div className="page-wrapper" style={{ paddingTop: 120, textAlign: 'center' }}>
    <h1 style={{ fontSize: 80, fontWeight: 800, color: 'var(--border)' }}>404</h1>
    <h2 style={{ fontSize: 24, marginBottom: 12 }}>Page not found</h2>
    <a href="/" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 50, background: 'var(--gradient-cta)', color: 'white', fontWeight: 600 }}>
      Go Home
    </a>
  </div>
);

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('vs_token');
  if (!token) return <Navigate to="/login" />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return <Navigate to="/" />;
    return children;
  } catch(e) {
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected routes */}
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute><Upload /></ProtectedRoute>
          } />
          <Route path="/video/:id" element={<VideoPlayer />} />

          {/* Admin route */}
          <Route path="/admin" element={
            <AdminRoute><AdminPanel /></AdminRoute>
          } />

          {/* Redirects */}
          <Route path="/my-videos" element={<Navigate to="/dashboard" />} />
          <Route path="/earnings" element={<Navigate to="/dashboard" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;