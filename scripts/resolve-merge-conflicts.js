/**
 * Remove git conflict markers, keeping the last branch section (after final =======).
 */
const fs = require('fs');
const path = require('path');

const files = [
  'app/admin/rentals.tsx',
  'app/rent/[id].tsx',
  'app/contract/[id].tsx',
  'hooks/useReservations.ts',
  'services/reservationsService.ts',
  'services/ContractPdf.tsx',
];

function resolveContent(text) {
  let changed = true;
  let result = text;

  while (changed) {
    changed = false;
    const start = result.indexOf('<<<<<<<');
    if (start === -1) break;

    const end = result.indexOf('\n>>>>>>>', start);
    if (end === -1) break;

    const blockEnd = result.indexOf('\n', end + 1);
    const block = result.slice(start, blockEnd === -1 ? undefined : blockEnd + 1);
    const inner = block.replace(/^<<<<<<<[^\n]*\n/, '').replace(/\n>>>>>>>[^\n]*\n?$/, '');

    const parts = [];
    let current = '';
    for (const line of inner.split(/\r?\n/)) {
      if (line.startsWith('=======')) {
        parts.push(current);
        current = '';
      } else {
        if (current) current += '\n';
        current += line;
      }
    }
    parts.push(current);

    const chosen = (parts[parts.length - 1] || '').replace(/^\n/, '');
    result = result.slice(0, start) + chosen + (blockEnd === -1 ? '' : result.slice(blockEnd + 1));
    changed = true;
  }

  // Orphan markers (nested resolution leftovers)
  result = result
    .split(/\r?\n/)
    .filter((line) => !/^<<<<<<<|^=======|^>>>>>>>/.test(line))
    .join('\n');

  return result;
}

const root = path.join(__dirname, '..');
for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) continue;
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.includes('<<<<<<<') && !raw.includes('=======') && !raw.includes('>>>>>>>')) continue;
  const resolved = resolveContent(raw);
  fs.writeFileSync(filePath, resolved, 'utf8');
  console.log('Resolved:', rel);
}
