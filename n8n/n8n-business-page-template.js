/**
 * n8n "Code"-node template: twee talen per zaak → business/{slug}.html & business/{slug}-el.html
 * - Magazine detail layout (Rodia POC): sheet chrome, contact card, review/maps, photo lightbox via app.js
 * - Domein: overal https://www.kalanera.gr
 * - OG + Twitter meta, JSON-LD BreadcrumbList + category-specific LocalBusiness
 *
 * Kopieer de volledige inhoud naar je n8n workflow (geen import van dit bestand).
 */

const results = [];

const SITE_ORIGIN = 'https://www.kalanera.gr';

const dict = {
  Camp: 'Καμπινγκ',
  Drink: 'Ποτό',
  Eat: 'Φαγητό',
  Other: 'Άλλο',
  Rent: 'Ενοικιάσεις',
  Shop: 'Ψώνια',
  Sleep: 'Διαμονή',
  Travel: 'Ταξίδια',
  'Kala Nera': 'Καλά Νερά',
  'Kato Gatzea': 'Κάτω Γατζέα',
  'Ano Gatzea': 'Άνω Γατζέα',
  Koropi: 'Κορώπη',
  Milies: 'Μηλιές',
  Vizitsa: 'Βυζίτσα',
  Afissos: 'Αφησσος',
};

const t = (text, isGreek) => {
  if (!isGreek) return text;
  return dict[text] ?? text;
};

const categoryToSchemaType = (categoryRaw) => {
  const c = String(categoryRaw ?? '').trim();
  const m = {
    Camp: 'Campground',
    Eat: 'Restaurant',
    Drink: 'BarOrPub',
    Sleep: 'LodgingBusiness',
    Shop: 'Store',
    Rent: 'LocalBusiness',
    Travel: 'TravelAgency',
    Other: 'LocalBusiness',
  };
  return m[c] || 'LocalBusiness';
};

const categorySectionSlug = (cat) =>
  String(cat || 'other')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'other';

