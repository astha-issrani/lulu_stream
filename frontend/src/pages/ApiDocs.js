import React, { useState } from 'react';
import './ApiDocs.css';

// ── Data ──────────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5000/api';

const SECTIONS = [
  {
    group: 'Account',
    items: [
      { id: 'account_info',    label: 'Account Info' },
      { id: 'account_update',  label: 'Update Profile' },
    ],
  },
  {
    group: 'Auth',
    items: [
      { id: 'auth_register', label: 'Register' },
      { id: 'auth_login',    label: 'Login' },
    ],
  },
  {
    group: 'Videos',
    items: [
      { id: 'video_list',     label: 'Video List' },
      { id: 'video_trending', label: 'Trending Videos' },
      { id: 'video_info',     label: 'Video Info' },
      { id: 'video_upload',   label: 'Upload Video' },
      { id: 'video_delete',   label: 'Delete Video' },
      { id: 'video_user',     label: 'User Videos' },
    ],
  },
  {
    group: 'Earnings',
    items: [
      { id: 'earnings_info', label: 'Earnings Info' },
      { id: 'earnings_withdraw', label: 'Request Withdrawal' },
    ],
  },
  {
    group: 'Contact',
    items: [
      { id: 'contact_send', label: 'Send Message' },
    ],
  },
];

