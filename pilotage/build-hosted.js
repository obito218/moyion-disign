#!/usr/bin/env node
'use strict';
// Construit la version publiée (claude.ai) du dashboard : pilotage/hosted/index.html.
// Même interface et même logique que la version locale ; seules les données changent de place
// (base de données de l'artifact au lieu des fichiers JSON).
// Usage : node pilotage/build-hosted.js

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = (p) => fs.readFileSync(path.join(dir, p), 'utf8');
const html = read('public/index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/\s*<script src="[^"]+"><\/script>/g, '');
const css = read('public/styles.css')
  .replace('position: sticky; top: 0; height: 100vh;', 'position: sticky; top: env(safe-area-inset-top, 0px); height: 100vh;')
  + '\n:root { color-scheme: light; }\n';
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');

const out = `<title>MURELLE · Pilotage</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>
${css}</style>
${body.trim()}
<script>window.PILOTAGE_HOSTED = true;</script>
<script>
${safe(read('lib/model.js'))}
</script>
<script>
${safe(read('public/app.js'))}
</script>
`;

fs.mkdirSync(path.join(dir, 'hosted'), { recursive: true });
fs.writeFileSync(path.join(dir, 'hosted', 'index.html'), out);
console.log(`hosted/index.html écrit (${Math.round(out.length / 1024)} Ko)`);
