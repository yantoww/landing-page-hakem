import { useSim, demoMember, signIn, signOut, currentMember } from '../lib/store.js';

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
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => demoMember()}>
          Coba sebagai anggota demo
        </button>
      </div>
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
  if (!m)
    return (
      <p className="memberbar">
        Kamu membaca sebagai pengunjung. Memilih, mendukung, dan menulis hanya untuk anggota.
      </p>
    );
  return (
    <p className="memberbar">
      Masuk sebagai <strong>{m.nick}</strong> <span className="num">({m.id})</span>.{' '}
      <button type="button" className="linkbtn" onClick={signOut}>
        Keluar
      </button>
    </p>
  );
}
