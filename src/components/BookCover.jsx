import { useState } from 'react';

const NIGHTOWL_STYLE = `
  @keyframes owlFloat {
    0%   { transform: translateY(0)   rotate(0deg)   scale(1);    opacity: 0; }
    15%  { opacity: 1; }
    80%  { opacity: 0.6; }
    100% { transform: translateY(-55px) rotate(-6deg) scale(0.75); opacity: 0; }
  }
  @keyframes owlPulse {
    0%,100% { opacity: 0.07; transform: scale(1); }
    50%     { opacity: 0.16; transform: scale(1.04); }
  }
`;

const FONT_VARIANTS = [
  { font: '"Georgia", serif',                         weight: 800, style: 'normal',  label: 'Night Owl' },
  { font: '"Bricolage Grotesque", sans-serif',        weight: 700, style: 'normal',  label: 'NIGHT OWL' },
  { font: '"Inter", sans-serif',                      weight: 300, style: 'normal',  label: 'Night Owl' },
  { font: '"Georgia", serif',                         weight: 400, style: 'italic',  label: 'Night Owl' },
  { font: '"Courier New", monospace',                 weight: 700, style: 'normal',  label: 'NightOwl' },
  { font: '"Palatino Linotype", "Palatino", serif',   weight: 600, style: 'italic',  label: 'Night Owl' },
  { font: '"Arial Black", sans-serif',                weight: 900, style: 'normal',  label: 'NIGHTOWL' },
  { font: '"Trebuchet MS", sans-serif',               weight: 500, style: 'normal',  label: 'Night Owl' },
];

function NightOwlEffect({ size }) {
  const baseFontSize = Math.max(7, size * 0.11);
  const watermarkSize = Math.max(10, size * 0.18);
  return (
    <>
      <style>{NIGHTOWL_STYLE}</style>
      {/* Watermark center */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 0,
        color: 'rgba(255,255,255,0.09)',
        userSelect: 'none',
        animation: 'owlPulse 4s ease-in-out infinite',
        fontSize: watermarkSize, fontWeight: 800,
        fontFamily: '"Georgia", serif', fontStyle: 'italic',
        letterSpacing: -0.5, whiteSpace: 'nowrap',
        transform: 'rotate(-20deg)',
      }}>
        Night Owl
      </div>
      {/* Floating labels — each different font variant */}
      {[0, 1, 2, 3].map(i => {
        const v = FONT_VARIANTS[i % FONT_VARIANTS.length];
        return (
          <div key={i} style={{
            position: 'absolute', pointerEvents: 'none', zIndex: 1,
            left: `${10 + i * 22}%`,
            bottom: `${6 + (i % 2) * 14}%`,
            fontSize: baseFontSize,
            fontWeight: v.weight,
            fontStyle: v.style,
            fontFamily: v.font,
            color: 'rgba(255,255,255,0.5)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            animation: `owlFloat ${2.4 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`,
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}>
            {v.label}
          </div>
        );
      })}
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
        {!noEffect && <NightOwlEffect size={width} />}
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
      {!noEffect && <NightOwlEffect size={width} />}
    </div>
  );
}
