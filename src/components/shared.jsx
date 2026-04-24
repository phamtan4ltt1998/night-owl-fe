import { useState } from 'react';
import { Icons } from './Icons.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';

const PILL_MAP = {
  'Hot':        { bg:'rgba(220,38,38,0.1)', color:'#DC2626' },
  'Top Rating': { bg:'rgba(217,119,6,0.1)', color:'#D97706' },
  'Mới':        { bg:'rgba(5,150,105,0.1)', color:'#059669' },
  'Classic':    { bg:'rgba(79,70,229,0.1)', color:'#4F46E5' },
  'Đang ra':    { bg:'rgba(37,99,235,0.1)', color:'#2563EB' },
  'Hoàn thành': { bg:'rgba(107,114,128,0.1)', color:'#6B7280' },
};

export function Pill({ label, style={} }) {
  const c = PILL_MAP[label] || { bg:'var(--surface2)', color:'var(--text3)' };
  return <span className="pill" style={{ background:c.bg, color:c.color, ...style }}>{label}</span>;
}

export function StarRating({ rating, size=12 }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ color:'#F59E0B', fontSize:size }}>{Icons.star(size)}</span>
      <span style={{ fontSize:size+1, fontWeight:600, color:'var(--text)' }}>{rating}</span>
    </span>
  );
}

export function Btn({ children, variant='primary', size='md', onClick, style={} }) {
  const sizes = { sm:'8px 16px 9px', md:'11px 20px 12px', lg:'14px 28px 15px' };
  const styles = {
    primary:   { background:'var(--grad-accent)', color:'white', boxShadow:'var(--shadow-accent)' },
    secondary: { background:'var(--surface)', color:'var(--text)', border:'1.5px solid var(--border2)', boxShadow:'var(--shadow-xs)' },
    ghost:     { background:'transparent', color:'var(--accent)', border:'1.5px solid var(--accent-border)' },
    danger:    { background:'rgba(239,68,68,0.08)', color:'#EF4444' },
  };
  return (
    <button onClick={onClick} style={{
      padding: sizes[size], borderRadius: size==='lg'?12:10,
      fontSize: size==='sm'?12:size==='lg'?15:13,
      fontWeight:600, cursor:'pointer', letterSpacing:0.1,
      display:'inline-flex', alignItems:'center', gap:7,
      transition:'all 0.15s', whiteSpace:'nowrap',
      ...styles[variant], ...style,
    }}
    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
    >{children}</button>
  );
}

export function Input({ value, onChange, placeholder, type='text', icon, onFocus, onBlur, style={} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:'relative', ...style }}>
      {icon && <div style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',display:'flex',pointerEvents:'none' }}>{icon}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        onFocus={()=>{ setFocused(true); onFocus&&onFocus(); }}
        onBlur={()=>{ setFocused(false); onBlur&&onBlur(); }}
        style={{
          width:'100%', padding: icon?'11px 14px 11px 40px':'11px 14px',
          borderRadius:10, fontSize:14, color:'var(--text)',
          background:'var(--surface)', border:`1.5px solid ${focused?'var(--accent)':'var(--border2)'}`,
          boxShadow: focused?'0 0 0 3px var(--accent-bg)':'var(--shadow-xs)',
          transition:'all 0.2s',
        }}/>
    </div>
  );
}

export function Toggle({ value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{
      width:44, height:26, borderRadius:13, cursor:'pointer',
      background: value?'var(--accent)':'var(--surface3)', position:'relative',
      transition:'background 0.25s', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        width:20, height:20, borderRadius:'50%', background:'white',
        position:'absolute', top:3, left: value?21:3,
        transition:'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
      }}/>
    </div>
  );
}

