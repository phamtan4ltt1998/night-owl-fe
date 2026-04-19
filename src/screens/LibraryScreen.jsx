import { useState } from 'react';
import BookCover from '../components/BookCover.jsx';
import { Pill, Btn, BookCard } from '../components/shared.jsx';

export default function LibraryScreen({ onNavigate, books = [] }) {
  const [tab, setTab] = useState('reading');

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom:40 }}>
      <div style={{ padding:'36px 48px 0', borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
        <h1 style={{ fontSize:34, fontWeight:800, letterSpacing:-1, fontFamily:'var(--font-display)', marginBottom:20 }}>Thư viện</h1>
        <div style={{ display:'flex', gap:4 }}>
          {[['reading','Đang đọc'],['saved','Đã lưu'],['finished','Hoàn thành']].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              padding:'12px 20px', fontSize:14, fontWeight:600, cursor:'pointer', background:'none',
              color: tab===k?'var(--accent)':'var(--text2)',
              borderBottom: tab===k?'2px solid var(--accent)':'2px solid transparent',
              marginBottom:-1, transition:'all 0.2s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:'28px 48px' }}>
        {tab==='reading' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
            {books.slice(0,4).map((b,i)=>(
              <div key={b.id} onClick={()=>onNavigate('detail',b)} style={{
                display:'flex', gap:20, background:'var(--surface)', borderRadius:16,
                border:'1px solid var(--border)', padding:'20px 24px', cursor:'pointer',
                boxShadow:'var(--shadow-sm)', transition:'all 0.2s',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateX(4px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateX(0)'; }}
              >
                <div style={{ width:6, borderRadius:4, background:`linear-gradient(180deg, ${b.c1}, ${b.c2})`, flexShrink:0 }}/>
                <BookCover book={b} width={64} radius={10}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                    {b.tags.slice(0,2).map(t=><Pill key={t} label={t}/>)}
                  </div>
                  <div style={{ fontSize:17, fontWeight:800, letterSpacing:-0.4, fontFamily:'var(--font-display)', marginBottom:4 }}>{b.title}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', marginBottom:10 }}>{b.author} · {b.lastChapter}</div>
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginBottom:6 }}>
                      <span>Tiến độ đọc</span>
                      <span style={{ fontWeight:600 }}>{15+i*17}%</span>
                    </div>
                    <div style={{ height:4, background:'var(--surface3)', borderRadius:2 }}>
                      <div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg, ${b.c1}, ${b.c2})`, width:`${15+i*17}%` }}/>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', justifyContent:'center' }}>
                  <Btn size="sm" onClick={e=>{e.stopPropagation();onNavigate('reader',b);}}>Đọc tiếp</Btn>
                  <Btn size="sm" variant="secondary" onClick={e=>{e.stopPropagation();onNavigate('audiobook',b);}}>🎧 Audio</Btn>
                  <span style={{ fontSize:10, color:'var(--text3)' }}>{b.updated}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='saved' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:20 }}>
            {books.slice(0,7).map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate}/>)}
          </div>
        )}

        {tab==='finished' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:20 }}>
            {books.filter(b=>b.tags.includes('Hoàn thành')).map(b => <BookCard key={b.id} book={b} onNavigate={onNavigate}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
