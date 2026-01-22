(function(){
  // HERO SWAP
  const hero = document.querySelector('[data-hero]');
  const thumbs = document.querySelectorAll('[data-hero-thumb]');
  if(hero && thumbs.length){
    const setHero = (url, idx) => {
      hero.style.backgroundImage = `url('${url}')`;
      thumbs.forEach(t => t.classList.remove('active'));
      if(thumbs[idx]) thumbs[idx].classList.add('active');
    };
    thumbs.forEach((t, idx) => {
      t.addEventListener('click', () => setHero(t.getAttribute('data-hero-thumb'), idx));
    });
    // auto rotate (subtle)
    let i = 0;
    setInterval(() => {
      i = (i + 1) % thumbs.length;
      setHero(thumbs[i].getAttribute('data-hero-thumb'), i);
    }, 6500);
  }

  // GALLERY FILTER + LIGHTBOX
  const cards = Array.from(document.querySelectorAll('[data-cat]'));
  const buttons = Array.from(document.querySelectorAll('[data-filter]'));
  const lb = document.querySelector('.lightbox');
  const lbImg = document.querySelector('.lightbox-img');
  const lbTitle = document.querySelector('.lightbox-bar .t');
  const lbSub = document.querySelector('.lightbox-bar .s');
  const lbClose = document.querySelector('[data-lb-close]');
  const lbPrev = document.querySelector('[data-lb-prev]');
  const lbNext = document.querySelector('[data-lb-next]');

  let visibleCards = cards.slice();
  let currentIndex = -1;

  const applyFilter = (cat) => {
    buttons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === cat));
    cards.forEach(c => {
      const ok = (cat === 'All') || (c.getAttribute('data-cat') === cat);
      c.style.display = ok ? '' : 'none';
    });
    visibleCards = cards.filter(c => c.style.display !== 'none');
  };

  if(buttons.length){
    buttons.forEach(b => b.addEventListener('click', () => applyFilter(b.getAttribute('data-filter'))));
    applyFilter('All');
  }

  const openLb = (card) => {
    if(!lb) return;
    const img = card.querySelector('img');
    lbImg.src = img.getAttribute('data-full') || img.src;
    lbTitle.textContent = card.getAttribute('data-title') || 'Project';
    lbSub.textContent = card.getAttribute('data-cat') || '';
    lb.classList.add('open');
    currentIndex = visibleCards.indexOf(card);
  };

  const closeLb = () => lb && lb.classList.remove('open');

  const navLb = (dir) => {
    if(currentIndex < 0 || !visibleCards.length) return;
    currentIndex = (currentIndex + dir + visibleCards.length) % visibleCards.length;
    openLb(visibleCards[currentIndex]);
  };

  cards.forEach(c => c.addEventListener('click', () => openLb(c)));

  if(lb){
    lb.addEventListener('click', (e) => { if(e.target === lb) closeLb(); });
  }
  if(lbClose) lbClose.addEventListener('click', closeLb);
  if(lbPrev) lbPrev.addEventListener('click', () => navLb(-1));
  if(lbNext) lbNext.addEventListener('click', () => navLb(1));
  document.addEventListener('keydown', (e) => {
    if(!lb || !lb.classList.contains('open')) return;
    if(e.key === 'Escape') closeLb();
    if(e.key === 'ArrowLeft') navLb(-1);
    if(e.key === 'ArrowRight') navLb(1);
  });
})();
