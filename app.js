/**
 * failforward.dev · Application Logic
 * Client interactions: Theme toggle, Paramenu scroll-spy, AI Hazard Label Engine, Incident filters, API Governance filter, and Contact intake handler.
 */

// Master Label Dictionary
const LABELS_DICT = {
  'hallucination': {
    id: 'hallucination',
    name: 'Confabulation Hazard',
    shape: 'shape-diamond',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="currentColor"><path d="M10.25 3.5h3.5l-.75 9.5h-2l-.75-9.5zm.25 13a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"/></svg>',
    code: 'AI-H201',
    statement: 'May generate fluent, confident falsehoods indistinguishable from fact.',
    precaution: 'Verify all factual claims against primary sources before action.',
    source: 'Source Reference: GHS07, industrial exclamation mark'
  },
  'sycophancy': {
    id: 'sycophancy',
    name: 'Agreement Bias',
    shape: 'shape-triangle',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>',
    code: 'AI-W110',
    statement: 'Output skews toward user-stated positions; may reinforce error.',
    precaution: 'Request counterarguments explicitly. Monitor for drift under pressure.',
    source: 'Source Reference: ISO 7010 W001, general warning feedback loop'
  },
  'emotional-substitution': {
    id: 'emotional-substitution',
    name: 'Attachment / Substitution Hazard',
    shape: 'shape-diamond',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 13.572L12 21l-7.5-7.428A5 5 0 1 1 12 7.006a5 5 0 1 1 7.5 6.572"/><path d="M12 7v4l-2 2 4 2-2 3"/></svg>',
    code: 'AI-H310',
    statement: 'Prolonged use may substitute for human relationships and support systems.',
    precaution: 'Not a replacement for professional care. Time-boxed sessions advised.',
    source: 'Source Reference: GHS08, health hazard starburst fracture'
  },
  'engagement-loop': {
    id: 'engagement-loop',
    name: 'Engagement Optimization',
    shape: 'shape-triangle',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/></svg>',
    code: 'AI-W205',
    statement: 'System optimizes for retention, not user benefit. Compulsion loop risk.',
    precaution: 'Usage limits recommended. Audit recommendation feed quarterly.',
    source: 'Source Reference: Chilean stop-octagon, infinite engagement loop'
  },
  'human-oversight': {
    id: 'human-oversight',
    name: 'Human Oversight Required',
    shape: 'shape-circle',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    code: 'AI-M401',
    statement: 'System must not execute irreversible actions without human sign-off.',
    precaution: 'Maintain kill-switch access. Log all autonomous decisions.',
    source: 'Source Reference: ISO 7010 M-series, mandatory supervision eye'
  },
  'data-provenance': {
    id: 'data-provenance',
    name: 'Undisclosed Training Data',
    shape: 'shape-triangle',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/></svg>',
    code: 'AI-W502',
    statement: 'Training corpus not disclosed. Copyright and PII contamination unknown.',
    precaution: 'Do not use output in regulated filings without provenance review.',
    source: 'Source Reference: GHS transport placard, black-box sealed data cube'
  },
  'audited-safe': {
    id: 'audited-safe',
    name: 'Independently Audited',
    shape: 'shape-square',
    svg: '<svg viewBox="0 0 24 24" class="picto-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    code: 'AI-C900',
    statement: 'Behavior audited by an independent third party within the last 12 months.',
    precaution: 'Audit scope on file. Re-certification due annually.',
    source: 'Source Reference: CE / UL compliance mark, verified shield seal'
  }
};

// Preset Data Configurations
const PRESETS = {
  'frontier-chat': {
    labels: ['hallucination', 'sycophancy', 'emotional-substitution', 'human-oversight'],
    model: 'Frontier LLM (>10^25 FLOP)',
    trainingData: { text: 'Partial', class: 'v-partial' },
    evalCoverage: '74%',
    humanOversight: 'Available',
    explainability: 'Low',
    biasAudit: { text: 'Conditional', class: 'v-partial' },
    trafficLight: 'amber',
    lightCaption: 'Risk Profile: Moderate / Amber',
    transportClass: 3,
    isClass4: false,
    certs: ['AI-CERT']
  },
  'social-feed': {
    labels: ['engagement-loop', 'data-provenance', 'emotional-substitution'],
    model: 'Recommender Ensemble',
    trainingData: { text: 'None', class: 'v-none' },
    evalCoverage: '31%',
    humanOversight: 'None',
    explainability: 'Low',
    biasAudit: { text: 'Not Performed', class: 'v-none' },
    trafficLight: 'red',
    lightCaption: 'Risk Profile: High / Red Hazard',
    transportClass: 4,
    isClass4: true,
    certs: []
  },
  'triage-copilot': {
    labels: ['hallucination', 'human-oversight', 'audited-safe'],
    model: 'Fine-tuned Domain Model',
    trainingData: { text: 'Full', class: 'v-full' },
    evalCoverage: '92%',
    humanOversight: 'Required',
    explainability: 'Medium',
    biasAudit: { text: 'Passed', class: 'v-full' },
    trafficLight: 'green',
    lightCaption: 'Risk Profile: Low / Green Certified',
    transportClass: 2,
    isClass4: false,
    certs: ['AI-CERT', 'ETHI-COMP', 'PRI-CERT']
  }
};

