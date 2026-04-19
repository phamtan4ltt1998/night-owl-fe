import { useState, useEffect } from 'react';
import { api } from './api.js';
import Sidebar from './Sidebar.jsx';
import TweaksPanel from './TweaksPanel.jsx';
import LoginPage from './screens/LoginPage.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import DetailScreen from './screens/DetailScreen.jsx';
import ReaderScreen from './screens/ReaderScreen.jsx';
import AudiobookScreen from './screens/AudiobookScreen.jsx';
import LibraryScreen from './screens/LibraryScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import AudioLibraryScreen from './screens/AudioLibraryScreen.jsx';
import NotificationScreen from './screens/NotificationScreen.jsx';

const STORAGE_KEY = 'nightowl_web';

export default function App() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  const [user,       setUser]       = useState(stored.user || null);
  const [screen,     setScreen]     = useState(stored.screen || 'home');
  const [detail,     setDetail]     = useState(null); // { book, chIdx }
  const [dark,       setDark]       = useState(stored.dark || false);
  const [fontSize,   setFontSize]   = useState(stored.fontSize || 17);
  const [showTweaks, setShowTweaks] = useState(false);
  const [books,      setBooks]      = useState([]);
  const [genres,     setGenres]     = useState([]);

  useEffect(() => {
    api.getBooks().then(setBooks).catch(console.error);
    api.getGenres().then(setGenres).catch(console.error);
  }, []);

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user,
      screen: ['reader','audiobook','detail'].includes(screen) ? (stored.screen||'home') : screen,
      dark,
      fontSize,
    }));
  },[user, screen, dark, fontSize]);

  useEffect(()=>{
    const handler = e => {
      if (e.data?.type==='__activate_edit_mode')   setShowTweaks(true);
      if (e.data?.type==='__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', handler);
    return ()=>window.removeEventListener('message', handler);
  },[]);

  const navigate = (s, book=null, chIdx=null) => {
    setDetail(book ? { book, chIdx } : null);
    setScreen(s);
  };

  if (!user) {
    return <LoginPage onLogin={u=>{ setUser(u); setScreen('home'); }}/>;
  }

  // Fullscreen screens — no sidebar
  if (screen==='reader' && detail) {
    return <ReaderScreen book={detail.book} chapterIdx={detail.chIdx??3} dark={dark} onToggleDark={()=>setDark(d=>!d)} onBack={()=>setScreen('detail')} onHome={()=>navigate('home')}/>;
  }

  const activeTab = ['home','library','saved','audio','profile'].includes(screen) ? screen : 'home';

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar
        active={activeTab}
        onNavigate={s=>navigate(s)}
        user={user}
        dark={dark}
        onToggleDark={()=>setDark(d=>!d)}
        onBell={()=>navigate('notifications')}
        books={books}
      />

      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {screen==='home'      && <HomeScreen onNavigate={navigate} books={books} genres={genres}/>}
        {screen==='detail' && detail && <DetailScreen book={detail.book} onNavigate={navigate} onBack={()=>setScreen('home')}/>}
        {screen==='audiobook' && detail && <AudiobookScreen book={detail.book} onBack={()=>navigate('audio')}/>}
        {screen==='library'   && <LibraryScreen onNavigate={navigate} books={books}/>}
        {screen==='saved'     && <LibraryScreen onNavigate={navigate} books={books}/>}
        {screen==='audio'     && <AudioLibraryScreen onNavigate={navigate} books={books}/>}
        {screen==='notifications' && <NotificationScreen />}
        {screen==='profile'   && (
          <ProfileScreen
            user={user}
            dark={dark}
            onToggleDark={()=>setDark(d=>!d)}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            onLogout={()=>{ setUser(null); localStorage.removeItem(STORAGE_KEY); }}
          />
        )}
      </main>

      {showTweaks && <TweaksPanel dark={dark} onToggleDark={()=>setDark(d=>!d)} onClose={()=>setShowTweaks(false)}/>}
    </div>
  );
}
