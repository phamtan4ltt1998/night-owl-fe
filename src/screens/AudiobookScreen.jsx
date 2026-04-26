import { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../components/Icons.jsx';
import { api } from '../api.js';

// ── Fancy generating overlay ────────────────────────────────────────────────
function GeneratingOverlay({ book, chapter }) {
  const bars = 28;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: `linear-gradient(160deg, ${book.c1}EE 0%, ${book.c2}CC 50%, #0a0a1a 100%)`,
      backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 0,
    }}>
      {/* Waveform animation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 40, height: 80 }}>
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} style={{
            width: 4,
            borderRadius: 2,
            background: `rgba(255,255,255,${0.3 + 0.7 * Math.sin(i / bars * Math.PI)})`,
            animation: `genWave 1.4s ${(i * 0.05).toFixed(2)}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Icon */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, fontSize: 32,
        boxShadow: '0 0 40px rgba(255,255,255,0.15)',
        animation: 'pulseGlow 2s ease infinite',
      }}>
        🎙️
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
          fontFamily: 'var(--font-display)', marginBottom: 10,
          textShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}>
          Nội dung đang được tạo
        </div>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 6 }}>
          {chapter ? `Chương ${chapter.chapterNumber} — ${chapter.title}` : 'Đang xử lý...'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.6, fontSize: 13 }}>
          <span>Xin vui lòng chờ</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'white',
                animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom shimmer bar */}
      <div style={{ position: 'absolute', bottom: 32, left: '10%', right: '10%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.6)', animation: 'shimmerBar 2s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────
export default function AudiobookScreen({ book, onBack }) {
  const [chapters, setChapters]           = useState([]);
  const [selectedChapter, setSelected]    = useState(null);
  // audioState: 'idle' | 'loading' | 'generating' | 'ready' | 'error'
  const [audioState, setAudioState]       = useState('idle');
  const [errorMsg, setErrorMsg]           = useState('');
  const [playing, setPlaying]             = useState(false);
  const [progress, setProgress]           = useState(0);
  const [duration, setDuration]           = useState(0);
  const [volume, setVolume]               = useState(0.8);
  const [speed, setSpeed]                 = useState(1.0);
  const [bufferedRanges, setBuffered]     = useState([]);
  const [shuffle, setShuffle]             = useState(false);
  const [repeat, setRepeat]               = useState(false);
  const [coverError, setCoverError]       = useState(false);

  const audioRef   = useRef(null);
  const barRef     = useRef(null);
  const pollRef    = useRef(null);

  useEffect(() => {
    api.getChapters(book.id)
      .then(data => setChapters(data.chapters ?? []))
      .catch(console.error);
  }, [book.id]);

  // Sync volume/speed to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, speed]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPolling = useCallback((storyName, chapterNumber) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.getChapterAudioStatus(storyName, chapterNumber);
        if (status.audio_exists) {
          stopPolling();
          const url = api.getChapterAudioUrl(storyName, chapterNumber);
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.load();
          }
          setAudioState('ready');
        }
      } catch { /* keep polling */ }
    }, 15000);
  }, []);

  useEffect(() => () => stopPolling(), []);

  const handleChapterClick = useCallback(async (chapter) => {
    stopPolling();
    setSelected(chapter);
    setPlaying(false);
    setProgress(0);
    setDuration(0);
    setAudioState('loading');
    setErrorMsg('');
    setBuffered([]);

    const storyName = book.slug;
    try {
      const status = await api.getChapterAudioStatus(storyName, chapter.chapterNumber);

      if (status.audio_exists) {
        const url = api.getChapterAudioUrl(storyName, chapter.chapterNumber);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
        setAudioState('ready');
        return;
      }

      if (!status.content_exists) {
        setAudioState('error');
        setErrorMsg('Không tìm thấy nội dung truyện này.');
        return;
      }

      // Content exists but no audio → trigger generation
      await api.generateChapterAudio(storyName, chapter.chapterNumber);
      setAudioState('generating');
      startPolling(storyName, chapter.chapterNumber);
    } catch (e) {
      setAudioState('error');
      setErrorMsg(e.message || 'Đã có lỗi xảy ra.');
    }
  }, [book.slug, startPolling]);

  // Audio element event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleEnded = () => {
    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setPlaying(false));
      return;
    }
    // Auto-advance to next chapter
    if (selectedChapter && chapters.length > 0) {
      const idx = chapters.findIndex(c => c.id === selectedChapter.id);
      const nextIdx = shuffle
        ? Math.floor(Math.random() * chapters.length)
        : idx + 1;
      if (nextIdx < chapters.length) handleChapterClick(chapters[nextIdx]);
    }
  };
  const skipTo = (direction) => {
    if (!selectedChapter || chapters.length === 0) return;
    const idx = chapters.findIndex(c => c.id === selectedChapter.id);
    if (direction === 'back') {
      // If >3s played → restart; else go prev
      if (audioRef.current && audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
        return;
      }
      if (idx > 0) handleChapterClick(chapters[idx - 1]);
    } else {
      const nextIdx = shuffle
        ? Math.floor(Math.random() * chapters.length)
        : idx + 1;
      if (nextIdx < chapters.length) handleChapterClick(chapters[nextIdx]);
    }
  };

  const handleProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const ranges = [];
    for (let i = 0; i < audio.buffered.length; i++) {
      ranges.push({
        start: audio.buffered.start(i) / audio.duration,
        end: audio.buffered.end(i) / audio.duration,
      });
    }
    setBuffered(ranges);
  };

  const togglePlay = () => {
    if (!audioRef.current || audioState !== 'ready') return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  };

  const seek = (e) => {
    if (!barRef.current || !audioRef.current || !duration) return;
    const r = barRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    audioRef.current.currentTime = p * duration;
    setProgress(p);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const current = progress * duration;

  const isGenerating = audioState === 'generating';

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onProgress={handleProgress}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* Top bar */}
      <div style={{ padding: '24px 48px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 8, background: 'var(--surface)', border: '1.5px solid var(--border2)',
          fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', boxShadow: 'var(--shadow-xs)',
        }}>{Icons.back(14)} Quay lại</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Đang phát</div>
        </div>
        <div style={{ width: 90 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
        {/* Player */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 80px', position: 'relative' }}>
          {isGenerating && <GeneratingOverlay book={book} chapter={selectedChapter} />}

          {/* Cover */}
          <div style={{ position: 'relative', marginBottom: 40 }}>
            <div style={{
              position: 'absolute', inset: -20,
              background: `radial-gradient(ellipse, ${book.c2}60, transparent 70%)`,
              filter: 'blur(20px)', borderRadius: '50%',
            }} />
            <div style={{
              width: 220, height: 308, borderRadius: 20,
              background: `linear-gradient(145deg, ${book.c1}, ${book.c2})`,
              boxShadow: `0 32px 80px ${book.c1}55, 0 8px 24px rgba(0,0,0,0.25)`,
              transform: playing ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.5s ease',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              {book.cover_image && !coverError ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  onError={() => setCoverError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 20 }}
                />
              ) : (
                <>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)', backgroundSize: '12px 12px' }} />
                  <div style={{ fontSize: 72, marginBottom: 12, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}>{book.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.95)', textAlign: 'center', padding: '0 16px', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>{book.title}</div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 6, width: '100%', maxWidth: 460 }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.8, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{book.title}</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>{book.author}</div>
            {selectedChapter && (
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                Chương {selectedChapter.chapterNumber} — {selectedChapter.title}
              </div>
            )}
            {audioState === 'error' && (
              <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{errorMsg}</div>
            )}
            {audioState === 'loading' && (
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Đang kiểm tra audio...</div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: 460, marginBottom: 20, marginTop: 16 }}>
            <div
              ref={barRef}
              onClick={seek}
              style={{ height: 5, background: 'var(--surface3)', borderRadius: 3, cursor: audioState === 'ready' ? 'pointer' : 'default', position: 'relative', overflow: 'visible' }}
            >
              {/* Buffer ranges (YouTube gray bar) */}
              {bufferedRanges.map((r, i) => (
                <div key={i} style={{
                  position: 'absolute', top: 0, height: '100%', borderRadius: 3,
                  background: 'rgba(150,150,170,0.35)',
                  left: `${r.start * 100}%`,
                  width: `${(r.end - r.start) * 100}%`,
                  pointerEvents: 'none',
                }} />
              ))}
              {/* Playback position */}
              <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${book.c1}, ${book.c2})`, width: `${progress * 100}%`, position: 'relative' }}>
                {audioState === 'ready' && (
                  <div style={{
                    position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, borderRadius: '50%', background: 'var(--surface)',
                    border: `3px solid ${book.c1}`, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }} />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
              <span>{fmt(current)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <button
              onClick={() => setShuffle(s => !s)}
              style={{ color: shuffle ? book.c1 : 'var(--text2)', padding: 8, cursor: 'pointer', display: 'flex', position: 'relative' }}
              title="Phát ngẫu nhiên"
            >
              {Icons.shuffle(20)}
              {shuffle && <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: book.c1 }} />}
            </button>
            <button
              onClick={() => skipTo('back')}
              disabled={audioState !== 'ready'}
              style={{ color: 'var(--text2)', padding: 8, cursor: audioState === 'ready' ? 'pointer' : 'not-allowed', display: 'flex', opacity: audioState === 'ready' ? 1 : 0.4 }}
              title="Chương trước"
            >
              {Icons.skipBack(24)}
            </button>
            <button
              onClick={togglePlay}
              disabled={audioState !== 'ready'}
              style={{
                width: 68, height: 68, borderRadius: '50%',
                background: audioState === 'ready' ? `linear-gradient(135deg, ${book.c1}, ${book.c2})` : 'var(--surface3)',
                color: 'white', cursor: audioState === 'ready' ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: audioState === 'ready' ? `0 8px 32px ${book.c1}55` : 'none',
                fontSize: 22,
                transform: playing ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.1s',
                animation: playing ? 'pulseGlow 2s ease infinite' : 'none',
                border: 'none',
              }}
            >
              {playing ? Icons.pause(24) : Icons.play(24)}
            </button>
            <button
              onClick={() => skipTo('next')}
              disabled={audioState !== 'ready'}
              style={{ color: 'var(--text2)', padding: 8, cursor: audioState === 'ready' ? 'pointer' : 'not-allowed', display: 'flex', opacity: audioState === 'ready' ? 1 : 0.4 }}
              title="Chương sau"
            >
              {Icons.skip(24)}
            </button>
            <button
              onClick={() => setRepeat(r => !r)}
              style={{ color: repeat ? book.c1 : 'var(--text2)', padding: 8, cursor: 'pointer', display: 'flex', position: 'relative' }}
              title="Lặp lại"
            >
              {Icons.repeat(20)}
              {repeat && <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: book.c1 }} />}
            </button>
          </div>

          {/* Speed */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: speed === s ? `linear-gradient(135deg, ${book.c1}, ${book.c2})` : 'var(--surface2)',
                color: speed === s ? 'white' : 'var(--text2)',
                boxShadow: speed === s ? `0 4px 12px ${book.c1}44` : 'none', border: 'none',
              }}>{s}×</button>
            ))}
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 360 }}>
            <span style={{ color: 'var(--text3)', display: 'flex' }}>{Icons.volume(18)}</span>
            <div
              style={{ flex: 1, height: 4, background: 'var(--surface3)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
            >
              <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${book.c1}, ${book.c2})`, width: `${volume * 100}%` }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 30 }}>{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Chapter list */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', overflowY: 'auto', background: 'var(--surface)' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Danh sách chương</div>
          </div>
          {chapters.slice(0, 50).map((ch) => {
            const isActive = selectedChapter?.id === ch.id;
            return (
              <div
                key={ch.id}
                onClick={() => handleChapterClick(ch)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: isActive ? 'var(--accent-bg)' : 'transparent', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: isActive ? book.c1 : 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? 'white' : 'var(--text3)', fontSize: 11, fontWeight: 700,
                }}>
                  {isActive && playing ? (
                    <div style={{ display: 'flex', gap: 2, height: 14, alignItems: 'flex-end' }}>
                      {[0, 1, 2].map(j => <div key={j} style={{ width: 3, borderRadius: 1, background: 'white', animation: `waveAnim 0.8s ${j * 0.13}s ease infinite` }} />)}
                    </div>
                  ) : ch.chapterNumber}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--accent)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{Math.floor((ch.words || 2000) / 150)} phút</div>
                </div>
                {isActive && audioState === 'generating' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: book.c1, animation: 'dotBounce 1s ease-in-out infinite', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes genWave {
          0%, 100% { height: 12px; }
          50% { height: 64px; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes shimmerBar {
          0% { transform: translateX(-100%); width: 40%; }
          50% { width: 60%; }
          100% { transform: translateX(250%); width: 40%; }
        }
      `}</style>
    </div>
  );
}
