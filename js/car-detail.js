/* ============================================================
   ADYA TRAVELS — Car detail page renderer
   Reads the ?car=<id> query param and builds the page from CARS
   in data.js. Adding a vehicle to data.js is enough for it to
   get a full detail page here automatically.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const carId = params.get('car');
  const car = typeof getCarById === 'function' ? getCarById(carId) : null;
  const content = document.getElementById('carContent');

  if (!car){
    content.innerHTML = `
      <div class="container not-found">
        <span class="eyebrow">Not Found</span>
        <h1 class="h2" style="margin-top:16px;">We couldn't find that car</h1>
        <p class="lede">It may have been renamed or removed. Take a look at the full fleet instead.</p>
        <a class="btn btn-primary" href="index.html#cars">View All Cars ${ic('arrow', 'i-arrow')}</a>
      </div>`;
    return;
  }

  document.title = `${car.name} with Driver in Bengaluru — Adya Travels`;
  const descTag = document.getElementById('pageDesc');
  const metaDesc = `Book the ${car.name} (${car.category}) with Adya Travels — chauffeur-driven for airport transfers, local and outstation travel from Bengaluru. ${car.tagline}`;
  if (descTag) descTag.setAttribute('content', metaDesc);
  const mobileEnquire = document.getElementById('mobileEnquireLink');
  if (mobileEnquire) mobileEnquire.href = `index.html?prefill=${car.id}#enquire`;

  /* ---------- Dynamic SEO head tags ---------- */
  const canonicalUrl = `https://www.adyatravels.in/car.html?car=${car.id}`;
  const carOgImage  = `https://www.adyatravels.in/${car.heroImage}`;
  const ogTitle     = `${car.name} with Driver in Bengaluru | Adya Travels`;

  const setMeta = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
  const canonical = document.getElementById('pageCanonical');
  if (canonical) canonical.setAttribute('href', canonicalUrl);
  setMeta('ogUrl',      'content', canonicalUrl);
  setMeta('ogTitle',    'content', ogTitle);
  setMeta('ogDesc',     'content', metaDesc);
  setMeta('ogImage',    'content', carOgImage);
  setMeta('ogImageAlt', 'content', `${car.name} — chauffeur-driven ${car.category} in Bengaluru`);
  setMeta('twTitle',    'content', ogTitle);
  setMeta('twDesc',     'content', metaDesc);
  setMeta('twImage',    'content', carOgImage);
  setMeta('pageKeywords', 'content',
    `${car.name} hire Bengaluru, ${car.name.toLowerCase()} with driver Bangalore, ` +
    `${car.category.toLowerCase()} Bengaluru, chauffeur driven ${car.name.toLowerCase()}, ` +
    `${car.bestFor.join(', ')}, Adya Travels Bengaluru`);

  /* ---------- Per-car JSON-LD structured data ---------- */
  const sdTag = document.getElementById('carStructuredData');
  if (sdTag) {
    const localPriceValue = car.pricing && car.pricing.local ? car.pricing.local.replace(/,/g, '') : null;
    sdTag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${car.name} with Chauffeur — Adya Travels`,
      "description": car.description,
      "image": carOgImage,
      "brand": { "@type": "Brand", "name": "Adya Travels" },
      "offers": {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "INR",
        "price": localPriceValue || "0",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": localPriceValue || "0",
          "priceCurrency": "INR",
          "unitText": car.priceUnit && car.priceUnit.local ? car.priceUnit.local : "per trip"
        },
        "availability": car.status === 'available'
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "LocalBusiness",
          "name": "Adya Travels",
          "telephone": "+91-99644-40886",
          "areaServed": "Bengaluru, Karnataka"
        }
      }
    });
  }

  /* ---------- BreadcrumbList schema ---------- */
  const bcTag = document.createElement('script');
  bcTag.type = 'application/ld+json';
  bcTag.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.adyatravels.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Our Cars",
        "item": "https://www.adyatravels.in/#cars"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": car.name,
        "item": canonicalUrl
      }
    ]
  });
  document.head.appendChild(bcTag);

  /* ---------- Build pricing rows ---------- */
  function buildPriceRow(label, value, sub, cls = ''){
    return `<div class="price-row ${cls}">
      <span class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</span>
      <span class="val">${value}</span>
    </div>`;
  }
  const noteRow = (text) => `<div class="price-note-row">${ic('info')}<span>${text}</span></div>`;

  /* Local duty rows */
  const localRows = [
    buildPriceRow('Package', car.local.base, car.local.baseDesc, 'hero-row'),
    buildPriceRow('Extra hour', car.local.extraHour || '—'),
    buildPriceRow('Extra km', car.local.extraKm || '—'),
    car.local.extras ? noteRow(car.local.extras) : ''
  ].join('');

  /* Outstation rows */
  const os = car.outstation;
  const outstationRows = [
    buildPriceRow('Rate', os.ratePerKm, os.minKm, 'hero-row'),
    os.driverBata ? buildPriceRow('Driver bata', os.driverBata) : '',
    os.nightBata  ? buildPriceRow('Night driver bata', os.nightBata) : '',
    os.extras ? noteRow(os.extras) : ''
  ].join('');

  /* Tariff tabs — airport only exists for some cars (e.g. Vellfire) */
  const tabs = [
    { id: 'local', label: 'Local', body: localRows },
    { id: 'outstation', label: 'Outstation', body: outstationRows },
  ];
  if (car.airportTransfer){
    tabs.push({ id: 'airport', label: 'Airport', body: buildPriceRow('Flat rate', car.airportTransfer.rate, car.airportTransfer.extras, 'hero-row') });
  }

  /* Unique gallery images (data may repeat the same photo) */
  const photos = [...new Set([car.heroImage, ...(car.gallery || [])])];
  const waCarHref = `${BUSINESS.whatsappHref}?text=${encodeURIComponent(`Hi ${BUSINESS.name}, I'd like to check availability and the fare for the ${car.name}.`)}`;
  const enquireHref = `index.html?prefill=${car.id}#enquire`;
  const tripIcons = { 'Local Duty': 'city', 'Outstation': 'route', 'Airport Transfer': 'plane', 'One Way': 'arrow', 'Round Trip': 'swap', 'Full Day': 'clock' };
  const tripTypes = ['Local Duty', 'Outstation', ...(car.airportTransfer ? ['Airport Transfer'] : []), 'One Way', 'Round Trip', 'Full Day'];
  const others = CARS.filter(c => c.id !== car.id);

  content.innerHTML = `
    <section class="car-hero grain snap-section">
      <div class="container car-hero-grid">
        <div class="reveal">
          <button class="gallery-main" type="button" aria-label="Open photo viewer">
            <img id="galleryMain" src="${photos[0]}" alt="${car.name}, chauffeur-driven ${car.category.toLowerCase()}" />
            <span class="zoom">${ic('expand')} ${photos.length > 1 ? `${photos.length} photos` : 'View photo'}</span>
          </button>
          ${photos.length > 1 ? `<div class="gallery-thumbs" role="group" aria-label="Photos">
            ${photos.map((src, i) => `<button type="button" data-index="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}"><img src="${src}" alt="" loading="lazy" /></button>`).join('')}
          </div>` : ''}
        </div>

        <div class="on-dark reveal" style="background:transparent;">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>${ic('chev-r')}<a href="index.html#cars">Our Cars</a>${ic('chev-r')}<span aria-current="page">${car.name}</span>
          </nav>
          <div class="tags">
            <span class="badge-chip">${car.category}</span>
            ${car.highlight ? `<span class="tag tag-bronze">${car.highlight}</span>` : ''}
          </div>
          <h1>${car.name}</h1>
          <p class="lede">${car.tagline}</p>

          <div class="spec-grid">
            <div class="spec">${ic('seat')}<b>${car.seats}</b><span>Capacity</span></div>
            <div class="spec">${ic('bag')}<b>${car.luggage}</b><span>Luggage</span></div>
            <div class="spec">${ic('snow')}<b>AC</b><span>Climate</span></div>
            <div class="spec">${ic('driver')}<b>Chauffeur</b><span>Included</span></div>
          </div>

          <div class="car-hero-price">
            <div>
              <small>Local package from</small>
              <div class="amt">${car.local.base}<span>/ 8 hrs · 80 km</span></div>
            </div>
            <div>
              <small>Outstation</small>
              <div class="amt" style="font-size:clamp(24px,2.6vw,30px)">${os.ratePerKm}</div>
            </div>
          </div>

          <div class="car-hero-ctas">
            <a class="btn btn-primary btn-lg" data-phone-href href="tel:">${ic('phone')} Call to Book</a>
            <a class="btn btn-whatsapp btn-lg" href="${waCarHref}" target="_blank" rel="noopener">${ic('wa', 'i-fill')} WhatsApp</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section snap-section">
      <div class="container detail-grid">
        <div>
          <div class="detail-block reveal">
            <span class="eyebrow">Overview</span>
            <h2>${car.category} · ${car.seats}</h2>
            <p class="lede">${car.description}</p>
          </div>

          <div class="detail-block reveal">
            <h3>Best suited for</h3>
            <div class="use-case-list">
              ${car.bestFor.map(u => `<span>${ic('check')}${u}</span>`).join('')}
            </div>
          </div>

          <div class="detail-block reveal">
            <h3>Comfort &amp; features</h3>
            <ul class="feature-list">
              ${car.features.map(f => `<li><span class="ck">${ic('check')}</span>${f}</li>`).join('')}
            </ul>
          </div>

          <div class="detail-block reveal">
            <h3>Available trip types</h3>
            <div class="use-case-list">
              ${tripTypes.map(t => `<span>${ic(tripIcons[t])}${t}</span>`).join('')}
            </div>
          </div>

          <div class="detail-block reveal">
            <h3>Good to know</h3>
            <div class="included-grid">
              <div class="included-card yes"><h4>${ic('check')} Included</h4><p>Chauffeur, fuel and the vehicle for the booked package.</p></div>
              <div class="included-card maybe"><h4>${ic('info')} May be extra</h4><p>Tolls, parking, inter-state permits and driver allowance for outstation or overnight trips — confirmed upfront on your call.</p></div>
            </div>
          </div>
        </div>

        <aside class="price-card reveal" aria-label="Tariff details">
          <div class="price-card-head">
            <h3>Tariff details</h3>
            <span class="badge-chip">Indicative</span>
          </div>

          <div class="price-tabs" role="tablist" aria-label="Pricing type">
            ${tabs.map((t, i) => `<button class="price-tab" id="tab-${t.id}" role="tab" type="button" aria-selected="${i === 0}" aria-controls="panel-${t.id}" tabindex="${i === 0 ? 0 : -1}">${t.label}</button>`).join('')}
          </div>
          ${tabs.map((t, i) => `<div class="pricing-tab-panel" id="panel-${t.id}" role="tabpanel" aria-labelledby="tab-${t.id}" ${i === 0 ? '' : 'hidden'}>${t.body}</div>`).join('')}

          <p class="note">All fares are indicative. Final charges are confirmed at the time of booking.</p>
          <div class="ctas">
            <a class="btn btn-primary btn-block" data-phone-href href="tel:">${ic('phone')} Call Now</a>
            <a class="btn btn-outline btn-block" href="${enquireHref}">Send an Enquiry ${ic('arrow', 'i-arrow')}</a>
          </div>
        </aside>
      </div>
    </section>

    <section class="section bg-soft snap-section" style="padding-top:clamp(56px,7vw,96px);">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">The Fleet</span>
            <h2>Explore other <em>cars</em></h2>
          </div>
          <a class="btn btn-outline" href="index.html#cars">View full fleet ${ic('arrow', 'i-arrow')}</a>
        </div>
        <div class="other-cars">
          ${others.map(c => `
            <a class="mini-car reveal" href="car.html?car=${c.id}">
              <div class="media"><img src="${c.heroImage}" alt="${c.name}" loading="lazy" /></div>
              <div class="body">
                <small>${c.category}</small>
                <h3>${c.name}</h3>
                <p><span>From ₹${c.pricing.local}</span>${ic('arrow')}</p>
              </div>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="contact-section grain snap-section">
      <div class="container on-dark" style="background:transparent;">
        <span class="eyebrow">Ready To Travel?</span>
        <h2 class="h2">Book the ${car.name}</h2>
        <p class="lede">Speak with our team to confirm the ${car.name} for your dates and get your exact fare.</p>
        <div class="contact-phone-lockup">
          <a data-phone-href href="tel:" data-phone-display>+91 99644 40886</a>
          <span><span class="live-dot" aria-hidden="true"></span> Tap to call · Available 24/7</span>
        </div>
        <div class="contact-ctas">
          <a class="btn btn-primary btn-lg" data-phone-href href="tel:">${ic('phone')} Call Now</a>
          <a class="btn btn-outline btn-lg" href="${enquireHref}">Send an Enquiry ${ic('arrow', 'i-arrow')}</a>
        </div>
      </div>
    </section>
  `;

  /* ---------- Tariff tabs (click + arrow keys) ---------- */
  const tabButtons = [...content.querySelectorAll('.price-tab')];
  function selectTab(btn){
    tabButtons.forEach(t => {
      const on = t === btn;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => selectTab(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabButtons[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ---------- Gallery + lightbox ---------- */
  const mainImg = document.getElementById('galleryMain');
  const thumbs = [...content.querySelectorAll('.gallery-thumbs button')];
  let current = 0;
  function showPhoto(i){
    current = (i + photos.length) % photos.length;
    mainImg.style.opacity = 0;
    setTimeout(() => { mainImg.src = photos[current]; mainImg.style.opacity = 1; }, 180);
    thumbs.forEach((t, j) => t.setAttribute('aria-current', String(j === current)));
    if (lightbox.classList.contains('is-open')) renderLightbox();
  }
  thumbs.forEach(t => t.addEventListener('click', () => showPhoto(+t.dataset.index)));

  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox.querySelector('img');
  const lbCount = lightbox.querySelector('.lb-count');
  const opener = content.querySelector('.gallery-main');
  lightbox.querySelector('.lb-prev').hidden = lightbox.querySelector('.lb-next').hidden = photos.length < 2;
  function renderLightbox(){
    lbImg.src = photos[current];
    lbImg.alt = `${car.name} — photo ${current + 1} of ${photos.length}`;
    lbCount.textContent = `${current + 1} / ${photos.length}`;
  }
  function openLightbox(){
    renderLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    lightbox.querySelector('.lb-close').focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    opener.focus();
  }
  opener.addEventListener('click', openLightbox);
  lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lb-prev').addEventListener('click', () => showPhoto(current - 1));
  lightbox.querySelector('.lb-next').addEventListener('click', () => showPhoto(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showPhoto(current + 1);
    if (e.key === 'ArrowLeft') showPhoto(current - 1);
  });
});
