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
      'Under 10 lbs',
      '10–25 lbs',
      '25–50 lbs',
      '50+ lbs',
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

function initQuiz() {
  QUESTIONS.forEach(function (question, index) {
    renderStep(question, index);
  });

  var track = qs('.progress-track');
  if (track) {
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(window.CONFIG.TOTAL_STEPS));
    track.setAttribute('aria-valuenow', '1');
    track.setAttribute('aria-label', 'Quiz progress');
    track.removeAttribute('aria-hidden');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuiz);
} else {
  initQuiz();
}
