import { useEffect, useState } from 'react';
import { aspCategories, ASP_REVIEW, ASP_AGENDA } from '../data/site.js';
import {
  useSim,
  currentMember,
  demoMember,
  submitAspiration,
  supportAspiration,
  supportCount,
  aspStatus,
} from '../lib/store.js';
import { Gate } from './ui.jsx';

const STAGE = {
  filed: 'Diajukan',
  review: 'Dikaji Kursi Kebijakan',
  agenda: 'Wajib masuk agenda Rembuk',
  decided: 'Diputuskan',
};

// Rute mini: stasiun Diajukan, Dikaji, Agenda, Diputuskan. Stasiun terakhir yang menyala = posisi saat ini.
function Route({ stage }) {
  const order = ['filed', 'review', 'agenda', 'decided'];
  const at = order.indexOf(stage);
  const labels = ['Diajukan', `Dikaji (${ASP_REVIEW})`, `Agenda (${ASP_AGENDA})`, 'Diputuskan'];
  return (
    <ol className="route-h" aria-label={`Tahap aspirasi: ${STAGE[stage]}`}>
      {labels.map((l, i) => (
        <li key={l} className={i <= at ? (i === at ? 'is-on is-here' : 'is-on') : undefined}>
          <span className="route-h__dot" aria-hidden="true" />
          <span>{l}</span>
        </li>
      ))}
    </ol>
  );
}

function Composer({ member, onSent }) {
  const [v, setV] = useState({ title: '', cat: aspCategories[0], text: '' });
  const [err, setErr] = useState('');
  function submit(e) {
    e.preventDefault();
    const r = submitAspiration(member.id, v);
    if (r.ok) {
      setV({ title: '', cat: aspCategories[0], text: '' });
      setErr('');
      onSent();
    } else setErr(r.reason);
  }
  return (
    <form className="compose compose--new" onSubmit={submit} noValidate>
      <h4 className="compose__title">Ajukan aspirasi baru</h4>
      <div className="field">
        <label className="field__label" htmlFor="as-title">
          Judul usulan
        </label>
        <input
          id="as-title"
          className="input"
          type="text"
          maxLength={90}
          value={v.title}
          onChange={(e) => setV({ ...v, title: e.target.value })}
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="as-cat">
          Kategori
        </label>
        <select id="as-cat" className="input" value={v.cat} onChange={(e) => setV({ ...v, cat: e.target.value })}>
          {aspCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <p className="field__hint">Pilih Pengaduan integritas untuk melaporkan penyalahgunaan kepada Komite Integritas.</p>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="as-text">
          Uraian dan usulan solusi
        </label>
        <textarea
          id="as-text"
          className="input"
          rows={4}
          maxLength={400}
          value={v.text}
          onChange={(e) => setV({ ...v, text: e.target.value })}
        />
        <p className="field__hint">Minimal 20 karakter, maksimal 400. Jangan menulis data pribadi orang lain.</p>
      </div>
      {err && (
        <p className="field__error" role="alert">
          {err}
        </p>
      )}
      <button className="btn btn--primary" type="submit">
        Ajukan aspirasi
      </button>
    </form>
  );
}

export default function Aspirations() {
  const s = useSim();
  const member = currentMember(s);
  const [sort, setSort] = useState('top');
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [auto, setAuto] = useState('');
  const [ticked, setTicked] = useState('');

  useEffect(() => {
    if (!sent) return;
    const id = setTimeout(() => setSent(false), 6000);
    return () => clearTimeout(id);
  }, [sent]);

  const items = [...s.asp].sort((a, b) =>
    sort === 'top' ? supportCount(s, b) - supportCount(s, a) : +new Date(b.at || 0) - +new Date(a.at || 0),
  );

  // Pengunjung yang menekan Dukung otomatis masuk sebagai anggota demo, sama seperti di Peron Suara.
  function support(id) {
    const m = member || demoMember();
    const r = supportAspiration(m.id, id);
    setMsg(r.ok ? '' : r.reason);
    setAuto(r.ok && !member ? `${m.nick} (${m.id})` : '');
    setTicked(r.ok ? id : '');
  }

  return (
    <div className="asp">
      <p>
        Setiap usulan melewati stasiun yang sama. Pada {ASP_REVIEW} dukungan, Kursi Kebijakan wajib menjawab tertulis dalam 7
        hari. Pada {ASP_AGENDA} dukungan, usulan wajib masuk agenda Rembuk Pekanan berikutnya.
      </p>

      {!member ? (
        <Gate what="mengajukan aspirasi" extra="Menekan Dukung pada usulan di bawah otomatis memasukkanmu sebagai anggota demo." />
      ) : (
        <Composer member={member} onSent={() => setSent(true)} />
      )}

      {sent && (
        <p className="notice" role="status">
          Aspirasi terkirim. Statusnya Diajukan dan sudah memuat satu dukunganmu, tampil di urutan Terbaru.
        </p>
      )}
      {auto && (
        <p className="notice" role="status">
          Dukunganmu tercatat. Kamu otomatis masuk sebagai anggota demo: {auto}.
        </p>
      )}

      <div className="asp__tools">
        <span id="asp-sort">Urutkan:</span>
        <div className="seg" role="group" aria-labelledby="asp-sort">
          <button type="button" aria-pressed={sort === 'top'} onClick={() => setSort('top')}>
            Terbanyak didukung
          </button>
          <button type="button" aria-pressed={sort === 'new'} onClick={() => setSort('new')}>
            Terbaru
          </button>
        </div>
      </div>

      {msg && (
        <p className="field__error" role="alert">
          {msg}
        </p>
      )}

      {items.length === 0 ? (
        <p className="empty">Belum ada aspirasi. Ajukan usulan pertama.</p>
      ) : (
        <ul className="asp__list">
          {items.map((a) => {
            const st = aspStatus(s, a);
            const mine = member && (s.supports[a.id] || []).includes(member.id);
            return (
              <li key={a.id} className="asp__item">
                <div className="asp__main">
                  <h4 className="asp__title">{a.title}</h4>
                  <p className="asp__meta">
                    {a.author}, {a.cat}
                    {a.sim ? ', data simulasi' : ''}
                  </p>
                  <p>{a.text}</p>
                  {a.note && <p className="asp__note">{a.note}</p>}
                </div>
                <div className="asp__side">
                  <p className="asp__count">
                    <strong key={ticked === a.id ? st.n : 'n'} className={`num${ticked === a.id ? ' tick' : ''}`}>
                      {st.n}
                    </strong>{' '}
                    dukungan. Tahap: <strong>{STAGE[st.key]}</strong>
                  </p>
                  <Route stage={st.key} />
                  {st.key === 'decided' ? (
                    <p className="asp__final">Sudah diputuskan. Usulan ini tidak menerima dukungan baru.</p>
                  ) : (
                    <button
                      type="button"
                      className={`btn btn--ghost btn--sm${mine ? ' btn--done' : ''}`}
                      aria-disabled={mine || undefined}
                      onClick={() => !mine && support(a.id)}
                    >
                      {mine ? 'Sudah kamu dukung' : 'Dukung usulan ini'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
