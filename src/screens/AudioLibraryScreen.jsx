import { useState } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Section } from '../components/shared.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';

function AudioCover({ book }) {
  const [imgError, setImgError] = useState(false);
  if (book.cover_image && !imgError) {
    return (
      <img
        src={book.cover_image}
        alt={book.title}
        onError={() => setImgError(true)}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
      />
    );
  }
  return (
    <div style={{
      width:'100%', height:'100%',
      background:`linear-gradient(145deg, ${book.c1}, ${book.c2})`,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:52,
    }}>
      {book.emoji}
    </div>
  );
}

export default function AudioLibraryScreen({ onNavigate, books = [] }) {
  const isMobile = useIsMobile();
  const px = isMobile ? 16 : 48;
  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom:40 }}>
      {/* Hero */}
      <div style={{ position:'relative', overflow:'hidden', background:'var(--grad-hero)', padding: isMobile ? '28px 16px 32px' : '48px 48px 52px' }}>
        <div className="mesh-orb" style={{ width:400,height:400,top:-100,right:0,background:'#0EA5E9',opacity:0.3 }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>🎧 Audiobook</div>
          <h1 style={{ fontSize: isMobile ? 32 : 44, fontWeight:800, color:'white', letterSpacing:-2, fontFamily:'var(--font-display)', marginBottom:10 }}>
            Nghe truyện<br/>
            <span style={{ background:'linear-gradient(90deg, #7EE8A2, #38BDF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>mọi lúc mọi nơi</span>
          </h1>
          {!isMobile && <p style={{ fontSize:15, color:'rgba(255,255,255,0.55)', maxWidth:500, lineHeight:1.7 }}>
            Hàng trăm bộ truyện được thu âm bởi diễn viên chuyên nghiệp. Nghe khi lái xe, tập thể dục, hay trước khi ngủ.
          </p>}
        </div>
      </div>

      <div style={{ padding:`${isMobile?20:32}px ${px}px` }}>
        <Section title="Truyện âm thanh nổi bật">
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: isMobile ? 12 : 20 }}>
            {books.slice(0,6).map(b => (
              <div key={b.id} onClick={()=>onNavigate('audiobook',b)} style={{
                cursor:'pointer', background:'var(--surface)', borderRadius:16, overflow:'hidden',
                border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)', transition:'all 0.2s',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
              >
                <div style={{ position:'relative', height:160 }}>
                  <AudioCover book={b} />
                  <div style={{ position:'absolute', bottom:8, right:8 }}>
                    <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.9)',display:'flex',alignItems:'center',justifyContent:'center',color:b.c1 }}>
                      {Icons.play(12)}
                    </div>
                  </div>
                </div>
                <div style={{ padding:'14px 16px' }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{b.title}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>{b.author}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)' }}>
                    <span>🎙 {b.chapters} chương</span>
                    <span>⏱ ~{Math.floor(b.chapters * 4.5 / 60)} giờ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
