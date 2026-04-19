export default function BookCover({ book, width=160, radius=14 }) {
  return (
    <div style={{
      width, height: width*1.4, borderRadius: radius,
      background: `linear-gradient(145deg, ${book.c1}, ${book.c2})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      boxShadow: `0 20px 60px ${book.c1}55, 0 4px 16px rgba(0,0,0,0.2)`,
    }}>
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
    </div>
  );
}
