import { useState } from 'react';
import { forumCategories } from '../data/site.js';
import { useSim, currentMember, demoMember, postThread, postReply, reportPost, forumView } from '../lib/store.js';
import { gasEnabled } from '../lib/gas.js';
import { useRealtimeData } from '../hooks/useRealtimeData.js';
import { Gate, fmt } from './ui.jsx';

const lastAt = (t) => Math.max(...t.posts.map((p) => +new Date(p.at)));

function Reply({ thread, member }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  // Balasan langsung muncul di topik; kolom dikosongkan setelah server menerima.
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await postReply(member.id, thread.id, text);
      if (r.ok) {
        setText('');
        setErr('');
      } else setErr(r.reason);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="compose" onSubmit={submit} noValidate>
      <label className="field__label" htmlFor={`reply-${thread.id}`}>
        Balasan sebagai {member.nick}
      </label>
      <textarea
        id={`reply-${thread.id}`}
        className="input"
        rows={3}
        maxLength={600}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-invalid={Boolean(err)}
      />
      {err && (
        <p className="field__error" role="alert">
          {err}
        </p>
      )}
      <button className="btn btn--primary btn--sm" type="submit" disabled={busy}>
        {busy ? 'Mengirim...' : 'Kirim balasan'}
      </button>
    </form>
  );
}

function NewThread({ member, onCreated }) {
  const [v, setV] = useState({ title: '', cat: forumCategories[0], text: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await postThread(member.id, v);
      if (r.ok) {
        setV({ title: '', cat: forumCategories[0], text: '' });
        setErr('');
        onCreated(r.id);
      } else setErr(r.reason);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="compose compose--new" onSubmit={submit} noValidate>
      <div className="field">
        <label className="field__label" htmlFor="nt-title">
          Judul topik
        </label>
        <input
          id="nt-title"
          className="input"
          type="text"
          maxLength={90}
          value={v.title}
          onChange={(e) => setV({ ...v, title: e.target.value })}
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="nt-cat">
          Kategori
        </label>
        <select id="nt-cat" className="input" value={v.cat} onChange={(e) => setV({ ...v, cat: e.target.value })}>
          {forumCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="nt-text">
          Isi topik
        </label>
        <textarea
          id="nt-text"
          className="input"
          rows={4}
          maxLength={600}
          value={v.text}
          onChange={(e) => setV({ ...v, text: e.target.value })}
        />
        <p className="field__hint">Maksimal 600 karakter. Bahas gagasan, jangan menyerang orang.</p>
      </div>
      {err && (
        <p className="field__error" role="alert">
          {err}
        </p>
      )}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? 'Menerbitkan...' : 'Terbitkan topik'}
      </button>
    </form>
  );
}

export default function Forum() {
  const s = useSim();
  const member = currentMember(s);
  const [open, setOpen] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const { loading } = useRealtimeData(); // topik dan komentar diperbarui otomatis bila tersambung ke Google Spreadsheet
  const threads = [...forumView(s)].sort((a, b) => lastAt(b) - lastAt(a));

  return (
    <div className="forum">
      <div className="forum__intro">
        <p>
          Forum tidak mengambil keputusan. Ia dipakai menyusun pertimbangan sebelum sebuah usulan masuk Rembuk Pekanan.
        </p>
        <ul className="rules-list" aria-label="Tata krama forum">
          <li>Bahas gagasan, bukan menyerang orang.</li>
          <li>Tanpa ujaran kebencian, doxing, atau tuduhan tanpa sumber.</li>
          <li>Tulisan berisi kata kasar ditolak sebelum terkirim, juga pada nama panggilan dan aspirasi.</li>
          <li>Satu orang satu akun. Jangan menyamar sebagai anggota lain.</li>
          <li>Laporan menyembunyikan unggahan sementara sampai moderator memutuskan.</li>
        </ul>
      </div>

      {!member && (
        <Gate
          what="menulis di forum"
          extra={gasEnabled() ? undefined : 'Menekan Laporkan pada sebuah unggahan otomatis memasukkanmu sebagai anggota demo.'}
        />
      )}

      {member && (
        <div className="forum__new">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            aria-expanded={showNew}
            aria-controls="new-topic"
            onClick={() => setShowNew((x) => !x)}
          >
            {showNew ? 'Tutup formulir topik' : 'Buka topik baru'}
          </button>
          {showNew && (
            <div id="new-topic">
              <NewThread
                member={member}
                onCreated={(id) => {
                  setShowNew(false);
                  setOpen(id);
                }}
              />
            </div>
          )}
        </div>
      )}

      {threads.length === 0 ? (
        <p className="empty">{loading ? 'Memuat topik...' : 'Belum ada topik. Jadilah yang pertama membuka diskusi.'}</p>
      ) : (
        <div className="threads">
          {threads.map((t) => (
            <details
              key={t.id}
              className="thread"
              open={open === t.id}
              onToggle={(e) => {
                if (e.currentTarget.open) setOpen(t.id);
                else if (open === t.id) setOpen(null);
              }}
            >
              <summary className="thread__sum">
                <span className="thread__title">{t.title}</span>
                <span className="thread__meta">
                  {t.cat}, {t.posts.length} unggahan, terakhir {fmt(new Date(lastAt(t)).toISOString())}
                </span>
              </summary>
              <ol className="posts">
                {t.posts.map((p) => (
                  <li key={p.id} className={`post${p.reported ? ' post--reported' : ''}`}>
                    <p className="post__head">
                      <strong>{p.author}</strong> <time dateTime={p.at}>{fmt(p.at)}</time>
                    </p>
                    {p.reported ? (
                      <p className="post__text post__text--hidden">
                        Unggahan ini dilaporkan dan disembunyikan sementara. Moderator menjawab dalam 24 jam (jadwal simulasi).
                      </p>
                    ) : (
                      <>
                        <p className="post__text">{p.text}</p>
                        <button
                          type="button"
                          className="linkbtn"
                          onClick={() => {
                            // Laporan hanya berlaku di perangkat ini, jadi mode Google Spreadsheet tidak perlu membuat anggota demo.
                            if (!member && !gasEnabled()) demoMember();
                            reportPost(t.id, p.id);
                          }}
                        >
                          Laporkan
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ol>
              {member && <Reply thread={t} member={member} />}
            </details>
          ))}
        </div>
      )}

      <details className="log">
        <summary>Log moderasi di perangkat ini ({s.reports.length})</summary>
        {s.reports.length === 0 ? (
          <p className="empty">Belum ada laporan. Tombol Laporkan pada unggahan akan mencatatnya di sini.</p>
        ) : (
          <ul>
            {s.reports.map((r) => (
              <li key={r.id}>
                <span className="num">{fmt(r.at)}</span> {r.thread}: {r.status}.
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
