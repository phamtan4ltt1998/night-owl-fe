import { useState, useEffect } from 'react';
import { Icons } from '../components/Icons.jsx';
import BookCover from '../components/BookCover.jsx';
import { Pill, StarRating, Btn } from '../components/shared.jsx';
import { api } from '../api.js';

export default function DetailScreen({ book, onNavigate, onBack }) {
  const [tab, setTab] = useState('chapters');
  const [saved, setSaved] = useState(false);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    api.getChapters(book.id).then(setChapters).catch(console.error);
  }, [book.id]);

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom:40 }}>
      {/* Hero */}
      <div style={{
        position:'relative', overflow:'hidden',
        background:`linear-gradient(135deg, ${book.c1}22, ${book.c2}11)`,
        borderBottom:'1px solid var(--border)', padding:'36px 48px 40px',
      }}>
        <div className="mesh-orb" style={{ width:300,height:300,top:-100,right:-60,background:book.c2,opacity:0.15 }}/>

        <button onClick={onBack} style={{
          display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
          borderRadius:8, background:'var(--surface)', border:'1.5px solid var(--border2)',
          fontSize:13, fontWeight:600, color:'var(--text2)', cursor:'pointer',
          marginBottom:28, boxShadow:'var(--shadow-xs)',
        }}>
          {Icons.back(14)} Quay lại
        </button>

        <div style={{ display:'flex', gap:36, alignItems:'flex-start' }}>
          <BookCover book={book} width={160} radius={18}/>
          <div style={{ flex:1, paddingTop:4 }}>
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {book.tags.map(t=><Pill key={t} label={t}/>)}
            </div>
            <h1 style={{ fontSize:40, fontWeight:800, letterSpacing:-1.5, lineHeight:1.1, fontFamily:'var(--font-display)', marginBottom:8 }}>{book.title}</h1>
            <div style={{ fontSize:15, color:'var(--text2)', marginBottom:16 }}>bởi <strong style={{color:'var(--text)'}}>{book.author}</strong> · {book.genre}</div>
            <div style={{ display:'flex', gap:24, marginBottom:20 }}>
              <StarRating rating={book.rating} size={14}/>
              <span style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>📖 {book.chapters} chương</span>
              <span style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>👁 {book.reads} lượt đọc</span>
              <span style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>📝 {book.words} từ</span>
            </div>
            <p style={{ fontSize:14, lineHeight:1.75, color:'var(--text2)', maxWidth:540, marginBottom:24 }}>{book.desc}</p>
            <div style={{ display:'flex', gap:12 }}>
              <Btn size="lg" onClick={()=>onNavigate('reader',book)}>
                {Icons.play(15)} Đọc tiếp
              </Btn>
              <Btn size="lg" variant="secondary" onClick={()=>onNavigate('audiobook',book)}>
                {Icons.headphones(15)} Audiobook
              </Btn>
              <Btn size="lg" variant="ghost" onClick={()=>setSaved(s=>!s)}>
                {Icons.bookmark(15)} {saved?'Đã lưu':'Lưu truyện'}
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 48px', borderBottom:'1px solid var(--border)', display:'flex', gap:4 }}>
        {[['chapters','Danh sách chương'],['about','Giới thiệu']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:'16px 20px', fontSize:14, fontWeight:600, cursor:'pointer',
            color: tab===k?'var(--accent)':'var(--text2)',
            borderBottom: tab===k?'2px solid var(--accent)':'2px solid transparent',
            marginBottom:-1, background:'none', transition:'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:'24px 48px' }}>
        {tab==='about' ? (
          <div style={{ maxWidth:640 }}>
            <p style={{ fontSize:15, lineHeight:1.8, color:'var(--text2)', marginBottom:24 }}>{book.desc}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Thể loại',book.genre],['Số chương',book.chapters],['Tổng từ',book.words],['Lượt đọc',book.reads],['Cập nhật',book.updated],['Trạng thái',book.tags.includes('Hoàn thành')?'Hoàn thành':'Đang ra']].map(([k,v])=>(
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
              <div style={{ display:'flex', gap:8 }}>
                <Btn size="sm" variant="secondary">Sắp xếp ↑</Btn>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {chapters.map((ch,i) => (
                <div key={ch.id} onClick={()=>onNavigate('reader',book,i)} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
                  borderRadius:10, cursor:'pointer', transition:'all 0.15s',
                  background: i===3?'var(--accent-bg)':'transparent',
                  border: i===3?'1px solid var(--accent-border)':'1px solid transparent',
                }}
                onMouseEnter={e=>{ if(i!==3) e.currentTarget.style.background='var(--surface2)'; }}
                onMouseLeave={e=>{ if(i!==3) e.currentTarget.style.background='transparent'; }}
                >
                  <div style={{
                    width:32, height:32, borderRadius:8, flexShrink:0,
                    background: i===3?'var(--accent)':'var(--surface2)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, color: i===3?'white':'var(--text3)',
                  }}>{i===3 ? '▶' : ch.chapterNumber}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:i===3?600:400, color:!ch.free&&i>=15?'var(--text3)':'var(--text)' }}>{ch.title}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{(ch.words ?? 0).toLocaleString()} từ</div>
                  </div>
                  {i===3 && <span style={{ fontSize:11, fontWeight:600, color:'var(--accent)', whiteSpace:'nowrap' }}>Đang đọc</span>}
                  {!ch.free && i>=15 && <span style={{ fontSize:12, color:'var(--text3)' }}>{Icons.lock(14)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
