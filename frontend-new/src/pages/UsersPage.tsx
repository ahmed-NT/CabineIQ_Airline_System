import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import { TbUsers, TbPlus, TbX, TbShield, TbUser, TbCheck, TbPlane } from 'react-icons/tb';

type UserRole = 'ADMIN' | 'USER' | 'CREW';

interface CreatedUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: CreatedUser = {
  username: '',
  email: '',
  password: '',
  role: 'USER',
};

const ROLE_COLORS = {
  ADMIN: { bg: '#2a1040', text: '#a78bfa', border: '#4c1d95' },
  USER: { bg: '#0f2a1a', text: '#4ade80', border: '#14532d' },
  CREW: { bg: '#2a1e00', text: '#fbbf24', border: '#92400e' },
};

export default function UsersPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreatedUser>(EMPTY_FORM);
  const [created, setCreated] = useState<CreatedUser[]>([]);
  const [success, setSuccess] = useState('');

  const bg = isDark ? '#07162c' : '#f8fafc';
  const card = isDark ? '#071628' : 'white';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted = isDark ? '#4a7aab' : '#6b7280';
  const inputBg = isDark ? '#0a1e38' : '#f9fafb';

  const createMutation = useMutation({
    mutationFn: (data: CreatedUser) => authAPI.register(data),
    onSuccess: () => {
      const user: CreatedUser = { ...form };
      setCreated((prev) => [user, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSuccess(`User "${user.username}" created successfully.`);
      setTimeout(() => setSuccess(''), 4000);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const canSubmit =
    form.username.trim() &&
    form.email.trim() &&
    form.password.length >= 6;

  const inputClass = 'w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#C41E3A] transition-colors';
  const inputStyle = { background: inputBg, borderColor: border, color: textPrimary };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4" style={{ background: bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TbUsers className="w-6 h-6 text-[#C41E3A]" />
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#C41E3A' }}
        >
          <TbPlus className="w-4 h-4" />
          New User
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: '#0f2a1a', color: '#4ade80', border: '1px solid #14532d' }}>
          <TbCheck className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-xl border p-4 text-sm"
        style={{ background: isDark ? '#0a1622' : '#f0f6ff', borderColor: isDark ? '#1a2e4a' : '#bfdbfe', color: isDark ? '#4a7aab' : '#1d4ed8' }}>
        <p className="font-medium mb-1">Admin note</p>
        <p className="text-xs opacity-80">
          Users created here receive access to the CabineIQ admin dashboard.
          ADMIN role has full access. USER role has read-only access.
          CREW role can only access flight details and score seats.
        </p>
      </div>

      {/* Created users this session */}
      {created.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
            Created this session
          </p>
          {created.map((u: CreatedUser, i) => {
            const rc = ROLE_COLORS[u.role];
            return (
              <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl border"
                style={{ background: card, borderColor: border }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: '#C41E3A' }}>
                  {u.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>{u.username}</p>
                  <p className="text-xs truncate" style={{ color: textMuted }}>{u.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                  {u.role === 'ADMIN'
                    ? <TbShield className="w-3 h-3" />
                    : u.role === 'CREW'
                    ? <TbPlane className="w-3 h-3" />
                    : <TbUser className="w-3 h-3" />}
                  {u.role}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Placeholder for existing users */}
      {created.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <TbUsers className="w-12 h-12 opacity-20" style={{ color: textMuted }} />
          <p className="text-sm" style={{ color: textMuted }}>
            No users created in this session yet
          </p>
          <p className="text-xs text-center max-w-xs" style={{ color: isDark ? '#2a5080' : '#9ca3af' }}>
            User list requires a dedicated admin endpoint (not yet exposed by auth-service).
            Use the button above to create new accounts.
          </p>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>New User</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="john.doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="john@royalairmaroc.ma"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                  Password <span style={{ color: isDark ? '#2a5080' : '#9ca3af' }}>(min 6 chars)</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: textMuted }}>
                  Role
                </label>
                <div className="flex gap-2">
                  {(['USER', 'ADMIN', 'CREW'] as const).map((role) => {
                    const rc = ROLE_COLORS[role];
                    const active = form.role === role;
                    const Icon = role === 'ADMIN' ? TbShield : role === 'CREW' ? TbPlane : TbUser;
                    return (
                      <button
                        key={role}
                        onClick={() => setForm((f) => ({ ...f, role }))}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all"
                        style={{
                          background: active ? rc.bg : 'transparent',
                          color: active ? rc.text : textMuted,
                          borderColor: active ? rc.border : border,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {createMutation.isError && (
              <p className="text-xs text-red-400">
                Failed to create user. Username or email may already exist.
              </p>
            )}

            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!canSubmit || createMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
