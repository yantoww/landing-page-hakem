import { useEffect, useRef, useState } from 'react';
import { groups, issues, DEMO_TTL_MIN } from '../data/site.js';
import { useSim, currentMember, joinMember, signIn, signOut, deleteMember, isDemo } from '../lib/store.js';
import { gasEnabled } from '../lib/gas.js';
import { asset } from './ui.jsx';

const joined = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export default function Register() {
  const s = useSim();
  const member = currentMember(s);
  const [fresh, setFresh] = useState(false);
  return member ? (
    <Pass m={member} focusOnMount={fresh} others={s.members.filter((x) => x.id !== member.id)} />
  ) : (
    <Form members={s.members} onDone={setFresh} />
  );
}

function Form({ members, onDone }) {
  const [v, setV] = useState({ nick: '', group: '', issues: [], role: 'Anggota', consent: false });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const refs = { nick: useRef(null), group: useRef(null), consent: useRef(null) };

  const validate = () => {
    const e = {};
    const nick = v.nick.trim();
    if (nick.length < 2 || nick.length > 30) e.nick = 'Tulis nama panggilan 2 sampai 30 karakter.';
    else if (/\d{6,}|@/.test(nick)) e.nick = 'Pakai nama panggilan saja, tanpa nomor panjang atau alamat email.';
    if (!v.group) e.group = 'Pilih kelompok yang paling dekat denganmu.';
    if (!v.consent) e.consent = 'Centang persetujuan agar kartu anggota bisa dibuat.';
    return e;
  };

  // Mode Google Spreadsheet: ID anggota dibuat server, jadi kartu tampil setelah server menjawab.
  async function submit(ev) {
    ev.preventDefault();
    if (busy) return;
    const e = validate();
    setErr(e);
    const first = Object.keys(e)[0];
    if (first) {
      refs[first].current?.focus();
      return;
    }
    setBusy(true);
    onDone(true); // kartu yang baru terbit mendapat fokus saat tampil
    try {
      const r = await joinMember({ nick: v.nick, group: v.group, issues: v.issues, role: v.role });
      if (!r.ok) {
        onDone(false);
        setErr({ form: r.reason });
      }
    } finally {
      setBusy(false);
    }
  }

  const toggleIssue = (id) =>
    setV((x) => ({ ...x, issues: x.issues.includes(id) ? x.issues.filter((i) => i !== id) : [...x.issues, id] }));

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h3 className="form__title">Formulir pendaftaran simulasi</h3>

      <div className="field">
        <label className="field__label" htmlFor="reg-nick">
          Nama panggilan
        </label>
        <input
          id="reg-nick"
          ref={refs.nick}
          className="input"
          type="text"
          autoComplete="off"
          value={v.nick}
          onChange={(e) => setV({ ...v, nick: e.target.value })}
          aria-invalid={Boolean(err.nick)}
          aria-describedby="reg-nick-h"
        />
        <p id="reg-nick-h" className={err.nick ? 'field__error' : 'field__hint'} role={err.nick ? 'alert' : undefined}>
          {err.nick || 'Cukup nama panggilan. Jangan tulis nama lengkap, NIK, email, atau nomor telepon.'}
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="reg-group">
          Kelompok yang paling mewakili kamu
        </label>
        <select
          id="reg-group"
          ref={refs.group}
          className="input"
          value={v.group}
          onChange={(e) => setV({ ...v, group: e.target.value })}
          aria-invalid={Boolean(err.group)}
          aria-describedby="reg-group-h"
        >
          <option value="">Pilih salah satu</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {err.group && (
          <p id="reg-group-h" className="field__error" role="alert">
            {err.group}
          </p>
        )}
      </div>

      <fieldset className="field">
        <legend className="field__label">Isu yang paling kamu pedulikan (boleh lebih dari satu)</legend>
        <div className="checks">
          {issues.map((i) => (
            <label key={i.id} className="check">
              <input type="checkbox" checked={v.issues.includes(i.id)} onChange={() => toggleIssue(i.id)} />
              <span>{i.short}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">Peran</legend>
        <div className="checks">
          {['Anggota', 'Relawan'].map((r) => (
            <label key={r} className="check">
              <input type="radio" name="reg-role" checked={v.role === r} onChange={() => setV({ ...v, role: r })} />
              <span>{r === 'Anggota' ? 'Anggota' : 'Relawan (anggota yang bersedia membantu kegiatan)'}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="check check--consent">
          <input
            ref={refs.consent}
            type="checkbox"
            checked={v.consent}
            onChange={(e) => setV({ ...v, consent: e.target.checked })}
            aria-invalid={Boolean(err.consent)}
            aria-describedby="reg-consent-h"
          />
          <span>
            {gasEnabled()
              ? 'Saya paham ini simulasi akademik. Nama panggilan, kelompok, dan isu yang saya pilih disimpan di Google Spreadsheet panitia agar hasilnya tampil di semua perangkat, dan saya tidak memasukkan data pribadi sensitif.'
              : 'Saya paham ini simulasi akademik. Data saya hanya tersimpan di browser ini dan tidak dikirim ke mana pun, dan saya tidak memasukkan data pribadi sensitif.'}
          </span>
        </label>
        {err.consent && (
          <p id="reg-consent-h" className="field__error" role="alert">
            {err.consent}
          </p>
        )}
      </div>

      {err.form && (
        <p className="field__error" role="alert">
          {err.form}
        </p>
      )}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? 'Menyimpan data...' : 'Buat kartu anggota simulasi'}
      </button>
      <p className="field__hint">
        Pada sistem nyata ada verifikasi dan masa tunggu 7 hari sebelum hak suara aktif. Di simulasi ini keduanya dilewati.
      </p>

      {members.length > 0 && (
        <p className="gate__back">
          Sudah punya kartu di perangkat ini?{' '}
          {members.slice(-4).map((m) => (
            <button key={m.id} type="button" className="linkbtn" onClick={() => signIn(m.id)}>
              {m.nick}
            </button>
          ))}
        </p>
      )}
    </form>
  );
}

// Lanjut ke Voting: buka tab Voting di Digital Participation. Bila alamatnya sudah sama, hashchange tidak
// terkirim sendiri, jadi dikirim manual agar tab tetap berpindah.
const toVoting = () => {
  if (location.hash === '#partisipasi-suara') window.dispatchEvent(new HashChangeEvent('hashchange'));
};

function Pass({ m, others, focusOnMount }) {
  const ref = useRef(null);
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [delErr, setDelErr] = useState('');

  // Anggota demo (mode Google Spreadsheet) bersifat sementara: satu tombol menghapus semua jejaknya di server.
  const demo = gasEnabled() && isDemo(m);

  async function remove() {
    if (!sure && !demo) {
      setSure(true);
      return;
    }
    setBusy(true);
    const r = await deleteMember(m.id); // mode Google Spreadsheet: baris anggota di server ikut dihapus
    setBusy(false);
    if (r && !r.ok) {
      setSure(false);
      setDelErr(r.reason);
    }
  }
  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, []);
  useEffect(() => {
    if (!sure) return;
    const id = setTimeout(() => setSure(false), 5000);
    return () => clearTimeout(id);
  }, [sure]);

  const issueNames = m.issues.map((id) => issues.find((i) => i.id === id)?.short).filter(Boolean);

  return (
    <div className="member">
      <div
        className={`pass${focusOnMount ? ' pass--new' : ''}`}
        role="group"
        aria-label="Kartu anggota digital simulasi"
        ref={ref}
        tabIndex={-1}
      >
        <div className="pass__top">
          <img src={asset('logo.svg')} alt="" width="40" height="40" />
          <div>
            <p className="pass__brand">Partai Simpul</p>
            <p className="pass__kind">{demo ? 'Kartu anggota demo, sementara' : 'Kartu anggota digital, simulasi'}</p>
          </div>
        </div>
        <p className="pass__name">{m.nick}</p>
        <p className="pass__no num">{m.id}</p>
        <div className="pass__foot">
          <p>
            {m.role}, bergabung {joined(m.joined)}
          </p>
          <ul className="pass__lines" aria-label="Jalur yang bisa dipakai">
            <li className="line line--a">A</li>
            <li className="line line--f">F</li>
            <li className="line line--s">S</li>
          </ul>
        </div>
        <span className="pass__sim" aria-hidden="true">
          Simulasi
        </span>
      </div>

      <div className="member__body">
        <h3 className="member__title">Kartu aktif. Hak suaramu berlaku.</h3>
        <p>
          Kelompok: {m.group}.{issueNames.length > 0 && ` Isu yang kamu pilih: ${issueNames.join(', ')}.`}{' '}
          {demo
            ? `Anggota demo bersifat sementara: suara dan tulisanmu dihapus saat kamu selesai atau setelah ${DEMO_TTL_MIN} menit.`
            : gasEnabled()
              ? 'Data ini tersimpan di Google Spreadsheet panitia dan bisa kamu hapus kapan saja.'
              : 'Data ini tersimpan hanya di browser ini.'}
        </p>
        <div className="actions">
          <a className="btn btn--primary" href="#partisipasi-suara" onClick={toVoting}>
            Lanjut ke Voting
          </a>
          <a className="btn btn--primary" href="#participation">
            Coba voting, forum, dan aspirasi
          </a>
          {!demo && (
            <button type="button" className="btn btn--ghost" onClick={signOut}>
              Keluar dan daftar anggota lain
            </button>
          )}
          <button
            type="button"
            className={`btn btn--ghost${sure ? ' btn--warn' : ''}`}
            disabled={busy}
            onClick={remove}
          >
            {busy
              ? 'Menghapus...'
              : demo
                ? 'Selesai dan hapus data demo'
                : sure
                  ? 'Klik lagi untuk menghapus datamu'
                  : 'Hapus data saya'}
          </button>
        </div>
        {delErr && (
          <p className="field__error" role="alert">
            {delErr}
          </p>
        )}
        {others.length > 0 && (
          <p className="gate__back">
            Kartu lain di perangkat ini:{' '}
            {others.slice(-4).map((o) => (
              <button key={o.id} type="button" className="linkbtn" onClick={() => signIn(o.id)}>
                {o.nick}
              </button>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
