'use client'

import { useEffect } from 'react'

export default function AdminDashboardPage() {
  useEffect(() => {
    // Check admin authentication
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      window.location.href = '/admin-login';
      return;
    }
  }, []);

  return (
    <iframe
      src="/admin-dashboard.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="Admin Dashboard"
    />
  );
}

