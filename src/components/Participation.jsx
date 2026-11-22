import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { resetAll, storageAvailable, useSim } from '../lib/store.js';
import { gasEnabled } from '../lib/gas.js';
import { useRealtimeData } from '../hooks/useRealtimeData.js';
import { LineBadge, LINES, MemberBar } from './ui.jsx';
import Ballot from './Ballot.jsx';
import Forum from './Forum.jsx';
import Aspirations from './Aspirations.jsx';

const TABS = [
  { id: 'aspirasi', step: 'Terhubung', blurb: 'Ajukan usulan dan kumpulkan dukungan.' },
  { id: 'forum', step: 'Berembuk', blurb: 'Diskusikan usulan sebelum diputuskan.' },
  { id: 'suara', step: 'Memutuskan', blurb: 'Beri suara pada Rembuk Pekanan.' },
];
const CODE = { aspirasi: 'a', forum: 'f', suara: 's' };

const fromHash = () => {
  const m = typeof location !== 'undefined' && location.hash.match(/^#partisipasi-(aspirasi|forum|suara)$/);
  return m ? m[1] : null;
};

export default function Participation() {
  useSim(); // render ulang saat penyimpanan berubah
  const live = useRealtimeData(); // data bersama dari Google Spreadsheet, diperbarui tiap 10 detik tanpa memuat ulang halaman
  const [tab, setTab] = useState(fromHash() || 'aspirasi');
  const [sure, setSure] = useState(false);
  const [bar, setBar] = useState({ x: 0, w: 0 });
  const [sweeps, setSweeps] = useState({ a: 0, f: 0, s: 0 });
  const tabRefs = useRef({});
  const tabsRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      const t = fromHash();
      if (t) setTab(t);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (!sure) return;
    const id = setTimeout(() => setSure(false), 5000);
    return () => clearTimeout(id);
  }, [sure]);

  // Garis aktif meluncur ke tab terpilih (hanya transform), dan mengikuti perubahan lebar.
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[tab];
      if (el) setBar({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tabsRef.current) ro.observe(tabsRef.current);
    return () => ro.disconnect();
  }, [tab]);

  // Setiap aksi anggota mengirim sinyal lewat jalurnya: garis tab aktif disapu sekali.
  useEffect(() => {
    const on = (e) => setSweeps((s) => ({ ...s, [e.detail.line]: (s[e.detail.line] || 0) + 1 }));
    window.addEventListener('simpul:signal', on);
    return () => window.removeEventListener('simpul:signal', on);
  }, []);

  function onKey(e) {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    if (e.key === 'ArrowLeft') n = (i + TABS.length - 1) % TABS.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = TABS.length - 1;
    if (n === null) return;
    e.preventDefault();
    setTab(TABS[n].id);
    tabRefs.current[TABS[n].id]?.focus();
  }

  return (
    <div className="part">
      {TABS.map((t) => (
        <span key={t.id} id={`partisipasi-${t.id}`} className="part__anchor" />
      ))}

      {!storageAvailable() && (
        <p className="notice notice--warn" role="alert">
          Penyimpanan browser tidak tersedia (mungkin mode privat). Fitur tetap berjalan, tetapi data hilang saat halaman
          ditutup.
        </p>
      )}

      {live.error && (
        <p className="notice notice--warn" role="status">
          Koneksi ke data bersama sedang terputus. Yang tampil adalah data terakhir, dan situs mencoba tersambung lagi otomatis.
        </p>
      )}

      <MemberBar />

      <div className="tabs" ref={tabsRef} role="tablist" aria-label="Tiga jalur partisipasi" onKeyDown={onKey}>
        <span
          className="tabs__bar"
          data-line={CODE[tab]}
          aria-hidden="true"
          style={{ transform: `translateX(${bar.x}px) scaleX(${bar.w / 100})` }}
        />
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => (tabRefs.current[t.id] = el)}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            className={`tab tab--${CODE[t.id]}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
          >
            <LineBadge line={t.id} />
            <span className="tab__text">
              <strong>{LINES[t.id].name}</strong>
              <span>{t.step}</span>
            </span>
            {tab === t.id && sweeps[CODE[t.id]] > 0 && (
              <span key={sweeps[CODE[t.id]]} className="tab__sweep" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {TABS.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          className="panel"
          hidden={tab !== t.id}
        >
          {tab === t.id && (
            <>
              {t.id === 'aspirasi' && <Aspirations />}
              {t.id === 'forum' && <Forum />}
              {t.id === 'suara' && (
                <div className="split">
                  <Ballot ballotId="rembuk-12" />
                  <div>
                    <h3 className="panel__sub">Keputusan sebelumnya</h3>
                    <Ballot ballotId="rembuk-11" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <div className="part__foot">
        <p>
          {gasEnabled()
            ? 'Data simulasi dimulai dari nol. Data yang kamu tambahkan tersimpan di Google Spreadsheet panitia dan tampil di semua perangkat. Laporan forum hanya berlaku di perangkat ini.'
            : 'Data simulasi dimulai dari nol. Semua data yang kamu tambahkan hanya tersimpan di browser ini.'}
        </p>
        <button
          type="button"
          className={`btn btn--ghost-light btn--sm${sure ? ' btn--warn' : ''}`}
          onClick={() => {
            if (sure) {
              resetAll();
              setSure(false);
            } else setSure(true);
          }}
        >
          {gasEnabled()
            ? sure
              ? 'Klik lagi untuk menghapus data di perangkat ini'
              : 'Reset data di perangkat ini'
            : sure
              ? 'Klik lagi untuk menghapus semua data simulasi'
              : 'Reset data simulasi'}
        </button>
      </div>
    </div>
  );
}
