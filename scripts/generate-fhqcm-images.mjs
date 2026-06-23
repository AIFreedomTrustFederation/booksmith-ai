import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'books/fhqcm/assets/images';
const manifestPath = join(root, 'manifest', 'image-manifest.md');
const manifest = readFileSync(manifestPath, 'utf8');

for (const dir of ['source', 'web', 'print', 'thumbnails']) {
  mkdirSync(join(root, dir), { recursive: true });
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function text(value, x, y, size = 40, fill = '#f8fafc') {
  return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-family="Georgia,serif" font-size="${size}">${escapeXml(value)}</text>`;
}

function node(value, x, y) {
  return `<rect x="${x - 155}" y="${y - 38}" width="310" height="76" rx="22" fill="#111827" stroke="#d7b56d" stroke-width="3"/>${text(value, x, y + 10, 22)}`;
}

function makeSvg(id, slug) {
  const title = titleFromSlug(slug);
  const words = ['Source', 'Pattern', 'Field', 'Relation', 'Coherence', 'Return'];
  const points = [[800,230],[1110,390],[1035,710],[800,835],[565,710],[490,390]];
  let body = '';
  body += `<circle cx="800" cy="525" r="285" fill="none" stroke="#d7b56d" stroke-width="5" opacity="0.78"/>`;
  body += `<circle cx="800" cy="525" r="140" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.72"/>`;
  body += `<path d="M800 185 C1220 285 1220 765 800 890 C380 765 380 285 800 185" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.65"/>`;
  points.forEach(([x, y], index) => { body += node(words[index], x, y); });
  body += text(id, 800, 505, 56, '#d7b56d');
  body += text(title, 800, 565, 34);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(id)} ${escapeXml(title)}</title>
  <desc id="desc">Draft FHQCM visual canon figure for ${escapeXml(title)}.</desc>
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#172554"/>
      <stop offset="55%" stop-color="#0b1020"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  ${text(`${id} — ${title}`, 800, 92, 48)}
  ${text('FHQCM Visual Canon · AI Freedom Trust Publishing · BookSmith AI', 800, 145, 23, '#d7b56d')}
  ${body}
</svg>`;
}

const rows = [...manifest.matchAll(/^\| (F\d{3}) \| ([a-z0-9-]+) \|/gm)].map((match) => ({ id: match[1], slug: match[2] }));

for (const row of rows) {
  const svg = makeSvg(row.id, row.slug);
  const filename = `${row.id}-${row.slug}.svg`;
  for (const dir of ['source', 'web', 'print', 'thumbnails']) {
    writeFileSync(join(root, dir, filename), svg, 'utf8');
  }
}

console.log(`Generated ${rows.length} FHQCM SVG figures from ${manifestPath}.`);
