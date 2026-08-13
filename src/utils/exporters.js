/**
 * utils/exporters.js — CSV and Excel export utilities
 */

'use strict';

const zlib = require('zlib');
const constants = require('../config/constants');

/**
 * Convert a registration object to a CSV row.
 * @param {object} reg - Registration object
 * @param {number} idx - Index (for row number)
 * @returns {Array}
 */
function registrationToRow(reg, idx) {
  const ts = reg.timestamp
    ? new Date(reg.timestamp).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return [
    idx + 1,
    reg.fullName || '',
    reg.email || '',
    reg.company || '',
    reg.department || '',
    reg.participationCategory || '',
    reg.culturalProgram || '',
    reg.phone || '',
    reg.sadhya || '',
    ts,
  ];
}

/**
 * Build a CSV string from registrations.
 * @param {Array<object>} registrations - Array of registration objects
 * @returns {string} CSV content
 */
function buildCSV(registrations) {
  const rows = registrations.map((reg, i) => registrationToRow(reg, i));
  return [constants.CSV_HEADERS, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

/**
 * Build a minimal Excel (.xlsx) file using raw OOXML ZIP structure.
 * Does NOT require any npm packages — uses Node.js built-in `zlib`.
 * @param {Array<object>} registrations - Array of registration objects
 * @returns {Buffer} Excel file content
 */
function buildExcel(registrations) {
  const allRows = [constants.CSV_HEADERS, ...registrations.map((r, i) => registrationToRow(r, i))];

  // Build shared strings table
  const strings = [];
  const strIdx = {};

  function si(val) {
    const s = String(val);
    if (!(s in strIdx)) {
      strIdx[s] = strings.length;
      strings.push(s);
    }
    return strIdx[s];
  }

  // Build worksheet XML
  let wsXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

  allRows.forEach((row, ri) => {
    wsXml += `<row r="${ri + 1}">`;
    row.forEach((cell, ci) => {
      const col = String.fromCharCode(65 + ci);
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

  // Shared strings XML
  let ssXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">`;
  strings.forEach((s) => {
    const escaped = s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    ssXml += `<si><t>${escaped}</t></si>`;
  });
  ssXml += '</sst>';

  // Workbook XML
  const wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Registrations" sheetId="1" r:id="rId1"/></sheets></workbook>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`;

  function deflateSync(str) {
    return zlib.deflateRawSync(Buffer.from(str, 'utf8'));
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function u16le(n) {
    const b = Buffer.alloc(2);
    b.writeUInt16LE(n, 0);
    return b;
  }

  function u32le(n) {
    const b = Buffer.alloc(4);
    b.writeUInt32LE(n >>> 0, 0);
    return b;
  }

  const entries = [];
  let offset = 0;

  function addEntry(name, content) {
    const nameBuf = Buffer.from(name, 'utf8');
    const rawBuf = Buffer.from(content, 'utf8');
    const cmpBuf = deflateSync(content);
    const crc = crc32(rawBuf);

    const localHeader = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16le(20),
      u16le(0),
      u16le(8),
      u16le(0),
      u16le(0),
      u32le(crc),
      u32le(cmpBuf.length),
      u32le(rawBuf.length),
      u16le(nameBuf.length),
      u16le(0),
      nameBuf,
      cmpBuf,
    ]);

    entries.push({
      name: nameBuf,
      crc,
      cmpSize: cmpBuf.length,
      rawSize: rawBuf.length,
      offset,
    });
    offset += localHeader.length;
    return localHeader;
  }

  const localParts = [
    addEntry('[Content_Types].xml', contentTypes),
    addEntry('_rels/.rels', rootRels),
    addEntry('xl/workbook.xml', wbXml),
    addEntry('xl/_rels/workbook.xml.rels', wbRels),
    addEntry('xl/worksheets/sheet1.xml', wsXml),
    addEntry('xl/sharedStrings.xml', ssXml),
  ];

  const centralDirParts = entries.map((e) =>
    Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16le(20),
      u16le(20),
      u16le(0),
      u16le(8),
      u16le(0),
      u16le(0),
      u32le(e.crc),
      u32le(e.cmpSize),
      u32le(e.rawSize),
      u16le(e.name.length),
      u16le(0),
      u16le(0),
      u16le(0),
      u16le(0),
      u16le(0),
      u32le(e.offset),
      e.name,
    ])
  );

  const centralDirBuf = Buffer.concat(centralDirParts);
  const centralDirOffset = offset;
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    u16le(0),
    u16le(0),
    u16le(entries.length),
    u16le(entries.length),
    u32le(centralDirBuf.length),
    u32le(centralDirOffset),
    u16le(0),
  ]);

  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}

module.exports = {
  registrationToRow,
  buildCSV,
  buildExcel,
};
