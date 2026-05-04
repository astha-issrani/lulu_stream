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

const Premium = () => (
  <div className="page-wrapper" style={{ paddingTop: 120, textAlign: 'center' }}>
    <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
      <span className="gradient-text">Premium</span> Plans
    </h1>
    <p style={{ color: 'var(--text-secondary)' }}>Premium plans coming soon!</p>
  </div>
);

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

// Admin only route guard
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('vs_token');
  console.log('Token:', token);
  
  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Payload:', payload);
    console.log('Role:', payload.role);
    
    if (payload.role !== 'admin') {
      console.log('Not admin, redirecting to home');
      return <Navigate to="/" />;
    }
    console.log('Admin confirmed, showing panel');
    return children;
  } catch(e) {
    console.log('Token parse error:', e);
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