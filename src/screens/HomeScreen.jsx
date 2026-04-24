import { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Pill, StarRating, BookCard, Section } from '../components/shared.jsx';
import BookCover from '../components/BookCover.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

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
  const px = isMobile ? 16 : 48;

  const featured = books[0];

  // genre filter on local books list (no search active)
  const filtered = genre === 'Tất cả' ? books : books.filter(b => b.genre === genre);

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
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--grad-hero)', padding: isMobile ? '28px 16px 24px' : '52px 48px 48px' }}>
        <div className="mesh-orb" style={{ width: 500, height: 500, top: -150, right: -80, background: '#635BFF', opacity: 0.4 }} />
        <div className="mesh-orb" style={{ width: 300, height: 300, bottom: -100, left: 200, background: '#0EA5E9', opacity: 0.2 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: search ? 16 : (isMobile ? 20 : 32) }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
              {Icons.search(18)}
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm truyện, tác giả..."
              style={{
                width: '100%', padding: '13px 44px 13px 48px',
                borderRadius: 12, fontSize: isMobile ? 14 : 15,
                background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(20px)', outline: 'none',
                color: 'white', boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.6)', display: 'flex', padding: 4,
                  background: 'rgba(255,255,255,0.1)', borderRadius: 6,
                }}
              >
                {Icons.close(14)}
              </button>
            )}
          </div>

          {search ? (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {isSearching ? 'Đang tìm kiếm...' : `${searchResults.length} kết quả cho `}
              {!isSearching && <>&ldquo;<span style={{ color: 'var(--accent3)', fontWeight: 700 }}>{search}</span>&rdquo;</>}
            </div>
          ) : featured && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Nổi bật hôm nay</div>
              {isMobile ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <BookCover book={featured} width={90} radius={12} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                      {featured.tags.slice(0,2).map(t => <Pill key={t} label={t} />)}
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: -0.8, lineHeight: 1.2, fontFamily: 'var(--font-display)', marginBottom: 10 }}>
                      {featured.title}
                    </h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => onNavigate('reader', featured)} style={{
                        padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: 'white', color: 'var(--accent)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {Icons.play(13)} Đọc ngay
                      </button>
                      <button onClick={() => onNavigate('detail', featured)} style={{
                        padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}>Chi tiết</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  <BookCover book={featured} width={140} radius={16} />
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
                      <button onClick={() => onNavigate('reader', featured)} style={{
                        padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                        background: 'white', color: 'var(--accent)', cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        {Icons.play(14)} Đọc ngay
                      </button>
                      <button onClick={() => onNavigate('detail', featured)} style={{
                        padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                      }}>Xem chi tiết</button>
                    </div>
                  </div>
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
                <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? 0 : 20 }}>
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
