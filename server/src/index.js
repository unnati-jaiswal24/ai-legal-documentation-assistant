require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key-for-legal-assistant-local';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Persistent JSON storage setup
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const INITIAL_TEMPLATES = [
  {
    id: 'template-freelance-1',
    documentTypeId: 'type-freelance',
    title: 'Freelance Service Agreement',
    version: '1.0',
    isActive: true,
    description: 'A standard, legally grounded contract for Indian freelancers and clients covering scope, milestones, IP ownership, and dispute resolution.',
    documentType: { id: 'type-freelance', name: 'Freelance Service Agreement' },
    fields: [
      { id: 'f-date', fieldKey: 'effective_date', labelPlain: 'Agreement start date', dataType: 'date', isRequired: true, displayOrder: 1 },
      { id: 'f-freelancer', fieldKey: 'freelancer_name', labelPlain: 'Freelancer full name', dataType: 'text', isRequired: true, displayOrder: 2 },
      { id: 'f-client', fieldKey: 'client_name', labelPlain: 'Client full name', dataType: 'text', isRequired: true, displayOrder: 3 },
      { id: 'f-scope', fieldKey: 'scope_description', labelPlain: 'Scope of work', dataType: 'text', isRequired: true, displayOrder: 4 },
      { id: 'f-fee', fieldKey: 'fee_amount', labelPlain: 'Total fee (INR)', dataType: 'number', isRequired: true, displayOrder: 5 },
      { id: 'f-nda', fieldKey: 'include_nda', labelPlain: 'Include confidentiality clause', dataType: 'boolean', isRequired: false, displayOrder: 6 }
    ],
    clauses: [
      {
        id: 'c-parties',
        title: 'Parties & Recitals',
        plainText: 'Identifies the independent contractor and the hiring client entering into the contract.',
        legalText: 'This Freelance Service Agreement is made between the Client and the Freelancer identified herein, each of whom confirms legal competence under the Indian Contract Act, 1872.',
        position: 1,
        source: 'Indian Contract Act, 1872'
      },
      {
        id: 'c-scope',
        title: 'Scope of Work & Deliverables',
        plainText: 'Sets clear expectations for deliverables, revisions, and project boundaries.',
        legalText: 'The Freelancer agrees to perform the services described in the Scope of Work with reasonable professional care and skill, according to agreed milestones.',
        position: 2,
        source: 'Commercial Practice'
      },
      {
        id: 'c-payment',
        title: 'Payment Terms & Consideration',
        plainText: 'Outlines the total agreed compensation in INR, payment schedule, and invoice clearance timelines.',
        legalText: 'The Client shall pay the Freelancer the agreed consideration in INR upon milestone verification, subject to applicable Indian tax deductions at source (TDS).',
        position: 3,
        source: 'Income Tax Act & GST Framework'
      },
      {
        id: 'c-ip',
        title: 'Intellectual Property Ownership',
        plainText: 'Clarifies that project deliverables belong to the client upon full payment, while developer background tools remain with the freelancer.',
        legalText: 'Upon receipt of full payment, all copyright in custom deliverables shall vest in the Client. The Freelancer retains rights to pre-existing background tools and methodologies.',
        position: 4,
        source: 'Copyright Act, 1957'
      },
      {
        id: 'c-confidentiality',
        title: 'Confidentiality & Non-Disclosure',
        plainText: 'Protects sensitive business information shared during the engagement.',
        legalText: 'Both parties agree to hold confidential information in strict confidence and not disclose proprietary data to any third party without prior written consent.',
        position: 5,
        source: 'Information Technology Act, 2000'
      },
      {
        id: 'c-jurisdiction',
        title: 'Governing Law & Dispute Resolution',
        plainText: 'Governed by Indian law with mutual conciliation before arbitration or court proceedings.',
        legalText: 'This agreement shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in India.',
        position: 6,
        source: 'Arbitration and Conciliation Act, 1996'
      }
    ]
  }
];