// Theme Management
function initTheme() {
  const saved = localStorage.getItem('ff_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ff_theme', next);
    });
  }
}

// Paramenu Navigation & Scroll Spy
function initNavScroll() {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section.section');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  }, { passive: true });
}

// AI Warning Labels Showcase Engine
function initLabelsEngine() {
  const pictoContainer = document.getElementById('picto-container');
  const certsContainer = document.getElementById('certs-container');
  const tabs = document.querySelectorAll('.product-tabs .tab');

  const detailName = document.getElementById('detail-name');
  const detailCode = document.getElementById('detail-code');
  const detailStatement = document.getElementById('detail-statement');
  const detailPrecaution = document.getElementById('detail-precaution');
  const detailSource = document.getElementById('detail-source');

  const factModel = document.getElementById('fact-model');
  const factData = document.getElementById('fact-data');
  const factEval = document.getElementById('fact-eval');
  const factOversight = document.getElementById('fact-oversight');
  const factExplain = document.getElementById('fact-explain');
  const factAudit = document.getElementById('fact-audit');

  const lightRed = document.getElementById('light-red');
  const lightAmber = document.getElementById('light-amber');
  const lightGreen = document.getElementById('light-green');
  const lightCaption = document.getElementById('light-caption');

  const placard = document.getElementById('transport-placard');
  const placardClass = document.getElementById('placard-class');

  function renderDetail(labelKey) {
    const item = LABELS_DICT[labelKey];
    if (!item) return;

    detailName.textContent = item.name;
    detailCode.textContent = item.code;
    detailStatement.textContent = item.statement;
    detailPrecaution.innerHTML = `<span>PRECAUTION:</span> ${item.precaution}`;
    detailSource.textContent = item.source;

    document.querySelectorAll('.picto').forEach(p => {
      p.classList.toggle('selected', p.dataset.labelKey === labelKey);
    });
  }

  function loadPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    // Render Pictograms
    pictoContainer.innerHTML = '';
    preset.labels.forEach((lblKey, idx) => {
      const def = LABELS_DICT[lblKey];
      if (!def) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `picto ${def.shape}`;
      btn.dataset.labelKey = lblKey;
      btn.setAttribute('aria-label', def.name);
      btn.innerHTML = `<span class="picto-icon">${def.svg || def.icon}</span>`;

      if (idx === 0) {
        btn.classList.add('selected');
        renderDetail(lblKey);
      }

      btn.addEventListener('click', () => renderDetail(lblKey));
      pictoContainer.appendChild(btn);
    });

    // Update Facts
    factModel.textContent = preset.model;
    factData.textContent = preset.trainingData.text;
    factData.className = preset.trainingData.class;
    factEval.textContent = preset.evalCoverage;
    factOversight.textContent = preset.humanOversight;
    factExplain.textContent = preset.explainability;
    factAudit.textContent = preset.biasAudit.text;
    factAudit.className = preset.biasAudit.class;

    // Traffic Light
    lightRed.classList.toggle('on', preset.trafficLight === 'red');
    lightAmber.classList.toggle('on', preset.trafficLight === 'amber');
    lightGreen.classList.toggle('on', preset.trafficLight === 'green');
    lightCaption.textContent = preset.lightCaption;

    // Placard
    placardClass.textContent = preset.transportClass;
    placard.classList.toggle('class-4', preset.isClass4);

    // Certs
    certsContainer.innerHTML = '';
    if (preset.certs.length === 0) {
      const span = document.createElement('span');
      span.className = 'cert none';
      span.textContent = 'NO INDEPENDENT AUDIT ON FILE';
      certsContainer.appendChild(span);
    } else {
      preset.certs.forEach(cert => {
        const span = document.createElement('span');
        span.className = 'cert';
        span.textContent = `✓ ${cert} CERTIFIED`;
        certsContainer.appendChild(span);
      });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      loadPreset(tab.dataset.preset);
    });
  });

  // Initial Load
  loadPreset('frontier-chat');
}

