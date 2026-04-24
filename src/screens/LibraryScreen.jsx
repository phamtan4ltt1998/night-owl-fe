import { useState } from 'react';
import BookCover from '../components/BookCover.jsx';
import { Pill, Btn, BookCard } from '../components/shared.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';

const PREVIEW_COUNT = 5;

function ReadingList({ books, readProgress, onNavigate, showAll }) {
  const inProgress = books.filter(b => readProgress[b.id] != null);
  const displayed = showAll ? inProgress : inProgress.slice(0, PREVIEW_COUNT);

  if (inProgress.length === 0) {
    return (
      <p style={{ color:'var(--text3)', textAlign:'center', marginTop:40 }}>Chưa có truyện đang đọc.</p>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {displayed.map(b => {
        const pct = b.chapters > 0 ? Math.round(((readProgress[b.id] ?? 0) + 1) / b.chapters * 100) : 0;
        return (
          <div key={b.id} onClick={() => onNavigate('detail', b)} style={{
            display:'flex', gap:16, background:'var(--surface)', borderRadius:14,
            border:'1px solid var(--border)', padding:'16px 20px', cursor:'pointer',
            boxShadow:'var(--shadow-sm)', transition:'all 0.2s', alignItems:'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateX(4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateX(0)'; }}
          >
            <div style={{ width:5, alignSelf:'stretch', borderRadius:4, background:`linear-gradient(180deg, ${b.c1}, ${b.c2})`, flexShrink:0 }}/>
            <BookCover book={b} width={56} radius={8} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:700, letterSpacing:-0.3, fontFamily:'var(--font-display)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>{b.author}</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1, height:3, background:'var(--surface3)', borderRadius:2 }}>
                  <div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg, ${b.c1}, ${b.c2})`, width:`${pct}%` }}/>
                </div>
                <span style={{ fontSize:10, color:'var(--text3)', whiteSpace:'nowrap', flexShrink:0 }}>
                  Ch.{(readProgress[b.id] ?? 0) + 1} · {pct}%
                </span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', flexShrink:0 }}>
              <Btn size="sm" onClick={e => { e.stopPropagation(); onNavigate('reader', b); }}>Đọc tiếp</Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LibraryScreen({ onNavigate, books = [], savedBookIds = new Set(), readProgress = {} }) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('reading');
  const [showAllReading, setShowAllReading] = useState(false);
  const px = isMobile ? 16 : 48;

  const inProgressCount = books.filter(b => readProgress[b.id] != null).length;

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom:40 }}>
      <div style={{ padding:`${isMobile?20:36}px ${px}px 0`, borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
        <h1 style={{ fontSize:isMobile?26:34, fontWeight:800, letterSpacing:-1, fontFamily:'var(--font-display)', marginBottom:16 }}>Thư viện</h1>
        <div style={{ display:'flex', gap:4 }}>
          {[['reading','Đang đọc'],['saved','Đã lưu'],['finished','Hoàn thành']].map(([k,l])=>(
            <button key={k} onClick={() => setTab(k)} style={{
              padding: isMobile ? '10px 14px' : '12px 20px', fontSize:14, fontWeight:600, cursor:'pointer', background:'none',
              color: tab===k?'var(--accent)':'var(--text2)',
              borderBottom: tab===k?'2px solid var(--accent)':'2px solid transparent',
              marginBottom:-1, transition:'all 0.2s', whiteSpace:'nowrap',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:`${isMobile?16:28}px ${px}px` }}>
        {tab==='reading' && (
          <>
            <ReadingList
              books={books}
              readProgress={readProgress}
              onNavigate={onNavigate}
              showAll={showAllReading}
            />
            {inProgressCount > PREVIEW_COUNT && !showAllReading && (
              <div style={{ textAlign:'center', marginTop:20 }}>
                <button
                  onClick={() => setShowAllReading(true)}
                  style={{
                    padding:'10px 28px', borderRadius:10, fontSize:14, fontWeight:600,
                    background:'var(--surface2)', color:'var(--text2)',
                    border:'1.5px solid var(--border2)', cursor:'pointer',
                    transition:'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--accent-bg)'; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent-border)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.borderColor='var(--border2)'; }}
                >
                  Xem tất cả {inProgressCount} truyện đang đọc
                </button>
              </div>
            )}
          </>
        )}

        {tab==='saved' && (
          <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? 0 : 20 }}>
            {books.filter(b => savedBookIds.has(b.id)).length === 0
              ? <p style={{ color:'var(--text3)', gridColumn:'1/-1', textAlign:'center', marginTop:40 }}>Chưa lưu truyện nào.</p>
              : books.filter(b => savedBookIds.has(b.id)).map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate}/>)
            }
          </div>
        )}

        {tab==='finished' && (
          <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? 0 : 20 }}>
            {books.filter(b => b.tags.includes('Hoàn thành')).map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
