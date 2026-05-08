import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/contact', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper contact-page">

      {/* Hero */}
      <div className="contact-hero">
        <div className="contact-hero-bg">
          <div className="ch-orb ch-orb1" />
          <div className="ch-orb ch-orb2" />
        </div>
        <div className="container contact-hero-inner">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-desc">
            To contact us simply fill the form below.<br />
            Please take a minute reading our{' '}
            <Link to="#" className="tos-link">TOS</Link>{' '}
            before sending any messages regarding our services.
          </p>
          <p className="contact-emails">
            Support : <a href="mailto:support@videostream.com">support@videostream.com</a>
            &nbsp;&nbsp;DMCA : <a href="mailto:dmca@videostream.com">dmca@videostream.com</a>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container contact-form-wrap">
        {submitted ? (
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h3>Message Sent!</h3>
            <p>We'll get back to you within 24 hours.</p>
            <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
              Send Another
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#ff505022', border: '1px solid #ff5050',
                color: '#ff5050', padding: '12px 16px', borderRadius: 8, marginBottom: 16
              }}>
                ❌ {error}
              </div>
            )}

            <div className="cf-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
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
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select
                name="subject"
                className="input-field"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="earnings">Earnings & Payments</option>
                <option value="upload">Upload Issues</option>
                <option value="account">Account Problem</option>
                <option value="dmca">DMCA / Copyright</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                className="input-field textarea"
                placeholder="Describe your issue or question in detail..."
                value={form.message}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            <button type="submit" className="btn-primary cf-submit" disabled={loading}>
              {loading
                ? <span className="spinner" style={{ width: 18, height: 18 }} />
                : '📨 Send Message'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
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
              <Link to="/contact">Contact Us</Link>
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

export default Contact;