const categoryFaSolid = (categoryRaw) => {
  const m = {
    Eat: 'fa-utensils',
    Drink: 'fa-glass-cheers',
    Sleep: 'fa-bed',
    Shop: 'fa-shopping-cart',
    Rent: 'fa-car',
    Travel: 'fa-route',
    Camp: 'fa-campground',
    Other: 'fa-tag',
  };
  return m[String(categoryRaw ?? '').trim()] || 'fa-tag';
};

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const jsonLdEmbed = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/** Relative ../pix/ for business/*.html — same origin on kalanera.gr and www (no cross-site img). */
const businessPixSrc = (photoField) => {
  const fallback = '../pix/nophoto.jpg';
  const raw = String(photoField ?? '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) {
    const m = raw.match(/\/pix\/[^?#'"\s]+/i);
    if (m && /kalanera\.gr\b/i.test(raw)) return '..' + m[0];
    if (/kalanera\.gr\b/i.test(raw)) return fallback;
    return raw;
  }
  let path = raw.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
  if (!path.startsWith('pix/')) {
    path = path.replace(/^pix\/?/, '');
    path = 'pix/' + path;
  }
  return '../' + path;
};

/** Absolute URL for OG/Twitter/JSON-LD only. */
const absoluteAssetUrl = (photoField) => {
  const rel = businessPixSrc(photoField);
  if (/^https?:\/\//i.test(rel)) return rel;
  const pix = rel.replace(/^\.\./, '');
  return `${SITE_ORIGIN}${pix.startsWith('/') ? pix : '/' + pix}`;
};

const telForLd = (p) => {
  const s = String(p ?? '').trim();
  if (!s || s === '-') return '';
  return s;
};

const telHref = (p) => telForLd(p).replace(/\s+/g, '');

/** Link text for Website row: "Facebook" instead of long profile.php URLs; own domains stay as hostname. */
const websiteDisplayLabel = (url) => {
  const raw = String(url ?? '').trim();
  if (!raw || raw === '-') return '';

  const labelFromHost = (host, path) => {
    const h = host.replace(/^(www|m|mobile)\./i, '').toLowerCase();
    const p = (path || '').toLowerCase();
    const known = [
      ['facebook.com', 'Facebook'],
      ['fb.com', 'Facebook'],
      ['instagram.com', 'Instagram'],
      ['tiktok.com', 'TikTok'],
      ['twitter.com', 'X'],
      ['x.com', 'X'],
      ['youtube.com', 'YouTube'],
      ['youtu.be', 'YouTube'],
      ['linkedin.com', 'LinkedIn'],
      ['pinterest.com', 'Pinterest'],
      ['tripadvisor.com', 'TripAdvisor'],
      ['tripadvisor.gr', 'TripAdvisor'],
      ['wa.me', 'WhatsApp'],
      ['api.whatsapp.com', 'WhatsApp'],
      ['whatsapp.com', 'WhatsApp'],
      ['t.me', 'Telegram'],
      ['telegram.me', 'Telegram'],
      ['linktr.ee', 'Linktree'],
      ['bit.ly', 'Link'],
    ];
    for (const [suffix, label] of known) {
      if (h === suffix || h.endsWith('.' + suffix)) return label;
    }
    if (h.includes('booking.com')) return 'Booking.com';
    if (h.includes('airbnb.')) return 'Airbnb';
    if (h === 'google.com' || h.endsWith('.google.com')) {
      return p.includes('/maps') ? 'Google Maps' : 'Google';
    }
    if (h === 'goo.gl' || h === 'maps.app.goo.gl') return 'Google Maps';
    return h;
  };

  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(href);
    return labelFromHost(u.hostname, u.pathname);
  } catch {
    const lower = raw.toLowerCase();
    if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'Facebook';
    if (lower.includes('instagram.com')) return 'Instagram';
    if (lower.includes('tripadvisor')) return 'TripAdvisor';
    if (raw.length > 36) return raw.slice(0, 33) + '…';
    return raw;
  }
};

const stripHtml = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const gtagSafeName = (name) => String(name ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

for (const item of $input.all()) {
  const biz = item.json;
  const slug = biz.Name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const generateHTML = (name, isGreek) => {
    const lang = isGreek ? 'el' : 'en';
    const gtagId = 'G-12LDX13JG6';
    const appVersion = '3.1.37';

    const summaryRaw = isGreek ? biz.Summary_el_imp : biz.Summary_en_imp;
    const summary = summaryRaw && String(summaryRaw).trim() !== '' && summaryRaw !== '-' ? String(summaryRaw).trim() : '';

    const footerAboutText = isGreek
      ? 'Βοηθάμε τους επισκέπτες να ανακαλύψουν τα καλύτερα σημεία—από αυθεντικές ταβέρνες μέχρι όμορφες διαμονές—στα Καλά Νερά και το ευρύτερο Πήλιο.'
      : 'We help travelers discover the best places—from authentic taverns to wonderful stays—in Kala Nera and the wider Pelion area.';
    const footerSiteTitle = isGreek ? 'Ιστότοπος' : 'Site';
    const footerInfoTitle = isGreek ? 'Πληροφορίες' : 'Info';
    const footerTagline = isGreek ? 'Καλά Νερά · Πήλιο, Ελλάδα' : 'Kala Nera · Pelion, Greece';
    const footerBusLabel = isGreek ? 'Λεωφορείο (Καλά Νερά)' : 'Bus (Kala Nera)';
    const footerTravelLabel = isGreek ? 'Οδηγός Πηλίου' : 'Pelion guide';
    const footerFavoritesLabel = isGreek ? 'Αγαπημένα' : 'Favorites';
    const footerAddBizLabel = isGreek ? 'Προσθέστε Επιχείρηση' : 'Add your Business';
    const footerSocialTitle = isGreek ? 'Κοινωνικά' : 'Social';
    const footerMobileApp = isGreek ? 'Εφαρμογή Κινητού' : 'Mobile App';
    const footerContactTitle = isGreek ? 'Επικοινωνία' : 'Contact';
    const footerPrivacyLabel = isGreek ? 'Πολιτική απορρήτου' : 'Privacy policy';
    const footerCopyright = isGreek
      ? '© 2026 Οδηγός Καλών Νερών. E-Project όλα τα δικαιώματα διατηρούνται.'
      : '© 2026 Kala Nera Guide. E-Project all rights reserved.';
    const footerPoweredLabel = isGreek ? 'Με την υποστήριξη' : 'Powered by';
    const footerPoweredAria = isGreek
      ? 'Με την υποστήριξη KanteKlik — επικοινωνία μέσω email'
      : 'Powered by KanteKlik — email contact';

    const catEn = String(biz.Category ?? 'Other').trim() || 'Other';
    const cat = t(catEn, isGreek);
    const loc = t(biz.Location, isGreek);
    const locEn = t(biz.Location, false);
    const catIcon = categoryFaSolid(catEn);

    const tabHome = isGreek ? 'Αρχική' : 'Home';
    const tabFav = isGreek ? 'Αγαπημένα' : 'Favorites';
    const tabGuide = isGreek ? 'Οδηγός' : 'Guide';
    const tabMore = isGreek ? 'Περισσότερα' : 'More';
    const tabBus = isGreek ? 'Λεωφορείο' : 'Bus';
    const navInstall = isGreek ? 'Εγκατάσταση Εφαρμογής' : 'Install App';
    const navMenuAria = isGreek ? 'Άνοιγμα μενού' : 'Open menu';
    const moreTravelNumbers = isGreek ? 'Χρήσιμα τηλέφωνα' : 'Useful numbers';

    const lblCategory = isGreek ? 'Κατηγορία' : 'Category';
    const lblPelion = isGreek ? 'Πήλιο' : 'Pelion';
    const lblPhone = isGreek ? 'Τηλέφωνο' : 'Phone';
    const lblEmail = 'Email';
    const lblWebsite = isGreek ? 'Ιστοσελίδα' : 'Website';
    const lblViewPhoto = isGreek ? 'Προβολή πλήρους φωτογραφίας' : 'View full photo';
    const lblQuickActions = isGreek ? 'Γρήγορες ενέργειες' : 'Quick actions';
    const lblReviews = isGreek ? 'Κριτικές' : 'Reviews';
    const lblReviewsAria = isGreek ? 'Κριτικές στο Google' : 'Reviews on Google';
    const lblLocation = isGreek ? 'Τοποθεσία' : 'Location';
    const lblMapsAria = isGreek ? 'Άνοιγμα στο Google Maps' : 'Open in Google Maps';
    const bottomNavAria = isGreek ? 'Κύρια πλοήγηση' : 'Primary';

    const ix = isGreek ? 'index-el.html' : 'index.html';
    const langAltPath = isGreek ? `${slug}.html` : `${slug}-el.html`;
    const langAltLabel = isGreek ? 'English' : 'Ελληνικά';
    const langFlagFile = isGreek ? 'gb' : 'gr';
    const pageUrl = `${SITE_ORIGIN}/business/${slug}${isGreek ? '-el' : ''}.html`;
    const alternateEn = `${SITE_ORIGIN}/business/${slug}.html`;
    const alternateEl = `${SITE_ORIGIN}/business/${slug}-el.html`;

    const metaDescPlain =
      summary
        ? stripHtml(summary).slice(0, 160)
        : `${isGreek ? 'Ανακαλύψτε το ' + name : 'Discover ' + name} - ${cat} in ${loc}.`;
    const ogTitle = `${name} — Kala Nera Guide`;
    const pageTitle = `${name} | Kala Nera Guide`;

    const otherNameRaw = isGreek
      ? biz.Name && String(biz.Name).trim() && String(biz.Name).trim() !== String(name).trim()
        ? String(biz.Name).trim()
        : ''
      : biz.Name_EL && String(biz.Name_EL).trim() && String(biz.Name_EL).trim() !== String(name).trim()
        ? String(biz.Name_EL).trim()
        : '';

    const schemaType = categoryToSchemaType(catEn);
    const tel = telForLd(biz.Phone);
    const email = String(biz.Email ?? '').trim();
    const hasEmail = email && email !== '-';

    const safeWebsite = (biz.Website || '').trim();
    const websiteHref =
      safeWebsite && safeWebsite !== '-' && !safeWebsite.startsWith('http')
        ? `https://${safeWebsite}`
        : safeWebsite && safeWebsite !== '-'
          ? safeWebsite
          : '';

    const imgSrc = businessPixSrc(biz.PhotoURL);
    const imgSrcAbsolute = absoluteAssetUrl(biz.PhotoURL);
    const imgAlt = isGreek ? `${name} στα ${loc}` : `${name} in ${loc}`;

    const reviewUrl = `https://www.google.com/search?q=${encodeURIComponent(biz.Name + ' Kala Nera reviews')}`;
    const mapsUrl =
      (biz.GoogleMapsLink && String(biz.GoogleMapsLink).trim()) ||
      `https://www.google.com/maps/search/${encodeURIComponent(biz.Name + ' Kala Nera')}`;
    const gtagBiz = gtagSafeName(biz.Name);

    const breadcrumbLd = {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isGreek ? 'Αρχική' : 'Home',
          item: `${SITE_ORIGIN}/${ix}`,
        },
        { '@type': 'ListItem', position: 2, name, item: pageUrl },
      ],
    };

    const businessLd = {
      '@type': schemaType,
      '@id': `${pageUrl}#business`,
      name,
      ...(otherNameRaw ? { alternateName: otherNameRaw } : {}),
      image: imgSrcAbsolute,
      url: pageUrl,
      description: metaDescPlain,
      address: {
        '@type': 'PostalAddress',
        addressLocality: locEn,
        addressRegion: 'Pelion',
        postalCode: '37010',
        addressCountry: 'GR',
      },
      ...(tel ? { telephone: tel } : {}),
      ...(websiteHref ? { sameAs: websiteHref } : {}),
    };

    const ldGraph = { '@context': 'https://schema.org', '@graph': [breadcrumbLd, businessLd] };

    const contactRows = [];
    if (tel) {
      contactRows.push(
        '          <div class="biz-detail-contact-row">\n' +
          `            <span class="biz-detail-contact-label"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${lblPhone}</span>\n` +
          `            <a href="tel:${escapeHtml(telHref(tel))}">${escapeHtml(tel)}</a>\n` +
          '          </div>',
      );
    }
    if (hasEmail) {
      contactRows.push(
        '          <div class="biz-detail-contact-row">\n' +
          `            <span class="biz-detail-contact-label"><i class="fa-solid fa-envelope" aria-hidden="true"></i> ${lblEmail}</span>\n` +
          `            <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>\n` +
          '          </div>',
      );
    }
    if (websiteHref) {
      contactRows.push(
        '          <div class="biz-detail-contact-row">\n' +
          `            <span class="biz-detail-contact-label"><i class="fa-solid fa-globe" aria-hidden="true"></i> ${lblWebsite}</span>\n` +
          `            <a href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(websiteHref)}">${escapeHtml(websiteDisplayLabel(websiteHref))}</a>\n` +
          '          </div>',
      );
    }
    const contactCardHtml = contactRows.length
      ? `        <div class="biz-detail-contact flights-card">\n${contactRows.join('\n')}\n        </div>`
      : '';
    const descriptionHtml = summary ? `        <p class="biz-detail-description">${escapeHtml(summary)}</p>\n` : '';
    const siteLangScript = isGreek ? "  <script>window.SITE_LANGUAGE = 'el';</script>\n" : '';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${siteLangScript}  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#4a6c4a">
  <script async src="https://www.googletagmanager.com/gtag/js?id=${gtagId}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gtagId}');</script>
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDescPlain)}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="alternate" hreflang="en" href="${alternateEn}" />
  <link rel="alternate" hreflang="el" href="${alternateEl}" />
  <link rel="alternate" hreflang="x-default" href="${alternateEn}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDescPlain)}">
  <meta property="og:image" content="${escapeHtml(imgSrcAbsolute)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kala Nera Guide">
  <meta property="og:locale" content="${isGreek ? 'el_GR' : 'en_GB'}">
  <meta property="og:locale:alternate" content="${isGreek ? 'en_GB' : 'el_GR'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDescPlain)}">
  <meta name="twitter:image" content="${escapeHtml(imgSrcAbsolute)}">
  <script type="application/ld+json">${jsonLdEmbed(ldGraph)}</script>
  <link rel="icon" type="image/png" href="../favicon.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
  <link rel="stylesheet" href="../style.css?v=${appVersion}">
  <link rel="manifest" href="/manifest.json">
</head>
<body class="biz-detail-page">
  <header class="site-header"><nav class="main-nav"><div class="nav-container">
        <a href="../${escapeHtml(ix)}" class="logo logo--with-tag" aria-label="${isGreek ? 'Οδηγός Καλών Νερών — αρχική' : 'Kala Nera Guide — home'}"><span class="logo-main">${isGreek ? 'Καλά <span>Νερά</span>' : 'Kala <span>Nera</span>'}</span><span class="logo-tag" aria-hidden="true">Guide</span></a>
        <a href="${escapeHtml(langAltPath)}" class="lang-link-mobile" title="${escapeHtml(langAltLabel)}" aria-label="${escapeHtml(langAltLabel)}"><img src="../pix/flags/${escapeHtml(langFlagFile)}.svg" alt="${escapeHtml(langAltLabel)}"></a>
        <a href="https://www.meteoblue.com/en/weather/forecast/week/kal%c3%a1-ner%c3%a1_greece_261556" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="weather-icon-container"><span id="weather-icon"></span><span id="weather-temp">--°C</span></div></a>
        <button class="menu-toggle" id="mobile-menu" type="button" aria-label="${escapeHtml(navMenuAria)}" title="${escapeHtml(navMenuAria)}"><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span></button>
        <ul class="nav-links" id="nav-list">
          <li><a href="../${escapeHtml(ix)}"><i class="fa-solid fa-house" aria-hidden="true"></i> ${escapeHtml(tabHome)}</a></li>
          <li><a href="../bus${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-bus" aria-hidden="true"></i> ${escapeHtml(footerBusLabel)}</a></li>
          <li><a href="../wishlist${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-heart menu-heart" aria-hidden="true"></i> ${escapeHtml(footerFavoritesLabel)}</a></li>
          <li><a href="../t-form${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-circle-plus" aria-hidden="true"></i> ${escapeHtml(footerAddBizLabel)}</a></li>
          <li><a href="../info${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-compass" aria-hidden="true"></i> ${escapeHtml(footerTravelLabel)}</a></li>
          <li id="menu-install-item" class="mobile-only-item"><a href="#" onclick="triggerManualInstall(event)"><i class="fa fa-download" style="color:var(--install-color)!important"></i> ${escapeHtml(navInstall)}</a></li>
          <li><a href="${escapeHtml(langAltPath)}" class="lang-link" title="${escapeHtml(langAltLabel)}" aria-label="${escapeHtml(langAltLabel)}"><img src="../pix/flags/${escapeHtml(langFlagFile)}.svg" alt="${escapeHtml(langAltLabel)}" style="width:20px;vertical-align:middle;margin-right:5px"></a></li>
        </ul>
      </div></nav></header>
  <main class="sheet-data-page biz-detail-page flights-page" id="top">
    <header class="flights-page-head"><div class="flights-page-head-main"><h1 class="flights-page-title">${escapeHtml(name)}</h1><p class="flights-iata-badge"><abbr title="${escapeHtml(lblCategory)}">${escapeHtml(cat)}</abbr></p></div>
      <p class="flights-page-kicker">${escapeHtml(loc)} <span class="flights-kicker-sep" aria-hidden="true">·</span> ${escapeHtml(lblPelion)}</p></header>
    <article class="biz-detail-card">
      <button type="button" class="biz-detail-card__image-btn" aria-label="${escapeHtml(lblViewPhoto)}"><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(imgAlt)}" class="biz-detail-card__image" width="800" height="500" loading="eager" onerror="this.onerror=null;this.src='../pix/nophoto.jpg'"></button>
      <div class="biz-detail-card__body">
        <p class="biz-detail-meta"><span><i class="fa-solid ${catIcon}" aria-hidden="true"></i> ${escapeHtml(cat)}</span><span class="biz-detail-meta-sep" aria-hidden="true">·</span><span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(loc)}</span></p>
