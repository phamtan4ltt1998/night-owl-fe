import { useState, useEffect } from 'react';
import { Icons } from './components/Icons.jsx';

const NAV_ITEMS = [
  { id:'home',    label:'Khám phá',  icon:s=>Icons.compass(s)   },
  { id:'library', label:'Thư viện',  icon:s=>Icons.library(s)   },
  { id:'foreign',  label:'Nước ngoài', icon:s=>Icons.globe(s)     },
  { id:'audio',   label:'Audiobook', icon:s=>Icons.headphones(s) },
  { id:'profile', label:'Tài khoản', icon:s=>Icons.user(s)      },
];

const EXPANDED_W = 248;
const COLLAPSED_W = 64;

const SIDEBAR_STYLES = `
  @keyframes sidebarItemIn {
    from { transform: translateX(-14px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
  @keyframes activeDotPulse {
    0%,100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(99,91,255,0.4); }
    50%     { transform: scale(1.4); box-shadow: 0 0 0 5px rgba(99,91,255,0); }
  }
  @keyframes logoGlow {
    0%,100% { box-shadow: var(--shadow-accent); }
    50%     { box-shadow: var(--shadow-accent), 0 0 18px rgba(99,91,255,0.45); }
  }
  @keyframes mobileTabBounce {
    0%,100% { transform: translateY(0) scale(1); }
    35%     { transform: translateY(-5px) scale(1.15); }
    65%     { transform: translateY(-2px) scale(1.05); }
  }
  @keyframes readingDot {
    0%,100% { opacity: 0.4; transform: scale(1); }
    50%     { opacity: 1;   transform: scale(1.6); }
  }
  @keyframes activeBarSlide {
    from { height: 0; opacity: 0; }
    to   { height: 65%; opacity: 1; }
  }
`;

export default function Sidebar({ active, onNavigate, user, dark, onToggleDark, onBell, books = [], readProgress = {}, isMobile = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  if (isMobile) {
    return (
      <nav style={{
        flexShrink: 0, display: 'flex', alignItems: 'stretch',
        height: 60, background: 'var(--surface)', borderTop: '1px solid var(--border)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}>
        <style>{SIDEBAR_STYLES}</style>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, background: 'none', border: 'none', cursor: 'pointer',
                color: isActive ? 'var(--accent)' : 'var(--text3)',
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                transition: 'color 0.2s',
                animation: isActive ? 'mobileTabBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
              }}
            >
              <span style={{ display: 'flex', position: 'relative' }}>
                {item.icon(isActive ? 22 : 20)}
                {isActive && (
                  <span style={{
                    position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)',
                    animation: 'activeDotPulse 1.6s ease-in-out infinite',
                  }} />
                )}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  const recentBooks = Object.keys(readProgress)
    .map(id => books.find(b => b.id === Number(id)))
    .filter(Boolean)
    .slice(0, 5);

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <div style={{
      width: w, flexShrink: 0, height: '100vh',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 20,
      boxShadow: 'var(--shadow-sm)',
      transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
    }}>
      <style>{SIDEBAR_STYLES}</style>
      {/* Logo + collapse toggle */}
      <div style={{ padding: '24px 14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <img src="/logo_main.png" alt="NightOwl" style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            objectFit: 'cover', animation: 'logoGlow 2.4s ease-in-out infinite',
          }} />
          {!collapsed && (
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>NightOwl</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          style={{
            flexShrink: 0, width: 28, height: 28, borderRadius: 8,
            background: 'var(--surface2)', color: 'var(--text3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
        >
          {collapsed ? Icons.chevronRight(14) : Icons.chevronLeft(14)}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', padding: '8px 10px', marginBottom: 4 }}>Menu</div>
        )}
        {NAV_ITEMS.map((item, idx) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius: 10, marginBottom: 2, position: 'relative', overflow: 'hidden',
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                fontSize: 14, fontWeight: isActive ? 600 : 500,
                transition: 'all 0.18s', textAlign: 'left',
                animation: mounted ? `sidebarItemIn 0.3s ease both` : 'none',
                animationDelay: `${idx * 0.06}s`,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Active left bar */}
              {isActive && !collapsed && (
                <span style={{
                  position: 'absolute', left: 0, top: '17.5%',
                  width: 3, borderRadius: '0 3px 3px 0', background: 'var(--accent)',
                  animation: 'activeBarSlide 0.3s ease both',
                  height: '65%',
                }} />
              )}
              {item.icon(17)}
              {!collapsed && item.label}
              {!collapsed && isActive && (
                <div style={{
                  marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                  animation: 'activeDotPulse 1.6s ease-in-out infinite',
                }} />
              )}
            </button>
          );
        })}

        {/* Reading now */}
        {!collapsed && recentBooks.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', padding: '16px 10px 8px' }}>Đang đọc</div>
            {recentBooks.map(b => {
              const chIdx = readProgress[b.id] ?? 0;
              return (
                <button key={b.id}
                  onClick={() => onNavigate('reader', b, chIdx)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 10, marginBottom: 2, background: 'transparent', color: 'var(--text2)',
                    fontSize: 13, fontWeight: 400, textAlign: 'left', transition: 'all 0.15s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: 16, flexShrink: 0, position: 'relative' }}>
                    {b.emoji}
                    <span style={{ position: 'absolute', top: -2, right: -2, width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'readingDot 1.8s ease-in-out infinite' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>Chương {chIdx + 1}</div>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {collapsed ? (
          /* Collapsed: icon-only bottom buttons */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button onClick={onToggleDark} title={dark ? 'Chế độ sáng' : 'Chế độ tối'} style={{
              width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', color: 'var(--text2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              {dark ? Icons.sun(15) : Icons.moon(15)}
            </button>
            <div
              onClick={() => onNavigate('profile')}
              title={user.name}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}
            >
              <img
                src={user.picture || '/logo_main.png'}
                alt={user.name}
                referrerPolicy="no-referrer"
                style={{ width: 36, height: 36, objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        ) : (
          /* Expanded: full bottom bar */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <button onClick={onToggleDark} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                borderRadius: 8, background: 'var(--surface2)', color: 'var(--text2)',
                fontSize: 12, fontWeight: 500,
              }}>
                {dark ? Icons.sun(14) : Icons.moon(14)}
                {dark ? 'Sáng' : 'Tối'}
              </button>
              <span onClick={onBell} style={{ color: 'var(--text3)', cursor: 'pointer' }}>{Icons.bell(18)}</span>
              <span style={{ color: 'var(--text3)', cursor: 'pointer' }}>{Icons.settings(18)}</span>
            </div>
            <div onClick={() => onNavigate('profile')} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 10, background: 'var(--surface2)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
            >
              <img
                src={user.picture || '/logo_main.png'}
                alt={user.name}
                referrerPolicy="no-referrer"
                style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Free plan</div>
              </div>
              {Icons.chevronDown(14)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
