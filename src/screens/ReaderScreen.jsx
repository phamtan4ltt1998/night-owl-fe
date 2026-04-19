import { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons.jsx';
import { api } from '../api.js';

const BACKGROUNDS = { white:'#FFFFFF', parchment:'#FAF3E0', slate:'#1E2A3A', dark:'#0D0D0D' };
const TEXT_COLORS  = { white:'#1D1D1F', parchment:'#3D2B1F', slate:'#E8F0F8', dark:'#F0F0F0' };

function ReaderSetting({ label, children, color='var(--text)' }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, color:'rgba(128,128,128,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>{label}</div>
      {children}
    </div>
  );
}

export default function ReaderScreen({ book, chapterIdx=3, dark, onToggleDark, onBack, onHome }) {
  const [showSettings, setShowSettings] = useState(false);
  const [chapter, setChapter]           = useState(chapterIdx);
  const [fontSize, setFontSize]         = useState(17);
  const [fontFamily, setFontFamily]     = useState('serif');
  const [bgMode, setBgMode]             = useState(dark ? 'dark' : 'white');
  const [lineH, setLineH]               = useState(1.85);
  const [chapters, setChapters]         = useState([]);
  const [content, setContent]           = useState('');
  const contentRef = useRef();

  useEffect(() => {
    api.getChapters(book.id).then(setChapters).catch(console.error);
  }, [book.id]);

  const ch = chapters[chapter] ?? chapters[0];

  useEffect(() => {
    if (!ch) return;
    setContent('');
    if (contentRef.current) contentRef.current.scrollTop = 0;
    api.getChapterContent(book.id, ch.chapterNumber)
      .then(data => setContent(data.content))
      .catch(console.error);
  }, [book.id, ch?.chapterNumber]);

  const bgColor  = BACKGROUNDS[bgMode];
  const txtColor = TEXT_COLORS[bgMode];
  const isDark   = bgMode === 'dark' || bgMode === 'slate';

  const barBg     = isDark ? 'rgba(15,15,25,0.97)' : 'rgba(255,255,255,0.97)';
  const barBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';
  const btnStyle  = {
    display:'flex', alignItems:'center', gap:6,
    padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600,
    background: isDark ? 'rgba(255,255,255,0.08)' : 'var(--surface2)',
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border2)',
    color: isDark ? '#e8e8f0' : 'var(--text)', cursor:'pointer',
  };

  if (!ch) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: dark ? '#0D0D0D' : '#fff', color:'var(--text3)' }}>
      Đang tải...
    </div>
  );

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:bgColor }}>

      {/* ── Top bar ── */}
      <div style={{
        flexShrink:0, display:'flex', alignItems:'center', gap:10,
        padding:'0 20px', height:56,
        background:barBg, borderBottom:barBorder,
        position:'relative', zIndex:30,
      }}>
        {/* Left: back + home */}
        <button onClick={onBack} style={btnStyle}>{Icons.back(14)} Quay lại</button>
        <button onClick={onHome} style={{ ...btnStyle, padding:'7px 10px' }} title="Màn hình chính">
          {Icons.compass(16)}
        </button>

        {/* Center: title */}
        <div style={{ flex:1, textAlign:'center', minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:txtColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.title}</div>
          <div style={{ fontSize:11, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{ch.title}</div>
        </div>

        {/* Right: dark/light toggle + settings */}
        <button onClick={() => {
          const next = isDark ? 'white' : 'dark';
          setBgMode(next);
          onToggleDark?.();
        }} style={{ ...btnStyle, padding:'7px 10px' }} title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}>
          {isDark ? Icons.sun(16) : Icons.moon(16)}
        </button>
        <button onClick={()=>setShowSettings(s=>!s)} style={{
          ...btnStyle,
          background: showSettings ? 'var(--accent-bg)' : (isDark ? 'rgba(255,255,255,0.08)' : 'var(--surface2)'),
          color: showSettings ? 'var(--accent)' : (isDark ? '#e8e8f0' : 'var(--text)'),
          fontWeight:800, fontSize:15,
        }}>Aa</button>
      </div>

      {/* ── Content ── */}
      <div ref={contentRef} style={{ flex:1, overflowY:'auto', background:bgColor }}>
        <div style={{ maxWidth:700, margin:'0 auto', padding:'40px 48px 40px' }}>
          <div style={{ fontSize:fontSize+4, fontWeight:800, color:txtColor, marginBottom:28, lineHeight:1.2, fontFamily:'var(--font-display)', letterSpacing:-0.5 }}>
            {ch.title}
          </div>
          {content
            ? content.split('\n\n').filter(p => p.trim()).map((p,i) => (
                <p key={i} style={{
                  marginBottom:'1.6em', textAlign:'justify',
                  fontFamily: fontFamily==='serif' ? 'Georgia, "Times New Roman", serif' : 'var(--font-body)',
                  fontSize, lineHeight:lineH, color:txtColor, textIndent:'2em',
                }}>{p.trim()}</p>
              ))
            : <p style={{ color:txtColor, opacity:0.4, textAlign:'center', marginTop:60 }}>Đang tải nội dung...</p>
          }
          <div style={{ textAlign:'center', padding:'48px 0 24px', color:txtColor, opacity:0.3, fontSize:28, letterSpacing:8 }}>· · ·</div>
          <p style={{ textAlign:'center', fontSize:13, color:txtColor, opacity:0.4 }}>— Hết {ch.title} —</p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        flexShrink:0, display:'flex', alignItems:'center', gap:12,
        padding:'0 20px', height:58,
        background:barBg, borderTop:barBorder, zIndex:30,
      }}>
        <button
          onClick={()=>{ setChapter(c=>Math.max(0,c-1)); }}
          disabled={chapter===0}
          style={{ ...btnStyle, opacity:chapter===0?0.35:1 }}
        >
          ← Chương trước
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:12, color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--text3)' }}>
          {ch.chapterNumber} / {chapters.length}
        </div>
        <button
          onClick={()=>{ setChapter(c=>Math.min(chapters.length-1,c+1)); }}
          disabled={chapter>=chapters.length-1}
          style={{ ...btnStyle, opacity:chapter>=chapters.length-1?0.35:1 }}
        >
          Chương sau →
        </button>
      </div>

      {/* ── Settings drawer ── */}
      {showSettings && (
        <div style={{
          position:'fixed', right:0, top:56, bottom:58, width:280, zIndex:40,
          background: isDark ? 'rgba(12,12,20,0.97)' : 'rgba(255,255,255,0.98)',
          backdropFilter:'blur(24px)', borderLeft:barBorder,
          padding:'20px 18px', overflowY:'auto',
          boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontWeight:800, fontSize:15, marginBottom:20, color:txtColor }}>Cài đặt đọc</div>

          <ReaderSetting label="Cỡ chữ">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={()=>setFontSize(s=>Math.max(13,s-1))} style={{ width:36,height:36,borderRadius:8,background:'rgba(128,128,128,0.12)',fontSize:20,color:txtColor,cursor:'pointer',fontWeight:600 }}>−</button>
              <span style={{ fontSize:14,fontWeight:700,minWidth:32,textAlign:'center',color:txtColor }}>{fontSize}px</span>
              <button onClick={()=>setFontSize(s=>Math.min(28,s+1))} style={{ width:36,height:36,borderRadius:8,background:'rgba(128,128,128,0.12)',fontSize:20,color:txtColor,cursor:'pointer',fontWeight:600 }}>+</button>
            </div>
          </ReaderSetting>

          <ReaderSetting label="Khoảng cách dòng">
            <div style={{ display:'flex', gap:6 }}>
              {[1.5,1.75,2.0].map(v=>(
                <button key={v} onClick={()=>setLineH(v)} style={{
                  padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
                  background:lineH===v?'var(--accent)':'rgba(128,128,128,0.12)',
                  color:lineH===v?'white':txtColor,
                }}>{v}</button>
              ))}
            </div>
          </ReaderSetting>

          <ReaderSetting label="Font chữ">
            <div style={{ display:'flex', gap:6 }}>
              {[['serif','Serif'],['sans','Sans']].map(([v,l])=>(
                <button key={v} onClick={()=>setFontFamily(v)} style={{
                  padding:'6px 16px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
                  background:fontFamily===v?'var(--accent)':'rgba(128,128,128,0.12)',
                  color:fontFamily===v?'white':txtColor,
                  fontFamily:v==='serif'?'Georgia,serif':'var(--font-body)',
                }}>{l}</button>
              ))}
            </div>
          </ReaderSetting>

          <ReaderSetting label="Màu nền">
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {Object.entries(BACKGROUNDS).map(([k,v])=>(
                <button key={k} onClick={()=>setBgMode(k)} style={{
                  width:44,height:30,borderRadius:8,background:v,cursor:'pointer',
                  border:bgMode===k?'2.5px solid var(--accent)':'2px solid rgba(128,128,128,0.25)',
                  boxShadow:bgMode===k?'0 0 0 3px var(--accent-bg)':'none',
                }}/>
              ))}
            </div>
          </ReaderSetting>
        </div>
      )}
    </div>
  );
}
