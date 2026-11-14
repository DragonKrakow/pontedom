import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]).filter(Boolean);
let parsed = 0;
for (const source of scripts) {
  new Script(source);
  parsed++;
}
assert.ok(parsed >= 2, 'Expected inline JS scripts');
assert.match(html, /api\/listings\?lang=\$\{encodeURIComponent\(requestedLanguage\)\}/);
assert.match(html, /requestSequence !== remoteListingsState\.requestSequence/);
assert.match(html, /withListingLanguage\(\x60\$\{API_BASE\}\/listings\//);
assert.match(html, /item\?\.localizedTitle/);
assert.match(html, /item\?\.localizedDescription/);
assert.match(html, /document\.documentElement\.lang = lang/);
assert.match(html, /function setLanguage\(lang/);
console.log('PASS: parsed ' + parsed + ' inline scripts, language routing and stale-response checks.');
