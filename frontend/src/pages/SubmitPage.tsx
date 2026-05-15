import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dropsApi } from '../api';
import './SubmitPage.css';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/zip'];

export default function SubmitPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('File type not allowed. Accepted: PDF, JPG, PNG, GIF, TXT, ZIP');
      setFile(null); return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_SIZE_MB}MB`);
      setFile(null); return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    if (file) fd.append('file', file);

    try {
      await dropsApi.submit(fd);
      setSuccess(true);
      setTimeout(() => navigate('/my-drops'), 1800);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="submit-success fade-up">
        <div className="success-icon">✓</div>
        <h2>Drop submitted</h2>
        <p className="mono">Your submission has been received and encrypted.</p>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">New drop</h1>
        <p className="page-subtitle">Submit a tip or document anonymously. All submissions are end-to-end encrypted.</p>
      </div>

      <div className="submit-grid">
        <form onSubmit={handleSubmit} className="submit-form card">
          <div className="field">
            <label>Title</label>
            <input
              className="input"
              placeholder="Brief subject of your tip"
              value={form.title}
              onChange={set('title')}
              required
              maxLength={200}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              className="textarea"
              placeholder="Describe what you're submitting, provide context, or paste relevant text here…"
              value={form.description}
              onChange={set('description')}
              required
              rows={6}
            />
          </div>

          <div className="field">
            <label>Attach file <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
            <div
              className={`file-drop-zone ${file ? 'has-file' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) {
                  const fake = { target: { files: [f] } } as any;
                  handleFile(fake);
                }
              }}
            >
              <input ref={fileRef} type="file" hidden onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.zip" />
              {file ? (
                <div className="file-selected">
                  <span>📎 {file.name}</span>
                  <span className="mono" style={{ color: 'var(--text3)', fontSize: 12 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
                </div>
              ) : (
                <>
                  <div className="file-icon">↑</div>
                  <div>Drag & drop or click to select</div>
                  <div className="mono" style={{ color: 'var(--text3)', fontSize: 11, marginTop: 4 }}>
                    PDF, JPG, PNG, GIF, TXT, ZIP · max {MAX_SIZE_MB}MB
                  </div>
                </>
              )}
            </div>
            {fileError && <p className="error-text">{fileError}</p>}
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="submit-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" />Encrypting & sending…</> : '↑ Submit drop'}
            </button>
            <p className="submit-note mono">Your IP is not logged. Submission is anonymous.</p>
          </div>
        </form>

        <div className="submit-sidebar">
          <div className="card">
            <h3 className="tip-heading">Security tips</h3>
            <ul className="tip-list">
              <li>Use Tor Browser or a VPN for maximum anonymity</li>
              <li>Do not submit from a work or school network</li>
              <li>Remove metadata from documents before uploading</li>
              <li>Do not discuss your submission over unencrypted channels</li>
              <li>Create a new email for this registration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
