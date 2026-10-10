// Builds docs/assets/architecture.svg and architecture-dark.svg following the diagram-design
// skill (Architecture type, doc-inline 960x600, orthogonal connectors, legend strip),
// skinned with the portfolio palette (Tailwind slate + indigo). System fonts only, because
// GitHub renders README SVGs as <img>, where web fonts cannot load.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Usage: node docs/diagrams/build-architecture.mjs  (writes docs/assets/architecture*.svg)
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');

const SKINS = {
  light: {
    slug: 'architecture', paper: '#f8fafc', node: '#ffffff', ink: '#1e293b', muted: '#475569', soft: '#64748b',
    rule: 'rgba(30,41,59,0.10)', zoneFill: 'rgba(30,41,59,0.02)', dots: 'rgba(30,41,59,0.10)',
    accent: '#4f46e5', accentTint: 'rgba(79,70,229,0.08)', link: '#0369a1',
    sut: 'rgba(71,85,105,0.08)', sutStroke: '#64748b', ci: 'rgba(30,41,59,0.04)', ciStroke: 'rgba(30,41,59,0.35)',
  },
  dark: {
    slug: 'architecture-dark', paper: '#0f172a', node: '#111c33', ink: '#f1f5f9', muted: '#94a3b8', soft: '#94a3b8',
    rule: 'rgba(241,245,249,0.12)', zoneFill: 'rgba(241,245,249,0.02)', dots: 'rgba(241,245,249,0.07)',
    accent: '#818cf8', accentTint: 'rgba(129,140,248,0.12)', link: '#38bdf8',
    sut: 'rgba(148,163,184,0.10)', sutStroke: '#94a3b8', ci: 'rgba(241,245,249,0.04)', ciStroke: 'rgba(241,245,249,0.35)',
  },
};

const SANS = "'Onest', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Menlo, Consolas, monospace";

// Nodes: x, y, w, h on the 4px grid. kind -> treatment.
const NODES = {
  ci:      { x: 40,  y: 228, w: 144, h: 56, kind: 'ci',     tag: 'CI',     name: 'GitHub Actions',        sub: 'push · PR · gitleaks' },
  reports: { x: 40,  y: 380, w: 144, h: 56, kind: 'ci',     tag: 'OUT',    name: 'Published reports',     sub: 'Pages · Gradle' },
  uiSpecs: { x: 232, y: 112, w: 152, h: 56, kind: 'code',   tag: 'SPEC',   name: 'UI specs',              sub: '28 tests · TypeScript' },
  pages:   { x: 432, y: 112, w: 160, h: 56, kind: 'code',   tag: 'POM',    name: 'Page objects',          sub: 'pages · components' },
  setup:   { x: 432, y: 208, w: 160, h: 56, kind: 'focal',  tag: 'SETUP',  name: 'Fixtures + API helpers', sub: 'newCustomer · loggedIn' },
  apiTests:{ x: 232, y: 380, w: 152, h: 56, kind: 'code',   tag: 'SPEC',   name: 'API tests',             sub: '32 tests · JUnit 6' },
  clients: { x: 432, y: 380, w: 160, h: 56, kind: 'code',   tag: 'CLIENT', name: 'Resource clients',      sub: 'RequestSpecs · records' },
  sutUi:   { x: 736, y: 112, w: 168, h: 56, kind: 'sut',    tag: 'SUT',    name: 'Toolshop UI',           sub: 'Angular' },
  sutApi:  { x: 736, y: 272, w: 168, h: 72, kind: 'sut',    tag: 'SUT',    name: 'Toolshop REST API',     sub: 'Laravel · JSON' },
};

const ZONES = [
  { x: 216, y: 80,  w: 392, h: 200, label: 'UI SUITE · PLAYWRIGHT' },
  { x: 216, y: 348, w: 392, h: 104, label: 'API SUITE · RESTASSURED' },
  { x: 720, y: 80,  w: 200, h: 280, label: 'SYSTEM UNDER TEST' },
];

