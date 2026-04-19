import { useState } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Input } from '../components/shared.jsx';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => onLogin({ name: name || email.split('@')[0], email }), 1400);
  };

  const socialLogin = () => {
    setLoading(true);
    setTimeout(() => onLogin({ name: 'Người dùng', email: 'user@gmail.com' }), 800);
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Left: Illustration */}
      <div style={{
        flex:'0 0 52%', position:'relative', overflow:'hidden',
        background:'var(--grad-hero)',
        display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48,
      }}>
        <div className="mesh-orb" style={{ width:400,height:400,top:-80,left:-80,background:'#635BFF' }}/>
        <div className="mesh-orb" style={{ width:300,height:300,bottom:0,right:-60,background:'#0EA5E9',opacity:0.3 }}/>
        <div className="mesh-orb" style={{ width:200,height:200,top:'40%',right:'20%',background:'#F63D68',opacity:0.2 }}/>

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background:'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
              border:'1px solid rgba(255,255,255,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
            }}>🦉</div>
            <span style={{ fontSize:22, fontWeight:800, color:'white', fontFamily:'var(--font-display)', letterSpacing:-0.5 }}>NightOwl</span>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{
            fontSize:56, fontWeight:800, color:'white', lineHeight:1.1,
            letterSpacing:-2, fontFamily:'var(--font-display)', marginBottom:20,
          }}>
            Thế giới<br/>
            <span style={{ background:'linear-gradient(90deg, #B4B0FF, #7EE8A2)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              truyện không ngủ
            </span>
          </div>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:380 }}>
            Hàng nghìn bộ truyện hay. Trải nghiệm đọc và nghe hoàn toàn mới. Theo dõi tiến độ mọi nơi mọi lúc.
          </p>
          <div style={{ display:'flex', gap:24, marginTop:36 }}>
            {[['12.4M+','Lượt đọc/ngày'],['50K+','Truyện'],['4.9★','Đánh giá']].map(([v,l])=>(
              <div key={l}>
                <div style={{ fontSize:26, fontWeight:800, color:'white', fontFamily:'var(--font-display)', letterSpacing:-1 }}>{v}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:48, background:'var(--bg)',
      }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1, fontFamily:'var(--font-display)', marginBottom:6 }}>
              {mode==='login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
            </h1>
            <p style={{ fontSize:14, color:'var(--text2)' }}>
              {mode==='login' ? 'Đăng nhập để tiếp tục đọc truyện' : 'Bắt đầu hành trình đọc truyện ngay hôm nay'}
            </p>
          </div>

          {/* Social login */}
          <div style={{ display:'flex', gap:10, marginBottom:24 }}>
            {[{icon:'G',label:'Google',color:'#EA4335'},{icon:'🍎',label:'Apple'},{icon:'f',label:'Facebook',color:'#1877F2'}].map(p=>(
              <button key={p.label} onClick={socialLogin} style={{
                flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid var(--border2)',
                background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                fontSize:13, fontWeight:600, color:'var(--text)', cursor:'pointer',
                boxShadow:'var(--shadow-xs)',
              }}>
                <span style={{ fontSize:15, color:p.color, fontWeight:800 }}>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:'var(--border2)' }}/>
            <span style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>hoặc dùng email</span>
            <div style={{ flex:1, height:1, background:'var(--border2)' }}/>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
            {mode==='register' && (
              <Input value={name} onChange={setName} placeholder="Tên của bạn" icon={Icons.user(16)}/>
            )}
            <Input value={email} onChange={setEmail} placeholder="Email" type="email" icon={<span style={{fontSize:14}}>@</span>}/>
            <Input value={password} onChange={setPassword} placeholder="Mật khẩu" type="password" icon={Icons.lock(16)}/>
          </div>

          {mode==='login' && (
            <div style={{ textAlign:'right', marginBottom:20 }}>
              <span style={{ fontSize:13, color:'var(--accent)', fontWeight:600, cursor:'pointer' }}>Quên mật khẩu?</span>
            </div>
          )}

          <button onClick={submit} style={{
            width:'100%', padding:'13px 0', borderRadius:10, fontSize:14, fontWeight:700,
            background:'var(--grad-accent)', color:'white', cursor:'pointer',
            boxShadow: loading?'none':'var(--shadow-accent)',
            transition:'all 0.2s', letterSpacing:0.2,
            opacity: loading?0.7:1,
          }}>
            {loading ? (
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}/>
                Đang xử lý...
              </span>
            ) : (mode==='login'?'Đăng nhập':'Tạo tài khoản')}
          </button>

          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text2)' }}>
            {mode==='login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <span onClick={()=>setMode(m=>m==='login'?'register':'login')}
              style={{ color:'var(--accent)', fontWeight:600, cursor:'pointer' }}>
              {mode==='login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
