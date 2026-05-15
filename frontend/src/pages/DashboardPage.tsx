import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dropsApi, Drop, DropStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { statusBadge, timeAgo } from '../utils';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dropsApi.listMine()
      .then(setDrops)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats: Record<DropStatus, number> = {
    PENDING:      drops.filter(d => d.status === 'PENDING').length,
    UNDER_REVIEW: drops.filter(d => d.status === 'UNDER_REVIEW').length,
    RESOLVED:     drops.filter(d => d.status === 'RESOLVED').length,
    DISMISSED:    drops.filter(d => d.status === 'DISMISSED').length,
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Welcome back, <strong style={{ color: 'var(--accent)' }}>{user?.email}</strong></p>
      </div>

      <div className="stat-grid">
        {([
          { label: 'Total Drops',   value: drops.length,          color: 'var(--text)' },
          { label: 'Pending',       value: stats.PENDING,         color: 'var(--warn)' },
          { label: 'Under Review',  value: stats.UNDER_REVIEW,    color: 'var(--info)' },
          { label: 'Resolved',      value: stats.RESOLVED,        color: 'var(--accent)' },
        ] as const).map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-value" style={{ color }}>{loading ? '–' : value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="section-row">
        <h2 className="section-title">Recent activity</h2>
        <Link to="/submit" className="btn btn-primary btn-sm">+ New drop</Link>
      </div>

      {loading && <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text2)' }}><div className="spinner" /> Loading…</div>}
      {error   && <p className="error-text">{error}</p>}

      {!loading && drops.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>No drops yet. <Link to="/submit">Submit your first one.</Link></p>
        </div>
      )}

      {!loading && drops.length > 0 && (
        <div className="drop-list">
          {drops.slice(0, 8).map(drop => (
            <Link to={`/my-drops/${drop.id}`} key={drop.id} className="drop-row">
              <div className="drop-row-main">
                <span className="drop-title">{drop.title}</span>
                {drop.fileName && <span className="drop-file mono">📎 {drop.fileName}</span>}
              </div>
              <div className="drop-row-meta">
                <span dangerouslySetInnerHTML={{ __html: statusBadge(drop.status) }} />
                <span className="drop-time mono">{timeAgo(drop.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
