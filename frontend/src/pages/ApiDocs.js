import React, { useState } from 'react';
import './ApiDocs.css';

const BASE_URL = 'https://your-api.com/api';

const SECTIONS = [
  {
    group: 'Auth',
    items: [
      { id: 'auth_register',        label: 'Register' },
      { id: 'auth_login',           label: 'Login' },
      { id: 'auth_me',              label: 'Get Current User' },
      { id: 'auth_profile',         label: 'Update Profile' },
      { id: 'auth_change_password', label: 'Change Password' },
    ],
  },
  {
    group: 'Videos',
    items: [
      { id: 'videos_list',     label: 'Video List' },
      { id: 'videos_trending', label: 'Trending Videos' },
      { id: 'videos_info',     label: 'Video Info' },
      { id: 'videos_upload',   label: 'Upload Video' },
      { id: 'videos_delete',   label: 'Delete Video' },
      { id: 'videos_user',     label: 'User Videos' },
    ],
  },
  {
    group: 'Earnings',
    items: [
      { id: 'earnings_summary',    label: 'Earnings Summary' },
      { id: 'earnings_history',    label: 'Earnings History' },
      { id: 'earnings_top_videos', label: 'Top Earning Videos' },
    ],
  },
  {
    group: 'Contact',
    items: [
      { id: 'contact_send', label: 'Send Message' },
    ],
  },
  {
    group: 'Admin',
    badge: 'Admin / Mod',
    items: [
      { id: 'admin_stats',               label: 'Dashboard Stats' },
      { id: 'admin_users_list',          label: 'List Users' },
      { id: 'admin_users_role',          label: 'Change User Role' },
      { id: 'admin_users_ban',           label: 'Ban / Unban User' },
      { id: 'admin_users_premium',       label: 'Grant / Revoke Premium' },
      { id: 'admin_users_delete',        label: 'Delete User' },
      { id: 'admin_videos_list',         label: 'List Videos' },
      { id: 'admin_videos_status',       label: 'Change Video Status' },
      { id: 'admin_videos_delete',       label: 'Delete Video' },
      { id: 'admin_reports_list',        label: 'List Reports' },
      { id: 'admin_reports_update',      label: 'Update Report' },
      { id: 'admin_withdrawals_list',    label: 'List Withdrawals' },
      { id: 'admin_withdrawals_process', label: 'Process Withdrawal' },
      { id: 'admin_messages_list',       label: 'List Messages' },
      { id: 'admin_messages_update',     label: 'Update Message Status' },
      { id: 'admin_messages_delete',     label: 'Delete Message' },
      { id: 'admin_audit_logs',          label: 'Audit Logs' },
    ],
  },
];

