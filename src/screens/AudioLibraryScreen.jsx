import { Icons } from '../components/Icons.jsx';
import { Section } from '../components/shared.jsx';

export default function AudioLibraryScreen({ onNavigate, books = [] }) {
  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom:40 }}>
      {/* Hero */}
      <div style={{ position:'relative', overflow:'hidden', background:'var(--grad-hero)', padding:'48px 48px 52px' }}>
        <div className="mesh-orb" style={{ width:400,height:400,top:-100,right:0,background:'#0EA5E9',opacity:0.3 }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>🎧 Audiobook</div>
          <h1 style={{ fontSize:44, fontWeight:800, color:'white', letterSpacing:-2, fontFamily:'var(--font-display)', marginBottom:10 }}>
            Nghe truyện<br/>
            <span style={{ background:'linear-gradient(90deg, #7EE8A2, #38BDF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>mọi lúc mọi nơi</span>
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.55)', maxWidth:500, lineHeight:1.7 }}>
            Hàng trăm bộ truyện được thu âm bởi diễn viên chuyên nghiệp. Nghe khi lái xe, tập thể dục, hay trước khi ngủ.
          </p>
        </div>
      </div>

      <div style={{ padding:'32px 48px' }}>
        <Section title="Truyện âm thanh nổi bật">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:20 }}>
            {books.slice(0,6).map(b => (
              <div key={b.id} onClick={()=>onNavigate('audiobook',b)} style={{
                cursor:'pointer', background:'var(--surface)', borderRadius:16, overflow:'hidden',
                border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)', transition:'all 0.2s',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
              >
                <div style={{
                  height:120, background:`linear-gradient(145deg, ${b.c1}, ${b.c2})`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:52,
                  position:'relative',
                }}>
                  {b.emoji}
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
