import fs from 'fs';

// Netscape bookmark format parser (Chrome/Edge export)
// Usage: node scripts/parse_bookmarks.mjs "/path/to/bookmarks.html"

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/parse_bookmarks.mjs "/path/to/bookmarks.html"');
  process.exit(2);
}

const html = fs.readFileSync(file, 'utf8');

function decodeHtml(s) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

// Tokenize H3 (folder) and A (bookmark) and DL open/close
const tokens = [];
const re = /<DL><p>|<\/DL><p>|<DT><H3\b([^>]*)>([\s\S]*?)<\/H3>|<DT><A\b([^>]*)>([\s\S]*?)<\/A>/gi;
let m;
while ((m = re.exec(html))) {
  if (m[0].toUpperCase().startsWith('<DL')) {
    tokens.push({ type: 'DL_OPEN' });
  } else if (m[0].toUpperCase().startsWith('</DL')) {
    tokens.push({ type: 'DL_CLOSE' });
  } else if (m[0].toUpperCase().includes('<DT><H3')) {
    tokens.push({ type: 'FOLDER', attrs: m[1] || '', title: decodeHtml((m[2] || '').trim()) });
  } else if (m[0].toUpperCase().includes('<DT><A')) {
    tokens.push({ type: 'BOOKMARK', attrs: m[3] || '', title: decodeHtml((m[4] || '').trim()) });
  }
}

function getAttr(attrs, name) {
  const r = new RegExp(`\\b${name}=\"([^\"]*)\"`, 'i');
  const mm = attrs.match(r);
  return mm ? mm[1] : null;
}

const root = { type: 'folder', title: 'ROOT', children: [] };
const stack = [root];
let pendingFolder = null;

for (const t of tokens) {
  if (t.type === 'FOLDER') {
    pendingFolder = { type: 'folder', title: t.title, children: [] };
    stack[stack.length - 1].children.push(pendingFolder);
  } else if (t.type === 'BOOKMARK') {
    stack[stack.length - 1].children.push({
      type: 'bookmark',
      title: t.title,
      href: getAttr(t.attrs, 'HREF') || '',
      addDate: getAttr(t.attrs, 'ADD_DATE'),
      icon: getAttr(t.attrs, 'ICON'),
    });
  } else if (t.type === 'DL_OPEN') {
    // In Netscape format, a folder title is followed by <DL><p> containing its children
    if (pendingFolder) {
      stack.push(pendingFolder);
      pendingFolder = null;
    }
  } else if (t.type === 'DL_CLOSE') {
    if (stack.length > 1) stack.pop();
  }
}

// Convert to your app’s "group" model suggestion:
// group: { name, tags, bgImages, description, addreamUrl: [{title, link, icon}] }
function toGroups(node, path = []) {
  const groups = [];
  if (node.type !== 'folder') return groups;
  for (const child of node.children) {
    if (child.type === 'folder') {
      // Treat folders under "书签栏" as groups; deeper folders become tags/path
      const nextPath = [...path, child.title];
      // collect direct bookmarks as urls
      const urls = child.children
        .filter((x) => x.type === 'bookmark')
        .map((b) => ({ title: b.title, link: b.href, icon: b.icon || '' }));
      groups.push({
        name: child.title,
        tags: path.length ? [...path] : [],
        bgImages: '',
        description: '',
        addreamUrl: urls,
      });
      groups.push(...toGroups(child, nextPath));
    }
  }
  return groups;
}

const groups = toGroups(root.children.find((n) => n.type === 'folder' && n.title === '书签栏') || root, []);

const out = {
  meta: {
    file,
    tokenCount: tokens.length,
    groupCount: groups.length,
  },
  tree: root,
  groups,
};

console.log(JSON.stringify(out, null, 2));

