import { useState, useEffect } from 'react';
import { api, token as authToken } from './api.js';
import { useIsMobile } from './hooks/useIsMobile.js';
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
import ForeignScreen from './screens/ForeignScreen.jsx';

const STORAGE_KEY = 'nightowl_web';

export default function App() {
  const isMobile = useIsMobile();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  const [user,         setUser]         = useState(stored.user || null);
  const [screen,       setScreen]       = useState(stored.screen || 'home');
  const [detail,       setDetail]       = useState(null); // { book, chIdx }
  const [dark,         setDark]         = useState(stored.dark || false);
  const [fontSize,     setFontSize]     = useState(stored.fontSize || 17);
  const [showTweaks,   setShowTweaks]   = useState(false);
  const [books,        setBooks]        = useState([]);
  const [genres,       setGenres]       = useState([]);
  const [savedBooks,    setSavedBooks]    = useState(() => new Set(stored.savedBooks || []));
  const [readProgress,  setReadProgress]  = useState(stored.readProgress || {});
  const [autoAdvance,   setAutoAdvance]   = useState(stored.autoAdvance  ?? true);
  const [savePosition,  setSavePosition]  = useState(stored.savePosition ?? true);
  const [pageFlip,      setPageFlip]      = useState(stored.pageFlip     ?? false);

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
      savedBooks: [...savedBooks],
      readProgress,
      autoAdvance,
      savePosition,
      pageFlip,
    }));
  },[user, screen, dark, fontSize, savedBooks, readProgress, autoAdvance, savePosition, pageFlip]);

  useEffect(()=>{
    const handler = e => {
      if (e.data?.type==='__activate_edit_mode')   setShowTweaks(true);
      if (e.data?.type==='__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', handler);
    return ()=>window.removeEventListener('message', handler);
  },[]);

  // Auto-logout on 401
  useEffect(()=>{
    const handler = () => {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener('nightowl:unauthorized', handler);
    return ()=>window.removeEventListener('nightowl:unauthorized', handler);
  },[]);

  const navigate = (s, book=null, chIdx=null) => {
    const resolvedChIdx = chIdx ?? (book ? (readProgress[book.id] ?? 0) : null);
    setDetail(book ? { book, chIdx: resolvedChIdx } : null);
    setScreen(s);
  };

  const toggleSave = (bookId) => {
    setSavedBooks(prev => {
      const next = new Set(prev);
      next.has(bookId) ? next.delete(bookId) : next.add(bookId);
      return next;
    });
  };

  const saveChapterProgress = (bookId, chIdx) => {
    if (!savePosition) return;
    setReadProgress(prev => ({ ...prev, [bookId]: chIdx }));
    // Sync tới DB — chapter_number = chIdx + 1 (chIdx là index 0-based)
    if (user?.email) {
      api.updateReadingProgress(user.email, bookId, chIdx + 1).catch(() => {});
    }
  };

  // Load reading history từ DB khi user đăng nhập
  useEffect(() => {
    if (!user?.email) return;
    api.getReadingHistory(user.email).then(history => {
      setReadProgress(prev => {
        const merged = { ...prev };
        history.forEach(item => {
          // Chỉ ghi đè nếu DB có chapter_number mới hơn (hoặc chưa có local)
          const localChIdx = prev[item.bookId] ?? -1;
          const dbChIdx = item.chapterNumber - 1;
          if (dbChIdx > localChIdx) {
            merged[item.bookId] = dbChIdx;
          }
        });
        return merged;
      });
    }).catch(() => {});
  }, [user?.email]);

  if (!user) {
    return <LoginPage onLogin={(u, jwtToken) => {
      if (jwtToken) authToken.set(jwtToken);
      setUser(u);
      setScreen('home');
    }}/>;
  }

  // Fullscreen screens — no sidebar
  if (screen==='reader' && detail) {
    return <ReaderScreen book={detail.book} chapterIdx={detail.chIdx??0} dark={dark} onToggleDark={()=>setDark(d=>!d)} onBack={()=>setScreen('detail')} onHome={()=>navigate('home')} onChapterChange={chIdx=>saveChapterProgress(detail.book.id, chIdx)} user={user} onUserUpdate={u=>setUser(u)} autoAdvance={autoAdvance} fontSize={fontSize} onFontSizeChange={setFontSize} books={books} onNavigate={navigate} pageFlip={pageFlip} onPageFlipChange={setPageFlip}/>;
  }

  const activeTab = ['home','library','foreign','audio','profile'].includes(screen) ? screen : 'home';

  const sidebar = (
    <Sidebar
      active={activeTab}
      onNavigate={navigate}
      user={user}
      dark={dark}
      onToggleDark={()=>setDark(d=>!d)}
      onBell={()=>navigate('notifications')}
      books={books}
      readProgress={readProgress}
      isMobile={isMobile}
    />
  );

  const mainScreens = (
    <>
      {screen==='home'      && <HomeScreen onNavigate={navigate} books={books} genres={genres} readProgress={readProgress}/>}
      {screen==='detail' && detail && <DetailScreen book={detail.book} onNavigate={navigate} onBack={()=>setScreen('home')} isSaved={savedBooks.has(detail.book.id)} onToggleSave={()=>toggleSave(detail.book.id)} readProgress={readProgress}/>}
      {screen==='audiobook' && detail && <AudiobookScreen book={detail.book} onBack={()=>navigate('audio')}/>}
      {screen==='library'   && <LibraryScreen onNavigate={navigate} books={books} savedBookIds={savedBooks} readProgress={readProgress}/>}
      {screen==='foreign'   && <ForeignScreen onNavigate={navigate} books={books}/>}
      {screen==='audio'     && <AudioLibraryScreen onNavigate={navigate} books={books}/>}
      {screen==='notifications' && <NotificationScreen />}
      {screen==='profile'   && (
        <ProfileScreen
          user={user}
          onUserUpdate={u => setUser(prev => ({ ...prev, ...u }))}
          dark={dark}
          onToggleDark={()=>setDark(d=>!d)}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          autoAdvance={autoAdvance}
          onAutoAdvanceChange={setAutoAdvance}
          savePosition={savePosition}
          onSavePositionChange={setSavePosition}
          onLogout={()=>{ setUser(null); authToken.clear(); localStorage.removeItem(STORAGE_KEY); }}
        />
      )}
    </>
  );

  if (isMobile) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
        <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {mainScreens}
        </main>
        {sidebar}
        {showTweaks && <TweaksPanel dark={dark} onToggleDark={()=>setDark(d=>!d)} onClose={()=>setShowTweaks(false)}/>}
      </div>
    );
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {sidebar}
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {mainScreens}
      </main>
      {showTweaks && <TweaksPanel dark={dark} onToggleDark={()=>setDark(d=>!d)} onClose={()=>setShowTweaks(false)}/>}
    </div>
  );
}