// API Governance & Shadow AI Interactive Dashboard
const BU_METRICS = {
  all: {
    title: 'Enterprise Aggregate Dashboard',
    owner: 'Executive Overview · All 4 Business Units',
    total: '1,420',
    rogue: '31',
    authors: '18 Active',
    comp: '94.2%'
  },
  engineering: {
    title: 'Engineering & Platform Unit',
    owner: 'BU Owner: Elena Kowalski · Director of Platform',
    total: '840',
    rogue: '12',
    authors: '7 Active',
    comp: '92.4%'
  },
  datascience: {
    title: 'Data Science & AI Labs',
    owner: 'BU Owner: Dr. Aris Vance · Head of AI Research',
    total: '215',
    rogue: '14',
    authors: '6 Active',
    comp: '86.5%'
  },
  product: {
    title: 'Product & Growth Unit',
    owner: 'BU Owner: Marcus Zhang · VP of Product',
    total: '195',
    rogue: '3',
    authors: '3 Active',
    comp: '97.1%'
  },
  infrastructure: {
    title: 'IT Infrastructure & Corporate Ops',
    owner: 'BU Owner: Jason Sterling · Director of Enterprise Infra',
    total: '170',
    rogue: '2',
    authors: '2 Active',
    comp: '98.5%'
  }
};