// Connectors (drawn before nodes). style: muted | accent | link | dashed
const ARROWS = [
  { d: 'M 184,244 H 200 Q 208,244 208,236 V 148 Q 208,140 216,140 H 232', style: 'muted' },          // CI -> UI specs
  { d: 'M 184,268 H 200 Q 208,268 208,276 V 400 Q 208,408 216,408 H 232', style: 'muted' },          // CI -> API tests
  { d: 'M 112,284 V 380', style: 'dashed' },                                                           // CI -> reports
  { d: 'M 384,132 H 432', style: 'muted' },                                                            // UI specs -> page objects
  { d: 'M 384,152 H 404 Q 412,152 412,160 V 228 Q 412,236 420,236 H 432', style: 'muted' },           // UI specs -> fixtures
  { d: 'M 592,140 H 736', style: 'muted' },                                                            // page objects -> UI
  { d: 'M 592,236 H 640 Q 648,236 648,244 V 288 Q 648,296 656,296 H 736', style: 'accent' },          // fixtures -> REST API
  { d: 'M 384,408 H 432', style: 'muted' },                                                            // API tests -> clients
  { d: 'M 592,408 H 664 Q 672,408 672,400 V 328 Q 672,320 680,320 H 736', style: 'link' },            // clients -> REST API
];

// Arrow labels: centered at (cx, cy), width w. Gap from the stroke 6-10px.
const LABELS = [
  { cx: 664, cy: 126, w: 56, text: 'BROWSER',    style: 'muted' },   // above the y=140 line (mask 120-132, gap 8)
  { cx: 688, cy: 266, w: 64, text: 'SETUP DATA', style: 'accent' },  // right of x=648 segment (mask 656-720, gap 8)
  { cx: 700, cy: 364, w: 40, text: 'HTTP',       style: 'link' },    // right of x=672 segment (mask 680-720, gap 8)
  { cx: 148, cy: 332, w: 56, text: 'PUBLISH',    style: 'muted' },   // right of x=112 segment (mask 120-176, gap 8)
];

const LEGEND = [
  { kind: 'focal', text: 'Focal: test data set up through the API' },
  { kind: 'code',  text: 'Test code' },
  { kind: 'sut',   text: 'System under test' },
  { kind: 'ci',    text: 'Pipeline / output' },
];

function treatment(s, kind) {
  switch (kind) {
    case 'focal': return { fill: s.accentTint, stroke: s.accent, tag: s.accent };
    case 'code':  return { fill: s.node, stroke: s.ink, tag: s.ink };
    case 'sut':   return { fill: s.sut, stroke: s.sutStroke, tag: s.muted };
    default:      return { fill: s.ci, stroke: s.ciStroke, tag: s.muted };
  }
}