const INITIAL_TYPES = [
  { id: 'type-freelance', name: 'Freelance Service Agreement' },
  { id: 'type-nda', name: 'Non-Disclosure Agreement (NDA)' },
  { id: 'type-consulting', name: 'Consulting Retainer Agreement' }
];

const INITIAL_EXPERTS = [
  { id: 'expert-1', name: 'Adv. Rohit Sharma', specialization: 'Tech Contracts & Freelance IP (High Court of Delhi)', isAvailable: true },
  { id: 'expert-2', name: 'Adv. Priya Deshmukh', specialization: 'Commercial Agreements & SME Advisory (Bombay Bar)', isAvailable: true },
  { id: 'expert-3', name: 'Adv. Anand Kulkarni', specialization: 'GST & Service Contracts (Karnataka Bar)', isAvailable: true }
];

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading store, using defaults:', err.message);
  }
  return {
    users: [],
    drafts: [],
    versions: {},
    consultations: [],
  };
}

const store = loadStore();

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err.message);
  }
}

const sign = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore expired / invalid in optional
    }
  }
  next();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH
app.post(['/api/auth/signup', '/api/signup'], async (req, res) => {
  const { name, fullName, email, password } = req.body || {};
  const userName = (fullName || name || '').trim();

  if (!userName || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Full name, email, and a password of at least 8 characters are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (store.users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'This email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullName: userName,
    email: normalizedEmail,
    passwordHash,
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  saveStore();

  const userRes = { id: user.id, fullName: user.fullName, email: user.email, preferredLanguage: user.preferredLanguage };
  res.status(201).json({ token: sign(user), user: userRes });
});

app.post(['/api/auth/login', '/api/login'], async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Convenience for dev/demo if user logs in without signup
    const passwordHash = await bcrypt.hash(password, 10);
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fullName: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    saveStore();
  } else {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
  }

  const userRes = { id: user.id, fullName: user.fullName, email: user.email, preferredLanguage: user.preferredLanguage };
  res.json({ token: sign(user), user: userRes });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = store.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.json({ user: { id: req.user.id, fullName: 'User', email: req.user.email, preferredLanguage: 'en' } });
  }
  res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, preferredLanguage: user.preferredLanguage } });
});

app.put('/api/me', authMiddleware, (req, res) => {
  const { fullName, email, preferredLanguage } = req.body || {};
  let user = store.users.find((u) => u.id === req.user.id);
  if (!user) {
    user = { id: req.user.id, fullName: fullName || 'User', email: email || req.user.email, preferredLanguage: preferredLanguage || 'en' };
    store.users.push(user);
  } else {
    if (fullName) user.fullName = fullName.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  }
  saveStore();
  res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, preferredLanguage: user.preferredLanguage } });
});

// TEMPLATES & TYPES
app.get('/api/document-types', (req, res) => {
  res.json(INITIAL_TYPES);
});

app.get('/api/templates', (req, res) => {
  res.json(INITIAL_TEMPLATES);
});

// DRAFTS
app.get('/api/drafts', optionalAuth, (req, res) => {
  const userId = req.user?.id;
  const userDrafts = userId ? store.drafts.filter((d) => !d.userId || d.userId === userId) : store.drafts;
  res.json(userDrafts);
});

app.post('/api/drafts', optionalAuth, (req, res) => {
  const { templateId } = req.body || {};
  const template = INITIAL_TEMPLATES.find((t) => t.id === templateId) || INITIAL_TEMPLATES[0];
  const now = new Date().toISOString();

  const newDraft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: req.user?.id || 'guest',
    templateId: template.id,
    title: template.title,
    status: 'in_progress',
    template,
    values: [],
    createdAt: now,
    updatedAt: now,
  };

  store.drafts.unshift(newDraft);
  saveStore();

  res.status(201).json(newDraft);
});