const GOV_APIS = [
  {
    id: 'api-1',
    endpoint: 'api.openai.com/v1/chat/completions',
    method: 'POST',
    classification: 'Shadow AI',
    badgeClass: 'sev2',
    bu: 'engineering',
    buName: 'Engineering & Platform',
    owner: 'm.kovalsky@corp',
    role: 'Software Eng II',
    manager: 'D. Hoffman (Eng Manager)',
    buOwner: 'E. Kowalski (Director of Platform)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '10.24.12.8 [k8s-dev-pool-02]',
    repo: 'internal-fleet/telemetry : feat/openai-pilot',
    bandwidth: '4.2 MB / hr',
    trigger: 'Matched DLP Rule 802 (API Secret Key Pattern)',
    stage: 2,
    stageText: 'Level 2: BU Owner Review (48h SLA)',
    stageBadgeClass: 'sev2',
    stepper: [
      { title: 'Direct Manager Alert', time: 'T+0h [DISPATCHED]', detail: 'Alert sent to D. Hoffman. Awaiting OpenAPI schema.', state: 'done' },
      { title: 'Business Unit Owner', time: 'T+24h [IN REVIEW]', detail: 'Escalated to E. Kowalski. Reviewing zero-retention contract.', state: 'current' },
      { title: 'Vice President Gate', time: 'T+48h [STANDBY]', detail: 'Required if raw PII or proprietary code egresses.', state: 'pending' },
      { title: 'SecOps Automated Quarantine', time: 'T+72h SLA', detail: 'Zero-touch BGP route revocation ready on trigger.', state: 'pending' }
    ]
  },
  {
    id: 'api-2',
    endpoint: 'generativelanguage.googleapis.com/v1beta',
    method: 'POST',
    classification: 'Approved Corporate',
    badgeClass: 'lesson',
    bu: 'datascience',
    buName: 'Data Science & AI Labs',
    owner: 'a.nowak@corp',
    role: 'Staff ML Researcher',
    manager: 'Dr. A. Vance (Head of AI)',
    buOwner: 'Dr. A. Vance (Head of AI)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '10.50.8.14 [lab-gpu-cluster-01]',
    repo: 'ml-research/doc-synth : main',
    bandwidth: '18.4 MB / hr',
    trigger: 'Clean Context Evaluation · Zero Data Retention Active',
    stage: 0,
    stageText: 'Sanctioned & Attested',
    stageBadgeClass: 'lesson',
    stepper: [
      { title: 'Direct Manager Alert', time: 'ATTESTED', detail: 'Approved under enterprise AI budget.', state: 'done' },
      { title: 'Business Unit Owner', time: 'SIGNED', detail: 'Corporate contract with Zero Retention active.', state: 'done' },
      { title: 'Vice President Gate', time: 'APPROVED', detail: 'Enterprise risk assessment completed.', state: 'done' },
      { title: 'SecOps Automated Quarantine', time: 'BYPASS', detail: 'Sanctioned gateway proxy bound.', state: 'done' }
    ]
  },
  {
    id: 'api-3',
    endpoint: 'api.anthropic.com/v1/messages',
    method: 'POST',
    classification: 'Approved Engineering',
    badgeClass: 'lesson',
    bu: 'engineering',
    buName: 'Engineering & Platform',
    owner: 'p.zielinski@corp',
    role: 'Senior Backend Engineer',
    manager: 'D. Hoffman (Eng Manager)',
    buOwner: 'E. Kowalski (Director of Platform)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '10.24.16.42 [ci-runner-eu-central]',
    repo: 'core-platform/code-review-bot : main',
    bandwidth: '12.1 MB / hr',
    trigger: 'Engineering Workspace Key · Zero Retention Bound',
    stage: 0,
    stageText: 'Sanctioned & Attested',
    stageBadgeClass: 'lesson',
    stepper: [
      { title: 'Direct Manager Alert', time: 'ATTESTED', detail: 'Verified CI bot integration.', state: 'done' },
      { title: 'Business Unit Owner', time: 'SIGNED', detail: 'Engineering workspace key attested.', state: 'done' },
      { title: 'Vice President Gate', time: 'APPROVED', detail: 'Enterprise risk approved.', state: 'done' },
      { title: 'SecOps Automated Quarantine', time: 'BYPASS', detail: 'Continuous schema monitoring active.', state: 'done' }
    ]
  },
  {
    id: 'api-4',
    endpoint: 'unverified-proxy.internal.corp/llm',
    method: 'GET',
    classification: 'Unsanctioned Relay',
    badgeClass: 'sev1',
    bu: 'product',
    buName: 'Product & Growth',
    owner: 't.chen@corp',
    role: 'Growth PM',
    manager: 'R. Patel (Group PM)',
    buOwner: 'M. Zhang (VP of Product)',
    vp: 'M. Zhang (VP of Product)',
    host: '10.88.4.19 [MacBook-M3-Pro]',
    repo: 'untracked / local reverse proxy wrapper',
    bandwidth: '820 KB / hr',
    trigger: 'Zero OAuth Token · Unauthenticated Proxy Relay',
    stage: 4,
    stageText: 'Level 4: SecOps Quarantine Active',
    stageBadgeClass: 'sev1',
    stepper: [
      { title: 'Direct Manager Alert', time: 'EXPIRED', detail: 'No response from R. Patel within 24h window.', state: 'done' },
      { title: 'Business Unit Owner', time: 'ESCALATED', detail: 'M. Zhang rejected unvetted proxy relay.', state: 'done' },
      { title: 'Vice President Gate', time: 'REJECTED', detail: 'Risk exception denied.', state: 'done' },
      { title: 'SecOps Automated Quarantine', time: 'ENFORCED', detail: 'Host isolated and proxy port blocked via SOAR.', state: 'quarantined' }
    ]
  },
  {
    id: 'api-5',
    endpoint: 'api-stage-internal.legacy.net/v2',
    method: 'POST',
    classification: 'Zombie Endpoint',
    badgeClass: 'sev1',
    bu: 'infrastructure',
    buName: 'IT Infrastructure & Ops',
    owner: 'legacy-service-acct',
    role: 'Orphaned Route',
    manager: 'K. Larson (Infra Manager)',
    buOwner: 'J. Sterling (Director of Infra)',
    vp: 'C. Henderson (VP of Operations)',
    host: '172.16.80.25 [legacy-edge-lb-01]',
    repo: 'terraform-estate/routes (unpruned state)',
    bandwidth: '1.4 MB / hr',
    trigger: 'Exposing Session Tokens · DNS route not pruned',
    stage: 4,
    stageText: 'Level 4: Revoked by SecOps',
    stageBadgeClass: 'sev1',
    stepper: [
      { title: 'Direct Manager Alert', time: 'ORPHAN', detail: 'No active manager owner identified.', state: 'done' },
      { title: 'Business Unit Owner', time: 'ESCALATED', detail: 'Flagged during post-M&A infrastructure audit.', state: 'done' },
      { title: 'Vice President Gate', time: 'REVIEWED', detail: 'Decommissioning signed off.', state: 'done' },
      { title: 'SecOps Automated Quarantine', time: 'REVOKED', detail: 'DNS and routing table pruned by automated pipeline.', state: 'quarantined' }
    ]
  },
  {
    id: 'api-6',
    endpoint: 'local-ollama-cluster.lab.internal:11434',
    method: 'POST',
    classification: 'Unregistered LLM',
    badgeClass: 'sev3',
    bu: 'datascience',
    buName: 'Data Science & AI Labs',
    owner: 'k.wojcik@corp',
    role: 'Data Scientist',
    manager: 'Dr. A. Vance (Head of AI)',
    buOwner: 'Dr. A. Vance (Head of AI)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '192.168.10.45 [GPU Node lab-04]',
    repo: 'datascience/local-eval : branch-deepseek',
    bandwidth: '95.0 MB / hr',
    trigger: 'Unmanaged GPU Node · No Corporate Attestation',
    stage: 1,
    stageText: 'Level 1: Manager Notified (24h SLA)',
    stageBadgeClass: 'sev3',
    stepper: [
      { title: 'Direct Manager Alert', time: 'T+4h [PENDING]', detail: 'Notification sent to Dr. A. Vance to register GPU node.', state: 'current' },
      { title: 'Business Unit Owner', time: 'T+24h [STANDBY]', detail: 'Will review GPU lab compliance if un-attested.', state: 'pending' },
      { title: 'Vice President Gate', time: 'T+48h [STANDBY]', detail: 'Not required for air-gapped lab nodes.', state: 'pending' },
      { title: 'SecOps Automated Quarantine', time: 'T+72h SLA', detail: 'Will isolate if un-attested after SLA.', state: 'pending' }
    ]
  },
  {
    id: 'api-7',
    endpoint: 'api.mistral.ai/v1/chat/completions',
    method: 'POST',
    classification: 'Shadow AI',
    badgeClass: 'sev2',
    bu: 'product',
    buName: 'Product & Growth',
    owner: 's.mendoza@corp',
    role: 'Lead Product Designer',
    manager: 'R. Patel (Group PM)',
    buOwner: 'M. Zhang (VP of Product)',
    vp: 'M. Zhang (VP of Product)',
    host: '10.88.12.30 [MacBook-M2-Max]',
    repo: 'growth/onboarding-wizard : feat/ai-assist',
    bandwidth: '6.8 MB / hr',
    trigger: 'Matched DLP Rule 640 (Proprietary Roadmap Schema in Payload)',
    stage: 1,
    stageText: 'Level 1: Manager Notified (24h SLA)',
    stageBadgeClass: 'sev3',
    stepper: [
      { title: 'Direct Manager Alert', time: 'T+2h [DISPATCHED]', detail: 'Automated notification sent to R. Patel with schema diff.', state: 'current' },
      { title: 'Business Unit Owner', time: 'T+24h [STANDBY]', detail: 'Escalation queued if manager fails to attest.', state: 'pending' },
      { title: 'Vice President Gate', time: 'T+48h [STANDBY]', detail: 'Requires VP exception for unapproved EU LLM provider.', state: 'pending' },
      { title: 'SecOps Automated Quarantine', time: 'T+72h SLA', detail: 'Automated DNS blackhole on SLA timeout.', state: 'pending' }
    ]
  },
  {
    id: 'api-8',
    endpoint: 'api.replicate.com/v1/predictions',
    method: 'POST',
    classification: 'Unregistered Vendor',
    badgeClass: 'sev2',
    bu: 'datascience',
    buName: 'Data Science & AI Labs',
    owner: 'l.dubois@corp',
    role: 'Research Scientist',
    manager: 'Dr. A. Vance (Head of AI)',
    buOwner: 'Dr. A. Vance (Head of AI)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '10.50.14.88 [lab-cluster-worker-03]',
    repo: 'ai-experiments/flux-image-eval : exp-run-09',
    bandwidth: '44.2 MB / hr',
    trigger: 'Unvetted External Vendor · High Egress Image Buffers',
    stage: 3,
    stageText: 'Level 3: VP Gate Review (72h SLA)',
    stageBadgeClass: 'sev2',
    stepper: [
      { title: 'Direct Manager Alert', time: 'PASSED', detail: 'Dr. Vance endorsed experimental utility.', state: 'done' },
      { title: 'Business Unit Owner', time: 'PASSED', detail: 'Budget approved under research grant pool.', state: 'done' },
      { title: 'Vice President Gate', time: 'T+36h [IN REVIEW]', detail: 'Awaiting VP Alvarez sign-off on data retention terms.', state: 'current' },
      { title: 'SecOps Automated Quarantine', time: 'T+72h SLA', detail: 'Enforces proxy block if VP denies risk exception.', state: 'pending' }
    ]
  },
  {
    id: 'api-9',
    endpoint: 'internal-billing.corp/v3/subscriptions/sync',
    method: 'PUT',
    classification: 'Schema Drift',
    badgeClass: 'sev2',
    bu: 'engineering',
    buName: 'Engineering & Platform',
    owner: 'j.nowicki@corp',
    role: 'Staff Billing Engineer',
    manager: 'D. Hoffman (Eng Manager)',
    buOwner: 'E. Kowalski (Director of Platform)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '10.24.40.11 [billing-svc-node-01]',
    repo: 'fintech/billing-engine : release/2026.08',
    bandwidth: '2.1 MB / hr',
    trigger: 'Breaking Schema Drift: Undocumented credit_card_bin field',
    stage: 2,
    stageText: 'Level 2: BU Owner Review (48h SLA)',
    stageBadgeClass: 'sev2',
    stepper: [
      { title: 'Direct Manager Alert', time: 'PASSED', detail: 'D. Hoffman verified breaking change in PR #442.', state: 'done' },
      { title: 'Business Unit Owner', time: 'T+18h [IN REVIEW]', detail: 'E. Kowalski reviewing PCI DSS scope impact with SecOps.', state: 'current' },
      { title: 'Vice President Gate', time: 'T+48h [STANDBY]', detail: 'Executive compliance sign-off if PCI scope expands.', state: 'pending' },
      { title: 'SecOps Automated Quarantine', time: 'T+72h SLA', detail: 'Rollback trigger staged if compliance fails.', state: 'pending' }
    ]
  },
  {
    id: 'api-10',
    endpoint: 'api.deepseek.com/v1/chat/completions',
    method: 'POST',
    classification: 'Policy Violation',
    badgeClass: 'sev1',
    bu: 'engineering',
    buName: 'Engineering & Platform',
    owner: 'v.petrov@corp',
    role: 'Senior DevOps Engineer',
    manager: 'D. Hoffman (Eng Manager)',
    buOwner: 'E. Kowalski (Director of Platform)',
    vp: 'S. Alvarez (VP of Engineering)',
    host: '10.24.8.19 [dev-bastion-eu-01]',
    repo: 'infra/k8s-manifests : hotfix/cluster-debug',
    bandwidth: '1.8 MB / hr',
    trigger: 'Matched DLP Rule 910: Private SSH Key in Payload Buffer',
    stage: 4,
    stageText: 'Level 4: SecOps Quarantine Active',
    stageBadgeClass: 'sev1',
    stepper: [
      { title: 'Direct Manager Alert', time: 'CRITICAL', detail: 'Instant DLP alert triggered with key hash fingerprint.', state: 'done' },
      { title: 'Business Unit Owner', time: 'ESCALATED', detail: 'Immediate emergency alert dispatched to SecOps on-call.', state: 'done' },
      { title: 'Vice President Gate', time: 'BYPASS', detail: 'Automated critical incident protocol active.', state: 'done' },
      { title: 'SecOps Automated Quarantine', time: 'ENFORCED', detail: 'Host isolated via SOAR, token revoked, credentials rotated.', state: 'quarantined' }
    ]
  },
  {
    id: 'api-11',
    endpoint: 'monitoring-relay.aws-west.internal:9090/metrics',
    method: 'GET',
    classification: 'Unsanctioned Relay',
    badgeClass: 'sev2',
    bu: 'infrastructure',
    buName: 'IT Infrastructure & Ops',
    owner: 'r.garcia@corp',
    role: 'Senior SRE',
    manager: 'K. Larson (Infra Manager)',
    buOwner: 'J. Sterling (Director of Infra)',
    vp: 'C. Henderson (VP of Operations)',
    host: '172.20.14.102 [cloud-gateway-edge]',
    repo: 'observability/edge-collectors : telemetry-v4',
    bandwidth: '15.3 MB / hr',
    trigger: 'Public Cloud Relay Bypassing Corporate mTLS Ingress',
    stage: 1,
    stageText: 'Level 1: Manager Notified (24h SLA)',
    stageBadgeClass: 'sev3',
    stepper: [
      { title: 'Direct Manager Alert', time: 'T+5h [PENDING]', detail: 'K. Larson reviewing mTLS certificate bypass configuration.', state: 'current' },
      { title: 'Business Unit Owner', time: 'T+24h [STANDBY]', detail: 'Director review for cloud egress architecture.', state: 'pending' },
      { title: 'Vice President Gate', time: 'T+48h [STANDBY]', detail: 'Not required if mTLS is reinstated.', state: 'pending' },
      { title: 'SecOps Automated Quarantine', time: 'T+72h SLA', detail: 'Firewall drop rule scheduled on SLA expiry.', state: 'pending' }
    ]
  }
];

