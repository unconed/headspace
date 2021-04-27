const fs = require('fs');
const path = require('path');
const glob = require('glob');

const sanitizeId = (id) => ('' + id).replace(/[^A-Za-z0-9-]+/g, '');

const libraryPath = path.join(__dirname, '../library');
const outPath = path.join(__dirname, '../public/music');

const copyFile = (srcPath, dstPath) => {
  try {
    fs.copyFileSync(srcPath, dstPath);
  } catch (e) {
    console.error(`Failed to copy file from ${srcPath} to ${dstPath}`);
    console.error(e.stack);
  }
}

const out = [];
let i = 0;

const libraries = glob.sync(path.join(libraryPath, '/**/library.json'));
for (let libraryFile of libraries) {
  const libraryBase = path.dirname(libraryFile);

  const library = JSON.parse(fs.readFileSync(libraryFile));
  const tracks = glob.sync(path.join(libraryBase, '/**/track.json'));

  const {name, art} = library;
  console.log(`Library: ${name}`);
  console.log(`Tracks: ${tracks.length}`);

  const id = library.id = library.id ? sanitizeId(library.id) : `${++i}`;
  const outputBase = path.join(outPath, id);
  fs.mkdirSync(outputBase, {recursive: true});

  out.push(library);
  library.tracks = [];

  const [artIndex] = glob.sync(path.join(libraryBase, 'art/index.html'));
  const artFiles = glob.sync(path.join(libraryBase, 'art/*'));

  if (artIndex) {
    library.art = `index.html`;

    for (let artFile of artFiles) {
      const fileName = path.basename(artFile);
      copyFile(artFile, path.join(outputBase, fileName));
    }
  }

  tracks.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
  for (let trackFile of tracks) {
    const trackBase = path.dirname(trackFile);

    const track = JSON.parse(fs.readFileSync(trackFile));
    const {name, files} = track;

    console.log(`Track: ${name}`);
    console.log(`Files: ${files.length}`);

    for (let fileName of files) {
      copyFile(path.join(trackBase, fileName), path.join(outputBase, fileName));
    }

    library.tracks.push(track);
  }
}

const jsonPath = path.join(__dirname, '../src/libraries.json');
fs.writeFileSync(jsonPath, JSON.stringify(out));
