import { Icons } from './components/Icons.jsx';

const NAV_ITEMS = [
  { id:'home',    label:'Khám phá',  icon:s=>Icons.compass(s)   },
  { id:'library', label:'Thư viện',  icon:s=>Icons.library(s)   },
  { id:'saved',   label:'Đã lưu',    icon:s=>Icons.bookmark(s)  },
  { id:'audio',   label:'Audiobook', icon:s=>Icons.headphones(s) },
  { id:'profile', label:'Tài khoản', icon:s=>Icons.user(s)      },
];

export default function Sidebar({ active, onNavigate, user, dark, onToggleDark, onBell, books = [] }) {
  return (
    <div style={{
      width:'var(--sidebar-w)', flexShrink:0, height:'100vh',
      background:'var(--surface)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', position:'relative', zIndex:20,
      boxShadow:'var(--shadow-sm)',
    }}>
      {/* Logo */}
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'var(--grad-accent)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            boxShadow:'var(--shadow-accent)',
          }}>🦉</div>
          <span style={{ fontSize:18, fontWeight:800, letterSpacing:-0.5, fontFamily:'var(--font-display)' }}>NightOwl</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px', overflowY:'auto' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', letterSpacing:1.2, textTransform:'uppercase', padding:'8px 10px', marginBottom:4 }}>Menu</div>
        {NAV_ITEMS.map(item => {
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>onNavigate(item.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:10, marginBottom:2,
              background: isActive?'var(--accent-bg)':'transparent',
              color: isActive?'var(--accent)':'var(--text2)',
              fontSize:14, fontWeight: isActive?600:500,
              transition:'all 0.15s', textAlign:'left',
            }}
            onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='var(--surface2)'; }}
            onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
            >
              {item.icon(17)}
              {item.label}
              {isActive && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'var(--accent)' }}/>}
            </button>
          );
        })}

        {/* Reading now */}
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', letterSpacing:1.2, textTransform:'uppercase', padding:'16px 10px 8px' }}>Đang đọc</div>
        {books.slice(0,3).map(b => (
          <button key={b.id} style={{
            width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
            borderRadius:10, marginBottom:2, background:'transparent', color:'var(--text2)',
            fontSize:13, fontWeight:400, textAlign:'left', transition:'all 0.15s',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <div style={{ fontSize:16, flexShrink:0 }}>{b.emoji}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>Chương {50+b.id*30}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'12px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <button onClick={onToggleDark} style={{
            display:'flex', alignItems:'center', gap:6, padding:'7px 12px',
            borderRadius:8, background:'var(--surface2)', color:'var(--text2)',
            fontSize:12, fontWeight:500,
          }}>
            {dark ? Icons.sun(14) : Icons.moon(14)}
            {dark ? 'Sáng' : 'Tối'}
          </button>
          <span onClick={onBell} style={{ color:'var(--text3)', cursor:'pointer' }}>{Icons.bell(18)}</span>
          <span style={{ color:'var(--text3)', cursor:'pointer' }}>{Icons.settings(18)}</span>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
          borderRadius:10, background:'var(--surface2)', cursor:'pointer',
        }}>
          <div style={{
            width:30, height:30, borderRadius:8,
            background:'var(--grad-accent)', color:'white',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:700, flexShrink:0,
          }}>{user.name[0]?.toUpperCase()}</div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>Free plan</div>
          </div>
          {Icons.chevronDown(14)}
        </div>
      </div>
    </div>
  );
}