let activeBU = 'all';
let selectedApiId = null;

function initGovernanceDashboard() {
  const buTabs = document.querySelectorAll('.gov-bu-tab');
  const searchInput = document.getElementById('gov-search');
  const tbody = document.getElementById('gov-tbody');
  const drawer = document.getElementById('gov-drawer');
  const drawerClose = document.getElementById('drawer-close-btn');

  if (!tbody) return;

  function renderTable() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    tbody.innerHTML = '';

    const filtered = GOV_APIS.filter(api => {
      const matchBU = activeBU === 'all' || api.bu === activeBU;
      const matchSearch = !query || 
        api.endpoint.toLowerCase().includes(query) ||
        api.owner.toLowerCase().includes(query) ||
        api.host.toLowerCase().includes(query) ||
        api.classification.toLowerCase().includes(query) ||
        api.buName.toLowerCase().includes(query);
      return matchBU && matchSearch;
    });

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-dim);">No endpoints match the active filter criteria.</td>`;
      tbody.appendChild(tr);
      return;
    }

    filtered.forEach(api => {
      const tr = document.createElement('tr');
      if (api.id === selectedApiId) tr.classList.add('selected');

      tr.innerHTML = `
        <td class="api-endpoint-cell">
          <span class="api-method-badge">${api.method}</span>
          <code>${api.endpoint}</code>
        </td>
        <td><span class="badge ${api.badgeClass}">${api.classification}</span></td>
        <td>
          <div class="api-owner-cell">
            <span class="owner-alias">${api.owner}</span>
            <span class="owner-host">${api.buName} · ${api.host}</span>
          </div>
        </td>
        <td><span style="font-size:0.75rem; color: var(--text-dim);">${api.trigger}</span></td>
        <td><span class="badge ${api.stageBadgeClass}">${api.stageText}</span></td>
        <td>
          <button class="btn-table-inspect" data-api-id="${api.id}">Inspect</button>
        </td>
      `;

      tr.addEventListener('click', () => {
        openApiDrawer(api.id);
      });

      tbody.appendChild(tr);
    });
  }

  function updateBUBanner(buKey) {
    const metrics = BU_METRICS[buKey] || BU_METRICS.all;
    const titleEl = document.getElementById('bu-banner-title');
    const ownerEl = document.getElementById('bu-banner-owner');
    const totalEl = document.getElementById('bu-stat-total');
    const rogueEl = document.getElementById('bu-stat-rogue');
    const authorsEl = document.getElementById('bu-stat-authors');
    const compEl = document.getElementById('bu-stat-comp');

    if (titleEl) titleEl.textContent = metrics.title;
    if (ownerEl) ownerEl.textContent = metrics.owner;
    if (totalEl) totalEl.textContent = metrics.total;
    if (rogueEl) rogueEl.textContent = metrics.rogue;
    if (authorsEl) authorsEl.textContent = metrics.authors;
    if (compEl) compEl.textContent = metrics.comp;
  }

  function openApiDrawer(apiId) {
    const api = GOV_APIS.find(a => a.id === apiId);
    if (!api || !drawer) return;

    selectedApiId = apiId;

    // Update highlights in table
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(r => r.classList.remove('selected'));

    const endpointTitle = document.getElementById('drawer-endpoint-title');
    const endpointMeta = document.getElementById('drawer-endpoint-meta');
    const dOwner = document.getElementById('d-owner');
    const dManager = document.getElementById('d-manager');
    const dBuOwner = document.getElementById('d-bu-owner');
    const dHost = document.getElementById('d-host');
    const dRepo = document.getElementById('d-repo');
    const dBandwidth = document.getElementById('d-bandwidth');
    const stepperContainer = document.getElementById('drawer-stepper');

    if (endpointTitle) endpointTitle.textContent = `${api.method} ${api.endpoint}`;
    if (endpointMeta) endpointMeta.textContent = `Discovered via eBPF Socket Tap · Host: ${api.host} · Bandwidth: ${api.bandwidth}`;
    if (dOwner) dOwner.textContent = `${api.owner} (${api.role})`;
    if (dManager) dManager.textContent = api.manager;
    if (dBuOwner) dBuOwner.textContent = api.buOwner;
    if (dHost) dHost.textContent = api.host;
    if (dRepo) dRepo.textContent = api.repo;
    if (dBandwidth) dBandwidth.textContent = api.bandwidth;

    // Render Stepper
    if (stepperContainer && api.stepper) {
      stepperContainer.innerHTML = '';
      api.stepper.forEach((step, idx) => {
        const stepEl = document.createElement('div');
        stepEl.className = `step-item ${step.state}`;
        stepEl.innerHTML = `
          <div class="step-dot">${idx + 1}</div>
          <div class="step-content">
            <div class="step-title">${step.title} <span class="step-time">${step.time}</span></div>
            <div class="step-detail">${step.detail}</div>
          </div>
        `;
        stepperContainer.appendChild(stepEl);
      });
    }

    drawer.style.display = 'block';
    renderTable();
  }

  function closeApiDrawer() {
    if (drawer) drawer.style.display = 'none';
    selectedApiId = null;
    renderTable();
  }

  // Event Listeners for BU tabs
  buTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      buTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      activeBU = tab.dataset.bu;
      updateBUBanner(activeBU);
      renderTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', renderTable);
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeApiDrawer);
  }

  // Simulation buttons in drawer
  const btnAttest = document.getElementById('btn-simulate-attest');
  const btnQuarantine = document.getElementById('btn-simulate-quarantine');

  if (btnAttest) {
    btnAttest.addEventListener('click', () => {
      const api = GOV_APIS.find(a => a.id === selectedApiId);
      if (!api) return;
      api.classification = 'Approved Engineering';
      api.badgeClass = 'lesson';
      api.stage = 0;
      api.stageText = 'Sanctioned & Attested';
      api.stageBadgeClass = 'lesson';
      api.stepper = [
        { title: 'Direct Manager Alert', time: 'ATTESTED', detail: 'Manager verified business requirement and bound OpenAPI contract.', state: 'done' },
        { title: 'Business Unit Owner', time: 'NOTIFIED', detail: 'Attestation logged in corporate compliance ledger.', state: 'done' },
        { title: 'Vice President Gate', time: 'CLEARED', detail: 'Within pre-approved department budget.', state: 'done' },
        { title: 'SecOps Automated Quarantine', time: 'BYPASS', detail: 'Active telemetry monitoring verified.', state: 'done' }
      ];
      openApiDrawer(api.id);
    });
  }

  if (btnQuarantine) {
    btnQuarantine.addEventListener('click', () => {
      const api = GOV_APIS.find(a => a.id === selectedApiId);
      if (!api) return;
      api.classification = 'Quarantined Rogue';
      api.badgeClass = 'sev1';
      api.stage = 4;
      api.stageText = 'Level 4: SecOps Quarantined';
      api.stageBadgeClass = 'sev1';
      api.stepper = [
        { title: 'Direct Manager Alert', time: 'TIMEOUT', detail: 'SLA timer expired with unverified endpoint.', state: 'done' },
        { title: 'Business Unit Owner', time: 'ESCALATED', detail: 'No corporate contract found.', state: 'done' },
        { title: 'Vice President Gate', time: 'DENIED', detail: 'Exception rejected.', state: 'done' },
        { title: 'SecOps Automated Quarantine', time: 'ENFORCED', detail: 'Zero-touch BGP route revoked and host isolated.', state: 'quarantined' }
      ];
      openApiDrawer(api.id);
    });
  }

  // Initial load
  updateBUBanner('all');
  renderTable();
}