export function Section({ title, action, onAction, children, style={} }) {
  return (
    <div style={{ marginBottom:8, ...style }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5, fontFamily:'var(--font-display)' }}>{title}</h2>
        {action && (
          <button onClick={onAction} style={{ fontSize:13, color:'var(--accent)', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            {action} {Icons.chevronRight(14)}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function BookCoverThumb({ book, size }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = book.cover_image && !imgError;
  return (
    <div style={{
      width: size, flexShrink: 0,
      borderRadius: 10, overflow: 'hidden',
      background: `linear-gradient(145deg, ${book.c1}, ${book.c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      aspectRatio: '2/3',
    }}>
      {hasImage ? (
        <img src={book.cover_image} alt={book.title} onError={()=>setImgError(true)}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      ) : (
        <div style={{ fontSize: size * 0.35, textAlign: 'center' }}>{book.emoji}</div>
      )}
    </div>
  );
}

export function BookCard({ book, onNavigate }) {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hasImage = book.cover_image && !imgError;

  if (isMobile) {
    return (
      <div onClick={()=>onNavigate('detail',book)}
        style={{
          display:'flex', gap:12, alignItems:'center',
          padding:'10px 0', borderBottom:'1px solid var(--border)',
          cursor:'pointer',
        }}>
        <BookCoverThumb book={book} size={64} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', gap:4, marginBottom:4 }}>
            {book.tags.slice(0,1).map(t=><Pill key={t} label={t}/>)}
          </div>
          <div style={{ fontSize:14, fontWeight:700, lineHeight:1.3, marginBottom:2, letterSpacing:-0.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.title}</div>
          <div style={{ fontSize:12, color:'var(--text2)', marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.author}</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <StarRating rating={book.rating} size={11}/>
            <span style={{ fontSize:11, color:'var(--text3)' }}>📖 {book.chapters} ch.</span>
          </div>
        </div>
        <div style={{ color:'var(--text3)', flexShrink:0 }}>{Icons.chevronRight(14)}</div>
      </div>
    );
  }

  return (
    <div onClick={()=>onNavigate('detail',book)}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        cursor:'pointer', transition:'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
        transform: hovered?'translateY(-6px)':'translateY(0)',
        background:'var(--surface)', borderRadius:16, overflow:'hidden',
        border:'1px solid var(--border)', boxShadow: hovered?'var(--shadow-lg)':'var(--shadow-sm)',
      }}>
      <div style={{ position:'relative', paddingTop:'140%', overflow:'hidden' }}>
        <div style={{
          position:'absolute', inset:0,
          background:`linear-gradient(145deg, ${book.c1}, ${book.c2})`,
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8,
        }}>
          {hasImage ? (
            <img src={book.cover_image} alt={book.title} onError={()=>setImgError(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          ) : (
            <>
              <div style={{ position:'absolute',inset:0,opacity:0.1,backgroundImage:'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)',backgroundSize:'10px 10px' }}/>
              <div style={{ fontSize:40, filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{book.emoji}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.9)', textAlign:'center', padding:'0 12px', letterSpacing:-0.2 }}>{book.title}</div>
            </>
          )}
        </div>
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:4, zIndex:1 }}>
          {book.tags.slice(0,1).map(t=><Pill key={t} label={t}/>)}
        </div>
        {hovered && (
          <div style={{
            position:'absolute', inset:0,
            background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(4px)', animation:'fadeIn 0.2s ease', zIndex:2,
          }}>
            <div style={{ color:'white', fontSize:13, fontWeight:600, textAlign:'center', padding:16 }}>
              <div style={{ marginBottom:12, fontSize:24 }}>📖</div>
              Xem chi tiết
            </div>
          </div>
        )}
      </div>
      <div className="book-card-body">
        <div style={{ fontSize:13, fontWeight:700, lineHeight:1.3, marginBottom:3, letterSpacing:-0.2 }}>{book.title}</div>
        <div style={{ fontSize:11, color:'var(--text2)', marginBottom:6 }}>{book.author}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <StarRating rating={book.rating} size={10}/>
          <span style={{ fontSize:10, color:'var(--text3)' }}>📖 {book.chapters}</span>
        </div>
      </div>
    </div>
  );
}
