import { useEffect, useRef, useState } from 'react';
import { ballots, MEMBER_BASE, QUORUM } from '../data/site.js';
import { useSim, currentMember, tally, castVote, demoMember } from '../lib/store.js';
import { emitState } from '../lib/signal.js';
import { LineBadge } from './ui.jsx';

const dec = (n) => n.toFixed(1).replace('.', ',');

export default function Ballot({ ballotId, compact = false }) {
  const s = useSim();
  const ballot = ballots.find((b) => b.id === ballotId);
  const member = currentMember(s);
  const t = tally(s, ballot);
  const receipt = member ? s.roll[ballot.id]?.[member.id] : undefined;
  const closed = ballot.status === 'closed';
  // Hasil per opsi terbuka bagi yang sudah memilih dan bagi semua orang saat ditutup.
  const showSplit = closed || Boolean(receipt);

  const [choice, setChoice] = useState('');
  const [error, setError] = useState('');
  const [grown, setGrown] = useState(false);
  const [qOn, setQOn] = useState(false);
  const result = useRef(null);
  const justVoted = useRef(false);
  const uid = `${ballot.id}${compact ? '-c' : ''}`;

  // Meter kuorum terisi dari kosong saat pertama tampil; perubahan berikutnya mengalir lewat transisi CSS.
  useEffect(() => {
    const id = requestAnimationFrame(() => setQOn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Peta di hero menyalakan stasiun "Keputusan ditetapkan" mengikuti status kuorum Rembuk yang terbuka.
  useEffect(() => {
    if (ballot.status === 'open') emitState(t.quorumMet);
  }, [t.quorumMet]);

  useEffect(() => {
    if (!showSplit) {
      setGrown(false);
      return;
    }
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [showSplit]);

  useEffect(() => {
    if (justVoted.current && receipt) {
      justVoted.current = false;
      result.current?.focus();
    }
  }, [receipt]);

  function submit(e) {
    e.preventDefault();
    if (!choice) {
      setError('Pilih satu opsi dulu, lalu tekan tombol suara.');
      return;
    }
    const m = member || demoMember();
    const r = castVote(ballot.id, m.id, choice);
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    setError('');
    justVoted.current = true;
  }

  const leaderLabel = t.leader ? ballot.options.find((o) => o.id === t.leader)?.label : null;
  const turnout = dec(t.turnout * 100);

  return (
    <article className={`ballot${compact ? ' ballot--compact' : ''}`} aria-labelledby={`${uid}-t`}>
      <header className="ballot__head">
        <LineBadge line="suara" />
        <h3 className="ballot__title" id={`${uid}-t`}>
          {ballot.title}
        </h3>
        <span className="ballot__status">{closed ? 'Ditutup' : 'Terbuka'}</span>
      </header>
      <p className="ballot__meta">{ballot.closes}</p>

      {!showSplit ? (
        <form className="ballot__form" onSubmit={submit} noValidate>
          <fieldset>
            <legend className="ballot__q">{ballot.question}</legend>
            {ballot.options.map((o) => (
              <label key={o.id} className={`opt${choice === o.id ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name={`opt-${uid}`}
                  value={o.id}
                  checked={choice === o.id}
                  onChange={() => {
                    setChoice(o.id);
                    setError('');
                  }}
                />
                <span className="opt__dot" aria-hidden="true" />
                <span>{o.label}</span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="field__error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--primary" type="submit">
            {member ? 'Beri suara' : 'Beri suara sebagai anggota demo'}
          </button>
          {!member && (
            <p className="ballot__hint">
              Kamu otomatis masuk sebagai anggota demo, atau <a href="#membership">daftar anggota simulasi</a>.
            </p>
          )}
        </form>
      ) : (
        <div className="ballot__result" ref={result} tabIndex={-1} aria-live="polite">
          {receipt && (
            <p className="ballot__ok">
              <strong>Suaramu tercatat.</strong> Kode bukti suara: <span className="num code">{receipt}</span>
            </p>
          )}
          <p className="ballot__q ballot__q--static">{ballot.question}</p>
          <ul className="bars">
            {ballot.options.map((o, i) => {
              const n = t.counts[o.id] || 0;
              const share = t.total ? (n / t.total) * 100 : 0;
              return (
                <li key={o.id} className={t.leader === o.id ? 'is-lead' : undefined} style={{ '--i': i }}>
                  <div className="bars__row">
                    <span>
                      {o.label}
                      {t.leader === o.id && <span className="bars__lead">unggul</span>}
                    </span>
                    <span className="num">
                      {n} suara, {dec(share)}%
                    </span>
                  </div>
                  <div className="bars__track" aria-hidden="true">
                    <div className="bars__fill" style={{ width: grown ? `${share}%` : '0%' }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="quorum">
        <div
          className="quorum__meter"
          role="img"
          aria-label={`${t.total} dari ${t.needed} suara yang dibutuhkan untuk kuorum`}
        >
          <span className="quorum__fill" style={{ width: qOn ? `${Math.min(100, (t.total / t.needed) * 100)}%` : '0%' }} />
        </div>
        <p className="quorum__text">
          Partisipasi {t.total} dari {MEMBER_BASE} anggota aktif simulasi ({turnout}%).{' '}
          {t.quorumMet
            ? closed
              ? `Kuorum ${QUORUM * 100}% tercapai.`
              : `Kuorum ${QUORUM * 100}% tercapai. Hasil sah jika bertahan sampai penutupan.`
            : `Kuorum ${QUORUM * 100}% belum tercapai, kurang ${t.missing} suara.`}
        </p>
        {showSplit && !closed && t.quorumMet && (
          <p className="quorum__text">
            {leaderLabel
              ? `Jika hasil bertahan, "${leaderLabel}" menjadi sikap partai.`
              : 'Suara seri. Jika masih seri saat penutupan, pemungutan diulang 24 jam.'}
          </p>
        )}
      </div>

      {closed && ballot.outcome && (
        <div className="ballot__outcome">
          <span className="stamp" aria-hidden="true">
            Ditetapkan
            <br />
            simulasi
          </span>
          <div>
            <p>
              <strong>Keputusan:</strong> {ballot.outcome.decision}
            </p>
            <p>
              <strong>Tindak lanjut:</strong> {ballot.outcome.followUp}
            </p>
          </div>
        </div>
      )}

      <p className="ballot__rule">{ballot.rule} Satu anggota satu suara. Data awal adalah suara simulasi.</p>
    </article>
  );
}