// Incident Gallery Filter
function initIncidentFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.incident-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          const tags = (card.dataset.tags || '').trim().split(/\s+/);
          card.style.display = tags.includes(filter) ? '' : 'none';
        }
      });
    });
  });
}

// Live Simulated Telemetry Stream
function initTelemetryStream() {
  const streamEl = document.getElementById('telemetry-stream');
  if (!streamEl) return;

  const mockEvents = [
    { type: 'block', badge: '[BLOCKED]', msg: 'POST api.openai.com/v1/embeddings : Exceeds unapproved token payload quota (85kb)' },
    { type: 'allow', badge: '[ALLOWED]', msg: 'POST api.anthropic.com/v1/messages : Engineering workspace bound · Valid OAuth 2.0 cert' },
    { type: 'warn', badge: '[DRIFT]', msg: 'POST internal-model.gateway.corp/v1 : Parameter \'temperature_override\' unlisted in contract' },
    { type: 'block', badge: '[QUARANTINE]', msg: 'POST 192.168.4.120:8000/v1/chat : Unregistered vLLM instance responding on developer VLAN' },
    { type: 'allow', badge: '[ALLOWED]', msg: 'POST generativelanguage.googleapis.com/v1beta : Corporate Contract Verified · Zero Retention Active' }
  ];

  let idx = 0;
  setInterval(() => {
    const event = mockEvents[idx % mockEvents.length];
    idx++;

    const now = new Date();
    const ts = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}]`;

    const row = document.createElement('div');
    row.className = 'log-entry';
    row.innerHTML = `<span class="log-time">${ts}</span> <span class="log-badge ${event.type}">${event.badge}</span> <span class="log-msg">${event.msg}</span>`;

    streamEl.prepend(row);
    if (streamEl.children.length > 8) {
      streamEl.removeChild(streamEl.lastChild);
    }
  }, 4500);
}

// Contact Form Submission Handler
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  if (!form || !statusEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check Honeypot Trap
    const hp = document.getElementById('form-hp');
    if (hp && hp.value.trim() !== '') {
      statusEl.textContent = 'Message sent successfully.';
      statusEl.className = 'intake-status ok';
      form.reset();
      return;
    }

    const payload = {
      _subject: 'New failforward.dev Inquiry: ' + (form.elements['name'].value.trim() || 'Visitor'),
      _captcha: 'false',
      _template: 'table',
      name: form.elements['name'].value.trim(),
      email: form.elements['email'].value.trim(),
      company: form.elements['company'].value.trim() || 'Not specified',
      engagement_type: form.elements['engagement_type'].value,
      timeline: form.elements['timeline'].value,
      budget: form.elements['budget'].value,
      message: form.elements['message'].value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting...';
    statusEl.textContent = '';
    statusEl.className = 'intake-status';

    try {
      const res = await fetch('https://formsubmit.co/ajax/chad@failforward.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      const isSuccess = res.ok && (data.success === true || data.success === 'true');

      if (isSuccess) {
        statusEl.textContent = 'Inquiry transmitted securely. Expect a direct response shortly.';
        statusEl.className = 'intake-status ok';
        form.reset();
      } else {
        const errorMsg = data.message || 'Submission could not be processed automatically.';
        statusEl.innerHTML = `${errorMsg} <a href="mailto:chad@failforward.dev?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent('Name: ' + payload.name + '\nEmail: ' + payload.email + '\nCompany: ' + payload.company + '\nEngagement: ' + payload.engagement_type + '\nTimeline: ' + payload.timeline + '\nBudget: ' + payload.budget + '\n\nMessage:\n' + payload.message)}" style="color: var(--ice); text-decoration: underline; margin-left: 0.5rem;">Send via email client</a>`;
        statusEl.className = 'intake-status err';
      }
    } catch (err) {
      statusEl.innerHTML = `Network transmission error. <a href="mailto:chad@failforward.dev?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent('Name: ' + payload.name + '\nEmail: ' + payload.email + '\nCompany: ' + payload.company + '\nEngagement: ' + payload.engagement_type + '\nTimeline: ' + payload.timeline + '\nBudget: ' + payload.budget + '\n\nMessage:\n' + payload.message)}" style="color: var(--ice); text-decoration: underline; margin-left: 0.5rem;">Click to send via email client</a>`;
      statusEl.className = 'intake-status err';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavScroll();
  initLabelsEngine();
  initGovernanceDashboard();
  initIncidentFilters();
  initTelemetryStream();
  initContactForm();
});
