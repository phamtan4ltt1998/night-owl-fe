import { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const BACKGROUNDS = { white:'#FFFFFF', parchment:'#FAF3E0', slate:'#1E2A3A', dark:'#0D0D0D' };
const TEXT_COLORS  = { white:'#1D1D1F', parchment:'#3D2B1F', slate:'#E8F0F8', dark:'#F0F0F0' };
const UNLOCK_COST = 5;

function ReaderSetting({ label, children, color='var(--text)' }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, color:'rgba(128,128,128,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>{label}</div>
      {children}
    </div>
  );
}

export default function ReaderScreen({ book, chapterIdx=0, dark, onToggleDark, onBack, onHome, onChapterChange, user, onUserUpdate, autoAdvance=true, fontSize=17, onFontSizeChange }) {
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [chapter, setChapter]           = useState(chapterIdx);
  const setFontSize = (fn) => onFontSizeChange(typeof fn === 'function' ? fn(fontSize) : fn);
  const [fontFamily, setFontFamily]     = useState('serif');
  const [bgMode, setBgMode]             = useState(dark ? 'dark' : 'white');
  const [lineH, setLineH]               = useState(1.85);
  const [chapters, setChapters]         = useState([]);
  const [sessionToken, setSessionToken] = useState(null); // null = not yet fetched, '' = disabled by server
  const [content, setContent]           = useState('');
  const [unlocking, setUnlocking]       = useState(false);
  const [unlockError, setUnlockError]   = useState('');
  const [linhThach, setLinhThach]       = useState(user?.linh_thach ?? 0);
  const [advanceCountdown, setAdvanceCountdown] = useState(null); // null | 3 | 2 | 1
  const contentRef  = useRef();
  const advanceTimer = useRef(null);
  const countdownInterval = useRef(null);
  const advanceCancelled = useRef(false);

  // Sync khi App cập nhật user.linh_thach (vd: sau khi mua ở ProfileScreen)
  useEffect(() => {
    if (user?.linh_thach != null) setLinhThach(user.linh_thach);
  }, [user?.linh_thach]);

  useEffect(() => {
    api.getChapters(book.id)
      .then(data => {
        setChapters(data.chapters ?? []);
        setSessionToken(data.session_token ?? '');
      })
      .catch(console.error);
  }, [book.id]);

  useEffect(() => {
    onChapterChange?.(chapter);
  }, [chapter]);

  useEffect(() => {
    const handler = () => onChapterChange?.(chapter);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [chapter]);

  const ch = chapters[chapter] ?? chapters[0];

  useEffect(() => {
    if (!ch) return;
    if (ch.unlocked === false) return; // chờ user mở khóa, không load content
    setContent('');
    setUnlockError('');
    if (contentRef.current) contentRef.current.scrollTop = 0;
    if (sessionToken === null) return; // still waiting for getChapters
    api.getChapterContent(book.id, ch.chapterNumber, sessionToken)
      .then(data => setContent(data.content))
      .catch(console.error);
  }, [book.id, ch?.chapterNumber, ch?.unlocked, sessionToken]);

  // Auto-advance: khi scroll xuống cuối trang và còn chương tiếp theo
  const cancelAdvance = (userInitiated = false) => {
    clearTimeout(advanceTimer.current);
    clearInterval(countdownInterval.current);
    advanceTimer.current = null;
    if (userInitiated) advanceCancelled.current = true;
    setAdvanceCountdown(null);
  };

  useEffect(() => {
    if (!autoAdvance || ch?.unlocked === false) return;
    const el = contentRef.current;
    if (!el) return;

    const startAdvance = () => {
      if (advanceTimer.current) return;
      let count = 3;
      setAdvanceCountdown(count);
      countdownInterval.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countdownInterval.current);
          setAdvanceCountdown(null);
        } else {
          setAdvanceCountdown(count);
        }
      }, 1000);
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        setChapter(c => Math.min(chapters.length - 1, c + 1));
      }, 3000);
    };

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atBottom = scrollHeight - scrollTop - clientHeight < 80;
      if (atBottom && chapter < chapters.length - 1) {
        if (!advanceCancelled.current) startAdvance();
      } else {
        advanceCancelled.current = false; // reset when user scrolls away from bottom
        cancelAdvance();
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); cancelAdvance(); };
  }, [autoAdvance, ch?.unlocked, chapter, chapters.length]);

  const handleUnlock = async () => {
    if (unlocking) return;
    if (linhThach < UNLOCK_COST) {
      setUnlockError(`Không đủ Linh Thạch. Cần ${UNLOCK_COST}, hiện có ${linhThach}.`);
      return;
    }
    setUnlocking(true);
    setUnlockError('');
    try {
      const res = await api.unlockChapter(book.id, ch.chapterNumber);
      const newBalance = res.balance ?? linhThach - UNLOCK_COST;
      setLinhThach(newBalance);
      onUserUpdate?.({ ...user, linh_thach: newBalance });
      // Đánh dấu chương đã mở khóa trong danh sách
      setChapters(prev => prev.map((c, i) =>
        i === chapter ? { ...c, unlocked: true } : c
      ));
    } catch (e) {
      setUnlockError(e.message || 'Mở khóa thất bại. Thử lại.');
    } finally {
      setUnlocking(false);
    }
  };

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
        flexShrink:0, display:'flex', alignItems:'center', gap: isMobile ? 6 : 10,
        padding: isMobile ? '0 10px' : '0 20px', height:56,
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
      <div ref={contentRef} style={{ flex:1, overflowY:'auto', background:bgColor, position:'relative' }}>
        {ch.unlocked !== false ? (
          <div style={{ maxWidth:700, margin:'0 auto', padding: isMobile ? '24px 16px 40px' : '40px 48px 40px' }}>
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

            {/* Auto-advance countdown banner */}
            {autoAdvance && chapter < chapters.length - 1 && advanceCountdown !== null && (
              <div style={{
                margin:'24px 0 8px', padding:'14px 20px', borderRadius:14,
                background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <span style={{ fontSize:14, fontWeight:600, color:'white' }}>
                  ⏭ Tự động chuyển chương sau {advanceCountdown}s...
                </span>
                <button
                  onClick={() => cancelAdvance(true)}
                  style={{ fontSize:12, fontWeight:700, color:'white', background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer' }}
                >
                  Huỷ
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Lock overlay ── */
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', padding:32 }}>
            <div style={{
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:20, padding:'40px 48px', maxWidth:400, width:'100%',
              textAlign:'center', boxShadow:'var(--shadow-lg)',
            }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
              <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Chương bị khóa</div>
              <div style={{ fontSize:14, color:'var(--text2)', marginBottom:24, lineHeight:1.6 }}>
                Mở khóa <strong>{ch.title}</strong> để đọc tiếp
              </div>

              <div style={{
                background:'var(--surface2)', borderRadius:12, padding:'12px 20px',
                marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span style={{ fontSize:13, color:'var(--text2)' }}>Chi phí mở khóa</span>
                <span style={{ fontSize:16, fontWeight:800, color:'var(--accent)' }}>💎 {UNLOCK_COST} Linh Thạch</span>
              </div>

              <div style={{
                background:'var(--surface2)', borderRadius:12, padding:'12px 20px',
                marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span style={{ fontSize:13, color:'var(--text2)' }}>Số dư của bạn</span>
                <span style={{ fontSize:16, fontWeight:700, color: linhThach >= UNLOCK_COST ? 'var(--text)' : '#ef4444' }}>
                  💎 {linhThach} Linh Thạch
                </span>
              </div>

              {unlockError && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#dc2626' }}>
                  {unlockError}
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={unlocking || linhThach < UNLOCK_COST}
                style={{
                  width:'100%', padding:'13px 0', borderRadius:12, fontSize:15, fontWeight:700,
                  background: linhThach >= UNLOCK_COST ? 'var(--accent)' : 'var(--surface2)',
                  color: linhThach >= UNLOCK_COST ? 'white' : 'var(--text3)',
                  cursor: linhThach >= UNLOCK_COST ? 'pointer' : 'not-allowed',
                  opacity: unlocking ? 0.7 : 1, transition:'all 0.2s',
                }}
              >
                {unlocking ? 'Đang mở khóa...' : linhThach >= UNLOCK_COST ? '🔓 Mở khóa ngay' : 'Không đủ Linh Thạch'}
              </button>

              {linhThach < UNLOCK_COST && (
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:12 }}>
                  Thiếu {UNLOCK_COST - linhThach} Linh Thạch · Vào Tài khoản để nạp thêm
                </div>
              )}
            </div>
          </div>
        )}
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
          position:'fixed',
          right:0, top:56, bottom:58,
          width: isMobile ? '100%' : 280,
          zIndex:40,
          background: isDark ? 'rgba(12,12,20,0.97)' : 'rgba(255,255,255,0.98)',
          backdropFilter:'blur(24px)', borderLeft: isMobile ? 'none' : barBorder,
          borderTop: isMobile ? barBorder : 'none',
          padding:'20px 18px', overflowY:'auto',
          boxShadow: isMobile ? '0 -4px 24px rgba(0,0,0,0.12)' : '-4px 0 24px rgba(0,0,0,0.12)',
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
