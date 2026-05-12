import { useState } from 'react';
import { useGlobalChat } from '../hooks/useGlobalChat.js';
import GlobalChatPanel from './GlobalChatPanel.jsx';

const LS_SEEN_KEY = 'gc_last_seen';

function getLastSeen() {
  return Number(localStorage.getItem(LS_SEEN_KEY) || 0);
}

export default function GlobalChatFAB({ user, contextHint, isMobile }) {
  const [open, setOpen]           = useState(false);
  const [lastSeen, setLastSeen]   = useState(getLastSeen);
  const { comments, loading, posting, post, remove } = useGlobalChat();

  const unread = comments.filter(c => {
    if (c._pending || c.is_own) return false;
    return new Date(c.created_at).getTime() > lastSeen;
  }).length;

  const handleOpen = () => {
    setOpen(true);
    const now = Date.now();
    setLastSeen(now);
    localStorage.setItem(LS_SEEN_KEY, String(now));
  };

  const handleClose = () => setOpen(false);

  // FAB bottom offset: mobile = above 60px tab bar, desktop = from edge
  const fabBottom = isMobile ? 76 : 24;

  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%,100% { box-shadow: 0 4px 16px rgba(99,91,255,0.45); }
          50%      { box-shadow: 0 4px 24px rgba(99,91,255,0.7), 0 0 0 6px rgba(99,91,255,0.12); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      <button
        onClick={open ? handleClose : handleOpen}
        aria-label="Mở phòng chat"
        style={{
          position: 'fixed',
          bottom: fabBottom,
          right: 16,
          zIndex: 400,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: open ? 'var(--surface2)' : 'var(--accent)',
          color: open ? 'var(--text2)' : 'white',
          border: open ? '2px solid var(--border2)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          boxShadow: open ? 'none' : '0 4px 16px rgba(99,91,255,0.45)',
          animation: !open && unread > 0 ? 'fabPulse 2s ease-in-out infinite' : 'none',
          transition: 'background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s',
          position: 'fixed',
        }}
      >
        💬
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: '#EF4444',
            color: 'white',
            fontSize: 10,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--surface)',
            animation: 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            lineHeight: 1,
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <GlobalChatPanel
          comments={comments}
          loading={loading}
          posting={posting}
          user={user}
          contextHint={contextHint}
          isMobile={isMobile}
          onPost={post}
          onDelete={remove}
          onClose={handleClose}
        />
      )}
    </>
  );
}
