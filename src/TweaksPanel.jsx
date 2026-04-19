import { Icons } from './components/Icons.jsx';
import { Toggle } from './components/shared.jsx';

export default function TweaksPanel({ dark, onToggleDark, onClose }) {
  const colors = ['#635BFF','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899'];

  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:999,
      background:'var(--surface)', borderRadius:20, padding:'20px 22px',
      boxShadow:'var(--shadow-lg)', width:240, border:'1px solid var(--border2)',
      animation:'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontSize:15, fontWeight:800, fontFamily:'var(--font-display)' }}>Tweaks</div>
        <button onClick={onClose} style={{ color:'var(--text3)', display:'flex', cursor:'pointer' }}>{Icons.close(16)}</button>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>Giao diện</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:14, color:'var(--text2)' }}>Chế độ tối</span>
          <Toggle value={dark} onChange={onToggleDark}/>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>Màu nhấn</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {colors.map(c=>(
            <button key={c} onClick={()=>{
              document.documentElement.style.setProperty('--accent', c);
              document.documentElement.style.setProperty('--accent2', c+'cc');
            }} style={{
              width:28, height:28, borderRadius:8, background:c, cursor:'pointer',
              border:'2px solid transparent', outline:'none',
              boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
            }}/>
          ))}
        </div>
      </div>

      <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center', marginTop:8 }}>
        NightOwl Web v2.0
      </div>
    </div>
  );
}
