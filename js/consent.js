var CONSENT_KEY = 'ledisa_cookie_consent';
var CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

function getStoredConsent() {
  try {
    var raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() - parsed.timestamp > CONSENT_TTL_MS) return null;
    return parsed.state;
  } catch (e) {
    return null;
  }
}

function storeConsent(state) {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ state: state, timestamp: Date.now() }),
    );
  } catch (e) {
    // Storage disabled (private mode, quota exceeded). Consent is respected for
    // this page load only — banner will show again on next visit.
  }
}

function showBanner() {
  var banner = qs('#cookie-banner');
  var reopen = qs('#cookie-preferences-btn');
  if (!banner) return;
  banner.hidden = false;
  if (reopen) reopen.hidden = true;
  // Force reflow so the transform transition triggers from the hidden state.
  void banner.offsetWidth;
  banner.classList.add('visible');
}

function hideBanner() {
  var banner = qs('#cookie-banner');
  var reopen = qs('#cookie-preferences-btn');
  if (!banner) return;
  banner.classList.remove('visible');
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var delay = reduceMotion ? 0 : 320;
  setTimeout(function () {
    banner.hidden = true;
    if (reopen) reopen.hidden = false;
  }, delay);
}

var gtmLoaded = false;

function loadGTM() {
  if (gtmLoaded) return;
  var containerId = window.CONFIG && window.CONFIG.GTM_CONTAINER_ID;
  if (!containerId || containerId === 'GTM-XXXXXXX') {
    console.warn('[GTM] Container ID not configured — skipping load.');
    return;
  }
  gtmLoaded = true;
  // Standard GTM snippet, inlined so we can gate it on consent.
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0];
    var j = d.createElement(s);
    var dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', containerId);
}

function handleConsentClick(state) {
  storeConsent(state);
  hideBanner();
  if (state === 'accepted') loadGTM();
}

function initConsent() {
  var stored = getStoredConsent();
  var reopen = qs('#cookie-preferences-btn');

  if (stored === 'accepted') {
    if (reopen) reopen.hidden = false;
    loadGTM();
  } else if (stored === 'rejected') {
    if (reopen) reopen.hidden = false;
  } else {
    showBanner();
  }

  var banner = qs('#cookie-banner');
  if (banner) {
    banner.addEventListener('click', function (event) {
      var target = event.target.closest('[data-consent-action]');
      if (!target) return;
      var action = target.getAttribute('data-consent-action');
      handleConsentClick(action === 'accept' ? 'accepted' : 'rejected');
    });
  }

  if (reopen) {
    reopen.addEventListener('click', function () {
      showBanner();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConsent);
} else {
  initConsent();
}
