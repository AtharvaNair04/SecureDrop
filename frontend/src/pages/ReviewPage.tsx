import {
  useEffect,
  useState,
} from 'react';

import {
  dropsApi,
  Drop,
  DropStatus,
} from '../api';

import {
  statusBadge,
  timeAgo,
} from '../utils';

import './ReviewPage.css';

const STATUSES: DropStatus[] = [
  'PENDING',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED',
];

export default function ReviewPage() {
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

  // backend currently has NO updateStatus endpoint
  // keep UI but disable actions safely

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
          Review queue
        </h1>

        <p className="page-subtitle">
          All submissions
          across all users
        </p>
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
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          'var(--text2)',
                        fontFamily:
                          'var(--font-mono)',
                      }}
                    >
                      Status updates
                      not yet
                      supported by
                      backend
                    </span>
                  </div>
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}