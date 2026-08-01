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

function handleConsentClick(state) {
  storeConsent(state);
  hideBanner();
}

function initConsent() {
  var stored = getStoredConsent();
  var reopen = qs('#cookie-preferences-btn');

  if (stored === 'accepted' || stored === 'rejected') {
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
