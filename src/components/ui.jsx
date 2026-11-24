import { useState } from 'react';
import { useSim, demoMember, signIn, signOut, currentMember, deleteMember, isDemo } from '../lib/store.js';
import { gasEnabled } from '../lib/gas.js';
import { DEMO_TTL_MIN } from '../data/site.js';

export const asset = (p) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p}`;

export const fmt = (iso) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export const LINES = {
  aspirasi: { code: 'A', name: 'Aspirasi' },
  forum: { code: 'F', name: 'Forum' },
  suara: { code: 'S', name: 'Voting' },
};

// Lencana jalur: huruf + warna, jadi tidak bergantung pada warna saja.
export function LineBadge({ line }) {
  const l = LINES[line];
  return (
    <span className={`line line--${l.code.toLowerCase()}`} aria-hidden="true">
      {l.code}
    </span>
  );
}

// Tampil saat aksi butuh status anggota. Pengunjung tetap bisa membaca.
export function Gate({ what, extra }) {
  const s = useSim();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  // Mode Google Spreadsheet: anggota demo dibuat di server, jadi tombol menunggu sampai selesai.
  async function tryDemo() {
    if (busy) return;
    setBusy(true);
    setErr('');
    const m = await demoMember();
    setBusy(false);
    if (!m) setErr('Belum bisa membuat anggota demo. Periksa koneksi internet lalu coba lagi.');
  }
  return (
    <div className="gate">
      <p className="gate__msg">
        <strong>Untuk {what}, masuk dulu sebagai anggota.</strong> Pengunjung tetap bisa membaca semuanya.
        {extra && ` ${extra}`}
      </p>
      <div className="gate__actions">
        <a className="btn btn--primary btn--sm" href="#membership">
          Daftar anggota simulasi
        </a>
        <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={tryDemo}>
          {busy ? 'Membuat anggota demo...' : 'Coba sebagai anggota demo'}
        </button>
      </div>
      {err && (
        <p className="field__error" role="alert">
          {err}
        </p>
      )}
      {s.members.length > 0 && (
        <p className="gate__back">
          Kartu di perangkat ini:{' '}
          {s.members.slice(-4).map((m) => (
            <button key={m.id} type="button" className="linkbtn" onClick={() => signIn(m.id)}>
              {m.nick}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}

export function MemberBar() {
  const s = useSim();
  const m = currentMember(s);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!m)
    return (
      <p className="memberbar">
        Kamu membaca sebagai pengunjung. Memilih, mendukung, dan menulis hanya untuk anggota.
      </p>
    );
  // Anggota demo (mode Google Spreadsheet) tidak sekadar keluar: datanya dihapus menyeluruh di server.
  const demo = gasEnabled() && isDemo(m);
  async function endDemo() {
    setBusy(true);
    setErr('');
    const r = await deleteMember(m.id);
    setBusy(false);
    if (r && !r.ok) setErr(r.reason);
  }
  return (
    <p className="memberbar">
      Masuk sebagai <strong>{m.nick}</strong> <span className="num">({m.id})</span>.{' '}
      {demo ? (
        <>
          Anggota demo bersifat sementara: suara dan tulisanmu dihapus saat selesai atau setelah {DEMO_TTL_MIN} menit.{' '}
          <button type="button" className="linkbtn" disabled={busy} onClick={endDemo}>
            {busy ? 'Menghapus...' : 'Selesai dan hapus data demo'}
          </button>
          {err && (
            <>
              {' '}
              <span className="field__error" role="alert">
                {err}
              </span>
            </>
          )}
        </>
      ) : (
        <button type="button" className="linkbtn" onClick={signOut}>
          Keluar
        </button>
      )}
    </p>
  );
}