app.get('/api/drafts/:id', (req, res) => {
  const draft = store.drafts.find((d) => d.id === req.params.id);
  if (!draft) {
    // Generate fallback draft so deep-links continue working smoothly
    const template = INITIAL_TEMPLATES[0];
    const now = new Date().toISOString();
    const fallback = {
      id: req.params.id,
      templateId: template.id,
      title: template.title,
      status: 'in_progress',
      template,
      values: [],
      createdAt: now,
      updatedAt: now,
    };
    store.drafts.unshift(fallback);
    saveStore();
    return res.json(fallback);
  }
  res.json(draft);
});

app.put('/api/drafts/:id/values', (req, res) => {
  const { values } = req.body || {};
  let draft = store.drafts.find((d) => d.id === req.params.id);
  if (!draft) {
    const template = INITIAL_TEMPLATES[0];
    const now = new Date().toISOString();
    draft = {
      id: req.params.id,
      templateId: template.id,
      title: template.title,
      status: 'in_progress',
      template,
      values: [],
      createdAt: now,
      updatedAt: now,
    };
    store.drafts.unshift(draft);
  }

  draft.values = Array.isArray(values) ? values : [];
  draft.updatedAt = new Date().toISOString();
  saveStore();

  res.json({ values: draft.values });
});

app.post('/api/drafts/:id/validate', (req, res) => {
  const draft = store.drafts.find((d) => d.id === req.params.id);
  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  const fields = draft.template?.fields || [];
  const values = draft.values || [];
  const errors = [];

  for (const field of fields) {
    if (field.isRequired) {
      const val = values.find((v) => v.fieldId === field.id)?.value;
      if (val === undefined || val === null || val === '') {
        errors.push(`Missing required field: ${field.labelPlain || field.fieldKey}`);
      }
    }
  }

  if (errors.length === 0) {
    draft.status = 'validated';
  }
  draft.updatedAt = new Date().toISOString();
  saveStore();

  res.json({
    status: errors.length === 0 ? 'validated' : draft.status,
    errors,
  });
});

app.get('/api/drafts/:id/clauses', (req, res) => {
  const draft = store.drafts.find((d) => d.id === req.params.id);
  const clauses = draft?.template?.clauses || INITIAL_TEMPLATES[0].clauses;
  res.json(clauses);
});

app.post('/api/drafts/:id/generate', (req, res) => {
  const draftId = req.params.id;
  const draft = store.drafts.find((d) => d.id === draftId);
  if (draft) {
    draft.status = 'generated';
    draft.updatedAt = new Date().toISOString();
  }

  const existing = store.versions[draftId] || [];
  const newVersion = {
    id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    draftId,
    versionNo: existing.length + 1,
    fileUrl: '#',
    format: 'pdf',
    generatedAt: new Date().toISOString(),
  };

  store.versions[draftId] = [newVersion, ...existing];
  saveStore();

  res.status(201).json(newVersion);
});

app.get('/api/drafts/:id/documents', (req, res) => {
  const list = store.versions[req.params.id] || [];
  res.json(list);
});

// EXPERTS & CONSULTATIONS
app.get('/api/experts', (req, res) => {
  res.json(INITIAL_EXPERTS);
});

app.post(['/api/consultations', '/api/drafts/:id/consultations'], (req, res) => {
  const draftId = req.params.id || req.body?.draftId;
  const { expertId, query } = req.body || {};

  const expert = INITIAL_EXPERTS.find((e) => e.id === expertId) || INITIAL_EXPERTS[0];
  const consultation = {
    id: `con_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    draftId: draftId || null,
    expertId: expert.id,
    query: query || '',
    status: 'requested',
    expert,
    createdAt: new Date().toISOString(),
  };

  store.consultations.unshift(consultation);
  saveStore();

  res.status(201).json(consultation);
});

app.get('/api/consultations', (req, res) => {
  res.json(store.consultations);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
