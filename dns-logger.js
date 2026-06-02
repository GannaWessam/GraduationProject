'use strict';

const dns = require('dns');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, 'dns-report.log');
const JSON_FILE = path.join(__dirname, 'dns-report.json');

// ─── Load existing records (nodemon-safe: persists across restarts) ───────────
let dnsRecords = [];
let requestCounter = 0;
try {
  const existing = fs.readFileSync(JSON_FILE, 'utf8');
  dnsRecords = JSON.parse(existing);
  requestCounter = dnsRecords.length;
} catch {
  dnsRecords = [];
}

// ─── Local/internal hostnames to ignore ──────────────────────────────────────
const LOCAL_PATTERNS = [
  'localhost',
  '0.0.0.0',
  '127.',
  '192.168.',
  '172.',
  '10.',
  '::1',
  '::',
];

function isLocalHost(hostname) {
  return LOCAL_PATTERNS.some(p => hostname === p || hostname.startsWith(p));
}

// ─── Helper: parse call stack to find the real caller module ─────────────────
function getCallerInfo() {
  const err = new Error();
  const lines = err.stack.split('\n');

  // Skip internal dns-logger frames and node internals
  const skipPatterns = [
    'dns-logger.js',
    'node:dns',
    'node:internal',
    'node_modules/dns',
    'Error',
  ];

  for (const line of lines) {
    if (skipPatterns.some(p => line.includes(p))) continue;

    // Try to extract file path and line number
    const match =
      line.match(/at .+ \((.+):(\d+):(\d+)\)/) ||
      line.match(/at (.+):(\d+):(\d+)/);

    if (match) {
      const filePath = match[1];
      const lineNum = match[2];

      // Determine if it's a node_module or your own code
      const isNodeModule = filePath.includes('node_modules');
      const moduleName = isNodeModule
        ? filePath.split('node_modules/')[1]?.split('/')[0] || 'unknown'
        : path.relative(process.cwd(), filePath);

      return {
        file: filePath,
        line: lineNum,
        module: isNodeModule ? `[npm] ${moduleName}` : `[app] ${moduleName}`,
        isNodeModule,
        raw: line.trim(),
      };
    }
  }

  return { file: 'unknown', line: '?', module: 'unknown', raw: '' };
}

// ─── Helper: write a log entry ────────────────────────────────────────────────
function logEntry(hostname, caller) {
  requestCounter++;
  const timestamp = new Date().toISOString();

  const entry = {
    id: requestCounter,
    timestamp,
    hostname,
    module: caller.module,
    file: caller.file,
    line: caller.line,
    isNodeModule: caller.isNodeModule,
    stackLine: caller.raw,
  };

  dnsRecords.push(entry);

  // ── Console output ──
  const tag = caller.isNodeModule ? '📦' : '🔷';
  console.log(
    `[DNS #${requestCounter}] ${timestamp}\n` +
    `  ${tag} Module   : ${caller.module}\n` +
    `  🌐 Hostname : ${hostname}\n` +
    `  📄 File     : ${caller.file}:${caller.line}\n`
  );

  // ── Append to .log file ──
  const logLine =
    `[#${requestCounter}] ${timestamp}\n` +
    `  Module  : ${caller.module}\n` +
    `  Host    : ${hostname}\n` +
    `  File    : ${caller.file}:${caller.line}\n` +
    `  Stack   : ${caller.raw}\n` +
    `${'─'.repeat(60)}\n`;

  fs.appendFileSync(LOG_FILE, logLine, 'utf8');

  // ── Rewrite JSON file with all records ──
  fs.writeFileSync(JSON_FILE, JSON.stringify(dnsRecords, null, 2), 'utf8');
}

// ─── Monkey-patch dns.lookup ──────────────────────────────────────────────────
const originalLookup = dns.lookup.bind(dns);
dns.lookup = function (hostname, options, callback) {
  if (!isLocalHost(hostname)) {
    const caller = getCallerInfo();
    logEntry(hostname, caller);
  }
  if (typeof options === 'function') {
    return originalLookup(hostname, options);
  }
  return originalLookup(hostname, options, callback);
};

