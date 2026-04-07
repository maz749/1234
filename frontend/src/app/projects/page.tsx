'use client';
import { useEffect, useState } from 'react';
import { getProjects, deleteProject } from '@/services/api';
import type { Project } from '@/services/api';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth'); return; }
    getProjects()
      .then(setProjects)
      .catch(() => toast.error('Не удалось загрузить проекты'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      setProjects(p => p.filter(proj => proj.id !== id));
      toast.success('Проект удалён');
    } catch { toast.error('Ошибка удаления'); }
  };

  const getConfig = (json: string) => {
    try { return JSON.parse(json); } catch { return {}; }
  };

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', padding: '120px 60px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ width: 30, height: 1, background: '#f5f0e8', display: 'block' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#f5f0e8' }}>
              Мои проекты
            </span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300 }}>
            Сохранённые <em style={{ fontStyle: 'italic', color: '#f5f0e8' }}>конфигурации</em>
          </h1>
        </div>
        <Link href="/configurator" style={{
          background: '#f5f0e8', color: '#f5f0e8', padding: '14px 32px',
          fontSize: 11, fontWeight: 500, letterSpacing: '0.15em',
          textTransform: 'uppercase', textDecoration: 'none',
        }}>
          + Новый проект
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#8b7d6b', padding: 80 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24 }}>Загрузка...</div>
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 100,
          border: '1px dashed rgba(28,25,22,0.15)',
        }}>
          <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.2 }}>📁</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#8b7d6b', marginBottom: 16 }}>
            Проектов пока нет
          </div>
          <p style={{ fontSize: 13, color: '#3d3530', marginBottom: 32 }}>
            Откройте конфигуратор, создайте дизайн и сохраните проект
          </p>
          <Link href="/configurator" style={{
            background: '#f5f0e8', color: '#f5f0e8', padding: '14px 36px',
            fontSize: 11, fontWeight: 500, letterSpacing: '0.2em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Открыть конфигуратор
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {projects.map(p => {
            const cfg = getConfig(p.config_json);
            const date = new Date(p.updated_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={p.id} style={{
                border: '1px solid rgba(28,25,22,0.12)',
                background: 'rgba(255,255,255,0.02)',
                padding: 28, transition: 'all 0.4s',
              }}>
                {/* Color preview */}
                <div style={{
                  height: 80, marginBottom: 20,
                  background: cfg.selectedMaterial?.color
                    ? `linear-gradient(135deg, ${cfg.selectedMaterial.color}, ${cfg.selectedMaterial.color}88)`
                    : 'rgba(28,25,22,0.08)',
                  border: '1px solid rgba(28,25,22,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!cfg.selectedMaterial && (
                    <span style={{ fontSize: 24, opacity: 0.3 }}>🧊</span>
                  )}
                </div>

                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 8 }}>
                  {p.name}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {[
                    { label: 'Тип', value: cfg.category || '—' },
                    { label: 'Материал', value: cfg.selectedMaterial?.name || 'Не выбран' },
                    { label: 'Размер', value: cfg.width ? `${cfg.width}×${cfg.height}м` : '—' },
                    { label: 'Обновлён', value: date },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 9, color: '#3d3530', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12, color: '#d4c9b8' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Link href="/configurator" style={{
                    flex: 1, textAlign: 'center', padding: '10px',
                    border: '1px solid rgba(28,25,22,0.2)', color: '#d4c9b8',
                    fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                    textDecoration: 'none', transition: 'all 0.3s',
                  }}>
                    Открыть
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      padding: '10px 16px', border: '1px solid rgba(180,60,60,0.3)',
                      background: 'transparent', color: '#8b5a5a',
                      fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
