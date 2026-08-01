var KLAVIYO_ENDPOINT = 'https://a.klaviyo.com/client/subscriptions/';
var KLAVIYO_API_REVISION = '2026-07-15';

function isKlaviyoConfigured() {
  var config = window.CONFIG || {};
  return (
    typeof config.KLAVIYO_PUBLIC_KEY === 'string' &&
    config.KLAVIYO_PUBLIC_KEY.length > 0 &&
    config.KLAVIYO_PUBLIC_KEY !== 'XXXXXX' &&
    typeof config.KLAVIYO_LIST_ID === 'string' &&
    config.KLAVIYO_LIST_ID.length > 0 &&
    config.KLAVIYO_LIST_ID !== 'XXXXXX'
  );
}

function normalizePhoneForKlaviyo(rawPhone) {
  if (typeof rawPhone !== 'string') return '';
  var trimmed = rawPhone.trim();
  if (!trimmed) return '';
  var digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  // Prefix '+' so Klaviyo's E.164 validator has a chance of accepting the number.
  // If the user omitted a country code, Klaviyo rejects the phone and the profile
  // is still created with just email — no user-facing failure.
  return '+' + digits;
}

function splitLeadName(fullName) {
  var trimmed = (fullName || '').trim();
  if (!trimmed) return { first_name: '', last_name: '' };
  var parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return {
    first_name: parts.shift(),
    last_name: parts.join(' '),
  };
}

function buildKlaviyoPayload(lead, answers, listId) {
  var names = splitLeadName(lead.name);

  var profileAttributes = {
    email: (lead.email || '').trim().toLowerCase(),
  };

  var phone = normalizePhoneForKlaviyo(lead.phone);
  if (phone) profileAttributes.phone_number = phone;
  if (names.first_name) profileAttributes.first_name = names.first_name;
  if (names.last_name) profileAttributes.last_name = names.last_name;

  var properties = {};
  Object.keys(answers || {}).forEach(function (key) {
    properties['quiz_' + key] = answers[key];
  });
  properties.quiz_completed_at = new Date().toISOString();
  properties.quiz_source = 'Ledisa Quiz Funnel';
  profileAttributes.properties = properties;

  profileAttributes.subscriptions = {
    email: {
      marketing: {
        consent: 'SUBSCRIBED',
      },
    },
  };

  if (phone) {
    profileAttributes.subscriptions.sms = {
      marketing: {
        consent: 'SUBSCRIBED',
      },
      transactional: {
        consent: 'SUBSCRIBED',
      },
    };
  }

  return {
    data: {
      type: 'subscription',
      attributes: {
        profile: {
          data: {
            type: 'profile',
            attributes: profileAttributes,
          },
        },
        custom_source: 'Ledisa Quiz Funnel',
      },
      relationships: {
        list: {
          data: { type: 'list', id: listId },
        },
      },
    },
  };
}

function subscribeLeadToKlaviyo(lead, answers) {
  if (!isKlaviyoConfigured()) {
    console.warn('[Klaviyo] Public key or list ID not configured — skipping subscribe.');
    return Promise.resolve(null);
  }

  var config = window.CONFIG;
  var url = KLAVIYO_ENDPOINT + '?company_id=' + encodeURIComponent(config.KLAVIYO_PUBLIC_KEY);
  var body = JSON.stringify(buildKlaviyoPayload(lead, answers, config.KLAVIYO_LIST_ID));

  // keepalive lets the request survive the imminent page redirect.
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      revision: KLAVIYO_API_REVISION,
    },
    body: body,
    keepalive: true,
  }).catch(function (err) {
    console.error('[Klaviyo] Subscribe failed:', err);
    return null;
  });
}
