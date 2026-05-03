import { useState, useEffect, useRef, useMemo } from 'react';
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

const PAGE_SIZE_OPTIONS = [12, 24, 48];

function HotWorksCarousel({ books, onNavigate, isMobile }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const hot = useMemo(() => {
    return [...books]
      .sort((a, b) => (parseInt((b.reads || '0').replace(/\D/g, '')) || 0) - (parseInt((a.reads || '0').replace(/\D/g, '')) || 0))
      .slice(0, 8);
  }, [books]);

  const startTimer = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIdx(i => (i + 1) % Math.max(hot.length, 1));
    }, 3800);
  };

  useEffect(() => {
    if (hot.length <= 1) return;
    startTimer();
    return () => clearInterval(timer.current);
  }, [hot.length]);

  if (hot.length === 0) return null;

  const center = hot[idx];
  const goTo = (newIdx) => {
    clearInterval(timer.current);
    setIdx(((newIdx % hot.length) + hot.length) % hot.length);
    startTimer();
  };

  // Compute relative offset (-N..+N) handling circular wrap
  const relOffset = (i) => {
    const half = Math.floor(hot.length / 2);
    let d = i - idx;
    if (d > half) d -= hot.length;
    if (d < -half) d += hot.length;
    return d;
  };

  // Map offset → visual transform / state
  const slotStyle = (off) => {
    const abs = Math.abs(off);
    if (abs >= 3) return { display: 'none' };
    const baseW = isMobile ? 130 : 150;
    if (off === 0) {
      return {
        transform: 'translate(-50%, -50%) translateX(0px) rotate(0deg) scale(1)',
        opacity: 1, zIndex: 5, filter: 'none',
      };
    }
    const dir = off < 0 ? -1 : 1;
    const layer = abs; // 1 or 2
    const dist = layer === 1 ? (isMobile ? 78 : 100) : (isMobile ? 120 : 160);
    const rot = dir * (layer === 1 ? 14 : 22);
    const scale = layer === 1 ? 0.78 : 0.6;
    const opacity = layer === 1 ? 0.72 : 0.25;
    const zIndex = 5 - layer;
    return {
      transform: `translate(-50%, -50%) translateX(${dir * dist}px) rotate(${rot}deg) scale(${scale})`,
      opacity, zIndex, filter: layer === 1 ? 'brightness(0.85)' : 'brightness(0.7) blur(1px)',
    };
  };

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 16, padding: '20px 18px 22px',
      border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes hotPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50%     { transform: translate(-50%,-50%) scale(1.025); }
        }
        @keyframes hotFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hot-slot {
          position: absolute; top: 50%; left: 50%;
          transform-origin: center center;
          transition:
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
            opacity   0.55s cubic-bezier(0.22, 1, 0.36, 1),
            filter    0.55s ease;
          will-change: transform, opacity;
          cursor: pointer;
          border-radius: 10px;
        }
        .hot-slot.center {
          box-shadow: 0 12px 32px rgba(0,0,0,0.35), 0 0 0 3px rgba(255,255,255,0.08);
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid var(--accent)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3, fontFamily: 'var(--font-display)' }}>
          🔥 Tác phẩm hot
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {idx + 1} / {hot.length}
        </span>
      </div>

      {/* Cover stack — all books rendered absolute, position derived from offset */}
      <div style={{
        height: isMobile ? 210 : 240, position: 'relative',
        marginBottom: 18, perspective: 1000,
      }}>
        {hot.map((b, i) => {
          const off = relOffset(i);
          const isCenter = off === 0;
          return (
            <div
              key={b.id}
              className={`hot-slot${isCenter ? ' center' : ''}`}
              onClick={() => isCenter ? onNavigate('detail', b) : goTo(i)}
              style={slotStyle(off)}
            >
              <BookCover book={b} width={isMobile ? 130 : 150} radius={10} noEffect />
            </div>
          );
        })}
      </div>

      {/* Center book info — fade-in on idx change via keyed div */}
      <div
        key={center.id}
        style={{
          textAlign: 'center',
          animation: 'hotFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          onClick={() => onNavigate('detail', center)}
          style={{
            fontSize: 16, fontWeight: 800, letterSpacing: -0.4,
            marginBottom: 4, cursor: 'pointer',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-display)',
          }}
        >
          {center.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>
          {center.author || 'Không rõ'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text2)' }}>
          {center.reads || '0'} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>lượt đọc</span>
        </div>
        <div style={{
          fontSize: 11, color: 'var(--text3)', lineHeight: 1.5,
          marginBottom: 14, height: 32, overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          padding: '0 4px',
        }}>
          {center.description || center.desc || 'Đang cập nhật mô tả...'}
        </div>

        <button
          onClick={() => onNavigate('detail', center)}
          style={{
            padding: '8px 22px', borderRadius: 18, fontSize: 12, fontWeight: 700,
            background: 'var(--accent)', color: 'white', cursor: 'pointer',
            border: 'none', boxShadow: 'var(--shadow-accent)',
          }}
        >
          Chi tiết truyện
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 14 }}>
        {hot.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === idx ? 16 : 5, height: 5, borderRadius: 3,
              background: i === idx ? 'var(--accent)' : 'var(--border2)',
              transition: 'all 0.3s', cursor: 'pointer', padding: 0, border: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Rankings: tabbed by audience, 4 ranking lists per tab (zongheng-style) ────
function readsToInt(s) {
  return parseInt(String(s || '0').replace(/\D/g, '')) || 0;
}

const RANK_TABS = [
  { key: 'male',   label: 'Toàn site nam',    icon: '⚔️', accent: '#3B82F6',
    genres: ['Tiên hiệp', 'Huyền huyễn', 'Đô thị', 'Lịch sử', 'Khoa huyễn', 'Võ hiệp',
             'Quân sự', 'Tu chân', 'Tinh tế', 'Kiếm hiệp', 'Mạt thế', 'Dị giới'] },
  { key: 'female', label: 'Toàn site nữ',     icon: '💕', accent: '#EC4899',
    genres: ['Ngôn tình', 'Cổ trang', 'Cổ đại', 'Đam mỹ', 'Sủng', 'Nữ cường',
             'Ngược', 'Trùng sinh', 'Xuyên không', 'Xuyên Nhanh'] },
  { key: 'niche',  label: 'Đặc biệt / Khác',   icon: '✨', accent: '#A855F7',
    genres: ['Trinh thám', 'Kinh dị', 'Linh dị', 'Game', 'Mạng du', 'Hệ thống',
             'Đồng nhân', 'Hài hước', 'Kỳ huyễn', 'Ma pháp', 'Phương Tây', 'Khác'] },
];

const RANKING_DEFS = [
  { key: 'bestseller', label: 'BXH 24h',       sub: 'Hot 24h',         metric: 'reads' },
  { key: 'clicks',     label: 'Lượt click',    sub: 'Tuần này',        metric: 'reads' },
  { key: 'recommend',  label: 'Đề cử',         sub: 'Đánh giá cao',    metric: 'rating' },
  { key: 'channel',    label: 'BXH kênh',      sub: 'Top thể loại',    metric: 'reads' },
];

const MEDAL_STYLES = [
  { bg: 'linear-gradient(135deg,#FFD700,#F59E0B)', text: '#7C2D12' }, // 1: gold
  { bg: 'linear-gradient(135deg,#CBD5E1,#94A3B8)', text: '#1E293B' }, // 2: silver
  { bg: 'linear-gradient(135deg,#D97706,#92400E)', text: '#FEF3C7' }, // 3: bronze
];

function LaurelWreath({ color = 'var(--accent)' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 4 C 4 8, 4 14, 8 18 L 8 20 M 18 4 C 20 8, 20 14, 16 18 L 16 20 M 8 20 L 16 20"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="6" cy="8"  r="1.4" fill={color} />
      <circle cx="6" cy="13" r="1.4" fill={color} />
      <circle cx="18" cy="8"  r="1.4" fill={color} />
      <circle cx="18" cy="13" r="1.4" fill={color} />
    </svg>
  );
}

function RankingColumns({ books, onNavigate, isMobile }) {
  const [tab, setTab] = useState('male');

  const filtered = useMemo(() => {
    const t = RANK_TABS.find(x => x.key === tab) || RANK_TABS[0];
    const set = new Set(t.genres);
    const inSet = books.filter(b => set.has(pickGenre(b.genre)));
    // Fallback: if filter empty, use all books so UI still shows
    return inSet.length > 0 ? inSet : books;
  }, [books, tab]);

  const ranks = useMemo(() => {
    const byReads = [...filtered].sort((a, b) => readsToInt(b.reads) - readsToInt(a.reads));
    const byRating = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    const byNew = [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    return {
      bestseller: byReads.slice(0, 6),
      clicks:     byReads.slice(0, 6),
      recommend:  byRating.slice(0, 6),
      channel:    byNew.slice(0, 6),
    };
  }, [filtered]);

  if (books.length === 0) return null;

  const tabMeta = RANK_TABS.find(x => x.key === tab) || RANK_TABS[0];
  const cols = isMobile ? 2 : 4;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
            Bảng xếp hạng tổng
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            Top truyện hot · Phân theo độ tuổi & sở thích
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 18,
        borderBottom: '2px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {RANK_TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 18px', fontSize: 14, fontWeight: 700,
                background: 'transparent', border: 'none',
                color: active ? t.accent : 'var(--text2)',
                cursor: 'pointer', position: 'relative',
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: -2,
                borderBottom: active ? `3px solid ${t.accent}` : '3px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: isMobile ? 12 : 16,
      }}>
        {RANKING_DEFS.map(def => {
          const list = ranks[def.key] || [];
          const top1 = list[0];
          const rest = list.slice(1, 6);
          return (
            <div key={def.key} style={{
              background: 'var(--surface)', borderRadius: 14,
              padding: '14px 12px 12px', border: '1px solid var(--border)',
              minWidth: 0,
            }}>
              {/* Header with laurel wreath */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginBottom: 12, paddingBottom: 10,
                borderBottom: `2px solid ${tabMeta.accent}33`,
              }}>
                <LaurelWreath color={tabMeta.accent} />
                <div style={{ textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.2, color: tabMeta.accent }}>
                    {def.label}
                  </div>
                </div>
                <LaurelWreath color={tabMeta.accent} />
              </div>

              {/* Top 1 with cover */}
              {top1 && (
                <div
                  onClick={() => onNavigate('detail', top1)}
                  style={{
                    display: 'flex', gap: 10, padding: '8px 6px 10px',
                    borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                    background: `${tabMeta.accent}0C`,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${tabMeta.accent}1A`}
                  onMouseLeave={e => e.currentTarget.style.background = `${tabMeta.accent}0C`}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <BookCover book={top1} width={42} radius={5} noEffect />
                    <span style={{
                      position: 'absolute', top: -4, left: -4,
                      width: 18, height: 18, borderRadius: 5,
                      background: MEDAL_STYLES[0].bg, color: MEDAL_STYLES[0].text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900,
                      boxShadow: '0 2px 6px rgba(245,158,11,0.4)',
                    }}>1</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {top1.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {top1.author || 'Không rõ'}
                    </div>
                    <div style={{ fontSize: 10, color: tabMeta.accent, fontWeight: 700, marginTop: 2 }}>
                      {def.metric === 'rating'
                        ? `⭐ ${(top1.rating ?? 0).toFixed(1)}`
                        : `${top1.reads || '0'} đọc`}
                    </div>
                  </div>
                </div>
              )}

              {/* Rest 2-6 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rest.map((b, i) => {
                  const rank = i + 2; // 2..6
                  const isMedal = rank <= 3;
                  const medal = MEDAL_STYLES[rank - 1];
                  return (
                    <div
                      key={b.id}
                      onClick={() => onNavigate('detail', b)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', padding: '4px 4px',
                        borderRadius: 5, transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 900,
                        background: isMedal ? medal.bg : 'var(--surface2)',
                        color: isMedal ? medal.text : 'var(--text3)',
                      }}>
                        {rank}
                      </span>
                      <span style={{
                        flex: 1, fontSize: 12, color: 'var(--text2)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        lineHeight: 1.6,
                      }}>
                        {b.title}
                      </span>
                      {def.metric === 'rating' && (
                        <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>
                          {(b.rating ?? 0).toFixed(1)}
                        </span>
                      )}
                    </div>
                  );
                })}
                {list.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', padding: '8px 0', textAlign: 'center' }}>
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Channels: group by audience (male/female/niche) ──────────────────────────
const CHANNELS = [
  {
    key: 'male', label: 'Kênh Nam', icon: '⚔️', accent: '#3B82F6',
    genres: ['Tiên hiệp', 'Huyền huyễn', 'Đô thị', 'Lịch sử', 'Khoa huyễn', 'Võ hiệp'],
  },
  {
    key: 'female', label: 'Kênh Nữ', icon: '💕', accent: '#EC4899',
    genres: ['Ngôn tình', 'Cổ trang', 'Đam mỹ', 'Hệ thống'],
  },
  {
    key: 'niche', label: 'Kênh đặc biệt', icon: '✨', accent: '#A855F7',
    genres: ['Trinh thám', 'Kinh dị', 'Game', 'Khác'],
  },
];

function ChannelSection({ channel, books, onNavigate, isMobile }) {
  const byGenre = useMemo(() => {
    const m = {};
    books.forEach(b => {
      const g = pickGenre(b.genre);
      if (!m[g]) m[g] = [];
      m[g].push(b);
    });
    return m;
  }, [books]);

  const activeGenres = channel.genres.filter(g => byGenre[g]?.length > 0);
  if (activeGenres.length === 0) return null;

  const cols = isMobile ? 2 : Math.min(4, activeGenres.length);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, paddingBottom: 12,
        borderBottom: `2px solid ${channel.accent}`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${channel.accent}22`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>{channel.icon}</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, fontFamily: 'var(--font-display)' }}>
          {channel.label}
        </h2>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>
          {activeGenres.length} thể loại
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 12 : 18 }}>
        {activeGenres.slice(0, cols * 2).map(g => {
          const meta = GENRE_META[g] || { icon: '📖', prefix: g.slice(0, 4) };
          const items = byGenre[g].slice(0, 5);
          return (
            <div key={g} style={{
              background: 'var(--surface)', borderRadius: 12,
              padding: '12px 12px', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g}</span>
                <span style={{ fontSize: 16, flexShrink: 0, marginLeft: 6 }}>{meta.icon}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map(b => (
                  <div
                    key={b.id}
                    onClick={() => onNavigate('detail', b)}
                    style={{ display: 'flex', gap: 6, alignItems: 'baseline', cursor: 'pointer', padding: '2px 0' }}
                  >
                    <span style={{ fontSize: 10, color: channel.accent, fontWeight: 700, flexShrink: 0, minWidth: 32 }}>
                      {meta.prefix}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                      {b.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const GENRE_META = {
  'Tiên hiệp':       { icon: '⛩️', sub: 'Tu tiên / Phi thăng',        prefix: 'Tiên' },
  'Huyền huyễn':     { icon: '🐉', sub: 'Phong vân thiên hạ',         prefix: 'Huyễn' },
  'Đô thị':          { icon: '🌆', sub: 'Hiện đại / Đời sống',         prefix: 'Đô' },
  'Lịch sử':         { icon: '🏛️', sub: 'Cổ đại / Cung đấu',           prefix: 'Sử' },
  'Khoa huyễn':      { icon: '🛸', sub: 'Sci-fi / Tinh tế',            prefix: 'Khoa' },
  'Ngôn tình':       { icon: '💞', sub: 'Tình cảm lãng mạn',           prefix: 'Tình' },
  'Game':            { icon: '🕹️', sub: 'Mạng du / Esports',           prefix: 'Game' },
  'Trinh thám':      { icon: '🕵️', sub: 'Bí ẩn / Phá án',              prefix: 'Trinh' },
  'Kinh dị':         { icon: '👻', sub: 'Khủng bố / Siêu nhiên',       prefix: 'Kinh' },
  'Võ hiệp':         { icon: '🥋', sub: 'Giang hồ võ lâm',             prefix: 'Hiệp' },
  'Đam mỹ':          { icon: '🌈', sub: 'BL / Đồng tính nam',           prefix: 'Đam' },
  'Hệ thống':        { icon: '⚙️', sub: 'Game-like RPG',                prefix: 'Hệ' },
  'Cổ đại':          { icon: '🏯', sub: 'Triều đình / Cổ trang',       prefix: 'Cổ' },
  'Cổ trang':        { icon: '🪭', sub: 'Phong cách cổ trang',          prefix: 'Cổ' },
  'Xuyên không':     { icon: '⏳', sub: 'Du hành thời không',           prefix: 'Xuyên' },
  'Xuyên Nhanh':     { icon: '🌀', sub: 'Xuyên qua nhiều thế giới',     prefix: 'Nhanh' },
  'Trùng sinh':      { icon: '🔄', sub: 'Sống lại / Báo thù',           prefix: 'Trùng' },
  'Mạt thế':         { icon: '☢️', sub: 'Tận thế / Sinh tồn',           prefix: 'Mạt' },
  'Linh dị':         { icon: '🔮', sub: 'Tâm linh / Huyền bí',          prefix: 'Linh' },
  'Quân sự':         { icon: '🪖', sub: 'Chiến tranh / Quân đội',       prefix: 'Quân' },
  'Sủng':            { icon: '🌹', sub: 'Ngọt ngào / Cưng chiều',       prefix: 'Sủng' },
  'Dị giới':         { icon: '🌌', sub: 'Thế giới khác',                 prefix: 'Dị' },
  'Mạng du':         { icon: '🎮', sub: 'MMORPG / Game online',         prefix: 'Mạng' },
  'Nữ cường':        { icon: '👸', sub: 'Nữ chính mạnh mẽ',              prefix: 'Nữ' },
  'Đồng nhân':       { icon: '✨', sub: 'Fanfic / Ngoại truyện',         prefix: 'Đồng' },
  'Ngược':           { icon: '💔', sub: 'Bi kịch / Tổn thương',          prefix: 'Ngược' },
  'Hài hước':        { icon: '😂', sub: 'Hài / Vui nhộn',               prefix: 'Hài' },
  'Trọng sinh':      { icon: '♻️', sub: 'Tái sinh / Đầu thai',          prefix: 'Trọng' },
  'Phương Tây':      { icon: '🏰', sub: 'Lâu đài / Trung cổ',           prefix: 'Tây' },
  'Tu chân':         { icon: '🧘', sub: 'Tu luyện / Đạo gia',           prefix: 'Tu' },
  'Tinh tế':         { icon: '🪐', sub: 'Vũ trụ / Hành tinh',           prefix: 'Tinh' },
  'Kiếm hiệp':       { icon: '⚔️', sub: 'Kiếm khách / Giang hồ',        prefix: 'Kiếm' },
  'Kỳ huyễn':        { icon: '🧚', sub: 'Tiên cảnh / Kỳ ảo',            prefix: 'Kỳ' },
  'Ma pháp':         { icon: '🪄', sub: 'Phép thuật / Pháp sư',         prefix: 'Ma' },
  'Khác':            { icon: '📖', sub: 'Thể loại khác',                  prefix: 'Khác' },
};

// Build case-insensitive lookup map: 'tiên hiệp' → 'Tiên hiệp'
const GENRE_LOOKUP = Object.keys(GENRE_META).reduce((m, k) => {
  m[k.toLowerCase().trim()] = k;
  return m;
}, {});

// Normalize a book.genre string to a canonical GENRE_META key.
// Splits multi-genre strings (e.g. "Đam Mỹ, Hệ Thống, Xuyên Nhanh") and picks first known match.
function pickGenre(rawGenre) {
  if (!rawGenre) return 'Khác';
  const parts = String(rawGenre).split(/[,;|/]+/).map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    const hit = GENRE_LOOKUP[p.toLowerCase()];
    if (hit) return hit;
  }
  return 'Khác';
}

function GenreColumns({ books, onNavigate, isMobile }) {
  const byGenre = useMemo(() => {
    const m = {};
    books.forEach(b => {
      const g = pickGenre(b.genre);
      if (!m[g]) m[g] = [];
      m[g].push(b);
    });
    return m;
  }, [books]);

  const orderedGenres = useMemo(() => {
    const known = Object.keys(GENRE_META).filter(g => byGenre[g]?.length);
    const others = Object.keys(byGenre).filter(g => !GENRE_META[g] && byGenre[g]?.length);
    return [...known, ...others].slice(0, isMobile ? 4 : 8);
  }, [byGenre, isMobile]);

  if (orderedGenres.length === 0) return null;

  const cols = isMobile ? 2 : 4;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
            Khám phá theo thể loại
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {orderedGenres.length} thể loại nổi bật · Truyện hot mỗi danh mục
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 16 : 24 }}>
        {orderedGenres.map(g => {
          const meta = GENRE_META[g] || { icon: '📖', sub: '', prefix: g.slice(0, 4) };
          const items = byGenre[g].slice(0, 5);
          return (
            <div key={g} style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 14px', border: '1px solid var(--border)', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1.5px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <div onClick={() => onNavigate('home', null, null, g)} style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.3, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g}
                  </div>
                  {meta.sub && (
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {meta.sub}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 22, flexShrink: 0, marginLeft: 6 }}>{meta.icon}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(b => (
                  <div
                    key={b.id}
                    onClick={() => onNavigate('detail', b)}
                    style={{ display: 'flex', gap: 6, alignItems: 'baseline', cursor: 'pointer', transition: 'color 0.12s' }}
                    onMouseEnter={e => e.currentTarget.querySelector('.title').style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.querySelector('.title').style.color = 'var(--text2)'}
                  >
                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, flexShrink: 0, minWidth: 36 }}>
                      {meta.prefix}
                    </span>
                    <span className="title" style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                      {b.title}
                    </span>
                  </div>
                ))}
                {items.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>Chưa có truyện</div>
                )}
              </div>
            </div>
          );
        })}
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

  // ── Pagination state ──
  const [pagedBooks, setPagedBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [sortBy, setSortBy] = useState('read_count');
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const featuredBooks = books.slice(0, 10);
  const [slideIdx, setSlideIdx] = useState(0);
  const [animPhase, setAnimPhase] = useState('idle');

  const isTienHiep = (book) =>
    book?.genre?.toLowerCase().includes('tiên hiệp') ||
    book?.tags?.some(t => t.toLowerCase().includes('tiên hiệp'));

  const startTimer = () => {
    clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setAnimPhase('exit');
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % Math.max(featuredBooks.length, 1));
        setAnimPhase('enter');
        setTimeout(() => setAnimPhase('idle'), 420);
      }, 340);
    }, 4500);
  };

  useEffect(() => {
    if (featuredBooks.length <= 1) return;
    startTimer();
    return () => clearInterval(slideTimer.current);
  }, [featuredBooks.length]);

  const goSlide = (newIdx) => {
    clearInterval(slideTimer.current);
    setAnimPhase('exit');
    setTimeout(() => {
      setSlideIdx(newIdx);
      setAnimPhase('enter');
      setTimeout(() => { setAnimPhase('idle'); startTimer(); }, 420);
    }, 340);
  };

  const featured = featuredBooks[slideIdx] ?? featuredBooks[0];

  // ── Fetch paginated books from server ──
  useEffect(() => {
    if (search.trim()) return; // search mode — skip paged fetch
    setLoadingBooks(true);
    api.getBooksPaged({ page, pageSize, genre, sortBy })
      .then(res => {
        if (Array.isArray(res)) {
          setPagedBooks(res);
          setTotalPages(1);
          setTotalBooks(res.length);
        } else {
          const pg = res.pagination ?? {};
          setPagedBooks(res.data ?? res.books ?? []);
          setTotalPages(pg.total_pages ?? res.total_pages ?? 1);
          setTotalBooks(pg.total ?? res.total ?? 0);
        }
      })
      .catch(() => {
        // Fallback: filter from App-level books if API not yet paginated
        const norm = genre.toLowerCase().trim();
        const all = genre === 'Tất cả'
          ? books
          : books.filter(b => String(b.genre || '').toLowerCase().includes(norm));
        const start = (page - 1) * pageSize;
        setPagedBooks(all.slice(start, start + pageSize));
        setTotalPages(Math.ceil(all.length / pageSize));
        setTotalBooks(all.length);
      })
      .finally(() => setLoadingBooks(false));
  }, [page, pageSize, genre, search, books]);

  // Reset to page 1 when genre, pageSize, or sortBy changes
  useEffect(() => { setPage(1); }, [genre, pageSize, sortBy]);

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

              {/* Slide content — exit: slide left + fade out | enter: slide from right + fade in */}
              <style>{`
                @keyframes slideExitLeft {
                  from { transform: translateX(0);    opacity: 1; }
                  to   { transform: translateX(-90px); opacity: 0; }
                }
                @keyframes slideEnterRight {
                  from { transform: translateX(90px);  opacity: 0; }
                  to   { transform: translateX(0);     opacity: 1; }
                }
              `}</style>
              <div style={{
                animation: animPhase === 'exit'  ? 'slideExitLeft   0.34s cubic-bezier(0.4,0,1,1)   forwards' :
                           animPhase === 'enter' ? 'slideEnterRight 0.42s cubic-bezier(0,0,0.2,1)   forwards' : 'none',
                minHeight: isMobile ? 130 : 240,
              }}>
                {isMobile ? (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <BookCover book={featured} width={90} radius={12} noEffect />
                      {isTienHiep(featured) && (
                        <div style={{ position: 'absolute', inset: -3, borderRadius: 14, border: '2px solid rgba(255,215,0,0.7)', boxShadow: '0 0 12px rgba(255,215,0,0.5)', pointerEvents: 'none', animation: 'goldShimmer 1.8s ease-in-out infinite' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'nowrap', overflow: 'hidden', height: 22 }}>
                        {featured.tags.slice(0,2).map(t => <Pill key={t} label={t} />)}
                      </div>
                      <h2 style={{
                        fontSize: 20, fontWeight: 800, color: 'white',
                        letterSpacing: -0.8, lineHeight: 1.2,
                        fontFamily: 'var(--font-display)', marginBottom: 10,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', height: 48,
                      }}>
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
                    <div style={{ flex: 1, paddingTop: 8, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'nowrap', overflow: 'hidden', height: 24 }}>
                        {featured.tags.slice(0, 4).map(t => <Pill key={t} label={t} />)}
                      </div>
                      <h2 style={{
                        fontSize: 36, fontWeight: 800, color: 'white',
                        letterSpacing: -1.5, lineHeight: 1.1,
                        fontFamily: 'var(--font-display)', marginBottom: 10,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', height: 80,
                      }}>
                        {featured.title}
                      </h2>
                      <p style={{
                        fontSize: 14, color: 'rgba(255,255,255,0.65)',
                        lineHeight: 1.7, marginBottom: 16, maxWidth: 440,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', height: 48,
                      }}>
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

      {/* Body: [genre filter + content] + [Ad column] */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Quick genre filter — always visible */}
          <div style={{
            padding: `0 ${isMobile ? 16 : 32}px`,
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
          <div style={{ padding: isMobile ? '20px 16px' : '32px 32px' }}>
            {search ? (
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
              {/* Zongheng-style discovery sections — only on "Tất cả" view */}
              {genre === 'Tất cả' && books.length > 0 && (
                <>
                  {/* Row 1: HotWorks sidebar + Rankings (4 columns) */}
                  <div style={{
                    display: 'flex', gap: isMobile ? 16 : 24,
                    marginBottom: 32,
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0 }}>
                      <HotWorksCarousel books={books} onNavigate={onNavigate} isMobile={isMobile} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <RankingColumns books={books} onNavigate={onNavigate} isMobile={isMobile} />
                    </div>
                  </div>

                  {/* Row 2: Genre columns (general discovery, all genres) */}
                  <GenreColumns books={books} onNavigate={onNavigate} isMobile={isMobile} />
                </>
              )}

              {/* Toolbar: title + sort + page size */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
                    {genre === 'Tất cả' ? 'Tất cả truyện' : genre}
                  </h2>
                  {totalBooks > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {totalBooks} truyện · Trang {page}/{totalPages}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', cursor: 'pointer' }}
                  >
                    <option value="read_count">Lượt đọc</option>
                    <option value="rating">Đánh giá</option>
                    <option value="chapter_count">Số chương</option>
                    <option value="title">Tên A-Z</option>
                  </select>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', cursor: 'pointer' }}
                  >
                    {PAGE_SIZE_OPTIONS.map(n => (
                      <option key={n} value={n}>{n} / trang</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                {loadingBooks ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                    <div style={{ fontSize: 13 }}>Đang tải...</div>
                  </div>
                ) : pagedBooks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                    <div style={{ fontSize: 14 }}>Chưa có truyện thể loại này</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(140px, 1fr))', gap: isMobile ? 0 : 20 }}>
                      {pagedBooks.map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate} />)}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                          style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
                        >«</button>
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
                        >‹ Trước</button>

                        {/* Page number pills */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                          .reduce((acc, n, idx, arr) => {
                            if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                            acc.push(n);
                            return acc;
                          }, [])
                          .map((n, i) => n === '...' ? (
                            <span key={`ellipsis-${i}`} style={{ fontSize: 12, color: 'var(--text3)', padding: '0 4px' }}>…</span>
                          ) : (
                            <button
                              key={n}
                              onClick={() => setPage(n)}
                              style={{
                                width: 34, height: 34, borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: page === n ? 'var(--accent)' : 'var(--surface2)',
                                border: page === n ? 'none' : '1px solid var(--border2)',
                                color: page === n ? 'white' : 'var(--text2)',
                                cursor: 'pointer',
                              }}
                            >{n}</button>
                          ))
                        }

                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
                        >Sau ›</button>
                        <button
                          onClick={() => setPage(totalPages)}
                          disabled={page === totalPages}
                          style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
                        >»</button>
                      </div>
                    )}

                    {/* Page info */}
                    {totalPages > 1 && (
                      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
                        Trang {page} / {totalPages} · {totalBooks} truyện
                      </div>
                    )}
                  </>
                )}
              </div>
              </>
            )}
          </div>
        </div>

        {/* Right ad column — desktop only */}
        {!isMobile && (
          <div style={{
            width: 160, flexShrink: 0,
            position: 'sticky', top: 0,
            height: 'calc(100vh - 0px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '20px 8px', gap: 12,
            borderLeft: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <div style={{
              width: 140, minHeight: 600, borderRadius: 10,
              background: 'var(--surface2)',
              border: '1px dashed var(--border2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>Quảng cáo</span>
              {/* Thay bằng AdBanner khi có AdSense ID:
              <AdBanner adClient="ca-pub-XXXXXXXX" adSlot="XXXXXXXX" width={140} height={600} />
              */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
