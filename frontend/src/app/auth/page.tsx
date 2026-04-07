'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/services/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const resp = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      setAuth(resp.user, resp.token);
      toast.success(mode === 'login' ? 'Добро пожаловать!' : 'Аккаунт создан!');
      router.push('/projects');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(28,25,22,0.2)', color: '#f5f0e8',
    padding: '14px 16px', fontSize: 13, outline: 'none',
    marginBottom: 16,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#f5f0e8', letterSpacing: '0.2em', marginBottom: 16 }}>
            FACADE·STUDIO
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 36, border: '1px solid rgba(28,25,22,0.15)' }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '12px', fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', border: 'none', cursor: 'pointer',
              background: mode === m ? '#f5f0e8' : 'transparent',
              color: mode === m ? '#f5f0e8' : '#8b7d6b',
              transition: 'all 0.3s',
            }}>
              {m === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        {/* Form */}
        {mode === 'register' && (
          <input
            type="text" placeholder="Имя" value={form.name}
            onChange={e => set('name', e.target.value)}
            style={inputStyle}
          />
        )}
        <input
          type="email" placeholder="Email" value={form.email}
          onChange={e => set('email', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />
        <input
          type="password" placeholder="Пароль" value={form.password}
          onChange={e => set('password', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', background: '#f5f0e8', color: '#f5f0e8',
            border: 'none', padding: '16px', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 8,
          }}
        >
          {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </div>
    </div>
  );
}
