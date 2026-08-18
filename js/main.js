/* ============================================================
   ADYA TRAVELS — Site behaviour
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Inject phone numbers / business info ---------- */
  document.querySelectorAll('[data-phone-display]').forEach(el => el.textContent = BUSINESS.phoneDisplay);
  document.querySelectorAll('[data-phone-href]').forEach(el => el.setAttribute('href', BUSINESS.phoneHref));

  /* ---------- Sticky nav ---------- */
  const nav = document.querySelector('.nav');
  if (nav){
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu){
    const openMenu = () => {
      hamburger.classList.add('is-open');
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver = null;
  function initReveal(container){
    const els = (container || document).querySelectorAll('.reveal:not(.is-observed)');
    if (!els.length) return;
    if ('IntersectionObserver' in window){
      if (!revealObserver){
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting){
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
      }
      els.forEach((el, i) => {
        el.classList.add('is-observed');
        el.style.transitionDelay = `${(i % 4) * 90}ms`;
        revealObserver.observe(el);
      });
    } else {
      els.forEach(el => { el.classList.add('is-observed', 'is-visible'); });
    }
  }
  initReveal();

  /* ---------- Render car cards (home page) ---------- */
  const carsGrid = document.getElementById('carsGrid');
  if (carsGrid && typeof CARS !== 'undefined'){
    carsGrid.innerHTML = CARS.map(car => `
      <article class="car-card reveal">
        <a href="car.html?car=${car.id}" class="car-card-media" aria-label="View ${car.name} details">
          <img src="${car.heroImage}" alt="${car.name}, chauffeur-driven ${car.category.toLowerCase()}" loading="eager" />
          <span class="car-card-badge">Chauffeur Driven</span>
        </a>
        <div class="car-card-body">
          <div>
            <h3><a href="car.html?car=${car.id}">${car.name}</a></h3>
            <p class="car-card-cat">${car.category}</p>
          </div>
          <div class="car-specs">
            <span>${iconSeat()} ${car.seats}</span>
            <span>${iconAc()} AC</span>
            <span>${iconDriver()} Chauffeur</span>
          </div>
          <div class="car-pricing">
            <div class="price-tile"><div class="label">Local<small>8 hrs · 80 km</small></div><div class="value">₹${car.pricing.local}</div></div>
            <div class="price-tile"><div class="label">Outstation</div><div class="value">₹${car.pricing.outstation}</div></div>
            ${car.pricing.airport ? `<div class="price-tile"><div class="label">Airport</div><div class="value">₹${car.pricing.airport}</div></div>` : ''}
          </div>
          <p class="price-note">Final fare depends on route, distance, duration and trip requirements.</p>
          <div class="car-card-ctas">
            <button class="btn btn-primary btn-block js-enquire-car" data-car="${car.id}" type="button">Get Exact Price</button>
            <a class="btn btn-outline btn-block" href="${BUSINESS.phoneHref}">Call for Price</a>
          </div>
        </div>
      </article>
    `).join('');
    // Re-run reveal observer for the newly injected car cards
    initReveal(carsGrid);
  }

  /* ---------- Populate "Select Car" dropdown wherever it exists ---------- */
  document.querySelectorAll('.js-car-select').forEach(select => {
    if (typeof CARS === 'undefined') return;
    const options = CARS.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    select.insertAdjacentHTML('beforeend', options + `<option value="not-sure">Not sure — help me choose</option>`);
  });

  /* ---------- "Enquire" / "Get Exact Price" buttons prefill + scroll to form ---------- */
  function goToEnquiry(carId, tripType){
    const form = document.querySelector('.js-car-select');
    if (form && carId) form.value = carId;
    const tripSelect = document.querySelector('.js-trip-select');
    if (tripSelect && tripType) tripSelect.value = tripType;
    const target = document.getElementById('enquire');
    if (target){
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameField = document.getElementById('fullName');
      if (nameField) setTimeout(() => nameField.focus({ preventScroll: true }), 500);
    } else {
      // not on a page with the form (e.g. car.html) — go to homepage anchor
      window.location.href = `index.html?prefill=${carId || ''}#enquire`;
    }
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-enquire-car, .js-enquire-generic');
    if (!btn) return;
    e.preventDefault();
    goToEnquiry(btn.dataset.car || '', btn.dataset.trip || '');
  });

  // Handle ?prefill= coming from car.html's Enquire button
  const params = new URLSearchParams(window.location.search);
  if (params.get('prefill')){
    const select = document.querySelector('.js-car-select');
    if (select) select.value = params.get('prefill');
  }

  /* ---------- Enquiry form submission (no backend wired yet) ---------- */
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm){
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!enquiryForm.checkValidity()){
        enquiryForm.reportValidity();
        return;
      }
      // TODO: replace with a real submission (e.g. POST to your backend / form service)
      // so enquiries land in the Adya Travels inbox. For now this simulates success.
      enquiryForm.style.display = 'none';
      const success = document.getElementById('formSuccess');
      if (success) success.classList.add('is-visible');
      const heading = document.getElementById('formSuccess');
      if (heading) heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  const resetFormBtn = document.getElementById('resetEnquiry');
  if (resetFormBtn){
    resetFormBtn.addEventListener('click', () => {
      document.getElementById('formSuccess').classList.remove('is-visible');
      const form = document.getElementById('enquiryForm');
      form.reset();
      form.style.display = '';
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Small inline icon helpers ---------- */
  function iconSeat(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 17V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"/><path d="M6 13h9a3 3 0 0 1 3 3v3"/><path d="M6 17v3M18 19v-1"/></svg>`; }
  function iconAc(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg>`; }
  function iconDriver(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>`; }
});
