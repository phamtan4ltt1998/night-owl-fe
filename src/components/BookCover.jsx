import { useState, useMemo } from 'react';

const HANZI_STYLE = `
  @keyframes hanziFloat {
    0%   { transform: translateY(0)   rotate(0deg)   scale(1);    opacity: 0; }
    15%  { opacity: 1; }
    80%  { opacity: 0.6; }
    100% { transform: translateY(-55px) rotate(12deg) scale(0.7); opacity: 0; }
  }
  @keyframes hanziPulse {
    0%,100% { opacity: 0.08; transform: scale(1)   rotate(0deg); }
    50%     { opacity: 0.18; transform: scale(1.05) rotate(3deg); }
  }
`;

const HANZI_SETS = {
  'tiên hiệp': ['仙','道','靈','氣','丹','劍','天','武','修','玄'],
  'kiếm hiệp': ['劍','俠','義','武','江','湖','刀','拳','門','派'],
  'ngôn tình': ['情','愛','心','戀','緣','夢','柔','美','緒','緋'],
  'đam mỹ':    ['情','愛','緣','戀','心','夢','纏','綿','執','念'],
  'trinh thám': ['案','謎','查','破','密','局','伏','疑','詭','影'],
  default:      ['書','讀','夢','情','道','緣','心','光','風','月'],
};

function getHanziSet(book) {
  const g = (book.genre || '').toLowerCase();
  for (const key of Object.keys(HANZI_SETS)) {
    if (g.includes(key)) return HANZI_SETS[key];
  }
  return HANZI_SETS.default;
}

function HanziEffect({ book, size }) {
  const chars = useMemo(() => getHanziSet(book), [book.genre]);
  const fontSize = Math.max(10, size * 0.14);
  return (
    <>
      <style>{HANZI_STYLE}</style>
      {/* Watermark char center-background */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 0,
        fontSize: size * 0.55, color: 'rgba(255,255,255,0.1)',
        fontWeight: 900, userSelect: 'none',
        animation: 'hanziPulse 4s ease-in-out infinite',
      }}>
        {chars[0]}
      </div>
      {/* Floating chars */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 1,
          left: `${15 + i * 22}%`,
          bottom: `${8 + (i % 2) * 12}%`,
          fontSize, fontWeight: 700, color: 'rgba(255,255,255,0.55)',
          userSelect: 'none',
          animation: `hanziFloat ${2.4 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`,
          textShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}>
          {chars[(i + 1) % chars.length]}
        </div>
      ))}
    </>
  );
}

export default function BookCover({ book, width=160, radius=14, noEffect=false }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = book.cover_image && !imgError;

  const containerStyle = {
    width, height: width * 1.4, borderRadius: radius,
    flexShrink: 0, position: 'relative', overflow: 'hidden',
    boxShadow: `0 20px 60px ${book.c1}55, 0 4px 16px rgba(0,0,0,0.2)`,
    background: `linear-gradient(145deg, ${book.c1}, ${book.c2})`,
  };

  if (hasImage) {
    return (
      <div style={containerStyle}>
        <img
          src={book.cover_image}
          alt={book.title}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {!noEffect && <HanziEffect book={book} size={width} />}
      </div>
    );
  }

  return (
    <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.15,
        backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
        backgroundSize: '12px 12px',
      }}/>
      <div style={{ fontSize: width*0.3, marginBottom: 8, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{book.emoji}</div>
      <div style={{
        fontSize: Math.max(10, width*0.08), fontWeight: 800, color: 'rgba(255,255,255,0.95)',
        textAlign: 'center', padding: '0 10px', lineHeight: 1.25, letterSpacing: -0.3,
        fontFamily: 'var(--font-display)', textShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>{book.title}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}/>
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center',
        fontSize: Math.max(8, width*0.065), color: 'rgba(255,255,255,0.65)', fontWeight: 500,
      }}>{book.author}</div>
      {!noEffect && <HanziEffect book={book} size={width} />}
    </div>
  );
}
