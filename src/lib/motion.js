// Gerak khas dunia peta jalur: stasiun "bersandar" dan garis digambar saat dicapai.
// Hanya IntersectionObserver (tanpa listener scroll). Teks tidak pernah disembunyikan; yang bergerak
// hanya garis, titik, dan lencana. Semua gaya gerak ada di global.css dan dijaga prefers-reduced-motion.
const $$ = (s) => [...document.querySelectorAll(s)];
const sections = $$('main > .sec');

// Indeks jeda untuk daftar yang muncul sebagai daftar (dibatasi agar total jeda tetap pendek).
$$('.route--v').forEach((r) => [...r.children].forEach((li, i) => li.style.setProperty('--i', Math.min(i, 7))));
$$('.tree li').forEach((li, i) => li.style.setProperty('--i', Math.min(i, 9)));
$$('.issue dl > div').forEach((d, i) => d.style.setProperty('--i', i % 5));

if (!('IntersectionObserver' in window)) {
  [...$$('.sign'), ...$$('.route'), ...$$('.tree'), ...$$('.issue'), ...sections].forEach((el) =>
    el.classList.add('is-in', 'is-passed'),
  );
} else {
  // 1) Satu kali per elemen: bullet stasiun bersandar, garis rute/bagan digambar.
  const once = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          once.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  [...$$('.sign'), ...$$('.route--v'), ...$$('.tree'), ...$$('.issue')].forEach((el) => once.observe(el));

  // 2) Rel utama menyala di bagian yang sudah dilewati garis baca (35% tinggi layar).
  const reading = new IntersectionObserver(
    () => {
      const y = innerHeight * 0.35;
      sections.forEach((s) => s.classList.toggle('is-passed', s.getBoundingClientRect().top <= y));
    },
    { rootMargin: '-35% 0px -64% 0px' },
  );
  sections.forEach((s) => reading.observe(s));
}