function svg(s) {
  const color = { muted: s.muted, accent: s.accent, link: s.link, dashed: s.muted };
  const marker = { muted: 'arrow', accent: 'arrow-accent', link: 'arrow-link', dashed: 'arrow' };
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600" role="img" aria-labelledby="${s.slug}-title ${s.slug}-desc">`);
  out.push(`<title id="${s.slug}-title">QA Automation Showcase architecture</title>`);
  out.push(`<desc id="${s.slug}-desc">GitHub Actions runs a Playwright UI suite and a RestAssured API suite against Toolshop; the UI suite sets up its test data through the Toolshop API, and reports are published to GitHub Pages.</desc>`);
  out.push('<defs>');
  out.push(`<pattern id="${s.slug}-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="${s.dots}"/></pattern>`);
  for (const [id, c] of [['arrow', s.muted], ['arrow-accent', s.accent], ['arrow-link', s.link]]) {
    out.push(`<marker id="${s.slug}-${id}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${c}"/></marker>`);
  }
  out.push('</defs>');
  out.push(`<rect width="960" height="600" fill="${s.paper}"/>`);
  out.push(`<rect width="960" height="600" fill="url(#${s.slug}-dots)" opacity="0.6"/>`);

  // Diagram body, shifted down 20px to balance the space above it and the legend below.
  out.push('<g transform="translate(0,20)">');
  // Zones
  for (const z of ZONES) {
    const lw = z.label.length * 5.6 + 16;
    out.push(`<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8" fill="${s.zoneFill}" stroke="${s.rule}" stroke-width="0.8"/>`);
    out.push(`<rect x="${z.x + 12}" y="${z.y + 4}" width="${lw}" height="12" rx="2" fill="${s.paper}"/>`);
    out.push(`<text x="${z.x + 12 + lw / 2}" y="${z.y + 13}" fill="${s.soft}" font-size="8" font-family="${MONO}" text-anchor="middle" letter-spacing="0.14em">${z.label}</text>`);
  }

  // Arrows (behind nodes)
  for (const a of ARROWS) {
    const dash = a.style === 'dashed' ? ' stroke-dasharray="4,3"' : '';
    const width = a.style === 'accent' ? 1.6 : a.style === 'dashed' ? 1 : 1.2;
    out.push(`<path d="${a.d}" fill="none" stroke="${color[a.style]}" stroke-width="${width}"${dash} marker-end="url(#${s.slug}-${marker[a.style]})"/>`);
  }
  for (const l of LABELS) {
    out.push(`<rect x="${l.cx - l.w / 2}" y="${l.cy - 6}" width="${l.w}" height="12" rx="2" fill="${s.paper}"/>`);
    out.push(`<text x="${l.cx}" y="${l.cy + 3}" fill="${color[l.style]}" font-size="8" font-family="${MONO}" text-anchor="middle" letter-spacing="0.08em">${l.text}</text>`);
  }

  // Nodes
  for (const n of Object.values(NODES)) {
    const t = treatment(s, n.kind);
    const cx = n.x + n.w / 2;
    const tagW = n.tag.length * 5 + 10;
    const nameY = n.y + n.h / 2 + (n.h > 56 ? 6 : 6);
    out.push(`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="6" fill="${s.paper}"/>`);
    out.push(`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="6" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1"/>`);
    out.push(`<rect x="${n.x + 8}" y="${n.y + 8}" width="${tagW}" height="12" rx="2" fill="none" stroke="${t.tag}" stroke-opacity="0.5" stroke-width="0.8"/>`);
    out.push(`<text x="${n.x + 8 + tagW / 2}" y="${n.y + 17}" fill="${t.tag}" font-size="7" font-family="${MONO}" text-anchor="middle" letter-spacing="0.08em">${n.tag}</text>`);
    out.push(`<text x="${cx}" y="${nameY + (n.h > 56 ? 4 : 0)}" fill="${s.ink}" font-size="12" font-weight="600" font-family="${SANS}" text-anchor="middle">${n.name}</text>`);
    out.push(`<text x="${cx}" y="${nameY + 16 + (n.h > 56 ? 4 : 0)}" fill="${s.muted}" font-size="9" font-family="${MONO}" text-anchor="middle">${n.sub}</text>`);
  }

  out.push('</g>');
  // Legend strip (bottom 60px)
  out.push(`<line x1="40" y1="516" x2="920" y2="516" stroke="${s.rule}" stroke-width="0.8"/>`);
  out.push(`<text x="40" y="536" fill="${s.muted}" font-size="8" font-family="${MONO}" letter-spacing="0.18em">LEGEND</text>`);
  let x = 40;
  for (const item of LEGEND) {
    const t = treatment(s, item.kind);
    out.push(`<rect x="${x}" y="552" width="14" height="10" rx="2" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1"/>`);
    out.push(`<text x="${x + 20}" y="560" fill="${s.muted}" font-size="9" font-family="${SANS}">${item.text}</text>`);
    x += 20 + item.text.length * 4.2 + 24;
  }
  // Connector legend
  const conn = [['muted', 'Calls'], ['link', 'HTTP'], ['dashed', 'Publishes']];
  for (const [style, text] of conn) {
    const dash = style === 'dashed' ? ' stroke-dasharray="4,3"' : '';
    out.push(`<line x1="${x}" y1="557" x2="${x + 24}" y2="557" stroke="${color[style]}" stroke-width="1.2"${dash} marker-end="url(#${s.slug}-${marker[style]})"/>`);
    out.push(`<text x="${x + 32}" y="560" fill="${s.muted}" font-size="9" font-family="${SANS}">${text}</text>`);
    x += 32 + text.length * 4.2 + 20;
  }
  out.push('</svg>');
  return out.join('\n') + '\n';
}

for (const s of Object.values(SKINS)) {
  fs.writeFileSync(`${OUT}/${s.slug}.svg`, svg(s));
  console.log('wrote', `${s.slug}.svg`);
}