const DOCS = {
  // ── ACCOUNT ───────────────────────────────────────────────────────────────
  account_info: {
    title: 'Account Info',
    method: 'GET',
    endpoint: '/auth/me',
    auth: true,
    desc: 'Returns the currently authenticated user\'s profile, earnings, and account details.',
    params: [
      { name: 'Authorization', desc: 'Bearer token in header', example: 'Bearer eyJhbGci...', type: 'STRING', required: true },
    ],
    response: `{
  "user": {
    "id": 12,
    "username": "kartik21",
    "email": "kartik@example.com",
    "role": "user",
    "avatarUrl": "https://cdn.videostream.com/avatars/12.jpg",
    "isPremium": false,
    "totalEarnings": 4.821,
    "totalViews": 4821,
    "bio": "Video creator from India",
    "is_email_verified": true
  }
}`,
  },

  account_update: {
    title: 'Update Profile',
    method: 'PUT',
    endpoint: '/auth/profile',
    auth: true,
    desc: 'Update the authenticated user\'s username, bio, or avatar. Only supplied fields are updated.',
    params: [
      { name: 'username', desc: 'New username', example: 'kartik_new', type: 'STRING', required: false },
      { name: 'bio',      desc: 'Profile bio text', example: 'Video creator from India', type: 'STRING', required: false },
      { name: 'avatarUrl', desc: 'Avatar image URL or base64', example: 'https://cdn.example.com/img.jpg', type: 'STRING', required: false },
    ],
    response: `{
  "user": {
    "id": 12,
    "username": "kartik_new",
    "email": "kartik@example.com",
    "role": "user",
    "avatar_url": "https://cdn.videostream.com/avatars/12.jpg",
    "bio": "Video creator from India",
    "is_premium": false,
    "total_earnings": "4.821000",
    "total_views": 4821
  }
}`,
  },

  // ── AUTH ──────────────────────────────────────────────────────────────────
  auth_register: {
    title: 'Register',
    method: 'POST',
    endpoint: '/auth/register',
    auth: false,
    desc: 'Create a new user account. Returns a JWT token and user object on success.',
    params: [
      { name: 'username', desc: 'Desired username (3–50 chars)', example: 'kartik21', type: 'STRING', required: true },
      { name: 'email',    desc: 'Valid email address', example: 'kartik@example.com', type: 'STRING', required: true },
      { name: 'password', desc: 'Password (min 6 characters)', example: 'secret123', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12,
    "username": "kartik21",
    "email": "kartik@example.com",
    "role": "user",
    "avatarUrl": null,
    "isPremium": false,
    "totalEarnings": 0,
    "totalViews": 0
  }
}`,
  },

  auth_login: {
    title: 'Login',
    method: 'POST',
    endpoint: '/auth/login',
    auth: false,
    desc: 'Authenticate an existing user. Returns a JWT token valid for 7 days.',
    params: [
      { name: 'email',    desc: 'Registered email address', example: 'kartik@example.com', type: 'STRING', required: true },
      { name: 'password', desc: 'Account password', example: 'secret123', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12,
    "username": "kartik21",
    "email": "kartik@example.com",
    "role": "user",
    "avatarUrl": "https://cdn.videostream.com/avatars/12.jpg",
    "isPremium": false,
    "totalEarnings": 4.821,
    "totalViews": 4821
  }
}`,
  },

  // ── VIDEOS ────────────────────────────────────────────────────────────────
  video_list: {
    title: 'Video List',
    method: 'GET',
    endpoint: '/videos',
    auth: false,
    desc: 'Returns a paginated list of all public active videos. Supports sorting and pagination.',
    params: [
      { name: 'page',  desc: 'Page number (default: 1)', example: '2', type: 'INT', required: false },
      { name: 'limit', desc: 'Results per page (default: 12)', example: '24', type: 'INT', required: false },
      { name: 'sort',  desc: 'Sort order: latest | popular | earnings', example: 'popular', type: 'STRING', required: false },
    ],
    response: `{
  "videos": [
    {
      "id": 45,
      "title": "Big Buck Bunny Full",
      "description": "Classic open-source animation",
      "video_url": "https://cdn.videostream.com/v/45.mp4",
      "thumbnail_url": "https://cdn.videostream.com/t/45.jpg",
      "views": 19240,
      "earnings": "19.240000",
      "status": "active",
      "created_at": "2024-03-12T10:22:00Z",
      "username": "kartik21",
      "avatar_url": "https://cdn.videostream.com/avatars/12.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 94,
    "pages": 8
  }
}`,
  },

  video_trending: {
    title: 'Trending Videos',
    method: 'GET',
    endpoint: '/videos/trending',
    auth: false,
    desc: 'Returns up to 8 trending videos from the past 7 days, sorted by view count.',
    params: [],
    response: `{
  "videos": [
    {
      "id": 88,
      "title": "Viral Clip March 2024",
      "views": 54200,
      "thumbnail_url": "https://cdn.videostream.com/t/88.jpg",
      "video_url": "https://cdn.videostream.com/v/88.mp4",
      "username": "topuploader",
      "created_at": "2024-03-10T08:00:00Z"
    }
  ]
}`,
  },

  video_info: {
    title: 'Video Info',
    method: 'GET',
    endpoint: '/videos/:id',
    auth: false,
    desc: 'Fetch full details for a single video by its ID. Also increments the view count and credits $0.001 earnings to the creator.',
    params: [
      { name: 'id', desc: 'Video ID (in URL path)', example: '45', type: 'INT', required: true },
    ],
    response: `{
  "video": {
    "id": 45,
    "user_id": 12,
    "title": "Big Buck Bunny Full",
    "description": "Classic open-source animation",
    "video_url": "https://cdn.videostream.com/v/45.mp4",
    "thumbnail_url": "https://cdn.videostream.com/t/45.jpg",
    "duration": 596,
    "views": 19241,
    "earnings": "19.241000",
    "is_premium": false,
    "status": "active",
    "created_at": "2024-03-12T10:22:00Z",
    "username": "kartik21",
    "avatar_url": "https://cdn.videostream.com/avatars/12.jpg",
    "bio": "Video creator from India"
  }
}`,
  },

  video_upload: {
    title: 'Upload Video',
    method: 'POST',
    endpoint: '/videos',
    auth: true,
    desc: 'Create a new video entry. The video file should be hosted externally and its URL provided.',
    params: [
      { name: 'title',        desc: 'Video title', example: 'My First Upload', type: 'STRING', required: true },
      { name: 'videoUrl',     desc: 'URL to the hosted video file', example: 'https://cdn.example.com/video.mp4', type: 'STRING', required: true },
      { name: 'description',  desc: 'Video description', example: 'A short travel vlog', type: 'STRING', required: false },
      { name: 'thumbnailUrl', desc: 'URL to thumbnail image', example: 'https://cdn.example.com/thumb.jpg', type: 'STRING', required: false },
      { name: 'duration',     desc: 'Video duration in seconds', example: '312', type: 'INT', required: false },
      { name: 'isPremium',    desc: 'Premium-only flag (default: false)', example: 'false', type: 'BOOL', required: false },
    ],
    response: `{
  "message": "Video uploaded successfully!",
  "video": {
    "id": 101,
    "user_id": 12,
    "title": "My First Upload",
    "description": "A short travel vlog",
    "video_url": "https://cdn.example.com/video.mp4",
    "thumbnail_url": "https://cdn.example.com/thumb.jpg",
    "duration": 312,
    "views": 0,
    "earnings": "0.000000",
    "status": "active",
    "is_premium": false,
    "created_at": "2024-03-15T14:00:00Z"
  }
}`,
  },

  video_delete: {
    title: 'Delete Video',
    method: 'DELETE',
    endpoint: '/videos/:id',
    auth: true,
    desc: 'Permanently delete a video. Only the owner of the video can delete it.',
    params: [
      { name: 'id', desc: 'Video ID (in URL path)', example: '101', type: 'INT', required: true },
    ],
    response: `{
  "message": "Video deleted successfully."
}`,
  },

  video_user: {
    title: 'User Videos',
    method: 'GET',
    endpoint: '/videos/user/:userId',
    auth: false,
    desc: 'Returns all active public videos uploaded by a specific user.',
    params: [
      { name: 'userId', desc: 'User ID (in URL path)', example: '12', type: 'INT', required: true },
    ],
    response: `{
  "videos": [
    {
      "id": 45,
      "title": "Big Buck Bunny Full",
      "views": 19241,
      "thumbnail_url": "https://cdn.videostream.com/t/45.jpg",
      "created_at": "2024-03-12T10:22:00Z",
      "username": "kartik21"
    }
  ]
}`,
  },

  // ── EARNINGS ──────────────────────────────────────────────────────────────
  earnings_info: {
    title: 'Earnings Info',
    method: 'GET',
    endpoint: '/earnings',
    auth: true,
    desc: 'Returns total earnings, withdrawal history, and per-video earnings breakdown for the authenticated user.',
    params: [
      { name: 'Authorization', desc: 'Bearer token in header', example: 'Bearer eyJhbGci...', type: 'STRING', required: true },
    ],
    response: `{
  "totalEarnings": 4.821,
  "availableBalance": 3.321,
  "withdrawals": [
    {
      "id": 7,
      "amount": "1.500000",
      "method": "PayPal",
      "status": "paid",
      "created_at": "2024-02-01T09:00:00Z"
    }
  ],
  "videos": [
    {
      "id": 45,
      "title": "Big Buck Bunny Full",
      "views": 19241,
      "earnings": "19.241000"
    }
  ]
}`,
  },

  earnings_withdraw: {
    title: 'Request Withdrawal',
    method: 'POST',
    endpoint: '/earnings/withdraw',
    auth: true,
    desc: 'Submit a withdrawal request. Minimum threshold is $10. Requests are reviewed within 48 hours.',
    params: [
      { name: 'amount',         desc: 'Amount to withdraw (min $10)', example: '15.00', type: 'FLOAT', required: true },
      { name: 'method',         desc: 'Payout method: PayPal | Bank Transfer | Crypto (USDT)', example: 'PayPal', type: 'STRING', required: true },
      { name: 'accountDetails', desc: 'PayPal email or bank/wallet info', example: 'payout@email.com', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Withdrawal request submitted successfully.",
  "withdrawal": {
    "id": 14,
    "amount": "15.000000",
    "method": "PayPal",
    "account_details": "payout@email.com",
    "status": "pending",
    "created_at": "2024-03-15T14:30:00Z"
  }
}`,
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  contact_send: {
    title: 'Send Message',
    method: 'POST',
    endpoint: '/contact',
    auth: false,
    desc: 'Submit a support or contact message. Messages appear in the admin Messages tab.',
    params: [
      { name: 'name',    desc: 'Sender\'s full name', example: 'Kartik Sharma', type: 'STRING', required: true },
      { name: 'email',   desc: 'Sender\'s email address', example: 'kartik@example.com', type: 'STRING', required: true },
      { name: 'subject', desc: 'Subject category: general | earnings | upload | account | dmca | other', example: 'earnings', type: 'STRING', required: true },
      { name: 'message', desc: 'Message body', example: 'I haven\'t received my payout...', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Message sent successfully. We'll get back to you within 24 hours."
}`,
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MethodBadge = ({ method }) => {
  const colors = {
    GET:    { bg: 'rgba(0,229,160,0.12)', color: '#00e5a0' },
    POST:   { bg: 'rgba(79,142,247,0.12)', color: '#4f8ef7' },
    PUT:    { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    DELETE: { bg: 'rgba(255,80,80,0.12)', color: '#ff5050' },
  };
  const s = colors[method] || colors.GET;
  return (
    <span className="apidocs-method-badge" style={{ background: s.bg, color: s.color }}>
      {method}
    </span>
  );
};

const ParamTable = ({ params }) => {
  if (!params || params.length === 0) {
    return <p className="apidocs-no-params">No parameters required.</p>;
  }
  return (
    <div className="apidocs-table-wrap">
      <table className="apidocs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Example</th>
            <th>Type</th>
            <th>Required</th>
          </tr>
        </thead>
        <tbody>
          {params.map(p => (
            <tr key={p.name}>
              <td><code className="param-name">{p.name}</code></td>
              <td className="td-desc">{p.desc}</td>
              <td><code className="param-example">{p.example}</code></td>
              <td><span className="param-type">{p.type}</span></td>
              <td>
                {p.required
                  ? <span className="req-yes">✓ Yes</span>
                  : <span className="req-no">No</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EndpointSection = ({ doc }) => (
  <div className="apidocs-endpoint-section">
    <h2 className="apidocs-endpoint-title">{doc.title}</h2>
    <p className="apidocs-endpoint-desc">{doc.desc}</p>

    {doc.auth && (
      <div className="apidocs-auth-note">
        🔐 <strong>Authentication required</strong> — include your JWT token as{' '}
        <code>Authorization: Bearer &lt;token&gt;</code>
      </div>
    )}

    <div className="apidocs-block-label">REQUEST</div>
    <div className="apidocs-request-line">
      <MethodBadge method={doc.method} />
      <code className="apidocs-url">{BASE_URL}{doc.endpoint}</code>
    </div>

    <div className="apidocs-block-label" style={{ marginTop: 28 }}>PARAMETERS</div>
    <ParamTable params={doc.params} />

    <div className="apidocs-block-label" style={{ marginTop: 28 }}>RESPONSE</div>
    <pre className="apidocs-code-block">{doc.response}</pre>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const ApiDocs = () => {
  const [activeId, setActiveId] = useState('account_info');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const doc = DOCS[activeId];

  const handleNav = (id) => {
    setActiveId(id);
    setMobileNavOpen(false);
    // Scroll to top of content
    document.getElementById('apidocs-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="apidocs-wrapper">

      {/* ── Top bar ── */}
      <div className="apidocs-topbar">
        <div className="apidocs-topbar-left">
          <span className="apidocs-logo">
            <span style={{ color: '#4f8ef7' }}>video</span>
            <span className="apidocs-logo-badge">stream</span>
          </span>
          <span className="apidocs-topbar-title">API Documentation</span>
        </div>
        <div className="apidocs-topbar-right">
          <span className="apidocs-base-url-label">Base URL</span>
          <code className="apidocs-base-url-code">{BASE_URL}</code>
        </div>
        <button
          className="apidocs-mobile-toggle"
          onClick={() => setMobileNavOpen(v => !v)}
        >
          {mobileNavOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="apidocs-body">

        {/* ── Sidebar ── */}
        <aside className={`apidocs-sidebar ${mobileNavOpen ? 'open' : ''}`}>
          {SECTIONS.map(section => (
            <div key={section.group} className="apidocs-nav-group">
              <div className="apidocs-nav-group-label">{section.group}</div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`apidocs-nav-item ${activeId === item.id ? 'active' : ''}`}
                  onClick={() => handleNav(item.id)}
                >
                  <span className="apidocs-nav-dot" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Content ── */}
        <main className="apidocs-main" id="apidocs-main">
          {doc ? <EndpointSection doc={doc} /> : (
            <div className="apidocs-empty">Select an endpoint from the sidebar.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ApiDocs;