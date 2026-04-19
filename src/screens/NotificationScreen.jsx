import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = async () => {
    await api.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleMarkRead = async (id) => {
    await api.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        padding: '36px 48px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{unreadCount}</span> thông báo chưa đọc
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{
            padding: '8px 16px', borderRadius: 8,
            background: 'var(--accent-bg)', color: 'var(--accent)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ padding: '20px 48px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {notifications.map(n => (
          <div key={n.id} onClick={() => n.unread && handleMarkRead(n.id)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '16px 20px', borderRadius: 12,
            background: n.unread ? 'var(--accent-bg)' : 'var(--surface)',
            border: '1px solid ' + (n.unread ? 'var(--accent)22' : 'var(--border)'),
            cursor: n.unread ? 'pointer' : 'default', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {n.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{n.title}</span>
                {n.unread && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
