var QUESTIONS = [
  {
    id: 'goal',
    question: "What's your main goal right now?",
    options: [
      'Lose weight',
      'Reduce cravings & appetite',
      'Boost energy',
      'Feel less bloated',
    ],
  },
  {
    id: 'struggle',
    question: 'Biggest struggle with weight loss so far?',
    options: [
      'Constant food cravings',
      'Slow metabolism',
      'Low energy to stay active',
      'Stress/emotional eating',
    ],
  },
  {
    id: 'glp1_history',
    question: 'Tried GLP-1 injections or prescription weight-loss drugs before?',
    options: [
      'Yes, currently on one',
      'Tried before, stopped',
      'Interested but avoiding needles',
      'Never tried',
    ],
  },
  {
    id: 'pills_pref',
    question: 'How do you feel about taking daily pills or supplements?',
    options: [
      'I forget to take them',
      'They upset my stomach',
      "I don't mind",
      "I'd rather avoid pills altogether",
    ],
  },
  {
    id: 'cravings_timing',
    question: 'When do cravings hit you hardest?',
    options: [
      'Late at night',
      'Mid-afternoon slump',
      'After stress',
      'All day, constantly',
    ],
  },
  {
    id: 'weight_target',
    question: 'How much weight are you looking to lose?',
    options: [
      'Under 5 kg',
      '5–15 kg',
      '15–25 kg',
      '25+ kg',
    ],
  },
  {
    id: 'timeline',
    question: 'How soon would you like to start seeing results?',
    options: [
      'ASAP',
      'Within a month',
      'In the next few months',
      'Just exploring for now',
    ],
  },
];

function renderStep(question, index) {
  var isFirst = index === 0;
  var stepEl;

  if (isFirst) {
    // Hydrate the existing static #step-1 to preserve the LCP element.
    stepEl = qs('#step-1');
  } else {
    stepEl = createEl('section', {
      class: 'step',
      id: 'step-' + (index + 1),
      'data-step': String(index + 1),
    });
    stepEl.appendChild(createEl('h1', { text: question.question }));
  }

  var optionList = createEl('ul', { class: 'option-list' });
  question.options.forEach(function (optionText) {
    var button = createEl('button', {
      type: 'button',
      class: 'option-card',
      'data-question-id': question.id,
      'data-value': optionText,
    }, [optionText]);
    optionList.appendChild(createEl('li', {}, [button]));
  });
  stepEl.appendChild(optionList);

  if (!isFirst) {
    qs('#step-viewport').appendChild(stepEl);
  }
  return stepEl;
}

function updateProgress(stepIndex) {
  var totalSteps = window.CONFIG.TOTAL_STEPS;
  var pct = ((stepIndex + 1) / totalSteps) * 100;
  var fill = qs('#progress-fill');
  if (fill) fill.style.width = pct + '%';
  var track = qs('.progress-track');
  if (track) track.setAttribute('aria-valuenow', String(stepIndex + 1));
}

function goToStep(index) {
  var target = qs('#step-' + (index + 1));
  if (!target) return;
  var current = qs('#step-viewport .step.active');
  transitionToStep(current, target);
  updateProgress(index);
}

function createConsentField() {
  var wrap = createEl('div', { class: 'lead-form-consent' });
  var input = createEl('input', {
    type: 'checkbox',
    id: 'lead-marketing-consent',
    name: 'marketing_consent',
  });
  var label = createEl('label', { for: 'lead-marketing-consent' });
  label.appendChild(
    document.createTextNode(
      'I agree to receive marketing emails and text messages from Ledisa. See our ',
    ),
  );
  label.appendChild(
    createEl('a', {
      href: 'https://ledisa.com/pages/privacy-policy',
      target: '_blank',
      rel: 'noopener noreferrer',
      text: 'Privacy Policy',
    }),
  );
  label.appendChild(document.createTextNode('.'));
  wrap.appendChild(input);
  wrap.appendChild(label);
  return wrap;
}

