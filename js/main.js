/* ============================================================
   ADYA TRAVELS — Site behaviour
   Shared by index.html and car.html. Every block checks that its
   elements exist, so it is safe to run on either page.
   ============================================================ */

document.documentElement.classList.remove('no-js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Inline icon from the sprite in the page body */
function ic(name, cls = ''){
  return `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

/* Small toast used for confirmations */
let toastTimer = null;
function showToast(message){
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('span').textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function todayISO(){
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Inject phone numbers / business info ---------- */
  document.querySelectorAll('[data-phone-display]').forEach(el => el.textContent = BUSINESS.phoneDisplay);
  document.querySelectorAll('[data-phone-href]').forEach(el => el.setAttribute('href', BUSINESS.phoneHref));
  document.querySelectorAll('[data-wa-href]').forEach(el => el.setAttribute('href', BUSINESS.whatsappHref));

  /* ---------- Scroll-driven UI: nav, progress bar, back-to-top ---------- */
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.scroll-progress');
  const fabTop = document.querySelector('.fab-top');
  const heroMedia = document.querySelector('.hero-media');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll(){
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav){
      nav.classList.toggle('is-scrolled', y > 40);
      // Hide nav while scrolling down, bring it back on scroll up
      const menuOpen = document.body.classList.contains('no-scroll');
      nav.classList.toggle('is-hidden', !menuOpen && y > 700 && y > lastY + 4);
      if (y < lastY - 4) nav.classList.remove('is-hidden');
    }
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (fabTop) fabTop.classList.toggle('is-visible', y > 900);
    if (heroMedia && !prefersReducedMotion && y < window.innerHeight){
      heroMedia.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.02)`;
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (fabTop) fabTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  /* ---------- Mobile menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu){
    const openMenu = () => {
      hamburger.classList.add('is-open');
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('no-scroll');
      nav && nav.classList.remove('is-hidden');
      const first = mobileMenu.querySelector('.mobile-menu-links a');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 300);
    };
    const closeMenu = () => {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('no-scroll');
    };
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')){ closeMenu(); hamburger.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 780 && mobileMenu.classList.contains('is-open')) closeMenu(); });
  }

  /* ---------- Scrollspy: highlight the section in view ---------- */
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (navLinks.length && 'IntersectionObserver' in window){
    const byId = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove('is-active'));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    const hero = document.getElementById('top');
    if (hero) new IntersectionObserver(([e]) => { if (e.isIntersecting) navLinks.forEach(a => a.classList.remove('is-active')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
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
              entry.target.dispatchEvent(new CustomEvent('revealed'));
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      }
      els.forEach((el) => {
        el.classList.add('is-observed');
        // Stagger siblings that share a parent (e.g. cards in a grid)
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${(siblings.indexOf(el) % 4) * 90}ms`;
        revealObserver.observe(el);
      });
    } else {
      els.forEach(el => { el.classList.add('is-observed', 'is-visible'); });
    }
  }

  /* ---------- Animated counters ---------- */
  const stats = document.getElementById('stats');
  if (stats){
    stats.addEventListener('revealed', () => {
      stats.querySelectorAll('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        if (prefersReducedMotion){ el.textContent = target.toFixed(decimals); return; }
        const start = performance.now();
        const dur = 1600;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = (target * eased).toFixed(decimals);
          if (t < 1) requestAnimationFrame(tick);
        };
        el.textContent = (0).toFixed(decimals);
        requestAnimationFrame(tick);
      });
    }, { once: true });
  }

  /* ---------- Cursor glow on service cards ---------- */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Render car cards + filters (home page) ---------- */
  const carsGrid = document.getElementById('carsGrid');
  if (carsGrid && typeof CARS !== 'undefined'){
    carsGrid.innerHTML = CARS.map(car => {
      const hasAirport = !!car.pricing.airport;
      return `
      <article class="car-card reveal" data-type="${car.type}">
        <a href="car.html?car=${car.id}" class="car-card-media" aria-label="View ${car.name} details">
          <img src="${car.heroImage}" alt="${car.name}, chauffeur-driven ${car.category.toLowerCase()}" loading="lazy" />
          <div class="car-card-tags">
            <span class="tag">${car.category}</span>
            ${car.highlight ? `<span class="tag tag-bronze">${car.highlight}</span>` : ''}
          </div>
          <span class="car-card-seats">${ic('seat')} ${car.seats}</span>
          <span class="car-card-view">View details ${ic('arrow')}</span>
        </a>
        <div class="car-card-body">
          <div>
            <h3><a href="car.html?car=${car.id}">${car.name}</a></h3>
          </div>
          <div class="car-specs">
            <span>${ic('seat')} ${car.seatCount} seats</span>
            <span>${ic('bag')} ${car.luggage}</span>
            <span>${ic('snow')} AC</span>
          </div>
          <div class="car-pricing ${hasAirport ? 'has-3' : ''}">
            <div class="price-tile"><div class="label">Local</div><div class="value">₹${car.pricing.local}</div><small>8 hrs · 80 km</small></div>
            <div class="price-tile"><div class="label">Outstation</div><div class="value">₹${car.pricing.outstation}</div><small>min 300 km/day</small></div>
            ${hasAirport ? `<div class="price-tile"><div class="label">Airport</div><div class="value">₹${car.pricing.airport}</div><small>+ parking</small></div>` : ''}
          </div>
          <div class="car-card-ctas">
            <button class="btn btn-dark js-enquire-car" data-car="${car.id}" type="button">Get Exact Price ${ic('arrow', 'i-arrow')}</button>
            <a class="icon-btn" href="${BUSINESS.phoneHref}" aria-label="Call to book the ${car.name}">${ic('phone')}</a>
          </div>
        </div>
      </article>`;
    }).join('') + `
      <article class="car-card help-card-fleet reveal">
        <span class="ic">${ic('headset')}</span>
        <h3>Not sure which car fits?</h3>
        <p>Tell us how many people and how much luggage — we'll suggest the right car and share the exact fare.</p>
        <ul>
          <li>${ic('check')} Honest recommendation, no upselling</li>
          <li>${ic('check')} More vehicles added regularly</li>
        </ul>
        <div class="ctas">
          <a class="btn btn-primary" href="${BUSINESS.phoneHref}">${ic('phone')} Call Us</a>
          <a class="btn btn-outline on-dark-btn" href="${BUSINESS.whatsappHref}" target="_blank" rel="noopener">${ic('wa', 'i-fill')} WhatsApp</a>
        </div>
      </article>`;

    const filters = document.getElementById('fleetFilters');
    const countEl = document.getElementById('fleetCount');
    const emptyEl = document.getElementById('fleetEmpty');
    const cards = [...carsGrid.querySelectorAll('.car-card:not(.help-card-fleet)')];

    const applyFilter = (type) => {
      let shown = 0;
      cards.forEach(card => {
        const match = type === 'all' || card.dataset.type === type;
        card.classList.toggle('is-hidden', !match);
        card.classList.remove('is-entering');
        if (match){
          shown++;
          void card.offsetWidth; // restart the entry animation
          card.classList.add('is-entering', 'is-visible');
        }
      });
      if (countEl) countEl.innerHTML = `Showing <b>${shown}</b> of ${cards.length} vehicles`;
      if (emptyEl) emptyEl.classList.toggle('is-visible', shown === 0);
    };

    if (filters && typeof FLEET_TYPES !== 'undefined'){
      filters.innerHTML = FLEET_TYPES.map((t, i) => {
        const n = t.id === 'all' ? CARS.length : CARS.filter(c => c.type === t.id).length;
        return `<button type="button" class="chip" data-filter="${t.id}" aria-pressed="${i === 0}">${t.label}<span class="count">${n}</span></button>`;
      }).join('');
      filters.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        filters.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
        applyFilter(chip.dataset.filter);
      });
    }
    if (countEl) countEl.innerHTML = `Showing <b>${cards.length}</b> of ${cards.length} vehicles`;
  }

  /* ---------- Footer car links ---------- */
  const footerCars = document.getElementById('footerCars');
  if (footerCars && typeof CARS !== 'undefined'){
    footerCars.innerHTML = CARS.map(c => `<li><a href="car.html?car=${c.id}">${c.name}</a></li>`).join('');
  }

  /* ---------- Populate "Select Car" dropdowns ---------- */
  document.querySelectorAll('.js-car-select').forEach(select => {
    if (typeof CARS === 'undefined') return;
    const options = CARS.map(c => `<option value="${c.id}">${c.name} · ${c.seats}</option>`).join('');
    select.insertAdjacentHTML('beforeend', options + (select.id === 'car' ? `<option value="not-sure">Not sure — help me choose</option>` : ''));
  });

  /* ---------- Date inputs can't be in the past ---------- */
  document.querySelectorAll('input[type="date"]').forEach(inp => inp.min = todayISO());

  /* ---------- Outstation routes list ---------- */
  const routeList = document.getElementById('routeList');
  if (routeList){
    const items = [...routeList.querySelectorAll('.route-item')];
    const maxKm = Math.max(...items.map(i => +i.dataset.km));
    items.forEach(item => {
      const km = +item.dataset.km;
      item.innerHTML = `
        <span class="route-name"><span class="from">Bengaluru</span>${ic('arrow')}${item.dataset.dest}</span>
        <span class="route-km">${km} km ${ic('arrow')}</span>
        <span class="route-bar" aria-hidden="true"><i style="--w:${Math.round(km / maxKm * 100)}%"></i></span>`;
      item.setAttribute('aria-label', `Enquire about Bengaluru to ${item.dataset.dest}, about ${km} km`);
      if (item.hasAttribute('data-extra')) item.hidden = true;
      item.addEventListener('click', () => goToEnquiry({ tripType: 'Outstation', destination: item.dataset.dest }));
    });
    const toggle = document.getElementById('routesToggle');
    if (toggle){
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        items.filter(i => i.hasAttribute('data-extra')).forEach(i => i.hidden = expanded);
        toggle.setAttribute('aria-expanded', String(!expanded));
        toggle.innerHTML = expanded ? `Show all routes ${ic('chev-d')}` : `Show fewer ${ic('chev-d')}`;
        toggle.querySelector('.i').style.transform = expanded ? '' : 'rotate(180deg)';
      });
    }
  }

  /* ---------- Enquiry prefill + scroll ---------- */
  const enquiryForm = document.getElementById('enquiryForm');

  function setTripType(value){
    if (!enquiryForm || !value) return;
    const radio = [...enquiryForm.querySelectorAll('input[name="tripType"]')].find(r => r.value === value);
    if (radio) radio.checked = true;
  }

  function goToEnquiry({ carId = '', tripType = '', pickup = '', destination = '', date = '' } = {}){
    const target = document.getElementById('enquire');
    if (!target || !enquiryForm){
      // Not on a page with the form (e.g. car.html) — go to the homepage form
      window.location.href = `index.html?prefill=${encodeURIComponent(carId)}#enquire`;
      return;
    }
    const carSelect = document.getElementById('car');
    if (carSelect && carId) carSelect.value = carId;
    setTripType(tripType);
    if (pickup) document.getElementById('pickup').value = pickup;
    if (destination) document.getElementById('destination').value = destination;
    if (date) document.getElementById('date').value = date;
    updateProgress();

    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    const nameField = document.getElementById('fullName');
    if (nameField) setTimeout(() => nameField.focus({ preventScroll: true }), 700);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-enquire-car, .js-enquire-generic');
    if (!btn) return;
    e.preventDefault();
    const car = btn.dataset.car ? getCarById(btn.dataset.car) : null;
    goToEnquiry({ carId: btn.dataset.car || '', tripType: btn.dataset.trip || '' });
    if (car) showToast(`${car.name} selected — just add your trip details`);
  });

  /* ---------- Hero quick-quote card ---------- */
  const quick = document.getElementById('quickQuote');
  if (quick){
    const drop = document.getElementById('qDrop');
    const pickup = document.getElementById('qPickup');
    const placeholders = { 'Airport Transfer': 'Kempegowda Airport (BLR)', 'Local': 'e.g. MG Road', 'Outstation': 'e.g. Mysuru, Coorg, Ooty' };
    quick.querySelectorAll('input[name="qtrip"]').forEach(r => r.addEventListener('change', () => {
      drop.placeholder = placeholders[r.value] || '';
    }));
    const swap = quick.querySelector('.swap');
    if (swap) swap.addEventListener('click', () => {
      [pickup.value, drop.value] = [drop.value, pickup.value];
      [pickup.placeholder, drop.placeholder] = [drop.placeholder, pickup.placeholder];
    });
    quick.addEventListener('submit', (e) => {
      e.preventDefault();
      const trip = quick.querySelector('input[name="qtrip"]:checked');
      const tripType = trip ? trip.value : '';
      goToEnquiry({
        carId: document.getElementById('qCar').value,
        tripType,
        pickup: pickup.value.trim(),
        // Airport trips with no drop typed default to the airport itself
        destination: drop.value.trim() || (tripType === 'Airport Transfer' ? 'Kempegowda Airport (BLR)' : ''),
        date: document.getElementById('qDate').value
      });
      showToast('Trip details added — a couple more and you\'re done');
    });
  }

  /* ---------- Enquiry form: progress, validation, WhatsApp hand-off ---------- */
  const requiredFields = enquiryForm ? [...enquiryForm.querySelectorAll('[required]')] : [];
  const progressBar = document.getElementById('formProgress');
  const progressLabel = document.getElementById('formProgressLabel');

  function isFieldValid(input){
    const v = input.value.trim();
    if (!v) return false;
    if (input.type === 'tel'){
      const digits = v.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    }
    return input.checkValidity();
  }
  function markField(input){
    const field = input.closest('.field');
    if (!field) return;
    const ok = isFieldValid(input);
    field.classList.toggle('is-invalid', !ok);
    field.classList.toggle('is-valid', ok);
    input.setAttribute('aria-invalid', String(!ok));
  }
  function updateProgress(){
    if (!enquiryForm || !progressBar) return;
    const trip = enquiryForm.querySelector('input[name="tripType"]:checked') ? 1 : 0;
    const done = requiredFields.filter(isFieldValid).length + trip;
    const pct = Math.round(done / (requiredFields.length + 1) * 100);
    progressBar.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = pct + '%';
  }

  if (enquiryForm){
    requiredFields.forEach(input => {
      input.addEventListener('blur', () => { if (input.value.trim() || input.closest('.field').classList.contains('is-invalid')) markField(input); });
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('is-invalid')) markField(input);
        updateProgress();
      });
      input.addEventListener('change', updateProgress);
    });
    enquiryForm.querySelectorAll('input[name="tripType"]').forEach(r => r.addEventListener('change', updateProgress));

    // Passenger stepper
    const pax = document.getElementById('passengers');
    enquiryForm.querySelectorAll('.stepper button').forEach(b => b.addEventListener('click', () => {
      const next = Math.min(+pax.max, Math.max(+pax.min, (parseInt(pax.value, 10) || 1) + +b.dataset.step));
      pax.value = next;
    }));

    // ?prefill= coming from car.html
    const params = new URLSearchParams(window.location.search);
    if (params.get('prefill')){
      const select = document.getElementById('car');
      if (select) select.value = params.get('prefill');
    }

    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      requiredFields.forEach(markField);
      const firstBad = requiredFields.find(i => !isFieldValid(i));
      if (firstBad){
        firstBad.focus();
        firstBad.closest('.field').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        return;
      }

      const data = new FormData(enquiryForm);
      const carId = data.get('car');
      const car = carId && carId !== 'not-sure' ? getCarById(carId) : null;
      const dateStr = data.get('date') ? new Date(data.get('date') + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const rows = [
        ['Trip', data.get('tripType') || 'Not specified'],
        ['Name', data.get('fullName')],
        ['Phone', data.get('phone')],
        ['Pickup', data.get('pickup')],
        ['Drop', data.get('destination')],
        ['When', `${dateStr}, ${data.get('time')}`],
        ['Car', car ? car.name : (carId === 'not-sure' ? 'Not sure — please suggest' : 'Any')],
        ['Passengers', data.get('passengers') || '—'],
      ];
      const note = (data.get('message') || '').trim();
      if (note) rows.push(['Notes', note]);

      const text = `Hi ${BUSINESS.name}, I'd like a quote for a trip.\n\n` + rows.map(([k, v]) => `*${k}:* ${v}`).join('\n');
      const waUrl = `${BUSINESS.whatsappHref}?text=${encodeURIComponent(text)}`;

      // TODO: also POST the enquiry to a backend / form service so it lands in the Adya Travels inbox.
      window.open(waUrl, '_blank', 'noopener');

      const summary = document.getElementById('enquirySummary');
      if (summary){
        summary.innerHTML = rows.slice(0, 7).map(([k, v]) => `<div><span>${k}</span><b></b></div>`).join('');
        // textContent so user input is never interpreted as HTML
        summary.querySelectorAll('b').forEach((b, i) => b.textContent = rows[i][1]);
      }
      const reopen = document.getElementById('reopenWhatsApp');
      if (reopen) reopen.href = waUrl;

      enquiryForm.style.display = 'none';
      const success = document.getElementById('formSuccess');
      if (success){
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        success.focus({ preventScroll: true });
      }
    });

    const resetFormBtn = document.getElementById('resetEnquiry');
    if (resetFormBtn){
      resetFormBtn.addEventListener('click', () => {
        document.getElementById('formSuccess').classList.remove('is-visible');
        enquiryForm.reset();
        enquiryForm.querySelectorAll('.field').forEach(f => f.classList.remove('is-valid', 'is-invalid'));
        enquiryForm.style.display = '';
        updateProgress();
        document.getElementById('fullName').focus();
      });
    }
    updateProgress();
  }

  /* ---------- Hide the mobile CTA bar while the form is on screen ---------- */
  const ctaBar = document.querySelector('.mobile-cta-bar');
  const enquireSection = document.getElementById('enquire');
  if (ctaBar && enquireSection && 'IntersectionObserver' in window){
    new IntersectionObserver(([e]) => ctaBar.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe(enquireSection);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen){
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Hide broken images (the card keeps its gradient backdrop) ---------- */
  document.querySelectorAll('img').forEach(img => {
    const hide = () => { img.style.visibility = 'hidden'; };
    if (img.complete && img.naturalWidth === 0 && img.src) hide();
    img.addEventListener('error', hide);
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initReveal();
});
