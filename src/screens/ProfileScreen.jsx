import { useState, useEffect, useCallback } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Btn, Toggle } from '../components/shared.jsx';
import { api } from '../api.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

// ── helpers ────────────────────────────────────────────────────────────────────

function SettingItem({ label, desc, children, border }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', borderTop: border ? '1px solid var(--border)' : 'none',
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const PACKAGES = [
  { id: 'p60',   gems: 60,   bonus: 0,   price: 10000,  label: '60 Linh Thạch' },
  { id: 'p200',  gems: 200,  bonus: 20,  price: 30000,  label: '200 + 20 Linh Thạch', popular: true },
  { id: 'p500',  gems: 500,  bonus: 80,  price: 69000,  label: '500 + 80 Linh Thạch' },
  { id: 'p1200', gems: 1200, bonus: 250, price: 149000, label: '1200 + 250 Linh Thạch' },
  { id: 'p2500', gems: 2500, bonus: 600, price: 299000, label: '2500 + 600 Linh Thạch' },
  { id: 'p5000', gems: 5000, bonus: 1500,price: 549000, label: '5000 + 1500 Linh Thạch', best: true },
];

function fmt(n) { return Number(n).toLocaleString('vi-VN'); }
function fmtVND(n) { return fmt(n) + 'đ'; }
function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Linh Thạch section ─────────────────────────────────────────────────────────

function LinhThachSection({ user, onBalanceChange }) {
  const [confirm, setConfirm]     = useState(null);   // selected package
  const [success, setSuccess]     = useState(null);   // success state
  const [buying, setBuying]       = useState(false);
  const [history, setHistory]     = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [daily, setDaily]         = useState(null);   // daily reward result
  const [claimingDaily, setClaimingDaily] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    api.getLinhThachHistory(user.email).then(setHistory).catch(() => {}).finally(() => setHistLoading(false));
  }, [user?.email]);

  const handlePurchase = useCallback(async () => {
    if (!confirm) return;
    setBuying(true);
    try {
      const res = await api.purchaseLinhThach(user.email, confirm);
      onBalanceChange(res.balance);
      setSuccess({ pkg: confirm, newBalance: res.balance });
      setConfirm(null);
      const hist = await api.getLinhThachHistory(user.email);
      setHistory(hist);
    } catch (e) {
      alert('Mua thất bại: ' + e.message);
    } finally {
      setBuying(false);
    }
  }, [confirm, user?.email, onBalanceChange]);

  const handleDaily = useCallback(async () => {
    setClaimingDaily(true);
    try {
      const res = await api.claimDailyReward(user.email);
      setDaily(res);
      if (!res.already_claimed) {
        onBalanceChange(res.balance);
        const hist = await api.getLinhThachHistory(user.email);
        setHistory(hist);
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setClaimingDaily(false);
    }
  }, [user?.email, onBalanceChange]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, fontFamily: 'var(--font-display)', marginBottom: 28 }}>
        Linh Thạch
      </h1>

      {/* Balance hero */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
        borderRadius: 24, padding: '32px 36px', marginBottom: 24,
        position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(99,91,255,0.4)',
      }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -100, right: -60 }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -60, left: 40 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>Số dư Linh Thạch</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>💎</span>
            <span style={{ fontSize: 48, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', letterSpacing: -2, lineHeight: 1 }}>
              {fmt(user?.linh_thach ?? 0)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ padding: '6px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', fontSize: 13, color: 'white', fontWeight: 600 }}>
              🔥 Streak {user?.streak ?? 0} ngày
            </div>
          </div>
        </div>
      </div>

      {/* Daily reward */}
      <div style={{
        background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
        padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🎁 Phần thưởng hàng ngày</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            {daily?.already_claimed
              ? `Đã nhận hôm nay · Streak ${daily.streak} ngày`
              : `Nhận ${10 + Math.floor((user?.streak ?? 0) / 7) * 20} Linh Thạch`}
          </div>
        </div>
        {daily?.already_claimed ? (
          <div style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--surface2)', color: 'var(--text3)', fontSize: 14, fontWeight: 600 }}>✓ Đã nhận</div>
        ) : (
          <button
            onClick={handleDaily}
            disabled={claimingDaily}
            style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white',
              cursor: claimingDaily ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(99,91,255,0.4)',
              opacity: claimingDaily ? 0.7 : 1,
            }}
          >{claimingDaily ? '...' : 'Nhận ngay'}</button>
        )}
      </div>

      {/* Success toast */}
      {success && (
        <div style={{
          background: 'linear-gradient(135deg, #059669, #10B981)', borderRadius: 16,
          padding: '20px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>✅ Mua thành công!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              +{success.pkg.gems + success.pkg.bonus} Linh Thạch · Số dư: {fmt(success.newBalance)}
            </div>
          </div>
          <button onClick={() => setSuccess(null)} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, background: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Packages */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nạp Linh Thạch</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => setConfirm(pkg)}
              style={{
                position: 'relative', padding: '20px 18px', borderRadius: 16, cursor: 'pointer',
                border: `2px solid ${pkg.popular ? '#7C3AED' : pkg.best ? '#F59E0B' : 'var(--border)'}`,
                background: pkg.popular ? 'rgba(124,58,237,0.06)' : pkg.best ? 'rgba(245,158,11,0.06)' : 'var(--surface)',
                boxShadow: pkg.popular ? '0 4px 20px rgba(124,58,237,0.15)' : 'var(--shadow-sm)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute', top: -10, right: 12, fontSize: 10, fontWeight: 700,
                  background: '#7C3AED', color: 'white', padding: '3px 10px', borderRadius: 20,
                  letterSpacing: 0.5,
                }}>PHỔ BIẾN</div>
              )}
              {pkg.best && (
                <div style={{
                  position: 'absolute', top: -10, right: 12, fontSize: 10, fontWeight: 700,
                  background: '#F59E0B', color: 'white', padding: '3px 10px', borderRadius: 20,
                  letterSpacing: 0.5,
                }}>GIÁ TRỊ NHẤT</div>
              )}
              <div style={{ fontSize: 28, marginBottom: 10 }}>💎</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: -0.5, marginBottom: 4 }}>
                {fmt(pkg.gems)}
                {pkg.bonus > 0 && <span style={{ fontSize: 13, color: '#10B981', fontWeight: 700, marginLeft: 6 }}>+{fmt(pkg.bonus)}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Linh Thạch</div>
              <div style={{
                padding: '8px 0', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14,
                background: pkg.popular ? '#7C3AED' : pkg.best ? '#F59E0B' : 'var(--surface2)',
                color: pkg.popular || pkg.best ? 'white' : 'var(--text)',
              }}>{fmtVND(pkg.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 24, padding: 36, maxWidth: 400, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💎</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                {fmt(confirm.gems + confirm.bonus)} Linh Thạch
              </div>
              <div style={{ fontSize: 14, color: 'var(--text3)' }}>
                Mua gói {confirm.label} với giá <b style={{ color: 'var(--text)' }}>{fmtVND(confirm.price)}</b>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirm(null)} style={{
                flex: 1, padding: '12px 0', borderRadius: 12, fontSize: 15, fontWeight: 600,
                background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer', border: '1px solid var(--border)',
              }}>Huỷ</button>
              <button onClick={handlePurchase} disabled={buying} style={{
                flex: 1, padding: '12px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white',
                cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1,
              }}>{buying ? 'Đang xử lý...' : 'Xác nhận'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Lịch sử giao dịch</div>
        {histLoading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text3)' }}>Chưa có giao dịch nào</div>
        ) : (
          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {history.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    background: tx.amount > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  }}>
                    {tx.type === 'purchase' ? '💎' : tx.type === 'earn' ? '🎁' : tx.amount > 0 ? '➕' : '➖'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{tx.desc}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtDate(tx.date)}</div>
                  </div>
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)',
                  color: tx.amount > 0 ? '#10B981' : '#EF4444',
                }}>
                  {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Account section ────────────────────────────────────────────────────────────

function AccountSection({ user, onUserChange }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name ?? '');
  const [bio, setBio]         = useState(user?.bio ?? '');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
  }, [user?.name, user?.bio]);

  const handleSave = useCallback(async () => {
    if (!editing) { setEditing(true); return; }
    setSaving(true);
    try {
      const updated = await api.updateUserProfile(user.email, name, bio);
      onUserChange(updated);
      setEditing(false);
    } catch (e) {
      alert('Lưu thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [editing, user?.email, name, bio, onUserChange]);

  return (
    <>
      {/* Header banner */}
      <div style={{
        height: 140, borderRadius: 20, marginBottom: -40,
        background: 'linear-gradient(135deg, #635BFF 0%, #4F46E5 50%, #7C3AED 100%)',
        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-accent)',
      }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -80, right: -50 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -100, left: 100 }} />
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <Btn variant={editing ? 'primary' : 'secondary'} onClick={handleSave} disabled={saving}>
            {saving ? '...' : editing ? <>{Icons.check(14)} Lưu</> : <>{Icons.edit(14)} Chỉnh sửa</>}
          </Btn>
        </div>
      </div>

      {/* Avatar card */}
      <div style={{
        background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)',
        padding: '0 28px 28px', marginBottom: 28, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', paddingTop: 0, marginBottom: 20 }}>
          <div style={{ position: 'relative', marginTop: -24 }}>
            {true ? (
              <img src={user.picture || '/logo_main.png'} alt={name} referrerPolicy="no-referrer" style={{
                width: 88, height: 88, borderRadius: 24, objectFit: 'cover',
                border: '4px solid var(--surface)', boxShadow: 'var(--shadow-accent)',
                display: 'block',
              }} />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: 24,
                background: 'linear-gradient(135deg, var(--accent), #4B44E8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)',
                border: '4px solid var(--surface)', boxShadow: 'var(--shadow-accent)',
              }}>{(name[0] || '?').toUpperCase()}</div>
            )}
          </div>
          <div style={{ paddingBottom: 4 }}>
            {editing ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: -0.6,
                  background: 'var(--surface2)', border: '1.5px solid var(--border2)', borderRadius: 10,
                  padding: '6px 12px', color: 'var(--text)', outline: 'none', marginBottom: 4, display: 'block',
                }}
              />
            ) : (
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: -0.6, marginBottom: 4 }}>{name}</div>
            )}
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user?.email}</div>
          </div>
        </div>

        {editing ? (
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={2}
            placeholder="Giới thiệu bản thân..."
            style={{
              fontSize: 14, color: 'var(--text2)', background: 'var(--surface2)',
              border: '1.5px solid var(--border2)', borderRadius: 10, padding: '10px 14px',
              width: '100%', resize: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            {bio || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Chưa có giới thiệu</span>}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '💎', val: fmt(user?.linh_thach ?? 0), label: 'Linh Thạch', accent: true },
          { icon: '🔥', val: user?.streak ?? 0, label: 'Ngày streak' },
          { icon: '📖', val: '—', label: 'Đã đọc' },
          { icon: '🔖', val: '—', label: 'Đã lưu' },
        ].map(({ icon, val, label, accent }) => (
          <div key={label} style={{
            textAlign: 'center', padding: '20px 16px',
            background: accent ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.08))' : 'var(--surface)',
            borderRadius: 16,
            border: `1px solid ${accent ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{
              fontSize: 24, fontWeight: 800, letterSpacing: -1, fontFamily: 'var(--font-display)',
              color: accent ? '#7C3AED' : 'var(--text)',
            }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Info fields */}
      <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {[
          { label: 'Email', value: user?.email, icon: '📧' },
          { label: 'Tham gia', value: fmtDate(user?.created_at), icon: '📅' },
          { label: 'Gói hiện tại', value: 'Free Plan', icon: '🌟' },
        ].map(({ label, value, icon }, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{value || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProfileScreen({ user: propUser, onUserUpdate, onLogout, dark, onToggleDark, onFontSizeChange, fontSize, autoAdvance, onAutoAdvanceChange, savePosition, onSavePositionChange }) {
  const isMobile = useIsMobile();
  const [user, setUser]               = useState(propUser);
  const [activeSection, setActiveSection] = useState('account');
  const [loadingUser, setLoadingUser] = useState(false);

  const setUserAndSync = useCallback((updater) => {
    setUser(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onUserUpdate?.(next);
      return next;
    });
  }, [onUserUpdate]);

  // Sync fresh user data on mount
  useEffect(() => {
    if (!propUser?.email) return;
    setLoadingUser(true);
    api.getUserProfile(propUser.email)
      .then(u => setUserAndSync(u))
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, [propUser?.email]);

  const handleBalanceChange = useCallback((newBalance) => {
    setUserAndSync(u => ({ ...u, linh_thach: newBalance }));
  }, [setUserAndSync]);

  const sections = [
    { id: 'account',       label: 'Tài khoản',  icon: '👤' },
    { id: 'linh-thach',    label: 'Linh Thạch', icon: '💎' },
    { id: 'reading',       label: 'Đọc sách',   icon: '📖' },
  ];

  const px = isMobile ? 16 : 48;

  if (isMobile) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                flexShrink: 0, padding: '12px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none',
                color: activeSection === s.id ? 'var(--accent)' : 'var(--text2)',
                borderBottom: activeSection === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
            <button onClick={onLogout} style={{
              flexShrink: 0, marginLeft: 'auto', padding: '12px 16px', fontSize: 13, fontWeight: 600,
              color: '#EF4444', background: 'none', cursor: 'pointer',
            }}>⎋ Đăng xuất</button>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 40px' }}>
          {loadingUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text3)' }}>Đang tải...</div>
          ) : (
            <>
              {activeSection === 'account' && <AccountSection user={user} onUserChange={setUserAndSync} />}
              {activeSection === 'linh-thach' && <LinhThachSection user={user} onBalanceChange={handleBalanceChange} />}
              {activeSection === 'reading' && (
                <>
                  <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.8, fontFamily: 'var(--font-display)', marginBottom: 20 }}>Cài đặt đọc sách</h1>
                  <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <SettingItem label="Chế độ tối" desc="Bảo vệ mắt ban đêm">
                      <Toggle value={dark} onChange={onToggleDark} />
                    </SettingItem>
                    <SettingItem label="Cỡ chữ" desc={`${fontSize}px`} border>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => onFontSizeChange(Math.max(13, fontSize - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', fontSize: 18, cursor: 'pointer', color: 'var(--text)' }}>−</button>
                        <span style={{ fontSize: 15, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{fontSize}</span>
                        <button onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', fontSize: 18, cursor: 'pointer', color: 'var(--text)' }}>+</button>
                      </div>
                    </SettingItem>
                    <SettingItem label="Tự động chuyển chương" border>
                      <Toggle value={autoAdvance} onChange={() => onAutoAdvanceChange(v => !v)} />
                    </SettingItem>
                    <SettingItem label="Lưu vị trí đọc" border>
                      <Toggle value={savePosition} onChange={() => onSavePositionChange(v => !v)} />
                    </SettingItem>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 230, borderRight: '1px solid var(--border)', padding: '28px 14px',
        background: 'var(--surface)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {/* User card */}
        <div style={{
          padding: '16px 14px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(99,91,255,0.12), rgba(79,70,229,0.06))',
          border: '1px solid rgba(99,91,255,0.2)', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), #4B44E8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'white',
            }}>{(user?.name?.[0] || '?').toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>💎 Linh Thạch</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#7C3AED', fontFamily: 'var(--font-display)' }}>
              {fmt(user?.linh_thach ?? 0)}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.2, textTransform: 'uppercase', padding: '0 8px', marginBottom: 4 }}>Cài đặt</div>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10, background: activeSection === s.id ? 'var(--accent-bg)' : 'transparent',
              color: activeSection === s.id ? 'var(--accent)' : 'var(--text2)',
              fontSize: 14, fontWeight: activeSection === s.id ? 600 : 400,
              textAlign: 'left', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 17 }}>{s.icon}</span>{s.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, background: 'rgba(239,68,68,0.06)', color: '#EF4444',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', textAlign: 'left',
          }}
        >⎋ Đăng xuất</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 48px', paddingBottom: 60 }}>
        {loadingUser ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text3)' }}>Đang tải...</div>
        ) : (
          <>
            {activeSection === 'account' && (
              <AccountSection user={user} onUserChange={setUserAndSync} />
            )}
            {activeSection === 'linh-thach' && (
              <LinhThachSection user={user} onBalanceChange={handleBalanceChange} />
            )}
            {activeSection === 'reading' && (
              <>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, fontFamily: 'var(--font-display)', marginBottom: 28 }}>Cài đặt đọc sách</h1>
                <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <SettingItem label="Chế độ tối" desc="Chuyển sang nền tối để bảo vệ mắt ban đêm">
                    <Toggle value={dark} onChange={onToggleDark} />
                  </SettingItem>
                  <SettingItem label="Cỡ chữ đọc" desc={`Kích thước hiện tại: ${fontSize}px`} border>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => onFontSizeChange(Math.max(13, fontSize - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', fontSize: 18, cursor: 'pointer', color: 'var(--text)' }}>−</button>
                      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{fontSize}</span>
                      <button onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', fontSize: 18, cursor: 'pointer', color: 'var(--text)' }}>+</button>
                    </div>
                  </SettingItem>
                  <SettingItem label="Tự động chuyển chương" desc="Tự động đọc chương tiếp theo khi xong" border>
                    <Toggle value={autoAdvance} onChange={() => onAutoAdvanceChange(v => !v)} />
                  </SettingItem>
                  <SettingItem label="Lưu vị trí đọc" desc="Nhớ vị trí đọc cuối khi tắt app" border>
                    <Toggle value={savePosition} onChange={() => onSavePositionChange(v => !v)} />
                  </SettingItem>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
