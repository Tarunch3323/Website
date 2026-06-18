require('dotenv').config();
const express = require('express');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const cors    = require('cors');
const { Resend } = require('resend');

const app      = express();
const PORT     = 4000;
const ROOT     = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPL_DIR  = path.join(ROOT, 'uploads');
const API_KEY  = process.env.ANTHROPIC_API_KEY;

// ── multer (image uploads) ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPL_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 7) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|svg/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files allowed'), ok);
  }
});

// ── multer for RFQ (PDF + images) ───────────────────────────────────────────
const rfqUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /pdf|jpeg|jpg|png|webp/.test(file.mimetype);
    cb(ok ? null : new Error('Only PDF and image files allowed'), ok);
  }
});

// ── middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(ROOT, {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.jsx')) res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  }
}));
app.use('/uploads', express.static(UPL_DIR));

// ── helpers ──────────────────────────────────────────────────────────────────
function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Anthropic AI chat (streaming) ────────────────────────────────────────────
const SYSTEM = `You are Factory Brain AI, PatternLab's manufacturing intelligence assistant.
You help manufacturers with:
- Analyzing Request for Quotations (RFQs) and generating detailed, structured quotes
- Production scheduling, capacity planning, and work-center optimization
- BOM (Bill of Materials) analysis, costing, and material procurement planning
- Manufacturing feasibility assessment and realistic lead-time estimation
- Supply chain planning, inventory management, and order prioritization

Respond concisely and practically. Use markdown for structure (headers, bullets, tables).
When analyzing uploaded documents or images, extract and present key details in a clear, actionable format.
For RFQ analysis always include: estimated lead time, key materials/components, production complexity, and recommended next steps.`;

app.post('/api/chat', (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set — restart the server with it.' });
  }

  const body = JSON.stringify({
    model:    'claude-opus-4-8',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system:   SYSTEM,
    stream:   true,
    messages: req.body.messages || [],
  });

  const opts = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'Content-Length':    Buffer.byteLength(body),
      'x-api-key':         API_KEY,
      'anthropic-version': '2023-06-01',
    },
  };

  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
  });

  const apiReq = https.request(opts, apiRes => {
    apiRes.on('data',  chunk => res.write(chunk));
    apiRes.on('end',   ()    => res.end());
    apiRes.on('error', err   => { res.write(`data: {"type":"error","error":{"message":"${err.message}"}}\n\n`); res.end(); });
  });
  apiReq.on('error', err => {
    res.write(`data: {"type":"error","error":{"message":"${err.message}"}}\n\n`);
    res.end();
  });
  apiReq.write(body);
  apiReq.end();
});

// ── Articles CRUD ─────────────────────────────────────────────────────────────
app.get('/api/articles', (req, res) => {
  let list = readJSON('articles.json') || [];
  const { status, category, search } = req.query;
  if (status)                        list = list.filter(a => a.status === status);
  if (category && category !== 'all') list = list.filter(a => a.category === category);
  if (search) list = list.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.excerpt || '').toLowerCase().includes(search.toLowerCase())
  );
  list.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
  res.json(list);
});

app.get('/api/articles/:id', (req, res) => {
  const list = readJSON('articles.json') || [];
  const art  = list.find(a => a.id === req.params.id);
  if (!art) return res.status(404).json({ error: 'Article not found' });
  res.json(art);
});

