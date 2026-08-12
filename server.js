/**
 * server.js — Ponnonam 2K26 Backend API
 *
 * Endpoints:
 *   POST   /api/registrations          — Submit a new registration
 *   GET    /api/registrations          — List all registrations (admin only)
 *   DELETE /api/registrations/:index   — Delete a registration by index (admin only)
 *   GET    /api/registrations/export/csv   — Download CSV export (admin only)
 *   GET    /api/registrations/export/excel — Download Excel export (admin only)
 *   GET    /api/stats                  — Summary stats (admin only)
 *   GET    /api/health                 — Health check (public)
 *
 * Admin authentication:
 *   Pass the header:  X-Admin-Key: <ADMIN_KEY>
 *   Or query param:   ?key=<ADMIN_KEY>
 *
 * Start: node server.js
 * Or with a custom port: PORT=4000 node server.js
 */

'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

/* ============================================================
   CONFIG
   ============================================================ */

const PORT       = process.env.PORT       || 3000;
const ADMIN_KEY  = process.env.ADMIN_KEY  || 'ponnonam2k26-admin';
const DATA_DIR   = path.join(__dirname, '.data');
const DATA_FILE  = path.join(DATA_DIR, 'registrations.json');

/* ============================================================
   APP SETUP
   ============================================================ */

const app = express();

// Parse JSON bodies
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS — allow same origin + any localhost origin for dev
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed = /^https?:\/\/localhost(:\d+)?$/.test(origin) || !origin;
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve the static site files
app.use(express.static(path.join(__dirname)));

/* ============================================================
   DATA HELPERS
   ============================================================ */

/** Ensure the data directory and file exist. */
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

/** Read all registrations from disk. Returns [] on error. */
function readRegistrations() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[DATA] Read error:', err.message);
    return [];
  }
}

/** Write registrations array to disk. */
function writeRegistrations(data) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[DATA] Write error:', err.message);
    throw err;
  }
}

/** Sanitise a string field — trim and strip HTML tags. */
function sanitise(val) {
  return String(val || '').trim().replace(/<[^>]*>/g, '');
}

/* ============================================================
   ADMIN AUTH MIDDLEWARE
   ============================================================ */

/**
 * Middleware that checks X-Admin-Key header or ?key= query param.
 * Returns 401 if missing, 403 if wrong.
 */
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key || '';
  if (!key) {
    return res.status(401).json({ error: 'Admin key required. Pass X-Admin-Key header.' });
  }
  // Constant-time comparison to prevent timing attacks
  const provided = Buffer.from(key.padEnd(64));
  const expected = Buffer.from(ADMIN_KEY.padEnd(64));
  const match = provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected);
  if (!match) {
    return res.status(403).json({ error: 'Invalid admin key.' });
  }
  next();
}

/* ============================================================
   VALIDATION
   ============================================================ */

const VALID_COMPANIES    = ['COZMEK', 'Disha Mentor', 'BSI', 'BBC', 'YMBC'];
const VALID_DEPARTMENTS  = ['HR', 'Operations', 'AI', 'Cyber', 'Cloud', 'Marketing', 'Accounts', 'Administration', 'Other'];
const VALID_CATEGORIES   = ['Cultural Performance', 'Games Activity', 'Both'];
const VALID_EVENTS       = [
  'Thiruvathira', 'Onam Song', 'Dance', 'Song', 'Fashion Show',
  'Kasera Kali', 'Chakkil Ottam', 'Kuppiyil Velam Nirakal',
  'Lemon Spoon Race', 'Rotti Kadi', 'Oori Adi', 'Vadam Vali',
  'Onam Pookalam', 'Not Participating in Events',
];
const VALID_SADHYA = ['Vegetarian', 'Non-Vegetarian'];

function validateRegistration(body) {
  const errors = [];

  if (!body.fullName || sanitise(body.fullName).length < 2)
    errors.push('fullName: must be at least 2 characters.');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!body.email || !emailRe.test(sanitise(body.email)))
    errors.push('email: must be a valid email address.');

  if (!body.company || !VALID_COMPANIES.includes(sanitise(body.company)))
    errors.push(`company: must be one of: ${VALID_COMPANIES.join(', ')}.`);

  if (!body.department || !VALID_DEPARTMENTS.includes(sanitise(body.department)))
    errors.push(`department: must be one of: ${VALID_DEPARTMENTS.join(', ')}.`);

  if (!body.participationCategory || !VALID_CATEGORIES.includes(sanitise(body.participationCategory)))
    errors.push(`participationCategory: must be one of: ${VALID_CATEGORIES.join(', ')}.`);

  if (!body.culturalProgram || !VALID_EVENTS.includes(sanitise(body.culturalProgram)))
    errors.push(`culturalProgram: must be a valid event/activity.`);

  const phoneRe = /^[+\d][\d\s\-()\\.]{5,18}$/;
  if (!body.phone || !phoneRe.test(sanitise(body.phone)))
    errors.push('phone: must be a valid phone number.');

  if (!body.sadhya || !VALID_SADHYA.includes(sanitise(body.sadhya)))
    errors.push(`sadhya: must be one of: ${VALID_SADHYA.join(', ')}.`);

  return errors;
}

