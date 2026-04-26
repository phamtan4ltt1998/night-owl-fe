import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Icons } from '../components/Icons.jsx';
import { StarRating } from '../components/shared.jsx';
import BookCover from '../components/BookCover.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const BACKGROUNDS = { white:'#FFFFFF', parchment:'#FAF3E0', slate:'#1E2A3A', dark:'#0D0D0D' };
const TEXT_COLORS  = { white:'#1D1D1F', parchment:'#3D2B1F', slate:'#E8F0F8', dark:'#F0F0F0' };
const UNLOCK_COST = 5;

function ChapterPicker({ chapters, current, isDark, txtColor, isMobile, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const listRef = useRef(null);
  const currentRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.map((c, i) => ({ ...c, _idx: i })).filter(c =>
      !q ||
      String(c.chapterNumber ?? c._idx + 1).includes(q) ||
      (c.title || '').toLowerCase().includes(q)
    );
  }, [chapters, query]);

  // Auto-scroll to current chapter when popup opens
  useEffect(() => {
    if (!query && currentRef.current && listRef.current) {
      currentRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, []);

  const surface  = isDark ? 'rgba(18,18,28,0.97)' : 'rgba(255,255,255,0.98)';
  const divider  = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';
  const inputBg  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const hoverBg  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const numColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:'absolute', top:62, left:'50%', transform:'translateX(-50%)',
          width: isMobile ? '96vw' : 520,
          maxHeight:'75vh', display:'flex', flexDirection:'column',
          background: surface,
          borderRadius:18,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
          overflow:'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding:'16px 18px 12px', borderBottom: divider, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:txtColor, letterSpacing:-0.3 }}>Chọn chương</div>
              <div style={{ fontSize:11, color: isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.35)', marginTop:2 }}>
                Đang đọc chương {chapters[current]?.chapterNumber ?? current + 1} · {chapters.length} chương
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background: isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)', color:txtColor, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              {Icons.close(13)}
            </button>
          </div>
          {/* Search input */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color: isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)', display:'flex' }}>
              {Icons.search(14)}
            </div>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm tên chương hoặc số chương..."
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'8px 12px 8px 34px', borderRadius:10,
                background: inputBg,
                border: isDark?'1px solid rgba(255,255,255,0.08)':'1px solid rgba(0,0,0,0.08)',
                color: txtColor, fontSize:13, outline:'none',
              }}
            />
          </div>
        </div>

        {/* Chapter list */}
        <div ref={listRef} style={{ overflowY:'auto', flex:1, padding:'6px 8px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 0', fontSize:13, color: isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)' }}>
              Không tìm thấy chương
            </div>
          )}
          {filtered.map(c => {
            const isCurrent = c._idx === current;
            const isLocked  = c.unlocked === false;
            const chNum     = c.chapterNumber ?? c._idx + 1;
            return (
              <div
                key={c.chapterNumber ?? c._idx}
                ref={isCurrent ? currentRef : null}
                onClick={() => { if (!isLocked) onSelect(c._idx); }}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'10px 12px', borderRadius:11, marginBottom:2,
                  background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transition:'background 0.12s',
                  opacity: isLocked ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!isCurrent && !isLocked) e.currentTarget.style.background = hoverBg; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Chapter number badge */}
                <div style={{
                  minWidth:36, height:36, borderRadius:9, flexShrink:0,
                  background: isCurrent ? 'var(--accent)' : (isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'),
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:800,
                  color: isCurrent ? 'white' : numColor,
                }}>
                  {chNum}
                </div>

                {/* Title */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontSize:13, fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--accent)' : txtColor,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    lineHeight:1.3,
                  }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize:10, color: isDark?'rgba(255,255,255,0.28)':'rgba(0,0,0,0.3)', marginTop:2 }}>
                    Chương {chNum}
                  </div>
                </div>

                {/* Right badges */}
                {isCurrent && (
                  <span style={{ fontSize:10, fontWeight:700, color:'var(--accent)', background:'var(--accent-bg)', padding:'3px 8px', borderRadius:6, flexShrink:0 }}>
                    Đang đọc
                  </span>
                )}
                {isLocked && <span style={{ fontSize:13, flexShrink:0 }}>🔒</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReaderSetting({ label, children, color='var(--text)' }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, color:'rgba(128,128,128,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>{label}</div>
      {children}
    </div>
  );
}

