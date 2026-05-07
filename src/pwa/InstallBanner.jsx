import { useState } from 'react';
import { useInstallPrompt } from './useInstallPrompt.js';

const DISMISS_KEY = 'nightowl_pwa_install_dismissed';

export default function InstallBanner() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  if (installed || !canInstall || dismissed) return null;

  const wrap = {
    position: 'fixed', bottom: 16, right: 16, zIndex: 9998,
    background: 'var(--surface, #1f2937)', color: 'var(--text, #fff)',
    padding: '12px 14px', borderRadius: 14,
    border: '1px solid var(--border, rgba(255,255,255,0.1))',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex', gap: 12, alignItems: 'center', maxWidth: 'calc(100vw - 32px)',
    fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
  };
  const btn = {
    background: 'var(--accent, #6366f1)', color: '#fff', border: 0,
    padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
  };
  const x = {
    background: 'transparent', color: 'inherit', border: 0, padding: 4,
    cursor: 'pointer', opacity: 0.6, fontSize: 16, lineHeight: 1,
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div style={wrap} role="dialog" aria-label="Cài đặt ứng dụng">
      <span>📲 Cài đặt NightOwl lên màn hình chính?</span>
      <button style={btn} onClick={async () => { await promptInstall(); dismiss(); }}>
        Cài đặt
      </button>
      <button style={x} onClick={dismiss} aria-label="Đóng">×</button>
    </div>
  );
}
