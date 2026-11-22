// Klien tipis untuk Google Apps Script Web App (lihat google-apps-script/Code.gs).
// Semua fungsi mengembalikan { ok, ... } dan tidak pernah melempar, jadi pemanggil cukup memeriksa ok.

let url = (import.meta.env?.VITE_GAS_WEBAPP_URL ?? '').trim();

export const gasEnabled = () => Boolean(url);
export const setGasUrl = (u) => {
  url = String(u || '').trim(); // dipakai uji; di aplikasi nilainya datang dari VITE_GAS_WEBAPP_URL
};

const TIMEOUT_MS = 20000;

async function call(init, query = '') {
  if (!url) return { ok: false, reason: 'Alamat Google Apps Script belum diisi (VITE_GAS_WEBAPP_URL).' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url + query, { ...init, signal: ctrl.signal, redirect: 'follow', cache: 'no-store' });
    const json = await res.json();
    if (json && json.status === 'success') return { ok: true, message: json.message, data: json.data };
    return { ok: false, reason: (json && json.message) || 'Server menolak permintaan.' };
  } catch (e) {
    return {
      ok: false,
      network: true,
      reason:
        e && e.name === 'AbortError'
          ? 'Server terlalu lama membalas. Coba lagi.'
          : 'Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.',
    };
  } finally {
    clearTimeout(timer);
  }
}

// POST memakai text/plain agar browser tidak mengirim preflight OPTIONS (tidak didukung Apps Script).
export const gasPost = (action, payload = {}) =>
  call({ method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, ...payload }) });

export const gasGet = () => call({ method: 'GET' }, `${url.includes('?') ? '&' : '?'}_=${Date.now()}`);
