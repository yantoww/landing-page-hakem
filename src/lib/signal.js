// Aksi anggota mengirim "sinyal" lewat jalurnya (A aspirasi, F forum, S suara) menuju simpul.
// Peta di hero dan tab di Digital Participation mendengarkan, jadi gerak selalu menjawab sebuah aksi nyata.
const send = (type, detail) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(type, { detail }));
};

export const emitSignal = (line, extra = {}) => send('simpul:signal', { line, ...extra });
export const emitState = (decided) => send('simpul:state', { decided });