export default function ReaderScreen({ book, chapterIdx=0, dark, onToggleDark, onBack, onHome, onChapterChange, user, onUserUpdate, autoAdvance=true, fontSize=17, onFontSizeChange, books=[], onNavigate, pageFlip=false, onPageFlipChange }) {
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
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
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isAnimating = useRef(false);
  const [animClass, setAnimClass] = useState('');

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

  const goChapter = (newIdx, dir) => {
    if (isAnimating.current) return;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    cancelAdvance();
    if (!pageFlip) {
      setChapter(newIdx);
      return;
    }
    isAnimating.current = true;
    setAnimClass(dir === 'forward' ? 'page-flip-out-left' : 'page-flip-out-right');
    setTimeout(() => {
      setChapter(newIdx);
      setAnimClass(dir === 'forward' ? 'page-flip-in-right' : 'page-flip-in-left');
      setTimeout(() => {
        setAnimClass('');
        isAnimating.current = false;
      }, 380);
    }, 320);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && chapter < chapters.length - 1) goChapter(chapter + 1, 'forward');
    else if (dx > 0 && chapter > 0) goChapter(chapter - 1, 'backward');
  };

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

  const relatedBooks = useMemo(() => {
    if (!books.length) return [];
    return books
      .filter(b => b.id !== book.id && b.genre === book.genre)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 8);
  }, [books, book.id, book.genre]);

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
      <style>{`
        @keyframes pageFlipOutLeft {
          0%   { transform: perspective(1200px) rotateY(0deg)   translateX(0);     opacity: 1; }
          100% { transform: perspective(1200px) rotateY(20deg)  translateX(-110%); opacity: 0.6; }
        }
        @keyframes pageFlipInRight {
          0%   { transform: perspective(1200px) rotateY(-20deg) translateX(110%);  opacity: 0.6; }
          100% { transform: perspective(1200px) rotateY(0deg)   translateX(0);     opacity: 1; }
        }
        @keyframes pageFlipOutRight {
          0%   { transform: perspective(1200px) rotateY(0deg)   translateX(0);     opacity: 1; }
          100% { transform: perspective(1200px) rotateY(-20deg) translateX(110%);  opacity: 0.6; }
        }
        @keyframes pageFlipInLeft {
          0%   { transform: perspective(1200px) rotateY(20deg)  translateX(-110%); opacity: 0.6; }
          100% { transform: perspective(1200px) rotateY(0deg)   translateX(0);     opacity: 1; }
        }
        .page-flip-out-left  { animation: pageFlipOutLeft  0.32s cubic-bezier(0.4,0,1,1)   forwards; }
        .page-flip-in-right  { animation: pageFlipInRight  0.38s cubic-bezier(0,0,0.6,1)   forwards; }
        .page-flip-out-right { animation: pageFlipOutRight 0.32s cubic-bezier(0.4,0,1,1)   forwards; }
        .page-flip-in-left   { animation: pageFlipInLeft   0.38s cubic-bezier(0,0,0.6,1)   forwards; }
      `}</style>

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

        {/* Center: chapter select button — compact, centered */}
        <div style={{ flex:1, display:'flex', justifyContent:'center', minWidth:0 }}>
          <button
            onClick={() => { setShowChapters(s=>!s); setShowSettings(false); }}
            style={{
              cursor:'pointer', maxWidth: isMobile ? 180 : 260,
              display:'flex', alignItems:'center', gap:6,
              padding:'5px 10px 5px 6px', borderRadius:20,
              background: showChapters
                ? 'var(--accent)'
                : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'),
              border: showChapters
                ? 'none'
                : (isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.1)'),
              transition:'background 0.15s',
            }}
            title="Chọn chương"
          >
            {/* Chapter number badge */}
            <span style={{
              fontSize:10, fontWeight:800,
              padding:'2px 7px', borderRadius:12, flexShrink:0,
              background: showChapters ? 'rgba(255,255,255,0.25)' : 'var(--accent)',
              color: 'white',
            }}>
              {ch.chapterNumber ?? chapter + 1}
            </span>

            {/* Chapter title */}
            <span style={{
              fontSize:12, fontWeight:600,
              color: showChapters ? 'white' : txtColor,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>
              {ch.title}
            </span>

            {/* Chevron */}
            <span style={{
              fontSize:9, flexShrink:0,
              color: showChapters ? 'rgba(255,255,255,0.75)' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'),
              transform: showChapters ? 'rotate(180deg)' : 'none',
              transition:'transform 0.2s',
            }}>▾</span>
          </button>
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

      {/* ── Chapter picker popup ── */}
      {showChapters && (
        <ChapterPicker
          chapters={chapters}
          current={chapter}
          isDark={isDark}
          txtColor={txtColor}
          isMobile={isMobile}
          onSelect={(i) => { goChapter(i, i > chapter ? 'forward' : 'backward'); setShowChapters(false); }}
          onClose={() => setShowChapters(false)}
        />
      )}

      {/* ── Content + Sidebars ── */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', background:bgColor, position:'relative' }}>

        {/* Left: Google Ads (desktop only) */}
        {!isMobile && (
          <div style={{ width:160, flexShrink:0, padding:'20px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:16, overflowY:'auto', borderRight:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}` }}>
            {/* Google AdSense — thay data-ad-client và data-ad-slot bằng ID thật */}
            <div style={{ width:140, minHeight:600, background: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)', borderRadius:10, border:`1px dashed ${isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ fontSize:9, color: isDark?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.25)', letterSpacing:1, textTransform:'uppercase' }}>Quảng cáo</span>
              {/* Uncomment và điền ID AdSense thật:
              <ins className="adsbygoogle"
                style={{ display:'block', width:140, height:600 }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="false"
              />
              */}
            </div>
          </div>
        )}

        {/* Center: main reading area */}
      <div
        ref={contentRef}
        className={animClass}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ flex:1, height:'100%', overflowY:'auto', position:'relative' }}
      >
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

        {/* Right: Related books (desktop only) */}
        {!isMobile && (
          <div style={{ width:200, flexShrink:0, overflowY:'auto', padding:'16px 10px', borderLeft:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`, background: isDark?'rgba(0,0,0,0.15)':'rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color: isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.35)', marginBottom:12, padding:'0 4px' }}>
              Cùng thể loại
            </div>
            {relatedBooks.length === 0 ? (
              <div style={{ fontSize:12, color: isDark?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.25)', textAlign:'center', padding:'20px 0' }}>Chưa có truyện</div>
            ) : relatedBooks.map(b => (
              <div key={b.id} onClick={() => onNavigate?.('detail', b)} style={{ display:'flex', gap:8, padding:'8px 4px', borderRadius:8, cursor:'pointer', marginBottom:4, transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <BookCover book={b} width={48} radius={7} noEffect />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, lineHeight:1.3, marginBottom:3, color: isDark?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.85)', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{b.title}</div>
                  <StarRating rating={b.rating} size={9} />
                  <div style={{ fontSize:10, color: isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.4)', marginTop:2 }}>{b.chapters} ch.</div>
                </div>
              </div>
            ))}
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
          onClick={() => goChapter(chapter - 1, 'backward')}
          disabled={chapter === 0}
          style={{ ...btnStyle, opacity: chapter === 0 ? 0.35 : 1 }}
        >
          ← Chương trước
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:12, color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--text3)' }}>
          {ch.chapterNumber} / {chapters.length}
        </div>
        <button
          onClick={() => goChapter(chapter + 1, 'forward')}
          disabled={chapter >= chapters.length - 1}
          style={{ ...btnStyle, opacity: chapter >= chapters.length - 1 ? 0.35 : 1 }}
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

          <ReaderSetting label="Hiệu ứng lật trang">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color: isDark?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.55)' }}>
                {pageFlip ? 'Bật' : 'Tắt'}
              </span>
              <button
                onClick={() => onPageFlipChange?.(!pageFlip)}
                style={{
                  width:44, height:24, borderRadius:12, cursor:'pointer', position:'relative',
                  background: pageFlip ? 'var(--accent)' : (isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)'),
                  transition:'background 0.2s',
                  flexShrink:0,
                }}
              >
                <span style={{
                  position:'absolute', top:3, left: pageFlip ? 23 : 3,
                  width:18, height:18, borderRadius:'50%', background:'white',
                  transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.25)',
                }} />
              </button>
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