function createFormField(labelText, name, type, autocomplete, inputmode) {
  var wrap = createEl('div', { class: 'lead-form-field' });
  var label = createEl('label', { for: 'lead-' + name, text: labelText });
  var input = createEl('input', {
    type: type,
    id: 'lead-' + name,
    name: name,
    autocomplete: autocomplete || 'off',
    inputmode: inputmode || 'text',
    required: 'required',
  });
  var error = createEl('span', {
    class: 'error-message',
    id: 'lead-' + name + '-error',
    role: 'alert',
    'aria-live': 'polite',
  });
  wrap.appendChild(label);
  wrap.appendChild(input);
  wrap.appendChild(error);
  return wrap;
}

function renderLeadStep() {
  var stepEl = createEl('section', {
    class: 'step',
    id: 'step-8',
    'data-step': '8',
  });

  stepEl.appendChild(createEl('h1', {
    text: 'Almost there — where should we send your results?',
  }));

  var form = createEl('form', {
    class: 'lead-form',
    id: 'lead-form',
    novalidate: 'novalidate',
  });
  form.appendChild(createFormField('Full name', 'name', 'text', 'name'));
  form.appendChild(createFormField('Email', 'email', 'email', 'email', 'email'));
  form.appendChild(createFormField('Phone', 'phone', 'tel', 'tel', 'tel'));
  form.appendChild(createConsentField());
  form.appendChild(createEl('button', {
    type: 'submit',
    class: 'btn btn-primary',
    text: 'See my results',
  }));

  stepEl.appendChild(form);
  qs('#step-viewport').appendChild(stepEl);

  form.addEventListener('submit', handleLeadSubmit);
  return stepEl;
}

function setFieldError(name, message) {
  var input = qs('#lead-' + name);
  var errorEl = qs('#lead-' + name + '-error');
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (errorEl) errorEl.textContent = message || '';
}

function handleLeadSubmit(event) {
  event.preventDefault();
  var form = event.target;
  var name = form.elements['name'].value;
  var email = form.elements['email'].value;
  var phone = form.elements['phone'].value;

  var valid = true;
  if (!validateName(name)) {
    setFieldError('name', 'Please enter your full name.');
    valid = false;
  } else {
    setFieldError('name', '');
  }
  if (!validateEmail(email)) {
    setFieldError('email', 'Please enter a valid email address.');
    valid = false;
  } else {
    setFieldError('email', '');
  }
  if (!validatePhone(phone)) {
    setFieldError('phone', 'Please enter a valid phone number.');
    valid = false;
  } else {
    setFieldError('phone', '');
  }

  if (!valid) return;

  var marketingConsent = !!form.elements['marketing_consent'].checked;

  QuizState.setLead('name', name.trim());
  QuizState.setLead('email', email.trim());
  QuizState.setLead('phone', phone.trim());
  QuizState.setLead('marketing_consent', marketingConsent);

  if (marketingConsent) {
    var state = QuizState.get();
    subscribeLeadToKlaviyo(state.lead, state.answers);
  }

  window.location.href = window.CONFIG.REDIRECT_URL;
}

function handleOptionClick(event) {
  var button = event.target.closest('.option-card');
  if (!button) return;
  var questionId = button.getAttribute('data-question-id');
  var value = button.getAttribute('data-value');
  QuizState.setAnswer(questionId, value);

  var currentStep = button.closest('.step');
  var currentIndex = parseInt(currentStep.getAttribute('data-step'), 10) - 1;
  goToStep(currentIndex + 1);
}

function initQuiz() {
  QUESTIONS.forEach(function (question, index) {
    renderStep(question, index);
  });
  renderLeadStep();

  var track = qs('.progress-track');
  if (track) {
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(window.CONFIG.TOTAL_STEPS));
    track.setAttribute('aria-valuenow', '1');
    track.setAttribute('aria-label', 'Quiz progress');
    track.removeAttribute('aria-hidden');
  }

  updateProgress(0);

  var viewport = qs('#step-viewport');
  if (viewport) {
    viewport.addEventListener('click', handleOptionClick);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuiz);
} else {
  initQuiz();
}
