import { useState, useEffect } from 'react';
import { Icons } from '../components/Icons.jsx';
import BookCover from '../components/BookCover.jsx';
import { Pill, StarRating, Btn } from '../components/shared.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

// Strip markdown link [text](url) → text
function stripMarkdownLink(title = '') {
  return title.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}

export default function DetailScreen({ book, onNavigate, onBack, isSaved=false, onToggleSave, readProgress={} }) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('chapters');
  const [chapters, setChapters] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const lastChapterIdx = readProgress[book.id] ?? null;
  const px = isMobile ? 16 : 48;

  const sortedChapters = sortAsc ? chapters : [...chapters].reverse();

  useEffect(() => {
    api.getChapters(book.id).then(data => setChapters(data.chapters ?? [])).catch(console.error);
  }, [book.id]);

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom:40 }}>
      {/* Hero */}
      <div style={{
        position:'relative', overflow:'hidden',
        background:`linear-gradient(135deg, ${book.c1}22, ${book.c2}11)`,
        borderBottom:'1px solid var(--border)', padding: isMobile ? '20px 16px 24px' : '36px 48px 40px',
      }}>
        <div className="mesh-orb" style={{ width:300,height:300,top:-100,right:-60,background:book.c2,opacity:0.15 }}/>

        <button onClick={onBack} style={{
          display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
          borderRadius:8, background:'var(--surface)', border:'1.5px solid var(--border2)',
          fontSize:13, fontWeight:600, color:'var(--text2)', cursor:'pointer',
          marginBottom: isMobile ? 16 : 28, boxShadow:'var(--shadow-xs)',
        }}>
          {Icons.back(14)} Quay lại
        </button>

        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 36, alignItems:'flex-start' }}>
          {isMobile ? (
            <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <BookCover book={book} width={100} radius={14}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                  {book.tags.slice(0,2).map(t=><Pill key={t} label={t}/>)}
                </div>
                <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:-0.8, lineHeight:1.2, fontFamily:'var(--font-display)', marginBottom:6 }}>{book.title}</h1>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:8 }}>bởi <strong>{book.author}</strong></div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <StarRating rating={book.rating} size={13}/>
                  <span style={{ fontSize:12, color:'var(--text2)' }}>📖 {book.chapters} ch</span>
                </div>
              </div>
            </div>
          ) : (
            <BookCover book={book} width={160} radius={18}/>
          )}
          <div style={{ flex:1, paddingTop: isMobile ? 0 : 4 }}>
            {!isMobile && <>
              {/* Tags */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {book.tags.map(t=><Pill key={t} label={t}/>)}
              </div>
              {/* Title */}
              <h1 style={{ fontSize:38, fontWeight:800, letterSpacing:-1.5, lineHeight:1.1, fontFamily:'var(--font-display)', marginBottom:10 }}>{book.title}</h1>
              {/* Author */}
              <div style={{ fontSize:14, color:'var(--text2)', marginBottom:10 }}>
                bởi <strong style={{ color:'var(--text)' }}>{book.author}</strong>
              </div>
              {/* Genre pills */}
              {book.genre && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
                  <span style={{ fontSize:12, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6 }}>Thể loại:</span>
                  {book.genre.split(',').map(g => g.trim()).filter(Boolean).map(g => (
                    <span key={g} style={{ padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, background:'var(--surface2)', color:'var(--text2)', border:'1px solid var(--border2)' }}>{g}</span>
                  ))}
                </div>
              )}
              {/* Stats */}
              <div style={{ display:'flex', gap:24, marginBottom:18 }}>
                <StarRating rating={book.rating} size={14}/>
                <span style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>📖 {book.chapters} chương</span>
                <span style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>👁 {book.reads} lượt đọc</span>
                <span style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>📝 {book.words} từ</span>
              </div>
            </>}
            {/* Description */}
            {book.desc && (
              <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                {!isMobile && <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>Tóm tắt</div>}
                <p style={{ fontSize:13, lineHeight:1.7, color:'var(--text2)', margin:0 }}>{book.desc.slice(0, isMobile ? 120 : 9999)}{isMobile && '...'}</p>
              </div>
            )}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <Btn size={isMobile ? 'md' : 'lg'} onClick={()=>onNavigate('reader',book)}>
                {Icons.play(15)} {lastChapterIdx !== null ? 'Đọc tiếp' : 'Bắt đầu đọc'}
              </Btn>
              <Btn size={isMobile ? 'md' : 'lg'} variant="secondary" onClick={()=>onNavigate('audiobook',book)}>
                {Icons.headphones(15)} Audiobook
              </Btn>
              <Btn size={isMobile ? 'md' : 'lg'} variant="ghost" onClick={onToggleSave}>
                {Icons.bookmark(15)} {isSaved ? 'Đã lưu' : 'Lưu'}
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:`0 ${px}px`, borderBottom:'1px solid var(--border)', display:'flex', gap:4 }}>
        {[['chapters','Danh sách chương'],['about','Giới thiệu']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding: isMobile ? '12px 16px' : '16px 20px', fontSize:14, fontWeight:600, cursor:'pointer',
            color: tab===k?'var(--accent)':'var(--text2)',
            borderBottom: tab===k?'2px solid var(--accent)':'2px solid transparent',
            marginBottom:-1, background:'none', transition:'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: isMobile ? '16px 16px' : '24px 48px' }}>
        {tab==='about' ? (
          <div style={{ maxWidth:640 }}>
            {book.desc && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>Tóm tắt</div>
                <p style={{ fontSize:15, lineHeight:1.85, color:'var(--text2)', margin:0 }}>{book.desc}</p>
              </div>
            )}
            <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, marginBottom:12 }}>Thông tin</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                ['Thể loại', book.genre || '—'],
                ['Số chương', book.chapters],
                ['Tổng từ', book.words],
                ['Lượt đọc', book.reads],
                ['Cập nhật', book.updated],
                ['Trạng thái', book.status || (book.tags.includes('Hoàn thành') ? 'Hoàn thành' : 'Đang ra')],
              ].map(([k,v])=>(
                <div key={k} style={{ background:'var(--surface)', borderRadius:12, padding:'14px 18px', border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:15, fontWeight:700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth:680 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, alignItems:'center' }}>
              <span style={{ fontSize:13, color:'var(--text3)' }}>{chapters.length} chương</span>
              <Btn size="sm" variant="secondary" onClick={() => setSortAsc(v => !v)}>
                Sắp xếp {sortAsc ? '↑' : '↓'}
              </Btn>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {sortedChapters.map((ch, i) => {
                const realIdx = sortAsc ? i : chapters.length - 1 - i;
                const isLast = realIdx === lastChapterIdx;
                const cleanTitle = stripMarkdownLink(ch.title);
                return (
                  <div key={ch.id} onClick={() => onNavigate('reader', book, realIdx)} style={{
                    display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
                    borderRadius:10, cursor:'pointer', transition:'all 0.15s',
                    background: isLast?'var(--accent-bg)':'transparent',
                    border: isLast?'1px solid var(--accent-border)':'1px solid transparent',
                  }}
                  onMouseEnter={e=>{ if(!isLast) e.currentTarget.style.background='var(--surface2)'; }}
                  onMouseLeave={e=>{ if(!isLast) e.currentTarget.style.background='transparent'; }}
                  >
                    <div style={{
                      width:32, height:32, borderRadius:8, flexShrink:0,
                      background: isLast?'var(--accent)':'var(--surface2)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:700, color: isLast?'white':'var(--text3)',
                    }}>{isLast ? '▶' : ch.chapterNumber}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:2 }}>Chương {ch.chapterNumber}</div>
                      <div style={{ fontSize:14, fontWeight:isLast?600:500, color:!ch.free&&realIdx>=15?'var(--text3)':'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cleanTitle}</div>
                      {ch.viewCount > 0 && (
                        <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>👁 {ch.viewCount.toLocaleString()} lượt đọc</div>
                      )}
                    </div>
                    {isLast && <span style={{ fontSize:11, fontWeight:600, color:'var(--accent)', whiteSpace:'nowrap' }}>Đang đọc</span>}
                    {!ch.free && realIdx>=15 && <span style={{ fontSize:12, color:'var(--text3)' }}>{Icons.lock(14)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
