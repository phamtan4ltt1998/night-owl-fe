import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons.jsx';

const MAX_LEN = 280;

function timeAgo(isoStr) {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60)  return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  return `${Math.floor(diff / 86400)} ngày`;
}

function expiresIn(isoStr) {
  const diff = (new Date(isoStr).getTime() - Date.now()) / 1000;
  if (diff <= 0) return null;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  return `${Math.floor(diff / 86400)} ngày`;
}

function Avatar({ username, avatarUrl, size = 32 }) {
  const initial = (username || '?')[0].toUpperCase();
  const hue = username
    ? username.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
    : 200;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},55%,52%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.44, fontWeight: 800, color: 'white',
    }}>
      {initial}
    </div>
  );
}

function CommentCard({ comment, onDelete }) {
  const ttl = expiresIn(comment.expires_at);
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
      opacity: comment._pending ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      <Avatar username={comment.username} avatarUrl={comment.avatar_url} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{comment.username}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(comment.created_at)}</span>
          {comment._pending && (
            <span style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>đang gửi...</span>
          )}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
          {comment.content}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          {comment.context_hint && (
            <span style={{
              fontSize: 10, color: 'var(--accent)', fontStyle: 'italic',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
            }}>
              📖 {comment.context_hint}
            </span>
          )}
          {ttl && (
            <span style={{ fontSize: 10, color: '#F59E0B', flexShrink: 0 }}>
              🕐 còn {ttl}
            </span>
          )}
        </div>
      </div>
      {comment.is_own && !comment._pending && (
        <button
          onClick={() => onDelete(comment.id)}
          style={{
            flexShrink: 0, background: 'transparent', border: 'none',
            color: 'var(--text3)', cursor: 'pointer', padding: 4,
            opacity: 0.6, transition: 'opacity 0.15s',
            display: 'flex', alignItems: 'flex-start',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          title="Xóa"
        >
          {Icons.close(13)}
        </button>
      )}
    </div>
  );
}

export default function GlobalChatPanel({ comments, loading, posting, user, contextHint, isMobile, onPost, onDelete, onClose }) {
  const [input, setInput]   = useState('');
  const [error, setError]   = useState('');
  const listRef             = useRef(null);
  const inputRef            = useRef(null);

  // Scroll list to top when new comment arrives
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [comments.length]);

  const handlePost = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_LEN) {
      setError(`Tối đa ${MAX_LEN} ký tự`);
      return;
    }
    setError('');
    setInput('');
    try {
      await onPost(trimmed, contextHint);
    } catch {
      setError('Gửi thất bại, thử lại nhé');
      setInput(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  // Panel dimensions
  const panelStyle = isMobile
    ? {
        position: 'fixed', left: 0, right: 0, bottom: 60,
        height: '72vh',
        zIndex: 402,
        borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
        animation: 'gcSlideUp 0.28s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
      }
    : {
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 360,
        zIndex: 402,
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
        animation: 'gcSlideRight 0.28s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
      };

  return (
    <>
      <style>{`
        @keyframes gcSlideUp    { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes gcSlideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 401,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div style={panelStyle}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>💬 Phòng chat</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              Tin tự xóa sau 48h · {comments.filter(c => !c._pending).length} tin nhắn
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface2)', border: 'none', borderRadius: 8,
              padding: 8, cursor: 'pointer', color: 'var(--text2)',
              display: 'flex', alignItems: 'center',
            }}
          >
            {Icons.close(16)}
          </button>
        </div>

        {/* Comment list */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              Đang tải...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>
                Chưa có tin nhắn nào
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                Là người đầu tiên nhắn nhé!
              </div>
            </div>
          ) : (
            comments.map(c => (
              <CommentCard key={c.id} comment={c} onDelete={onDelete} />
            ))
          )}
        </div>

        {/* Input area */}
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid var(--border)',
          padding: '10px 12px',
          background: 'var(--surface)',
        }}>
          {user ? (
            <>
              {error && (
                <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 6, paddingLeft: 4 }}>
                  {error}
                </div>
              )}
              {contextHint && (
                <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 6, paddingLeft: 4, fontStyle: 'italic' }}>
                  📖 {contextHint}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhắn gì đó với mọi người..."
                    rows={1}
                    maxLength={MAX_LEN}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '9px 12px', borderRadius: 10,
                      fontSize: 13, resize: 'none', outline: 'none',
                      background: 'var(--surface2)',
                      border: error ? '1.5px solid #EF4444' : '1.5px solid var(--border2)',
                      color: 'var(--text)',
                      lineHeight: 1.5,
                      minHeight: 38, maxHeight: 80,
                      overflow: 'auto',
                      transition: 'border-color 0.15s',
                    }}
                    onInput={e => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                    }}
                  />
                  <span style={{
                    position: 'absolute', right: 8, bottom: 6,
                    fontSize: 10, color: input.length > MAX_LEN - 20 ? '#EF4444' : 'var(--text3)',
                  }}>
                    {input.length}/{MAX_LEN}
                  </span>
                </div>
                <button
                  onClick={handlePost}
                  disabled={posting || !input.trim()}
                  style={{
                    flexShrink: 0, padding: '9px 14px', borderRadius: 10,
                    background: 'var(--accent)', color: 'white',
                    border: 'none', cursor: posting || !input.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 700,
                    opacity: posting || !input.trim() ? 0.5 : 1,
                    transition: 'opacity 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {posting ? '...' : 'Gửi'}
                </button>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center', padding: '10px 0',
              fontSize: 13, color: 'var(--text3)',
            }}>
              Đăng nhập để nhắn tin cùng mọi người
            </div>
          )}
        </div>
      </div>
    </>
  );
}
