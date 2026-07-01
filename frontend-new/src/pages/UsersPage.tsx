import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import { TbUsers, TbPlus, TbX, TbShield, TbUser, TbCheck, TbPlane, TbTrash, TbSearch, TbKey } from 'react-icons/tb';

type UserRole = 'ADMIN' | 'USER' | 'CREW';

const EMPTY_FORM = { username: '', email: '', password: '', role: 'USER' as UserRole };

const ROLE_COLORS = {
  ADMIN: { bg: '#f3e8ff', text: '#7c3aed', border: '#ddd6fe' },
  USER:  { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  CREW:  { bg: '#fef9c3', text: '#ca8a04', border: '#fde68a' },
};

const ROLE_ICON = { ADMIN: TbShield, USER: TbUser, CREW: TbPlane };

export default function UsersPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Password change state
  const [pwUser, setPwUser] = useState<{ id: number; username: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const bg       = isDark ? '#07162c' : '#f8fafc';
  const card     = isDark ? '#071628' : 'white';
  const border   = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted   = isDark ? '#4a7aab' : '#6b7280';
  const inputBg     = isDark ? '#0a1e38' : '#f9fafb';

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getUsers().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) => authAPI.register(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSuccess(`User "${vars.username}" created successfully.`);
      setTimeout(() => setSuccess(''), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setConfirmDeleteId(null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      authAPI.changePassword(id, password),
    onSuccess: () => {
      setPwUser(null);
      setNewPassword('');
      setSuccess('Password changed successfully.');
      setTimeout(() => setSuccess(''), 4000);
    },
  });

  const filtered = (users as any[]).filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const canSubmit = form.username.trim() && form.email.trim() && form.password.length >= 6;
  const inputStyle = { background: inputBg, borderColor: border, color: textPrimary };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4" style={{ background: bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TbUsers className="w-6 h-6 text-[#C41E3A]" />
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>User Management</h1>
        <span className="text-sm ml-1" style={{ color: textMuted }}>{users.length} users</span>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#C41E3A' }}
        >
          <TbPlus className="w-4 h-4" />
          New User
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          <TbCheck className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-xl border p-4 text-sm"
        style={{ background: isDark ? '#0a1622' : '#f0f6ff', borderColor: isDark ? '#1a2e4a' : '#bfdbfe', color: isDark ? '#4a7aab' : '#1d4ed8' }}>
        <p className="font-medium mb-1">Admin note</p>
        <p className="text-xs opacity-80">
          ADMIN — full access · USER — read only · CREW — flight details & seat scoring only
        </p>
      </div>

      {/* Search + role filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none"
            style={{ background: card, borderColor: border, color: textPrimary }}
          />
        </div>
        <div className="flex gap-1">
          {['ALL', 'ADMIN', 'USER', 'CREW'].map((r) => (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: filterRole === r ? '#C41E3A' : 'transparent',
                color: filterRole === r ? 'white' : textMuted,
                borderColor: filterRole === r ? '#C41E3A' : border,
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#C41E3A', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 gap-3">
          <TbUsers className="w-12 h-12 opacity-20" style={{ color: textMuted }} />
          <p className="text-sm" style={{ color: textMuted }}>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u: any) => {
            const rc = ROLE_COLORS[u.role as UserRole] ?? ROLE_COLORS.USER;
            const Icon = ROLE_ICON[u.role as UserRole] ?? TbUser;
            return (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border"
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
                  <Icon className="w-3 h-3" />
                  {u.role}
                </span>
                <button
                  onClick={() => { setPwUser({ id: u.id, username: u.username }); setNewPassword(''); }}
                  className="p-1.5 rounded-lg border transition-opacity hover:opacity-70"
                  style={{ borderColor: '#38bdf840', color: '#38bdf8' }}
                  title="Change password"
                >
                  <TbKey className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(u.id)}
                  className="p-1.5 rounded-lg border transition-opacity hover:opacity-70"
                  style={{ borderColor: '#ef444440', color: '#ef4444' }}
                >
                  <TbTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
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
              {[
                { label: 'Username', key: 'username', type: 'text', placeholder: 'john.doe' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@royalairmaroc.ma' },
                { label: 'Password (min 6)', key: 'password', type: 'password', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: textMuted }}>Role</label>
                <div className="flex gap-2">
                  {(['USER', 'ADMIN', 'CREW'] as const).map((role) => {
                    const rc = ROLE_COLORS[role];
                    const Icon = ROLE_ICON[role];
                    const active = form.role === role;
                    return (
                      <button key={role} onClick={() => setForm((f) => ({ ...f, role }))}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all"
                        style={{ background: active ? rc.bg : 'transparent', color: active ? rc.text : textMuted, borderColor: active ? rc.border : border }}>
                        <Icon className="w-3.5 h-3.5" />
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {createMutation.isError && (
              <p className="text-xs text-red-400">Failed to create user. Username or email may already exist.</p>
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

      {/* Change Password Modal */}
      {pwUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
                Change Password
              </h2>
              <button onClick={() => setPwUser(null)}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>
            <p className="text-sm" style={{ color: textMuted }}>
              User: <span style={{ color: textPrimary, fontWeight: 600 }}>{pwUser.username}</span>
            </p>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                New Password (min 6)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={inputStyle}
              />
            </div>
            {changePasswordMutation.isError && (
              <p className="text-xs text-red-400">Failed to change password.</p>
            )}
            <button
              onClick={() => changePasswordMutation.mutate({ id: pwUser.id, password: newPassword })}
              disabled={newPassword.length < 6 || changePasswordMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {changePasswordMutation.isPending ? 'Saving…' : 'Save Password'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: '#ef444440' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#ef444420' }}>
                <TbTrash className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>Delete User</p>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>This will permanently remove the account.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: border, color: textMuted }}>Cancel</button>
              <button onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#ef4444' }}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