// ─── Monkey-patch dns.resolve ─────────────────────────────────────────────────
const originalResolve = dns.resolve.bind(dns);
dns.resolve = function (hostname, rrtype, callback) {
  if (!isLocalHost(hostname)) {
    const caller = getCallerInfo();
    logEntry(`resolve:${hostname}`, caller);
  }
  if (typeof rrtype === 'function') {
    return originalResolve(hostname, rrtype);
  }
  return originalResolve(hostname, rrtype, callback);
};

// ─── Monkey-patch dns.resolve4 ────────────────────────────────────────────────
const originalResolve4 = dns.resolve4.bind(dns);
dns.resolve4 = function (hostname, options, callback) {
  if (!isLocalHost(hostname)) {
    const caller = getCallerInfo();
    logEntry(`resolve4:${hostname}`, caller);
  }
  if (typeof options === 'function') {
    return originalResolve4(hostname, options);
  }
  return originalResolve4(hostname, options, callback);
};

// ─── Monkey-patch dns.resolve6 ────────────────────────────────────────────────
const originalResolve6 = dns.resolve6.bind(dns);
dns.resolve6 = function (hostname, options, callback) {
  if (!isLocalHost(hostname)) {
    const caller = getCallerInfo();
    logEntry(`resolve6:${hostname}`, caller);
  }
  if (typeof options === 'function') {
    return originalResolve6(hostname, options);
  }
  return originalResolve6(hostname, options, callback);
};

// ─── Monkey-patch dns.resolveMx (used by nodemailer) ─────────────────────────
const originalResolveMx = dns.resolveMx.bind(dns);
dns.resolveMx = function (hostname, callback) {
  if (!isLocalHost(hostname)) {
    const caller = getCallerInfo();
    logEntry(`resolveMx:${hostname}`, caller);
  }
  return originalResolveMx(hostname, callback);
};

// ─── On process exit: write summary report ───────────────────────────────────
function writeSummary() {
  if (dnsRecords.length === 0) return;

  // Group by hostname
  const byHost = {};
  const byModule = {};

  for (const r of dnsRecords) {
    byHost[r.hostname] = (byHost[r.hostname] || 0) + 1;
    byModule[r.module] = (byModule[r.module] || 0) + 1;
  }

  const sortedHosts = Object.entries(byHost).sort((a, b) => b[1] - a[1]);
  const sortedModules = Object.entries(byModule).sort((a, b) => b[1] - a[1]);

  let summary =
    `\n${'═'.repeat(60)}\n` +
    `  DNS REQUEST SUMMARY REPORT\n` +
    `  Generated: ${new Date().toISOString()}\n` +
    `  Total DNS Requests: ${dnsRecords.length}\n` +
    `${'═'.repeat(60)}\n\n` +
    `TOP HOSTNAMES (most resolved):\n` +
    `${'─'.repeat(40)}\n`;

  for (const [host, count] of sortedHosts) {
    summary += `  ${count.toString().padStart(4)}x  ${host}\n`;
  }

  summary +=
    `\nTOP MODULES (most DNS calls):\n` +
    `${'─'.repeat(40)}\n`;

  for (const [mod, count] of sortedModules) {
    summary += `  ${count.toString().padStart(4)}x  ${mod}\n`;
  }

  summary += `\n${'═'.repeat(60)}\n`;

  console.log(summary);
  fs.appendFileSync(LOG_FILE, summary, 'utf8');
}

process.on('exit', writeSummary);
process.on('SIGINT', () => { writeSummary(); process.exit(0); });
process.on('SIGTERM', () => { writeSummary(); process.exit(0); });

// ─── Init message ─────────────────────────────────────────────────────────────
const initMsg =
  `${'═'.repeat(60)}\n` +
  `  DNS LOGGER STARTED: ${new Date().toISOString()}\n` +
  `  Log file : ${LOG_FILE}\n` +
  `  JSON file: ${JSON_FILE}\n` +
  `${'═'.repeat(60)}\n\n`;

fs.appendFileSync(LOG_FILE, initMsg, 'utf8');
console.log(initMsg);

module.exports = {}; // just importing this file activates the logger
