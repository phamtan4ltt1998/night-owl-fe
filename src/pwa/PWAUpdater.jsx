import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export default function PWAUpdater() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState(() => () => {});

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() { setNeedRefresh(true); },
      onOfflineReady() {
        setOfflineReady(true);
        setTimeout(() => setOfflineReady(false), 4000);
      },
    });
    setUpdateSW(() => update);
  }, []);

  if (!needRefresh && !offlineReady) return null;

  const wrap = {
    position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999, background: 'var(--surface, #1f2937)', color: 'var(--text, #fff)',
    padding: '12px 16px', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    display: 'flex', gap: 12, alignItems: 'center', maxWidth: 'calc(100vw - 32px)',
    fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14,
  };
  const btn = {
    background: 'var(--accent, #6366f1)', color: '#fff', border: 0,
    padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  };
  const ghost = { ...btn, background: 'transparent', color: 'inherit' };

  return (
    <div style={wrap} role="status" aria-live="polite">
      {needRefresh ? (
        <>
          <span>Có bản cập nhật mới.</span>
          <button style={btn} onClick={() => updateSW(true)}>Tải lại</button>
          <button style={ghost} onClick={() => setNeedRefresh(false)}>Để sau</button>
        </>
      ) : (
        <span>✓ Sẵn sàng dùng offline</span>
      )}
    </div>
  );
}