${descriptionHtml}        <div class="biz-detail-contact-wrap">
${contactCardHtml}
        <div class="biz-detail-actions" aria-label="${escapeHtml(lblQuickActions)}">
          <a href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener noreferrer" class="btn-icon review-btn" title="${escapeHtml(lblReviews)}" aria-label="${escapeHtml(lblReviewsAria)}" onclick="gtag('event', 'click_reviews', {'biz_name': '${gtagBiz}'})"><i class="fa-solid fa-star" aria-hidden="true"></i></a>
          <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn-icon nav-btn-action" title="${escapeHtml(lblLocation)}" aria-label="${escapeHtml(lblMapsAria)}" onclick="gtag('event', 'open_maps', {'biz_name': '${gtagBiz}'})"><i class="fa-solid fa-location-dot" aria-hidden="true"></i></a>
        </div></div></div></article>
  </main>
  <footer class="site-footer"><div class="footer-container footer-container--hub"><div class="footer-column footer-column--brand">
        <a href="../${escapeHtml(ix)}" class="footer-brand-lockup"><img src="../logo.png" alt="${escapeHtml(isGreek ? 'Καλά Νερά' : 'Kala Nera')}" width="52" height="52" class="footer-brand-logo" loading="lazy"><span class="footer-lockup-wordmark logo">${isGreek ? 'Καλά <span>Νερά</span>' : 'Kala <span>Nera</span>'}</span></a>
        <p class="footer-tagline">${escapeHtml(footerTagline)}</p><p class="footer-lead">${escapeHtml(footerAboutText)}</p>
        <div class="footer-install-strip">
          <a href="../${isGreek ? 'install-el.html' : 'install.html'}" class="install-badge install-badge--footer" aria-label="${escapeHtml(isGreek ? 'Εγκατάσταση Καλά Νερά Guide στο κινητό' : 'Install Kala Nera Guide on your phone')}"><span class="install-badge__icon" aria-hidden="true"><i class="fa-solid fa-mobile-screen-button"></i></span><span class="install-badge__text"><span class="install-badge__title">${escapeHtml(isGreek ? 'Εγκατάσταση στο κινητό' : 'Install on your phone')}</span><span class="install-badge__note">${escapeHtml(isGreek ? 'Δωρεάν · Μέσω browser · Όχι App Store ή Google Play' : 'Free · Browser install · Not in App Store or Google Play')}</span></span><i class="fa-solid fa-chevron-right install-badge__chevron" aria-hidden="true"></i></a>
          <div class="footer-install-qr"><img src="../${isGreek ? 'pix/install-qr-el.png' : 'pix/install-qr-en.png'}" width="72" height="72" alt="${escapeHtml(isGreek ? 'QR εγκατάστασης: kalanera.gr/install-el.html' : 'QR: install Kala Nera Guide at kalanera.gr/install.html')}" loading="lazy"><span class="footer-install-qr__label">${escapeHtml(isGreek ? 'Σάρωση' : 'Scan')}</span></div>
        </div></div>
      <div class="footer-aside"><div class="footer-aside-cols">
        <div class="footer-column footer-column--site"><div class="footer-nav-section"><h3>${escapeHtml(footerSiteTitle)}</h3><ul>
            <li><a href="../bus${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-bus" aria-hidden="true"></i> ${escapeHtml(footerBusLabel)}</a></li>
            <li><a href="../wishlist${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-heart" aria-hidden="true"></i> ${escapeHtml(footerFavoritesLabel)}</a></li>
            <li><a href="../t-form${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-circle-plus" aria-hidden="true"></i> ${escapeHtml(footerAddBizLabel)}</a></li>
            <li><a href="../info${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-compass" aria-hidden="true"></i> ${escapeHtml(footerTravelLabel)}</a></li>
            <li><a href="../useful-numbers${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${escapeHtml(moreTravelNumbers)}</a></li>
          </ul></div></div>
        <div class="footer-column footer-column--social"><h3>${escapeHtml(footerSocialTitle)}</h3><div class="social-icons"><a href="https://www.facebook.com/kalanera.info" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a></div>
          <div class="footer-nav-section footer-nav-section--under-social"><h3>${escapeHtml(footerInfoTitle)}</h3><ul>
            <li><a href="mailto:info@spiti.tech"><i class="fa fa-envelope" aria-hidden="true"></i> ${escapeHtml(footerContactTitle)}</a></li>
            <li><a href="../privacy${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-user-shield" aria-hidden="true"></i> ${escapeHtml(footerPrivacyLabel)}</a></li>
          </ul></div></div></div>
        <p class="footer-legal">${escapeHtml(footerCopyright)} · <span class="footer-powered-inline">${escapeHtml(footerPoweredLabel)} <a href="mailto:info@spiti.tech">KanteKlik</a></span></p>
      </div></div>
  </footer>
  <nav class="bottom-nav" aria-label="${escapeHtml(bottomNavAria)}"><div class="bottom-nav-inner">
      <a href="../${escapeHtml(ix)}"><i class="fa-solid fa-house"></i><span>${escapeHtml(tabHome)}</span></a>
      <a href="../bus${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-bus"></i><span>${escapeHtml(tabBus)}</span></a>
      <a href="../wishlist${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-heart"></i><span>${escapeHtml(tabFav)}</span></a>
      <a href="../info${isGreek ? '-el' : ''}.html"><i class="fa-solid fa-compass"></i><span>${escapeHtml(tabGuide)}</span></a>
      <a href="#" data-more><i class="fa-solid fa-ellipsis"></i><span>${escapeHtml(tabMore)}</span></a>
    </div></nav>
  <script src="../app.js?v=${appVersion}"></script>
</body>
</html>`;
  };

  results.push({ json: { fileName: `business/${slug}.html`, htmlContent: generateHTML(biz.Name, false) } });
  results.push({
    json: {
      fileName: `business/${slug}-el.html`,
      htmlContent: generateHTML(biz.Name_EL || biz.Name, true),
    },
  });
}

return results;
