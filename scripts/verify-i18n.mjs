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

// Ensure the landing CTA in the top navigation updates immediately when
// language changes, not only when landing content is first rendered.
const switchStart = html.indexOf('function setLanguage(lang, refreshDynamic = true)');
const nextFunction = html.indexOf('const API_BASE', switchStart);
const languageSwitch = html.slice(switchStart, nextFunction);
assert.ok(languageSwitch.indexOf('renderLanding();') > -1, 'Landing nav must update on language switch');
assert.ok(languageSwitch.indexOf('renderLanding();') < languageSwitch.indexOf('if (!refreshDynamic) return;'), 'Landing nav must update even without dynamic refresh');
for (const label of ['Znajdź dom we Włoszech', 'Find a home in Italy', 'Trova casa in Italia']) {
  assert.ok(html.includes(label), 'Missing landing navigation label: ' + label);
}

console.log('PASS: parsed ' + parsed + ' inline scripts, language routing and stale-response checks.');
