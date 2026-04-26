import { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Pill, StarRating, BookCard, Section } from '../components/shared.jsx';
import BookCover from '../components/BookCover.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const HERO_SMOKE_CSS = `
  @keyframes blobMorph1 {
    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg)   scale(1);    opacity: 0.55; }
    25%     { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(90deg)   scale(1.08); opacity: 0.7;  }
    50%     { border-radius: 50% 50% 40% 60% / 40% 70% 50% 50%; transform: rotate(180deg)  scale(0.95); opacity: 0.45; }
    75%     { border-radius: 70% 30% 55% 45% / 60% 40% 60% 40%; transform: rotate(270deg)  scale(1.05); opacity: 0.65; }
  }
  @keyframes blobMorph2 {
    0%,100% { border-radius: 40% 60% 60% 40% / 50% 40% 60% 50%; transform: rotate(0deg)   scale(1);    opacity: 0.5;  }
    33%     { border-radius: 70% 30% 40% 60% / 60% 50% 40% 50%; transform: rotate(-120deg) scale(1.1);  opacity: 0.7;  }
    66%     { border-radius: 30% 70% 60% 40% / 40% 60% 50% 60%; transform: rotate(-240deg) scale(0.92); opacity: 0.4;  }
  }
  @keyframes blobMorph3 {
    0%,100% { border-radius: 55% 45% 35% 65% / 55% 35% 65% 45%; transform: rotate(0deg)   scale(1);    opacity: 0.6;  }
    50%     { border-radius: 35% 65% 65% 35% / 45% 65% 35% 55%; transform: rotate(180deg)  scale(1.12); opacity: 0.45; }
  }
  @keyframes starTwinkle {
    0%,100% { opacity: 0.2; transform: scale(1); }
    50%     { opacity: 1;   transform: scale(1.4); }
  }
`;

const SMOKE_BLOBS = [
  { style: { top: 0, left: 0, transform: 'translate(-45%,-45%)' },         size: 340, anim: 'blobMorph1', dur: 9,   delay: 0,   color: 'rgba(255,215,0,0.38)'  },
  { style: { top: 0, right: 0, transform: 'translate(45%,-45%)' },          size: 360, anim: 'blobMorph2', dur: 10,  delay: 1.5, color: 'rgba(255,240,180,0.32)'},
  { style: { bottom: 0, left: 0, transform: 'translate(-45%,45%)' },        size: 320, anim: 'blobMorph3', dur: 8.5, delay: 0.8, color: 'rgba(255,200,60,0.35)' },
  { style: { bottom: 0, right: 0, transform: 'translate(45%,45%)' },        size: 350, anim: 'blobMorph1', dur: 11,  delay: 2.2, color: 'rgba(255,230,120,0.30)'},
  { style: { top: '35%', left: 0, transform: 'translate(-55%,-50%)' },      size: 240, anim: 'blobMorph2', dur: 7.5, delay: 3,   color: 'rgba(255,255,200,0.28)'},
  { style: { top: '35%', right: 0, transform: 'translate(55%,-50%)' },      size: 260, anim: 'blobMorph3', dur: 8,   delay: 1,   color: 'rgba(255,220,80,0.32)' },
  { style: { top: '15%', left: '15%', transform: 'translate(-50%,-50%)' },  size: 180, anim: 'blobMorph1', dur: 6,   delay: 4,   color: 'rgba(255,255,255,0.18)'},
  { style: { top: '15%', right: '15%', transform: 'translate(50%,-50%)' },  size: 200, anim: 'blobMorph2', dur: 7,   delay: 2.5, color: 'rgba(255,255,255,0.15)'},
];

const STARS = Array.from({ length: 18 }, (_, i) => ({
  left: `${5 + (i * 31 + 7) % 90}%`,
  top:  `${5 + (i * 19 + 11) % 88}%`,
  size: 2 + i % 3,
  delay: i * 0.35,
  dur:   1.5 + (i % 4) * 0.4,
}));

function HeroSmokeFrame() {
  return (
    <>
      <style>{HERO_SMOKE_CSS}</style>
      {/* Corner & edge smoke blobs */}
      {SMOKE_BLOBS.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 0,
          width: b.size, height: b.size,
          background: b.color,
          filter: 'blur(38px)',
          animation: `${b.anim} ${b.dur}s ease-in-out ${b.delay}s infinite`,
          ...b.style,
        }} />
      ))}
      {/* Sparkle stars */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 1,
          left: s.left, top: s.top,
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'rgba(255,240,150,0.9)',
          boxShadow: `0 0 ${s.size * 3}px rgba(255,220,80,0.8)`,
          animation: `starTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