const DOCS = {
  auth_register: {
    title: 'Register',
    method: 'POST',
    endpoint: '/auth/register',
    auth: false,
    desc: "Create a new user account. Returns a JWT token (valid 7 days) and user object on success.",
    params: [
      { name: 'username', desc: 'Desired username (3–50 chars)', example: 'kartik21', type: 'STRING', required: true },
      { name: 'email',    desc: 'Valid email address', example: 'kartik@example.com', type: 'STRING', required: true },
      { name: 'password', desc: 'Password, minimum 6 characters', example: 'secret123', type: 'STRING', required: true },
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
    desc: 'Authenticate with email and password. Returns a JWT token valid for 7 days. Banned accounts receive a 403 with the ban reason.',
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

  auth_me: {
    title: 'Get Current User',
    method: 'GET',
    endpoint: '/auth/me',
    auth: true,
    desc: 'Returns the currently authenticated user profile. Use this to verify a token and fetch up-to-date user data.',
    params: [],
    response: `{
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

  auth_profile: {
    title: 'Update Profile',
    method: 'PUT',
    endpoint: '/auth/profile',
    auth: true,
    desc: 'Update the authenticated user username, bio, or avatar URL. Only supplied fields are updated; omitted fields remain unchanged.',
    params: [
      { name: 'username',  desc: 'New username', example: 'kartik_new', type: 'STRING', required: false },
      { name: 'bio',       desc: 'Profile bio text', example: 'Video creator from India', type: 'STRING', required: false },
      { name: 'avatarUrl', desc: 'Avatar image URL or base64 data URI', example: 'https://cdn.example.com/img.jpg', type: 'STRING', required: false },
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

  auth_change_password: {
    title: 'Change Password',
    method: 'PUT',
    endpoint: '/auth/change-password',
    auth: true,
    desc: 'Change the authenticated user password. The current password is verified before the update. New password must be at least 6 characters.',
    params: [
      { name: 'currentPassword', desc: 'The user existing password', example: 'oldpass123', type: 'STRING', required: true },
      { name: 'newPassword',     desc: 'Desired new password (min 6 chars)', example: 'newpass456', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Password changed successfully."
}`,
  },

  videos_list: {
    title: 'Video List',
    method: 'GET',
    endpoint: '/videos',
    auth: false,
    desc: 'Returns a paginated list of all public active videos. Supports sorting by latest upload date, most views, or highest earnings.',
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

  videos_trending: {
    title: 'Trending Videos',
    method: 'GET',
    endpoint: '/videos/trending',
    auth: false,
    desc: 'Returns up to 8 trending videos from the past 7 days, sorted by view count descending.',
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

  videos_info: {
    title: 'Video Info',
    method: 'GET',
    endpoint: '/videos/:id',
    auth: false,
    desc: 'Fetch full details for a single video. Each call increments the view count by 1 and credits $0.001 earnings to the creator.',
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

  videos_upload: {
    title: 'Upload Video',
    method: 'POST',
    endpoint: '/videos',
    auth: true,
    desc: 'Create a new video entry. The video file must be hosted externally — provide its public URL. Title and videoUrl are required.',
    params: [
      { name: 'title',        desc: 'Video title', example: 'My Travel Vlog', type: 'STRING', required: true },
      { name: 'videoUrl',     desc: 'Public URL to the video file', example: 'https://cdn.example.com/video.mp4', type: 'STRING', required: true },
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
    "title": "My Travel Vlog",
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

  videos_delete: {
    title: 'Delete Video',
    method: 'DELETE',
    endpoint: '/videos/:id',
    auth: true,
    desc: 'Permanently delete a video. Only the owner can delete it. Returns 404 if the video does not exist or belongs to another user.',
    params: [
      { name: 'id', desc: 'Video ID (in URL path)', example: '101', type: 'INT', required: true },
    ],
    response: `{
  "message": "Video deleted successfully."
}`,
  },

  videos_user: {
    title: 'User Videos',
    method: 'GET',
    endpoint: '/videos/user/:userId',
    auth: false,
    desc: 'Returns all active public videos uploaded by a specific user, sorted newest first.',
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

  earnings_summary: {
    title: 'Earnings Summary',
    method: 'GET',
    endpoint: '/earnings',
    auth: true,
    desc: 'Returns a complete earnings summary for the authenticated user including today, yesterday, weekly totals, and percent change vs yesterday.',
    params: [],
    response: `{
  "totalEarnings": 4.821,
  "totalViews": 4821,
  "todayEarnings": 0.143,
  "yesterdayEarnings": 0.112,
  "weeklyEarnings": 0.891,
  "percentChange": 27.7
}`,
  },

  earnings_history: {
    title: 'Earnings History',
    method: 'GET',
    endpoint: '/earnings/history',
    auth: true,
    desc: 'Returns the last 50 individual earning events for the authenticated user, each linked to the source video.',
    params: [],
    response: `{
  "history": [
    {
      "id": 302,
      "user_id": 12,
      "video_id": 45,
      "amount": "0.001000",
      "created_at": "2024-03-15T13:44:00Z",
      "video_title": "Big Buck Bunny Full"
    }
  ]
}`,
  },

  earnings_top_videos: {
    title: 'Top Earning Videos',
    method: 'GET',
    endpoint: '/earnings/top-videos',
    auth: true,
    desc: 'Returns the top 5 highest-earning videos for the authenticated user, sorted by total earnings descending.',
    params: [],
    response: `{
  "videos": [
    {
      "id": 45,
      "title": "Big Buck Bunny Full",
      "views": 19241,
      "earnings": "19.241000",
      "thumbnail_url": "https://cdn.videostream.com/t/45.jpg"
    }
  ]
}`,
  },

  contact_send: {
    title: 'Send Message',
    method: 'POST',
    endpoint: '/contact',
    auth: false,
    desc: 'Submit a support or contact message. No auth required. Messages appear in the admin Messages tab with status "unread". Message body must be at least 10 characters.',
    params: [
      { name: 'name',    desc: 'Sender full name', example: 'Kartik Sharma', type: 'STRING', required: true },
      { name: 'email',   desc: 'Sender email address', example: 'kartik@example.com', type: 'STRING', required: true },
      { name: 'subject', desc: 'Category: general | earnings | upload | account | dmca | other', example: 'earnings', type: 'STRING', required: true },
      { name: 'message', desc: 'Message body (min 10 characters)', example: 'I have not received my payout yet.', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Message sent successfully."
}`,
  },

  admin_stats: {
    title: 'Dashboard Stats',
    method: 'GET',
    endpoint: '/admin/stats',
    auth: true,
    role: 'mod',
    desc: 'Returns aggregated platform stats: total users, videos, earnings, pending reports, pending withdrawals, new users this week, new videos this week, and unread messages.',
    params: [],
    response: `{
  "totalUsers": 1420,
  "totalVideos": 3810,
  "totalEarnings": 9204.55,
  "pendingReports": 7,
  "pendingWithdrawals": 3,
  "newUsersThisWeek": 42,
  "newVideosThisWeek": 118,
  "unreadMessages": 5
}`,
  },

  admin_users_list: {
    title: 'List Users',
    method: 'GET',
    endpoint: '/admin/users',
    auth: true,
    role: 'mod',
    desc: 'Returns a paginated list of all users. Supports search by username or email and filtering by role.',
    params: [
      { name: 'page',   desc: 'Page number (default: 1)', example: '1', type: 'INT', required: false },
      { name: 'limit',  desc: 'Results per page (default: 20)', example: '15', type: 'INT', required: false },
      { name: 'search', desc: 'Filter by username or email', example: 'kartik', type: 'STRING', required: false },
      { name: 'role',   desc: 'Filter by role: user | moderator | admin', example: 'moderator', type: 'STRING', required: false },
    ],
    response: `{
  "users": [
    {
      "id": 12,
      "username": "kartik21",
      "email": "kartik@example.com",
      "role": "user",
      "is_premium": false,
      "is_banned": false,
      "ban_reason": null,
      "total_earnings": "4.821000",
      "total_views": 4821,
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1420, "pages": 71 }
}`,
  },

  admin_users_role: {
    title: 'Change User Role',
    method: 'PUT',
    endpoint: '/admin/users/:id/role',
    auth: true,
    role: 'admin',
    desc: 'Change a user role. Valid values are user, moderator, or admin. Action is logged in the audit log.',
    params: [
      { name: 'id',   desc: 'User ID (in URL path)', example: '12', type: 'INT', required: true },
      { name: 'role', desc: 'New role: user | moderator | admin', example: 'moderator', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Role updated to moderator"
}`,
  },

  admin_users_ban: {
    title: 'Ban / Unban User',
    method: 'PUT',
    endpoint: '/admin/users/:id/ban',
    auth: true,
    role: 'mod',
    desc: 'Ban or unban a user. A reason is required when banning. The action is logged in the audit log.',
    params: [
      { name: 'id',     desc: 'User ID (in URL path)', example: '12', type: 'INT', required: true },
      { name: 'ban',    desc: 'true to ban, false to unban', example: 'true', type: 'BOOL', required: true },
      { name: 'reason', desc: 'Reason for ban (required when ban=true)', example: 'Spam uploads', type: 'STRING', required: false },
    ],
    response: `{
  "message": "User banned."
}`,
  },

  admin_users_premium: {
    title: 'Grant / Revoke Premium',
    method: 'PUT',
    endpoint: '/admin/users/:id/premium',
    auth: true,
    role: 'admin',
    desc: 'Grant or revoke premium status for a user. Action is logged in the audit log.',
    params: [
      { name: 'id',        desc: 'User ID (in URL path)', example: '12', type: 'INT', required: true },
      { name: 'isPremium', desc: 'true to grant premium, false to revoke', example: 'true', type: 'BOOL', required: true },
    ],
    response: `{
  "message": "Premium granted."
}`,
  },

  admin_users_delete: {
    title: 'Delete User',
    method: 'DELETE',
    endpoint: '/admin/users/:id',
    auth: true,
    role: 'admin',
    desc: 'Permanently delete a user account and all associated data. Cannot be undone. Action is logged in the audit log.',
    params: [
      { name: 'id', desc: 'User ID (in URL path)', example: '12', type: 'INT', required: true },
    ],
    response: `{
  "message": "User deleted."
}`,
  },

  admin_videos_list: {
    title: 'List Videos (Admin)',
    method: 'GET',
    endpoint: '/admin/videos',
    auth: true,
    role: 'mod',
    desc: 'Returns a paginated list of all videos including inactive ones, with uploader details. Supports search by title or username.',
    params: [
      { name: 'page',   desc: 'Page number (default: 1)', example: '1', type: 'INT', required: false },
      { name: 'limit',  desc: 'Results per page (default: 20)', example: '15', type: 'INT', required: false },
      { name: 'search', desc: 'Filter by video title or uploader username', example: 'bunny', type: 'STRING', required: false },
    ],
    response: `{
  "videos": [
    {
      "id": 45,
      "title": "Big Buck Bunny Full",
      "status": "active",
      "views": 19241,
      "earnings": "19.241000",
      "username": "kartik21",
      "email": "kartik@example.com",
      "created_at": "2024-03-12T10:22:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3810, "pages": 191 }
}`,
  },

  admin_videos_status: {
    title: 'Change Video Status',
    method: 'PUT',
    endpoint: '/admin/videos/:id/status',
    auth: true,
    role: 'mod',
    desc: 'Set a video status to active (visible to public) or inactive (hidden). Action is logged in the audit log.',
    params: [
      { name: 'id',     desc: 'Video ID (in URL path)', example: '45', type: 'INT', required: true },
      { name: 'status', desc: 'New status: active | inactive', example: 'inactive', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Video inactive."
}`,
  },

  admin_videos_delete: {
    title: 'Delete Video (Admin)',
    method: 'DELETE',
    endpoint: '/admin/videos/:id',
    auth: true,
    role: 'mod',
    desc: 'Permanently delete any video regardless of owner. Action is logged in the audit log.',
    params: [
      { name: 'id', desc: 'Video ID (in URL path)', example: '45', type: 'INT', required: true },
    ],
    response: `{
  "message": "Video deleted."
}`,
  },

  admin_reports_list: {
    title: 'List Reports',
    method: 'GET',
    endpoint: '/admin/reports',
    auth: true,
    role: 'mod',
    desc: 'Returns all pending video reports with the associated video title and reporter username.',
    params: [],
    response: `{
  "reports": [
    {
      "id": 9,
      "video_id": 45,
      "reporter_id": 7,
      "reason": "spam",
      "description": "This is a reupload.",
      "status": "pending",
      "created_at": "2024-03-14T11:00:00Z",
      "video_title": "Big Buck Bunny Full",
      "reporter_name": "user007"
    }
  ]
}`,
  },

  admin_reports_update: {
    title: 'Update Report',
    method: 'PUT',
    endpoint: '/admin/reports/:id',
    auth: true,
    role: 'mod',
    desc: 'Mark a report as reviewed or dismissed. Records the reviewing moderator ID.',
    params: [
      { name: 'id',     desc: 'Report ID (in URL path)', example: '9', type: 'INT', required: true },
      { name: 'status', desc: 'New status: reviewed | dismissed', example: 'reviewed', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Report updated."
}`,
  },

  admin_withdrawals_list: {
    title: 'List Withdrawals',
    method: 'GET',
    endpoint: '/admin/withdrawals',
    auth: true,
    role: 'mod',
    desc: 'Returns all withdrawal requests filtered by status, with full user details attached.',
    params: [
      { name: 'status', desc: 'Filter: pending | approved | rejected | paid (default: pending)', example: 'pending', type: 'STRING', required: false },
    ],
    response: `{
  "withdrawals": [
    {
      "id": 14,
      "user_id": 12,
      "amount": "15.000000",
      "method": "PayPal",
      "account_details": "payout@email.com",
      "status": "pending",
      "admin_note": null,
      "created_at": "2024-03-15T14:30:00Z",
      "username": "kartik21",
      "email": "kartik@example.com"
    }
  ]
}`,
  },

  admin_withdrawals_process: {
    title: 'Process Withdrawal',
    method: 'PUT',
    endpoint: '/admin/withdrawals/:id',
    auth: true,
    role: 'admin',
    desc: 'Approve, reject, or mark a withdrawal as paid. An admin note is recommended when rejecting. Action is logged in the audit log.',
    params: [
      { name: 'id',        desc: 'Withdrawal ID (in URL path)', example: '14', type: 'INT', required: true },
      { name: 'status',    desc: 'New status: approved | rejected | paid', example: 'approved', type: 'STRING', required: true },
      { name: 'adminNote', desc: 'Admin note (recommended when rejecting)', example: 'Unverified account', type: 'STRING', required: false },
    ],
    response: `{
  "message": "Withdrawal approved."
}`,
  },

  admin_messages_list: {
    title: 'List Messages',
    method: 'GET',
    endpoint: '/admin/messages',
    auth: true,
    role: 'mod',
    desc: 'Returns contact form messages filtered by status, sorted newest first.',
    params: [
      { name: 'status', desc: 'Filter: unread | read | resolved (default: unread)', example: 'unread', type: 'STRING', required: false },
    ],
    response: `{
  "messages": [
    {
      "id": 3,
      "name": "Kartik Sharma",
      "email": "kartik@example.com",
      "subject": "earnings",
      "message": "I have not received my payout yet.",
      "status": "unread",
      "created_at": "2024-03-15T10:00:00Z"
    }
  ]
}`,
  },

  admin_messages_update: {
    title: 'Update Message Status',
    method: 'PUT',
    endpoint: '/admin/messages/:id',
    auth: true,
    role: 'mod',
    desc: 'Update the status of a contact message. Valid statuses are unread, read, and resolved.',
    params: [
      { name: 'id',     desc: 'Message ID (in URL path)', example: '3', type: 'INT', required: true },
      { name: 'status', desc: 'New status: unread | read | resolved', example: 'resolved', type: 'STRING', required: true },
    ],
    response: `{
  "message": "Message updated."
}`,
  },

  admin_messages_delete: {
    title: 'Delete Message',
    method: 'DELETE',
    endpoint: '/admin/messages/:id',
    auth: true,
    role: 'admin',
    desc: 'Permanently delete a contact message. Admin only.',
    params: [
      { name: 'id', desc: 'Message ID (in URL path)', example: '3', type: 'INT', required: true },
    ],
    response: `{
  "message": "Message deleted."
}`,
  },

  admin_audit_logs: {
    title: 'Audit Logs',
    method: 'GET',
    endpoint: '/admin/audit-logs',
    auth: true,
    role: 'admin',
    desc: 'Returns the last 100 admin action logs with the acting admin username. Covers bans, role changes, deletions, premium grants, and withdrawal processing.',
    params: [],
    response: `{
  "logs": [
    {
      "id": 55,
      "admin_id": 1,
      "action": "BAN_USER",
      "target_type": "user",
      "target_id": 12,
      "details": "Spam uploads",
      "created_at": "2024-03-15T12:00:00Z",
      "admin_name": "superadmin"
    }
  ]
}`,
  },
};

// ── Components ────────────────────────────────────────────────────────────────

const MethodBadge = ({ method }) => {
  const colors = {
    GET:    { bg: 'rgba(0,229,160,0.12)',  color: '#00e5a0' },
    POST:   { bg: 'rgba(79,142,247,0.12)', color: '#4f8ef7' },
    PUT:    { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    DELETE: { bg: 'rgba(255,80,80,0.12)',  color: '#ff5050' },
  };
  const s = colors[method] || colors.GET;
  return <span className="apidocs-method-badge" style={{ background: s.bg, color: s.color }}>{method}</span>;
};

const RolePill = ({ role }) => {
  const map = {
    admin: { bg: 'rgba(255,107,53,0.12)', color: '#ff6b35', label: '👑 Admin only' },
    mod:   { bg: 'rgba(124,92,252,0.12)', color: '#7c5cfc', label: '🛡 Admin / Moderator' },
  };
  const s = map[role];
  if (!s) return null;
  return <span className="apidocs-role-pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
};

const ParamTable = ({ params }) => {
  if (!params || params.length === 0) return <p className="apidocs-no-params">No parameters required.</p>;
  return (
    <div className="apidocs-table-wrap">
      <table className="apidocs-table">
        <thead><tr><th>Name</th><th>Description</th><th>Example</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          {params.map(p => (
            <tr key={p.name}>
              <td><code className="param-name">{p.name}</code></td>
              <td className="td-desc">{p.desc}</td>
              <td><code className="param-example">{p.example}</code></td>
              <td><span className="param-type">{p.type}</span></td>
              <td>{p.required ? <span className="req-yes">✓ Yes</span> : <span className="req-no">No</span>}</td>
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

    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
      {doc.auth && (
        <div className="apidocs-auth-note">
          🔐 <strong>Authentication required</strong> — include your JWT as{' '}
          <code>Authorization: Bearer &lt;token&gt;</code>
        </div>
      )}
      {doc.role && <RolePill role={doc.role} />}
    </div>

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

// ── Main ──────────────────────────────────────────────────────────────────────
const ApiDocs = () => {
  const [activeId, setActiveId] = useState('auth_register');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const doc = DOCS[activeId];

  const handleNav = (id) => {
    setActiveId(id);
    setMobileNavOpen(false);
    document.getElementById('apidocs-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="apidocs-wrapper">
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
        <button className="apidocs-mobile-toggle" onClick={() => setMobileNavOpen(v => !v)}>
          {mobileNavOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="apidocs-body">
        <aside className={`apidocs-sidebar ${mobileNavOpen ? 'open' : ''}`}>
          {SECTIONS.map(section => (
            <div key={section.group} className="apidocs-nav-group">
              <div className="apidocs-nav-group-label">
                {section.group}
                {section.badge && <span className="apidocs-nav-group-badge">{section.badge}</span>}
              </div>
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

        <main className="apidocs-main" id="apidocs-main">
          {doc
            ? <EndpointSection doc={doc} />
            : <div className="apidocs-empty">Select an endpoint from the sidebar.</div>
          }
        </main>
      </div>
    </div>
  );
};

export default ApiDocs;