app.post('/api/articles', (req, res) => {
  const list    = readJSON('articles.json') || [];
  const article = {
    ...req.body,
    id:        req.body.id || slugify(req.body.title || 'untitled'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  let id = article.id, n = 1;
  while (list.find(a => a.id === id)) id = article.id + '-' + (n++);
  article.id = id;
  list.push(article);
  writeJSON('articles.json', list);
  res.status(201).json(article);
});

app.put('/api/articles/:id', (req, res) => {
  const list = readJSON('articles.json') || [];
  const idx  = list.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Article not found' });
  if (req.body.featured === true) list.forEach(a => { a.featured = false; });
  list[idx] = { ...list[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON('articles.json', list);
  res.json(list[idx]);
});

app.delete('/api/articles/:id', (req, res) => {
  let list = readJSON('articles.json') || [];
  list = list.filter(a => a.id !== req.params.id);
  writeJSON('articles.json', list);
  res.json({ success: true });
});

// ── Settings ──────────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => res.json(readJSON('settings.json') || {}));

app.put('/api/settings', (req, res) => {
  const updated = { ...(readJSON('settings.json') || {}), ...req.body };
  writeJSON('settings.json', updated);
  res.json(updated);
});

// ── Image uploads ─────────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  res.json({ url: '/uploads/' + req.file.filename, name: req.file.filename });
});

app.get('/api/uploads', (req, res) => {
  const files = fs.readdirSync(UPL_DIR)
    .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
    .map(f => ({ url: '/uploads/' + f, name: f }));
  res.json(files);
});

app.delete('/api/upload/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(UPL_DIR, filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });
  fs.unlinkSync(filepath);
  res.json({ success: true });
});

// ── RFQ Parser (PDF/image → structured quote data via Claude) ─────────────────
app.post('/api/parse-rfq', rfqUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  if (!API_KEY)  return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const fileData = fs.readFileSync(req.file.path);
  const base64   = fileData.toString('base64');
  const mime     = req.file.mimetype;
  const isPDF    = mime === 'application/pdf';
  fs.unlinkSync(req.file.path); // clean up temp file

  const userContent = [
    isPDF
      ? { type: 'document', source: { type: 'base64', media_type: mime, data: base64 } }
      : { type: 'image',    source: { type: 'base64', media_type: mime, data: base64 } },
    {
      type: 'text',
      text: `You are an RFQ (Request for Quotation) parser for a packaging manufacturer.
Extract all available information from this document and return ONLY a valid JSON object — no explanation, no markdown, no code fences.

Return this exact schema (use null for missing fields):
{
  "productName": "full product/item name",
  "customer": "customer or company name",
  "category": "product category (e.g. Folding Carton, Corrugated Box, Label, Mono Carton)",
  "quantity": <number or null>,
  "pricePerUnit": <number or null>,
  "total": <number or null>,
  "currency": "₹",
  "dimensions": "L × W × H mm",
  "material": "substrate/material name",
  "gsm": "GSM value as string",
  "printColours": "number of colours or —",
  "treatments": ["array", "of", "coatings", "finishes"]
}`
    }
  ];

  const body = JSON.stringify({
    model:      'claude-sonnet-4-6',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: userContent }]
  });

  const opts = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'Content-Length':    Buffer.byteLength(body),
      'x-api-key':         API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta':    'pdfs-2024-09-25',
    }
  };

  let raw = '';
  const apiReq = https.request(opts, apiRes => {
    apiRes.on('data', chunk => { raw += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.error) return res.status(500).json({ error: parsed.error.message || 'Claude API error' });
        const text = parsed.content?.[0]?.text || '{}';
        // strip any accidental markdown fences
        const clean = text.replace(/```json|```/g, '').trim();
        const data  = JSON.parse(clean);
        res.json(data);
      } catch(e) {
        res.status(500).json({ error: 'Failed to parse AI response', raw: raw.slice(0, 500) });
      }
    });
    apiRes.on('error', err => res.status(500).json({ error: err.message }));
  });
  apiReq.on('error', err => res.status(500).json({ error: err.message }));
  apiReq.write(body);
  apiReq.end();
});

// ── Contact form submissions ──────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, company, jobTitle, phone, message, source } = req.body;
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from:    'PatternLab Website <onboarding@resend.dev>',
      to:      ['tarun@patternlab.ai'],
      subject: `New enquiry from ${name || 'website visitor'}`,
      html: `
        <h2 style="margin:0 0 16px;font-family:sans-serif">New Contact Form Submission</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6;width:130px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${name || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${email || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6">Company</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${company || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6">Job Title</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${jobTitle || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${phone || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6">Source</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${source || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;background:#f3f4f6;vertical-align:top">Message</td><td style="padding:8px 12px">${(message || '—').replace(/\n/g, '<br>')}</td></tr>
        </table>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/admin',         (req, res) => res.sendFile(path.join(ROOT, 'admin', 'index.html')));
app.get('/admin/editor',  (req, res) => res.sendFile(path.join(ROOT, 'admin', 'editor.html')));
app.get('/blog',          (req, res) => res.sendFile(path.join(ROOT, 'blog.html')));
app.get('/pricing',       (req, res) => res.sendFile(path.join(ROOT, 'pricing.html')));
app.get('/contact',       (req, res) => res.sendFile(path.join(ROOT, 'contact.html')));
app.get('/quote',         (req, res) => res.sendFile(path.join(ROOT, 'Quote', 'PatternLab Scheduler_quote maker.html')));
app.use('/quote-files',   express.static(path.join(ROOT, 'Quote', 'PatternLab Scheduler_quote maker_files')));

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  PatternLab is running');
  console.log(`  Website  →  http://localhost:${PORT}`);
  console.log(`  Blog     →  http://localhost:${PORT}/blog`);
  console.log(`  Admin    →  http://localhost:${PORT}/admin`);
  console.log(`  Quote    →  http://localhost:${PORT}/quote`);
  console.log('');
  if (!API_KEY) console.warn('\x1b[33m⚠  ANTHROPIC_API_KEY not set — AI chat disabled until restart with it\x1b[0m');
});