function SearchResultItem({ book, onNavigate }) {
  return (
    <div
      onClick={() => onNavigate('detail', book)}
      style={{
        display: 'flex', gap: 16, padding: '16px 0',
        borderBottom: '1px solid var(--border)', cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <BookCover book={book} width={64} radius={10} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
          {book.tags.slice(0, 2).map(t => <Pill key={t} label={t} />)}
          <span style={{
            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
            background: 'var(--surface2)', color: 'var(--text3)',
          }}>{book.genre}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, marginBottom: 3, lineHeight: 1.3 }}>{book.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{book.author}</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <StarRating rating={book.rating} size={11} />
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>👁 {book.reads}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>📖 {book.chapters} chương</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {Icons.chevronRight(16)}
      </div>
    </div>
  );
}

export default function HomeScreen({ onNavigate, books = [], genres = [], readProgress = {} }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Tất cả');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);
  const slideTimer = useRef(null);
  const touchStartX = useRef(0);
  const px = isMobile ? 16 : 48;

  const featuredBooks = books.slice(0, 10);
  const [slideIdx, setSlideIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const isTienHiep = (book) =>
    book?.genre?.toLowerCase().includes('tiên hiệp') ||
    book?.tags?.some(t => t.toLowerCase().includes('tiên hiệp'));

  const startTimer = () => {
    clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % Math.max(featuredBooks.length, 1));
        setFade(true);
      }, 300);
    }, 4500);
  };

  useEffect(() => {
    if (featuredBooks.length <= 1) return;
    startTimer();
    return () => clearInterval(slideTimer.current);
  }, [featuredBooks.length]);

  const goSlide = (newIdx) => {
    clearInterval(slideTimer.current);
    setFade(false);
    setTimeout(() => { setSlideIdx(newIdx); setFade(true); startTimer(); }, 300);
  };

  const featured = featuredBooks[slideIdx] ?? featuredBooks[0];

  // genre filter on local books list (no search active)
  const filtered = genre === 'Tất cả' ? books : books.filter(b => b.genre === genre);

  const execSearch = (q) => {
    if (!q.trim()) return;
    clearTimeout(debounceRef.current);
    setIsSearching(true);
    api.searchBooks(q.trim(), { genre })
      .then(res => setSearchResults(res.data ?? res))
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  };

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api.searchBooks(search.trim(), { genre })
        .then(res => setSearchResults(res.data ?? res))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 1000);
    return () => clearTimeout(debounceRef.current);
  }, [search, genre]);

  const allGenres = ['Tất cả', ...genres];

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 40 }}>
      {/* Hero */}
      <div
        style={{ position: 'relative', overflow: 'hidden', background: 'var(--grad-hero)', padding: isMobile ? '28px 16px 24px' : '52px 48px 48px' }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) < 50) return;
          const next = dx < 0
            ? (slideIdx + 1) % featuredBooks.length
            : (slideIdx - 1 + featuredBooks.length) % featuredBooks.length;
          goSlide(next);
        }}
      >
        <style>{`
          @keyframes particleFloat {
            0%   { transform: translateY(0) scale(1);   opacity: 0; }
            15%  { opacity: 0.9; }
            85%  { opacity: 0.5; }
            100% { transform: translateY(-120px) scale(0.4); opacity: 0; }
          }
          @keyframes goldShimmer {
            0%,100% { opacity: 0.25; }
            50%     { opacity: 0.6; }
          }
          @keyframes swordBeam {
            0%   { transform: scaleX(0) rotate(-20deg); opacity: 0; }
            40%  { opacity: 0.6; }
            100% { transform: scaleX(1.4) rotate(-20deg); opacity: 0; }
          }
          @keyframes runeFloat {
            0%   { transform: translateY(10px) rotate(0deg);  opacity: 0; }
            30%  { opacity: 0.7; }
            100% { transform: translateY(-60px) rotate(180deg); opacity: 0; }
          }
        `}</style>

        <HeroSmokeFrame />
        {/* Base orbs */}
        <div className="mesh-orb" style={{ width: 500, height: 500, top: -150, right: -80, background: isTienHiep(featured) ? '#B8860B' : '#635BFF', opacity: 0.4, transition: 'background 0.6s' }} />
        <div className="mesh-orb" style={{ width: 300, height: 300, bottom: -100, left: 200, background: isTienHiep(featured) ? '#FFD700' : '#0EA5E9', opacity: 0.2, transition: 'background 0.6s' }} />

        {/* Tiên hiệp special effects */}
        {isTienHiep(featured) && (
          <>
            {/* Gold shimmer overlay */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 65% 40%, rgba(255,215,0,0.12) 0%, transparent 65%)',
              animation: 'goldShimmer 2.4s ease-in-out infinite',
            }} />
            {/* Floating gold particles */}
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', pointerEvents: 'none',
                left: `${5 + (i * 6) % 90}%`,
                bottom: `${(i * 13) % 40}%`,
                width: `${2 + i % 3}px`, height: `${2 + i % 3}px`,
                borderRadius: '50%',
                background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFF8DC' : '#FF8C00',
                boxShadow: `0 0 ${4 + i % 4}px currentColor`,
                animation: `particleFloat ${2.2 + (i % 5) * 0.4}s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
            {/* Rune symbols */}
            {['仙','道','靈','氣'].map((char, i) => (
              <div key={char} style={{
                position: 'absolute', pointerEvents: 'none',
                left: `${12 + i * 22}%`, bottom: `${10 + (i % 2) * 15}%`,
                fontSize: 13, color: 'rgba(255,215,0,0.5)', fontWeight: 700,
                animation: `runeFloat ${3 + i * 0.5}s ease-in-out ${i * 0.6}s infinite`,
              }}>{char}</div>
            ))}
            {/* Sword beam */}
            <div style={{
              position: 'absolute', top: '35%', left: '30%',
              width: 180, height: 2, pointerEvents: 'none',
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.7), transparent)',
              animation: 'swordBeam 3.5s ease-out 0.8s infinite',
              transformOrigin: 'left center',
            }} />
          </>
        )}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: search ? 16 : (isMobile ? 20 : 32) }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
              {Icons.search(18)}
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && execSearch(search)}
              placeholder="Tìm kiếm truyện, tác giả..."
              style={{
                width: '100%', padding: search ? '13px 140px 13px 48px' : '13px 44px 13px 48px',
                borderRadius: 12, fontSize: isMobile ? 14 : 15,
                background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(20px)', outline: 'none',
                color: 'white', boxSizing: 'border-box',
                transition: 'padding 0.2s',
              }}
            />
            {search && (
              <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => execSearch(search)}
                  style={{
                    padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    background: 'var(--accent)', color: 'white', cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(99,91,255,0.45)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Tìm kiếm
                </button>
                <button
                  onClick={() => setSearch('')}
                  style={{
                    color: 'rgba(255,255,255,0.6)', display: 'flex', padding: 5,
                    background: 'rgba(255,255,255,0.1)', borderRadius: 6,
                  }}
                >
                  {Icons.close(14)}
                </button>
              </div>
            )}
          </div>

          {search ? (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {isSearching ? 'Đang tìm kiếm...' : `${searchResults.length} kết quả cho `}
              {!isSearching && <>&ldquo;<span style={{ color: 'var(--accent3)', fontWeight: 700 }}>{search}</span>&rdquo;</>}
            </div>
          ) : featured && (
            <>
              {/* Label + arrows */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Nổi bật hôm nay</div>
                  {isTienHiep(featured) && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'linear-gradient(90deg,#B8860B,#FFD700)', color: '#1a0a00', letterSpacing: 0.5 }}>✦ TIÊN HIỆP</span>
                  )}
                </div>
                {!isMobile && featuredBooks.length > 1 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => goSlide((slideIdx - 1 + featuredBooks.length) % featuredBooks.length)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                    <button onClick={() => goSlide((slideIdx + 1) % featuredBooks.length)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                  </div>
                )}
              </div>

              {/* Slide content with fade */}
              <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                {isMobile ? (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <BookCover book={featured} width={90} radius={12} noEffect />
                      {isTienHiep(featured) && (
                        <div style={{ position: 'absolute', inset: -3, borderRadius: 14, border: '2px solid rgba(255,215,0,0.7)', boxShadow: '0 0 12px rgba(255,215,0,0.5)', pointerEvents: 'none', animation: 'goldShimmer 1.8s ease-in-out infinite' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                        {featured.tags.slice(0,2).map(t => <Pill key={t} label={t} />)}
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: -0.8, lineHeight: 1.2, fontFamily: 'var(--font-display)', marginBottom: 10 }}>
                        {featured.title}
                      </h2>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => onNavigate('reader', featured)} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'white', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {Icons.play(13)} Đọc ngay
                        </button>
                        <button onClick={() => onNavigate('detail', featured)} style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}>Chi tiết</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <BookCover book={featured} width={140} radius={16} noEffect />
                      {isTienHiep(featured) && (
                        <div style={{ position: 'absolute', inset: -4, borderRadius: 20, border: '2px solid rgba(255,215,0,0.8)', boxShadow: '0 0 24px rgba(255,215,0,0.4), inset 0 0 16px rgba(255,215,0,0.05)', pointerEvents: 'none', animation: 'goldShimmer 1.8s ease-in-out infinite' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingTop: 8 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {featured.tags.map(t => <Pill key={t} label={t} />)}
                      </div>
                      <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: -1.5, lineHeight: 1.1, fontFamily: 'var(--font-display)', marginBottom: 10 }}>
                        {featured.title}
                      </h2>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 16, maxWidth: 440 }}>
                        {featured.desc?.slice(0, 140)}...
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                        <StarRating rating={featured.rating} size={14} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>👁 {featured.reads} lượt đọc</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>📖 {featured.chapters} chương</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => onNavigate('reader', featured)} style={{ padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: isTienHiep(featured) ? 'linear-gradient(90deg,#FFD700,#FFA500)' : 'white', color: isTienHiep(featured) ? '#1a0a00' : 'var(--accent)', cursor: 'pointer', boxShadow: isTienHiep(featured) ? '0 4px 20px rgba(255,215,0,0.4)' : '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {Icons.play(14)} Đọc ngay
                        </button>
                        <button onClick={() => onNavigate('detail', featured)} style={{ padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>Xem chi tiết</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dots */}
              {featuredBooks.length > 1 && (
                <div style={{ display: 'flex', gap: 5, marginTop: 18, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  {featuredBooks.map((_, i) => (
                    <button key={i} onClick={() => goSlide(i)} style={{
                      width: i === slideIdx ? 20 : 6, height: 6, borderRadius: 3,
                      background: i === slideIdx ? (isTienHiep(featured) ? '#FFD700' : 'white') : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease', cursor: 'pointer', padding: 0,
                    }} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick genre filter — always visible */}
      <div style={{
        padding: `0 ${px}px`,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          display: 'flex', gap: 4, overflowX: 'auto', paddingTop: 12, paddingBottom: 12,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {allGenres.map(g => (
            <button
              key={g}
              onClick={() => { setGenre(g); setSearch(''); }}
              style={{
                flexShrink: 0, padding: isMobile ? '6px 14px' : '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: genre === g && !search ? 'var(--accent)' : 'transparent',
                color: genre === g && !search ? 'white' : 'var(--text2)',
                border: genre === g && !search ? 'none' : '1.5px solid var(--border2)',
                boxShadow: genre === g && !search ? 'var(--shadow-accent)' : 'none',
                transition: 'all 0.15s', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '20px 16px' : '32px 48px' }}>
        {search ? (
          /* Search results — server-side */
          <div>
            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
                <div style={{ fontSize: 13 }}>Đang tìm kiếm...</div>
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Không tìm thấy truyện nào</div>
                <div style={{ fontSize: 13 }}>Thử từ khóa khác nhé</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
                  {searchResults.length} truyện được tìm thấy
                </div>
                {searchResults.map(b => <SearchResultItem key={b.id} book={b} onNavigate={onNavigate} />)}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Book grid filtered by genre */}
            <Section
              title={genre === 'Tất cả' ? 'Tất cả truyện' : genre}
              style={{ marginTop: 36 }}
            >
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                  <div style={{ fontSize: 14 }}>Chưa có truyện thể loại này</div>
                </div>
              ) : (
                <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(140px, 1fr))', gap: isMobile ? 0 : 20 }}>
                  {filtered.map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate} />)}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
