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
        <span class="eyebrow" style="justify-content:center;">Not Found</span>
        <h1 class="h2" style="margin-top:16px;">We couldn't find that car</h1>
        <p class="lede" style="margin:16px auto 28px;">It may have been renamed or removed. Take a look at the full fleet instead.</p>
        <a class="btn btn-primary" href="index.html#cars">View All Cars</a>
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
  function buildPriceRow(label, value, sub){
    return `<div class="price-row">
      <span class="lbl">${label}${sub ? `<br/><small style="color:var(--stone)">${sub}</small>` : ''}</span>
      <span class="val">${value}</span>
    </div>`;
  }

  /* Local duty rows */
  const localRows = [
    buildPriceRow('Package', car.local.base, car.local.baseDesc),
    buildPriceRow('Extra Hour', car.local.extraHour || '—'),
    buildPriceRow('Extra KM', car.local.extraKm || '—'),
    car.local.extras ? `<div class="price-note-row"><span>⚠ ${car.local.extras}</span></div>` : ''
  ].join('');

  /* Outstation rows */
  const os = car.outstation;
  const outstationRows = [
    buildPriceRow('Rate', os.ratePerKm, os.minKm),
    os.driverBata ? buildPriceRow('Driver Bata', os.driverBata) : '',
    os.nightBata  ? buildPriceRow('Night Driver Bata', os.nightBata) : '',
    os.extras ? `<div class="price-note-row"><span>⚠ ${os.extras}</span></div>` : ''
  ].join('');

  /* Airport transfer (Vellfire only) */
  const airportBlock = car.airportTransfer ? `
    <div class="pricing-tab-panel" id="tab-airport-${car.id}">
      <h4 class="price-section-label">Airport Transfer</h4>
      ${buildPriceRow('Flat Rate', car.airportTransfer.rate, car.airportTransfer.extras)}
    </div>` : '';

  const airportTab = car.airportTransfer ? `<button class="price-tab" data-tab="tab-airport-${car.id}">Airport</button>` : '';

  content.innerHTML = `
    <section class="car-hero">
      <div class="car-hero-media"><img src="${car.heroImage}" alt="${car.name}, chauffeur-driven ${car.category.toLowerCase()}" /></div>
      <div class="container car-hero-inner on-dark">
        <div class="breadcrumb"><a href="index.html">Home</a> / <a href="index.html#cars">Our Cars</a> / ${car.name}</div>
        <span class="badge-chip">Chauffeur Driven</span>
        <h1 style="margin-top:18px;">${car.name}</h1>
        <p class="lede" style="margin-top:14px;">${car.tagline}</p>
      </div>
    </section>

    <div class="gallery-wrap">
      <div class="container">
        <div class="gallery">
          ${car.gallery.map((src, i) => `<img src="${src}" alt="${car.name} photo ${i+1}" loading="eager" />`).join('')}
        </div>
      </div>
    </div>

    <div class="container">

      <div class="detail-grid">
        <div>
          <span class="eyebrow">Overview</span>
          <h2 class="h2" style="margin-top:16px;">${car.category} · ${car.seats}</h2>
          <p class="lede" style="margin-top:16px; max-width:60ch;">${car.description}</p>

          <h3 style="margin-top:40px;">Best suited for</h3>
          <div class="use-case-list">
            ${car.bestFor.map(u => `<span>${u}</span>`).join('')}
          </div>

          <h3 style="margin-top:40px;">Comfort &amp; features</h3>
          <ul class="feature-list">
            ${car.features.map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> ${f}</li>`).join('')}
          </ul>

          <h3 style="margin-top:40px;">Available trip types</h3>
          <div class="use-case-list">
            <span>Local Duty</span><span>Outstation</span>${car.airportTransfer ? '<span>Airport Transfer</span>' : ''}<span>One Way</span><span>Round Trip</span><span>Full Day</span>
          </div>
        </div>

        <aside class="price-card">
          <h3>Tariff Details</h3>

          <div class="price-tabs" role="tablist" aria-label="Pricing type">
            <button class="price-tab is-active" data-tab="tab-local-${car.id}" role="tab" aria-selected="true">Local</button>
            <button class="price-tab" data-tab="tab-outstation-${car.id}" role="tab" aria-selected="false">Outstation</button>
            ${airportTab}
          </div>

          <div class="pricing-tab-panel is-active" id="tab-local-${car.id}" role="tabpanel">
            <h4 class="price-section-label">Local Duty</h4>
            ${localRows}
          </div>

          <div class="pricing-tab-panel" id="tab-outstation-${car.id}" role="tabpanel">
            <h4 class="price-section-label">Outstation</h4>
            ${outstationRows}
          </div>

          ${airportBlock}

          <p class="note" style="margin-top:16px;">All fares are indicative. Final charges confirmed at the time of booking.</p>
          <div class="ctas">
            <a class="btn btn-primary btn-block" data-phone-href href="tel:">Call Now</a>
            <a class="btn btn-outline btn-block" href="index.html?prefill=${car.id}#enquire">Enquire Now</a>
          </div>
          <div class="included-box">
            <strong>What's included:</strong> chauffeur, fuel and vehicle for the booked package.<br/><br/>
            <strong>May be extra:</strong> tolls, parking, inter-state permits and driver allowance for outstation or overnight trips — confirmed upfront on your call.
          </div>
        </aside>
      </div>
    </div>

    <section class="contact-section" style="margin-top:100px;">
      <div class="container">
        <span class="eyebrow" style="justify-content:center;">Ready To Travel?</span>
        <h2 class="h2" style="margin-top:16px;">Call Adya Travels</h2>
        <p class="lede">Speak with our team to confirm the ${car.name} for your dates and get your exact fare.</p>
        <div class="contact-phone-lockup">
          <a data-phone-href href="tel:" data-phone-display>+91 99644 40886</a>
          <span>Tap to call · Available daily</span>
        </div>
        <div class="contact-ctas">
          <a class="btn btn-primary btn-lg" data-phone-href href="tel:">Call Now</a>
          <a class="btn btn-outline btn-lg" href="index.html?prefill=${car.id}#enquire">Send an Enquiry</a>
        </div>
      </div>
    </section>
  `;

  /* ---------- Pricing tab switcher ---------- */
  const priceCard = content.querySelector('.price-card');
  if (priceCard){
    priceCard.querySelectorAll('.price-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        priceCard.querySelectorAll('.price-tab').forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        priceCard.querySelectorAll('.pricing-tab-panel').forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        const target = document.getElementById(tab.dataset.tab);
        if (target) target.classList.add('is-active');
      });
    });
  }
});
