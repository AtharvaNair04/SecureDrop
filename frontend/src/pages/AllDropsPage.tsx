import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dropsApi, Drop } from '../api';
import { timeAgo } from '../utils';
import './DropsPage.css';

export function AllDropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dropsApi.listAll()
      .then(setDrops)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">All drops</h1>
        <p className="page-subtitle">Recent submissions from the community</p>
      </div>

      {loading && <div style={{ display:'flex',gap:10,alignItems:'center',color:'var(--text2)' }}><div className="spinner"/>Loading…</div>}
      {error   && <p className="error-text">{error}</p>}

      {!loading && drops.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>No drops yet.</p>
        </div>
      )}

      {!loading && drops.length > 0 && (
        <div className="drops-table">
          <div className="table-header">
            <span>Title</span>
            <span>Description</span>
            <span>File</span>
            <span>Submitted</span>
          </div>
          {drops.map(drop => (
            <div key={drop.id} className="table-row">
              <span className="drop-title">{drop.title || 'Untitled'}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text2)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {drop.description.substring(0, 50)}...
              </span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text3)' }}>
                {drop.fileName || '—'}
              </span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text3)' }}>
                {timeAgo(drop.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
