function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
  return Array.from((scope || document).querySelectorAll(selector));
}

function createEl(tag, props, children) {
  var el = document.createElement(tag);
  if (props) {
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      if (key === 'text') {
        el.textContent = value;
      } else if (key === 'class' || key === 'className') {
        el.className = value;
      } else if (key.indexOf('on') === 0 && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value !== undefined && value !== null) {
        el.setAttribute(key, value);
      }
    });
  }
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach(function (child) {
      if (child == null) return;
      el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
  }
  return el;
}

function validateEmail(value) {
  if (typeof value !== 'string') return false;
  var trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

function validatePhone(value) {
  if (typeof value !== 'string') return false;
  var digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validateName(value) {
  if (typeof value !== 'string') return false;
  return value.trim().length >= 2;
}

var QuizState = (function () {
  var state = { answers: {}, lead: {} };

  return {
    get: function () {
      return state;
    },
    setAnswer: function (key, value) {
      state.answers[key] = value;
    },
    setLead: function (key, value) {
      state.lead[key] = value;
    },
    reset: function () {
      state = { answers: {}, lead: {} };
    },
  };
})();

function pushDataLayerEvent(eventName, payload) {
  window.dataLayer = window.dataLayer || [];
  var event = Object.assign({ event: eventName }, payload || {});
  window.dataLayer.push(event);
}

function transitionToStep(fromEl, toEl) {
  if (!toEl) return;

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    if (fromEl) {
      fromEl.classList.remove('active', 'exiting');
    }
    toEl.classList.add('active');
    return;
  }

  if (fromEl && fromEl !== toEl) {
    fromEl.classList.remove('active');
    fromEl.classList.add('exiting');

    var onEnd = function (event) {
      if (event.target !== fromEl) return;
      fromEl.classList.remove('exiting');
      fromEl.removeEventListener('transitionend', onEnd);
    };
    fromEl.addEventListener('transitionend', onEnd);
  }

  toEl.classList.remove('exiting');
  // Force a reflow so the browser registers the pre-active starting state
  // before we add .active, otherwise the transition may not run.
  void toEl.offsetWidth;
  toEl.classList.add('active');
}

function debounce(fn, delay) {
  var timeoutId;
  return function () {
    var args = arguments;
    var context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
