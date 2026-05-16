
import {
  useEffect,
  useState,
} from 'react';

import {
  dropsApi,
  Drop,
  DropStatus,
} from '../api';

import { useAuth } from '../context/AuthContext';

import {
  statusBadge,
  timeAgo,
} from '../utils';

import './AdminPage.css';

const STATUSES: DropStatus[] = [
  'PENDING',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED',
];

export default function AdminPage() {
  const { user } = useAuth();

  const [drops, setDrops] =
    useState<Drop[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [filter, setFilter] =
    useState<
      DropStatus | 'ALL'
    >('ALL');

  const [expanded, setExpanded] =
    useState<string | null>(
      null,
    );

  const [updating, setUpdating] =
    useState<string | null>(null);

  const [updateError, setUpdateError] =
    useState('');

  const load = () => {
    setLoading(true);

    dropsApi
      .listAll()
      .then(setDrops)
      .catch((e) =>
        setError(e.message),
      )
      .finally(() =>
        setLoading(false),
      );
  };

  useEffect(load, []);

  const handleStatusUpdate = async (
    dropId: string,
    newStatus: DropStatus,
  ) => {
    try {
      setUpdating(dropId);
      setUpdateError('');

      const updated =
        await dropsApi.updateStatus(
          dropId,
          newStatus,
        );

      setDrops((prev) =>
        prev.map((d) =>
          d.id === dropId
            ? updated
            : d,
        ),
      );
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : 'Failed to update status',
      );
    } finally {
      setUpdating(null);
    }
  };

  const stats: Record<
    DropStatus,
    number
  > = {
    PENDING:
      drops.filter(
        (d) =>
          d.status ===
          'PENDING',
      ).length,

    UNDER_REVIEW:
      drops.filter(
        (d) =>
          d.status ===
          'UNDER_REVIEW',
      ).length,

    RESOLVED:
      drops.filter(
        (d) =>
          d.status ===
          'RESOLVED',
      ).length,

    REJECTED:
      drops.filter(
        (d) =>
          d.status ===
          'REJECTED',
      ).length,
  };

  const visible =
    filter === 'ALL'
      ? drops
      : drops.filter(
          (d) =>
            d.status ===
            filter,
        );

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">
          Admin Overview
        </h1>

        <p className="page-subtitle">
          All submissions
          across all users
        </p>
      </div>

      <div className="stats-grid">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="stat-card card"
          >
            <div className="stat-label">
              {status.replace(
                '_',
                ' ',
              )}
            </div>

            <div className="stat-number">
              {stats[status]}
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {([
          'ALL',
          ...STATUSES,
        ] as const).map(
          (s) => (
            <button
              key={s}
              className={`filter-btn ${
                filter === s
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setFilter(s)
              }
            >
              {s === 'ALL'
                ? `All (${drops.length})`
                : `${s.replace(
                    '_',
                    ' ',
                  )} (${
                    drops.filter(
                      (d) =>
                        d.status ===
                        s,
                    ).length
                  })`}
            </button>
          ),
        )}
      </div>

      {loading && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems:
              'center',
            color:
              'var(--text2)',
          }}
        >
          <div className="spinner" />
          Loading…
        </div>
      )}

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      {!loading &&
        visible.length ===
          0 && (
          <div className="empty-state">
            <div className="empty-icon">
              ◉
            </div>

            <p>
              No submissions
              in this filter.
            </p>
          </div>
        )}

      <div className="review-list">
        {visible.map(
          (drop) => (
            <div
              key={drop.id}
              className="review-card card"
            >
              <div
                className="review-card-top"
                onClick={() =>
                  setExpanded(
                    expanded ===
                      drop.id
                      ? null
                      : drop.id,
                  )
                }
              >
                <div className="review-card-left">
                  <span className="drop-title">
                    {drop.title ||
                      'Untitled'}
                  </span>

                  {drop.author && (
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          'var(--text3)',
                      }}
                    >
                      by{' '}
                      <strong>
                        {
                          drop.author
                            .email
                        }
                      </strong>
                    </span>
                  )}
                </div>

                <div className="review-card-right">
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        statusBadge(
                          drop.status,
                        ),
                    }}
                  />

                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color:
                        'var(--text3)',
                    }}
                  >
                    {timeAgo(
                      drop.createdAt,
                    )}
                  </span>

                  <span
                    style={{
                      color:
                        'var(--text3)',
                      fontSize: 16,
                    }}
                  >
                    {expanded ===
                    drop.id
                      ? '▲'
                      : '▼'}
                  </span>
                </div>
              </div>

              {expanded ===
                drop.id && (
                <div className="review-card-body">
                  <p
                    style={{
                      color:
                        'var(--text)',
                      fontSize: 14,
                      lineHeight: 1.7,
                      whiteSpace:
                        'pre-wrap',
                      marginBottom: 16,
                    }}
                  >
                    {
                      drop.description
                    }
                  </p>

                  {drop
                    .attachments
                    ?.length >
                    0 && (
                    <div className="review-file">
                      📎{' '}
                      <span className="mono">
                        {
                          drop
                            .attachments[0]
                            .originalName
                        }
                      </span>

                      <span
                        className="mono"
                        style={{
                          color:
                            'var(--text3)',
                          fontSize: 11,
                        }}
                      >
                        (
                        {(
                          drop
                            .attachments[0]
                            .fileSize /
                          1024
                        ).toFixed(
                          1,
                        )}{' '}
                        KB)
                      </span>
                    </div>
                  )}

                  <div className="review-actions">
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        flexWrap: 'wrap',
                      }}
                    >
                      {STATUSES.map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleStatusUpdate(
                                drop.id,
                                status,
                              )
                            }
                            disabled={
                              updating ===
                                drop.id ||
                              drop.status ===
                                status
                            }
                            style={{
                              padding:
                                '4px 10px',
                              fontSize: 12,
                              backgroundColor:
                                drop.status ===
                                status
                                  ? 'var(--accent)'
                                  : 'var(--bg2)',
                              color:
                                drop.status ===
                                status
                                  ? 'white'
                                  : 'var(--text2)',
                              border:
                                '1px solid var(--border)',
                              borderRadius: 3,
                              cursor:
                                updating ===
                                  drop.id
                                  ? 'wait'
                                  : 'pointer',
                              opacity:
                                updating ===
                                  drop.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {updating ===
                            drop.id
                              ? '...'
                              : status.replace(
                                  '_',
                                  ' ',
                                )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {updateError && (
                    <p
                      style={{
                        color:
                          'var(--error)',
                        fontSize: 12,
                        marginTop: 8,
                      }}
                    >
                      {updateError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
