import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <Link to="/">
            <span style={{ color: '#4f8ef7' }}>video</span>
            <span className="logo-badge">stream</span>
          </Link>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start earning by sharing your videos today</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="input-field"
              placeholder="yourcoolname"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm"
              className="input-field"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="terms-note">
            By registering you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;