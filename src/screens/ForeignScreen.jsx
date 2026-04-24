import { useState } from 'react';
import { Icons } from '../components/Icons.jsx';
import { BookCard } from '../components/shared.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';

const FOREIGN_GENRES = ['Light Novel', 'Manga', 'Manhwa', 'Manhua', 'Nước ngoài', 'Korean', 'Japanese', 'Chinese', 'Dịch'];

function isForeign(book) {
  const genre = (book.genre || '').toLowerCase();
  const tags  = (book.tags || []).map(t => t.toLowerCase());
  return FOREIGN_GENRES.some(g => genre.includes(g.toLowerCase()) || tags.includes(g.toLowerCase()));
}

export default function ForeignScreen({ onNavigate, books = [] }) {
  const isMobile = useIsMobile();
  const px = isMobile ? 16 : 48;
  const [search, setSearch] = useState('');

  const foreignBooks = books.filter(isForeign);
  const displayed = search.trim()
    ? foreignBooks.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.author || '').toLowerCase().includes(search.toLowerCase())
      )
    : foreignBooks;

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: `${isMobile?20:36}px ${px}px ${isMobile?16:24}px`, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            {Icons.globe(22)}
          </div>
          <h1 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, letterSpacing: -1, fontFamily: 'var(--font-display)' }}>
            Truyện nước ngoài
          </h1>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
          {foreignBooks.length} truyện · Light novel, manga, manhwa và dịch thuật
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', display: 'flex' }}>
            {Icons.search(16)}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm trong truyện nước ngoài..."
            style={{
              width: '100%', padding: '10px 36px 10px 38px', borderRadius: 10, fontSize: 14,
              background: 'var(--surface2)', border: '1.5px solid var(--border2)',
              color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text3)', display: 'flex', padding: 2,
            }}>
              {Icons.close(14)}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: `${isMobile?16:28}px ${px}px` }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌏</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              {search ? 'Không tìm thấy truyện nào' : 'Chưa có truyện nước ngoài'}
            </div>
            <div style={{ fontSize: 13 }}>
              {search ? 'Thử từ khóa khác nhé' : 'Crawl thêm truyện Light Novel, Manhwa...'}
            </div>
          </div>
        ) : (
          <>
            {search && (
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
                {displayed.length} kết quả cho &ldquo;<strong>{search}</strong>&rdquo;
              </div>
            )}
            <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? 0 : 20 }}>
              {displayed.map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
