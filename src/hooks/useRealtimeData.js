import { useEffect } from 'react';
import { useSim, setRemote, setRemoteError } from '../lib/store.js';
import { gasEnabled, gasGet } from '../lib/gas.js';

// Satu pemantau bersama untuk seluruh halaman (hero, kartu anggota, dan Digital Participation adalah
// pulau React terpisah, tetapi memakai modul yang sama). Pemantau jalan selama ada komponen yang memakainya.
export const POLL_MS = 10000;
const FAILURES_BEFORE_NOTICE = 2;

let users = 0;
let timer = null;
let inflight = false;
let queued = false;
let failures = 0;

async function pull() {
  if (inflight) {
    queued = true; // minta ulang setelah permintaan yang sedang jalan selesai
    return;
  }
  inflight = true;
  const startedAt = performance.now();
  const r = await gasGet();
  inflight = false;
  if (r.ok) {
    failures = 0;
    setRemote(r.data, startedAt);
  } else if (++failures >= FAILURES_BEFORE_NOTICE) {
    setRemoteError(); // data terakhir tetap tampil; hanya penanda koneksi yang berubah
  }
  if (queued) {
    queued = false;
    pull();
  }
}

function schedule() {
  clearTimeout(timer);
  if (!users) return;
  timer = setTimeout(async () => {
    if (!document.hidden) await pull();
    schedule();
  }, POLL_MS);
}

const refresh = () => {
  pull().then(schedule);
};
const onVisible = () => {
  if (!document.hidden) refresh();
};

function start() {
  window.addEventListener('gas:refresh', refresh); // dikirim store setelah server menerima sebuah aksi
  window.addEventListener('online', refresh);
  document.addEventListener('visibilitychange', onVisible);
  refresh();
}

function stop() {
  clearTimeout(timer);
  window.removeEventListener('gas:refresh', refresh);
  window.removeEventListener('online', refresh);
  document.removeEventListener('visibilitychange', onVisible);
}

// Menyalakan pemantau bersama; mengembalikan fungsi untuk mematikannya (pemantau berhenti saat pemakai terakhir pergi).
export function startRealtime() {
  if (!gasEnabled()) return () => {};
  if (users++ === 0) start();
  return () => {
    if (--users === 0) stop();
  };
}

// Mengembalikan data terbaru dari server. loading hanya true sebelum data pertama tiba; polling berikutnya
// berjalan diam-diam dan hanya merender ulang bila ada yang berubah. Tanpa VITE_GAS_WEBAPP_URL hook tidak aktif.
export function useRealtimeData() {
  const s = useSim();
  useEffect(() => startRealtime(), []);
  const enabled = gasEnabled();
  return {
    enabled,
    data: s.remote,
    loading: enabled && !s.remote.ready,
    error: enabled && s.remote.error,
    refresh,
  };
}
