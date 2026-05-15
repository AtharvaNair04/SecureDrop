import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  dropsApi,
  Drop,
} from '../api';

import {
  statusBadge,
  timeAgo,
} from '../utils';

import './DropsPage.css';

export function MyDropsPage() {
  const [drops, setDrops] =
    useState<Drop[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    dropsApi
      .listMine()
      .then(setDrops)
      .catch((e) =>
        setError(e.message),
      )
      .finally(() =>
        setLoading(false),
      );
  }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">
          My drops
        </h1>

        <p className="page-subtitle">
          All submissions
          you've made
        </p>
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
        drops.length ===
          0 && (
          <div className="empty-state">
            <div className="empty-icon">
              ◈
            </div>

            <p>
              Nothing yet.{' '}
              <Link to="/submit">
                Make your
                first
                submission.
              </Link>
            </p>
          </div>
        )}

      {!loading &&
        drops.length > 0 && (
          <div className="drops-table">
            <div className="table-header">
              <span>
                Title
              </span>

              <span>
                Status
              </span>

              <span>
                File
              </span>

              <span>
                Submitted
              </span>
            </div>

            {drops.map(
              (drop) => (
                <Link
                  to={`/my-drops/${drop.id}`}
                  key={drop.id}
                  className="table-row"
                >
                  <span className="drop-title">
                    {drop.title ||
                      'Untitled'}
                  </span>

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
                      fontSize: 12,
                      color:
                        'var(--text3)',
                    }}
                  >
                    {drop
                      .attachments
                      ?.length >
                    0
                      ? drop
                          .attachments[0]
                          .originalName
                      : '—'}
                  </span>

                  <span
                    className="mono"
                    style={{
                      fontSize: 12,
                      color:
                        'var(--text3)',
                    }}
                  >
                    {timeAgo(
                      drop.createdAt,
                    )}
                  </span>
                </Link>
              ),
            )}
          </div>
        )}
    </div>
  );
}

export function DropDetailPage() {
  const { id } =
    useParams<{
      id: string;
    }>();

  const [drop, setDrop] =
    useState<Drop | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    dropsApi
      .getOne(id)
      .then(setDrop)
      .catch((e) =>
        setError(e.message),
      )
      .finally(() =>
        setLoading(false),
      );
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems:
            'center',
          color:
            'var(--text2)',
          padding: 40,
        }}
      >
        <div className="spinner" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="error-text"
        style={{
          padding: 40,
        }}
      >
        {error}
      </p>
    );
  }

  if (!drop) {
    return null;
  }

  return (
    <div className="fade-up">
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems:
            'flex-start',
          justifyContent:
            'space-between',
          gap: 12,
        }}
      >
        <div>
          <Link
            to="/my-drops"
            style={{
              color:
                'var(--text3)',
              fontSize: 13,
              fontFamily:
                'var(--font-mono)',
            }}
          >
            ← Back
          </Link>

          <h1
            className="page-title"
            style={{
              marginTop: 6,
            }}
          >
            {drop.title ||
              'Untitled'}
          </h1>
        </div>

        <span
          dangerouslySetInnerHTML={{
            __html:
              statusBadge(
                drop.status,
              ),
          }}
        />
      </div>

      <div className="detail-grid">
        <div
          className="card"
          style={{
            gridArea:
              'main',
          }}
        >
          <h3 className="detail-section-title">
            Description
          </h3>

          <p
            style={{
              color:
                'var(--text)',
              lineHeight: 1.75,
              fontSize: 14,
              whiteSpace:
                'pre-wrap',
            }}
          >
            {
              drop.description
            }
          </p>
        </div>

        <div
          style={{
            gridArea:
              'meta',
            display: 'flex',
            flexDirection:
              'column',
            gap: 14,
          }}
        >
          <div className="card">
            <h3 className="detail-section-title">
              Details
            </h3>

            <div className="detail-meta-list">
              <div>
                <span>
                  ID
                </span>

                <span
                  className="mono"
                  style={{
                    fontSize: 12,
                  }}
                >
                  {drop.id}
                </span>
              </div>

              <div>
                <span>
                  Submitted
                </span>

                <span>
                  {new Date(
                    drop.createdAt,
                  ).toLocaleString()}
                </span>
              </div>

              <div>
                <span>
                  Last update
                </span>

                <span>
                  {new Date(
                    drop.updatedAt,
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {drop
            .attachments
            ?.length >
            0 && (
            <div className="card">
              <h3 className="detail-section-title">
                Attachments
              </h3>

              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: 12,
                  marginTop: 6,
                }}
              >
                {drop.attachments.map(
                  (
                    attachment,
                  ) => (
                    <div
                      key={
                        attachment.id
                      }
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                        }}
                      >
                        📎
                      </span>

                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color:
                              'var(--text)',
                          }}
                        >
                          {
                            attachment.originalName
                          }
                        </div>

                        <div
                          className="mono"
                          style={{
                            fontSize: 11,
                            color:
                              'var(--text3)',
                          }}
                        >
                          {(
                            attachment.fileSize /
                            1024
                          ).toFixed(
                            1,
                          )}{' '}
                          KB
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}