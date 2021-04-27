const fs = require('fs');
const path = require('path');
const glob = require('glob');

const sanitizeId = (id) => ('' + id).replace(/[^A-Za-z0-9-]+/g, '');

const albumPath = path.join(__dirname, '../music');
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

const libraries = glob.sync(path.join(albumPath, '/**/album.json'));
for (let albumFile of libraries) {
  const albumBase = path.dirname(albumFile);

  const album = JSON.parse(fs.readFileSync(albumFile));
  const tracks = glob.sync(path.join(albumBase, '/**/track.json'));

  const {meta: {name}, art} = album;
  console.log(`Album: ${name}`);
  console.log(`Tracks: ${tracks.length}`);

  const id = album.id = album.id ? sanitizeId(album.id) : `${++i}`;
  const outputBase = path.join(outPath, id);
  fs.mkdirSync(outputBase, {recursive: true});

  out.push(album);
  album.tracks = [];

  const [artIndex] = glob.sync(path.join(albumBase, 'art/index.html'));
  const artFiles = glob.sync(path.join(albumBase, 'art/*'));

  if (artIndex) {
    album.art = `index.html`;

    for (let artFile of artFiles) {
      const fileName = path.basename(artFile);
      copyFile(artFile, path.join(outputBase, fileName));
    }
  }

  tracks.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
  for (let trackFile of tracks) {
    const trackBase = path.dirname(trackFile);

    const track = JSON.parse(fs.readFileSync(trackFile));
    const {meta: {name}, files} = track;

    console.log(`Track: ${name}`);
    console.log(`Files: ${files.length}`);

    for (let fileName of files) {
      copyFile(path.join(trackBase, fileName), path.join(outputBase, fileName));
    }

    album.tracks.push(track);
  }
}

const jsonPath = path.join(__dirname, '../src/albums.json');
fs.writeFileSync(jsonPath, JSON.stringify(out));