/* ============================================================
   CSV / EXCEL HELPERS
   ============================================================ */

const CSV_HEADERS = [
  '#', 'Full Name', 'Email', 'Company', 'Department',
  'Participation Category', 'Event / Activity', 'Phone', 'Sadhya Preference', 'Registered At',
];

function registrationToRow(r, idx) {
  const ts = r.timestamp
    ? new Date(r.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '';
  return [
    idx + 1,
    r.fullName              || '',
    r.email                 || '',
    r.company               || '',
    r.department            || '',
    r.participationCategory || '',
    r.culturalProgram       || '',
    r.phone                 || '',
    r.sadhya                || '',
    ts,
  ];
}

function buildCSV(regs) {
  const rows = regs.map((r, i) => registrationToRow(r, i));
  return [CSV_HEADERS, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

/**
 * Build a minimal Excel (.xlsx) file using raw OOXML ZIP structure.
 * Does NOT require any npm packages — uses Node.js built-in `zlib`.
 * Supports basic string cells. Numbers are written as numbers.
 */
function buildExcel(regs) {
  const zlib = require('zlib');

  const allRows = [CSV_HEADERS, ...regs.map((r, i) => registrationToRow(r, i))];

  /* Build shared strings table */
  const strings = [];
  const strIdx  = {};
  function si(val) {
    const s = String(val);
    if (!(s in strIdx)) { strIdx[s] = strings.length; strings.push(s); }
    return strIdx[s];
  }

  /* Build worksheet XML */
  let wsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  wsXml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  wsXml += '<sheetData>';

  allRows.forEach((row, ri) => {
    wsXml += `<row r="${ri + 1}">`;
    row.forEach((cell, ci) => {
      const col   = String.fromCharCode(65 + ci);
      const coord = `${col}${ri + 1}`;
      if (typeof cell === 'number') {
        wsXml += `<c r="${coord}"><v>${cell}</v></c>`;
      } else {
        const idx = si(cell);
        wsXml += `<c r="${coord}" t="s"><v>${idx}</v></c>`;
      }
    });
    wsXml += '</row>';
  });

  wsXml += '</sheetData></worksheet>';

  /* Shared strings XML */
  let ssXml  = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  ssXml += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">`;
  strings.forEach(s => {
    const escaped = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    ssXml += `<si><t>${escaped}</t></si>`;
  });
  ssXml += '</sst>';

  /* Workbook XML */
  const wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Registrations" sheetId="1" r:id="rId1"/></sheets></workbook>`;

  /* Relationship files */
  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`;

  /* Assemble ZIP manually using raw deflate */
  function deflateSync(str) {
    return zlib.deflateRawSync(Buffer.from(str, 'utf8'));
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function u16le(n)  { const b = Buffer.alloc(2); b.writeUInt16LE(n, 0); return b; }
  function u32le(n)  { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0, 0); return b; }

  const entries  = [];
  let   offset   = 0;

  function addEntry(name, content) {
    const nameBuf = Buffer.from(name, 'utf8');
    const rawBuf  = Buffer.from(content, 'utf8');
    const cmpBuf  = deflateSync(content);
    const crc     = crc32(rawBuf);

    const localHeader = Buffer.concat([
      Buffer.from([0x50, 0x4B, 0x03, 0x04]), // signature
      u16le(20),            // version needed
      u16le(0),             // general purpose bit flag
      u16le(8),             // compression method: deflate
      u16le(0), u16le(0),  // last mod time/date
      u32le(crc),
      u32le(cmpBuf.length),
      u32le(rawBuf.length),
      u16le(nameBuf.length),
      u16le(0),             // extra field length
      nameBuf,
      cmpBuf,
    ]);

    entries.push({ name: nameBuf, crc, cmpSize: cmpBuf.length, rawSize: rawBuf.length, offset });
    offset += localHeader.length;
    return localHeader;
  }

  const localParts = [
    addEntry('[Content_Types].xml',              contentTypes),
    addEntry('_rels/.rels',                      rootRels),
    addEntry('xl/workbook.xml',                  wbXml),
    addEntry('xl/_rels/workbook.xml.rels',        wbRels),
    addEntry('xl/worksheets/sheet1.xml',          wsXml),
    addEntry('xl/sharedStrings.xml',              ssXml),
  ];

  const centralDirParts = entries.map(e => Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x01, 0x02]), // signature
    u16le(20), u16le(20),   // version made by / needed
    u16le(0),               // flags
    u16le(8),               // deflate
    u16le(0), u16le(0),    // time/date
    u32le(e.crc),
    u32le(e.cmpSize),
    u32le(e.rawSize),
    u16le(e.name.length),
    u16le(0), u16le(0),    // extra / comment length
    u16le(0),               // disk start
    u16le(0), u16le(0),    // internal/external attr
    u32le(e.offset),
    e.name,
  ]));

  const centralDirBuf = Buffer.concat(centralDirParts);
  const centralDirOffset = offset;
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x05, 0x06]),
    u16le(0), u16le(0),
    u16le(entries.length), u16le(entries.length),
    u32le(centralDirBuf.length),
    u32le(centralDirOffset),
    u16le(0),
  ]);

  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}

/* ============================================================
   API ROUTES
   ============================================================ */

/** Health check — public */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', event: 'Ponnonam 2K26', timestamp: new Date().toISOString() });
});

/** Submit registration — public */
app.post('/api/registrations', (req, res) => {
  const body   = req.body;
  const errors = validateRegistration(body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }

  const regs = readRegistrations();

  // Duplicate check: same email + same event
  const duplicate = regs.find(r =>
    r.email.toLowerCase() === sanitise(body.email).toLowerCase() &&
    r.culturalProgram === sanitise(body.culturalProgram)
  );
  if (duplicate) {
    return res.status(409).json({
      error: 'You have already registered for this event with this email address.',
    });
  }

  const entry = {
    id:                    crypto.randomUUID(),
    fullName:              sanitise(body.fullName),
    email:                 sanitise(body.email).toLowerCase(),
    company:               sanitise(body.company),
    department:            sanitise(body.department),
    participationCategory: sanitise(body.participationCategory),
    culturalProgram:       sanitise(body.culturalProgram),
    phone:                 sanitise(body.phone),
    sadhya:                sanitise(body.sadhya),
    timestamp:             new Date().toISOString(),
  };

  regs.push(entry);
  writeRegistrations(regs);

  console.log(`[REG] New: ${entry.fullName} <${entry.email}> — ${entry.culturalProgram}`);
  res.status(201).json({ success: true, id: entry.id });
});

/** List all registrations — admin only */
app.get('/api/registrations', requireAdmin, (req, res) => {
  const regs = readRegistrations();

  // Optional filters via query params
  const { company, category, event: evt, sadhya } = req.query;
  let result = regs;
  if (company)  result = result.filter(r => r.company === company);
  if (category) result = result.filter(r => r.participationCategory === category);
  if (evt)      result = result.filter(r => r.culturalProgram === evt);
  if (sadhya)   result = result.filter(r => r.sadhya === sadhya);

  res.json({ count: result.length, data: result });
});

/** Delete a registration by index — admin only */
app.delete('/api/registrations/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const regs   = readRegistrations();
  const idx    = regs.findIndex(r => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  const [removed] = regs.splice(idx, 1);
  writeRegistrations(regs);
  console.log(`[REG] Deleted: ${removed.fullName} <${removed.email}>`);
  res.json({ success: true, removed });
});

/** Stats summary — admin only */
app.get('/api/stats', requireAdmin, (req, res) => {
  const regs = readRegistrations();

  const byCompany  = {};
  const byEvent    = {};
  const byCategory = {};
  const bySadhya   = {};

  regs.forEach(r => {
    byCompany[r.company]               = (byCompany[r.company]               || 0) + 1;
    byEvent[r.culturalProgram]         = (byEvent[r.culturalProgram]         || 0) + 1;
    byCategory[r.participationCategory]= (byCategory[r.participationCategory]|| 0) + 1;
    bySadhya[r.sadhya]                 = (bySadhya[r.sadhya]                 || 0) + 1;
  });

  res.json({
    total: regs.length,
    byCompany,
    byParticipationCategory: byCategory,
    byEvent,
    bySadhya,
    lastRegisteredAt: regs.length ? regs[regs.length - 1].timestamp : null,
  });
});

/** Export CSV — admin only */
app.get('/api/registrations/export/csv', requireAdmin, (req, res) => {
  const regs = readRegistrations();
  const csv  = buildCSV(regs);
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ponnonam2k26_registrations_${date}.csv"`);
  res.send('\uFEFF' + csv);
});

/** Export Excel — admin only (no npm deps, pure Node.js) */
app.get('/api/registrations/export/excel', requireAdmin, (req, res) => {
  try {
    const regs  = readRegistrations();
    const xlsx  = buildExcel(regs);
    const date  = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ponnonam2k26_registrations_${date}.xlsx"`);
    res.send(xlsx);
  } catch (err) {
    console.error('[EXCEL] Build error:', err.message);
    res.status(500).json({ error: 'Failed to generate Excel file.' });
  }
});

/* ============================================================
   START
   ============================================================ */

ensureDataFile();
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║      Ponnonam 2K26 — Backend Server      ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Site   → http://localhost:${PORT}           ║`);
  console.log(`  ║  API    → http://localhost:${PORT}/api        ║`);
  console.log('  ║  Admin key in ADMIN_KEY env variable     ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
