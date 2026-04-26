import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Icons } from '../components/Icons.jsx';
import { Input } from '../components/shared.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

export default function LoginPage({ onLogin }) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => onLogin({ name: name || email.split('@')[0], email }), 1400);
  };

  const facebookLogin = () => {
    setError('');
    if (!window.FB) {
      setError('Facebook SDK chưa tải xong, thử lại.');
      return;
    }
    window.FB.login((response) => {
      console.log('[FB] login response:', JSON.stringify(response));
      if (!response.authResponse) {
        setError('Đăng nhập Facebook bị huỷ.');
        return;
      }
      setLoading(true);
      const { accessToken, grantedScopes } = response.authResponse;
      console.log('[FB] grantedScopes:', grantedScopes);

      // Check if email scope was actually granted
      window.FB.api('/me/permissions', { access_token: accessToken }, (perms) => {
        console.log('[FB] permissions:', JSON.stringify(perms));
      });

      window.FB.api(
        '/me',
        { fields: 'name,email,picture.width(200)', access_token: accessToken },
        (info) => {
          console.log('[FB] /me response:', JSON.stringify(info));
          if (info.error) {
            console.error('[Facebook API]', info.error);
            setError(`Lỗi lấy thông tin Facebook: ${info.error.message}`);
            setLoading(false);
            return;
          }
          if (!info.email) {
            console.warn('[FB] email missing, fallback to facebook_id:', info.id);
          }
          api.facebookLogin({
            email: info.email || null,
            name: info.name,
            picture: info.picture?.data?.url || null,
            facebook_id: info.id || null,
          }).then((res) => {
            onLogin(
              {
                name: res.user?.name || info.name,
                email: res.user?.email || info.email || null,
                picture: res.user?.picture || info.picture?.data?.url || null,
              },
              res.access_token,
            );
          }).catch((err) => {
            console.error('[Facebook Login]', err);
            setError(`Đăng nhập Facebook thất bại: ${err?.message ?? err}`);
            setLoading(false);
          });
        },
      );
    }, { scope: 'public_profile,email' });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      setLoading(true);
      setError('');
      try {
        // Fetch user info from Google
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        }).then(r => r.json());
        // Sync user with BE, receive JWT
        const res = await api.googleLogin(info);
        onLogin(
          {
            name: res.user?.name || info.name,
            email: res.user?.email || info.email,
            picture: res.user?.picture || info.picture || null,
          },
          res.access_token,
        );
      } catch (err) {
        console.error('[Google Login]', err);
        setError(`Đăng nhập Google thất bại: ${err?.message ?? err}`);
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('[Google OAuth]', err);
      setError('Đăng nhập Google bị huỷ hoặc lỗi.');
    },
  });

  if (isMobile) {
    return (
      <div style={{ height:'100vh', overflow:'auto', background:'var(--grad-hero)', display:'flex', flexDirection:'column' }}>
        <div className="mesh-orb" style={{ width:300,height:300,top:-80,left:-80,background:'#635BFF' }}/>
        <div className="mesh-orb" style={{ width:200,height:200,bottom:0,right:-40,background:'#0EA5E9',opacity:0.3 }}/>
        {/* Logo */}
        <div style={{ position:'relative', zIndex:1, padding:'32px 24px 0', display:'flex', alignItems:'center', gap:10 }}>
          <img src="/logo_main.png" alt="NightOwl" style={{ width:36,height:36,borderRadius:10,objectFit:'cover' }} />
          <span style={{ fontSize:20,fontWeight:800,color:'white',fontFamily:'var(--font-display)',letterSpacing:-0.5 }}>NightOwl</span>
        </div>
        {/* Form card */}
        <div style={{ flex:1, display:'flex', alignItems:'flex-end' }}>
          <div style={{
            width:'100%', background:'var(--bg)', borderRadius:'24px 24px 0 0',
            padding:'28px 24px 40px', marginTop:32,
          }}>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:24,fontWeight:800,letterSpacing:-0.8,fontFamily:'var(--font-display)',marginBottom:4 }}>
                {mode==='login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
              </h1>
              <p style={{ fontSize:13,color:'var(--text2)' }}>
                {mode==='login' ? 'Đăng nhập để tiếp tục đọc truyện' : 'Bắt đầu hành trình đọc truyện ngay hôm nay'}
              </p>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:error?8:20 }}>
              <button onClick={()=>{setError('');googleLogin();}} disabled={loading} style={{ flex:1,padding:'10px 0',borderRadius:10,border:'1.5px solid var(--border2)',background:'var(--surface)',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:13,fontWeight:600,color:'var(--text)',cursor:'pointer',opacity:loading?0.6:1 }}>
                <span style={{ fontSize:15,color:'#EA4335',fontWeight:800 }}>G</span> Google
              </button>
              <button onClick={facebookLogin} disabled={loading} style={{ flex:1,padding:'10px 0',borderRadius:10,border:'1.5px solid var(--border2)',background:'var(--surface)',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:13,fontWeight:600,color:'var(--text)',cursor:'pointer',opacity:loading?0.6:1 }}>
                <span style={{ fontSize:15,color:'#1877F2',fontWeight:800 }}>f</span> Facebook
              </button>
            </div>
            {error && <div style={{ fontSize:13,color:'#F63D68',marginBottom:12,textAlign:'center' }}>{error}</div>}
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
              <div style={{ flex:1,height:1,background:'var(--border2)' }}/>
              <span style={{ fontSize:11,color:'var(--text3)',fontWeight:500 }}>hoặc dùng email</span>
              <div style={{ flex:1,height:1,background:'var(--border2)' }}/>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:14 }}>
              {mode==='register' && <Input value={name} onChange={setName} placeholder="Tên của bạn" icon={Icons.user(16)}/>}
              <Input value={email} onChange={setEmail} placeholder="Email" type="email" icon={<span style={{fontSize:14}}>@</span>}/>
              <Input value={password} onChange={setPassword} placeholder="Mật khẩu" type="password" icon={Icons.lock(16)}/>
            </div>
            {mode==='login' && (
              <div style={{ textAlign:'right',marginBottom:16 }}>
                <span style={{ fontSize:13,color:'var(--accent)',fontWeight:600,cursor:'pointer' }}>Quên mật khẩu?</span>
              </div>
            )}
            <button onClick={submit} style={{ width:'100%',padding:'13px 0',borderRadius:10,fontSize:14,fontWeight:700,background:'var(--grad-accent)',color:'white',cursor:'pointer',opacity:loading?0.7:1 }}>
              {loading ? 'Đang xử lý...' : (mode==='login'?'Đăng nhập':'Tạo tài khoản')}
            </button>
            <p style={{ textAlign:'center',marginTop:16,fontSize:13,color:'var(--text2)' }}>
              {mode==='login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <span onClick={()=>setMode(m=>m==='login'?'register':'login')} style={{ color:'var(--accent)',fontWeight:600,cursor:'pointer' }}>
                {mode==='login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            }}><img src="/logo_main.png" alt="NightOwl" style={{ width:42,height:42,borderRadius:12,objectFit:'cover' }} /></div>
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
          <div style={{ display:'flex', gap:10, marginBottom:error ? 8 : 24 }}>
            <button onClick={() => { setError(''); googleLogin(); }} disabled={loading} style={{
              flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid var(--border2)',
              background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              fontSize:13, fontWeight:600, color:'var(--text)', cursor:'pointer',
              boxShadow:'var(--shadow-xs)', opacity: loading ? 0.6 : 1,
            }}>
              <span style={{ fontSize:15, color:'#EA4335', fontWeight:800 }}>G</span>
              <span>Google</span>
            </button>
            <button key="Apple" disabled style={{
              flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid var(--border2)',
              background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              fontSize:13, fontWeight:600, color:'var(--text3)', cursor:'not-allowed',
              boxShadow:'var(--shadow-xs)', opacity:0.5,
            }}>
              <span style={{ fontSize:15, fontWeight:800 }}>🍎</span>
              <span>Apple</span>
            </button>
            <button onClick={facebookLogin} disabled={loading} style={{
              flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid var(--border2)',
              background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              fontSize:13, fontWeight:600, color:'var(--text)', cursor:'pointer',
              boxShadow:'var(--shadow-xs)', opacity: loading ? 0.6 : 1,
            }}>
              <span style={{ fontSize:15, color:'#1877F2', fontWeight:800 }}>f</span>
              <span>Facebook</span>
            </button>
          </div>
          {error && (
            <div style={{ fontSize:13, color:'#F63D68', marginBottom:16, textAlign:'center' }}>{error}</div>
          )}

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
