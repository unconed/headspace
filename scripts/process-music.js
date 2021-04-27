const fs = require('fs');
const path = require('path');
const glob = require('glob');

const sanitizeId = (id) => ('' + id).replace(/[^A-Za-z0-9-]+/g, '');

// Gather individual album & track.json into albums.json
const albumPath = path.join(__dirname, '../music');
const outPath = path.join(__dirname, '../public/music');

// Tolerant copy
const copyFile = (srcPath, dstPath) => {
  try {
    fs.copyFileSync(srcPath, dstPath);
  } catch (e) {
    console.error(`Error copying ${srcPath} to ${dstPath}`);
    console.error(e.message);
  }
}

const out = [];
let i = 0;

// Find all album.jsons
const albums = glob.sync(path.join(albumPath, '/**/album.json'));
for (let albumFile of albums) {
  const albumBase = path.dirname(albumFile);

  // Find all track.jsons
  const album = JSON.parse(fs.readFileSync(albumFile));
  const tracks = glob.sync(path.join(albumBase, '/**/track.json'));

  const {meta: {name}, art} = album;
  console.log(`Album: ${name}`);
  console.log(`Tracks: ${tracks.length}`);

  // Prepare output path music/$id
  const id = album.id = album.id ? sanitizeId(album.id) : `${++i}`;
  const outputBase = path.join(outPath, id);
  fs.mkdirSync(outputBase, {recursive: true});

  out.push(album);
  album.tracks = [];

  // Gather art
  const [artIndex] = glob.sync(path.join(albumBase, 'art/index.html'));
  const artFiles = glob.sync(path.join(albumBase, 'art/*'));

  if (artIndex) {
    album.art = `index.html`;

    for (let artFile of artFiles) {
      const fileName = path.basename(artFile);
      copyFile(artFile, path.join(outputBase, fileName));
    }
  }

  // Gather tracks
  tracks.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
  for (let trackFile of tracks) {
    const trackBase = path.dirname(trackFile);

    const track = JSON.parse(fs.readFileSync(trackFile));
    delete track.type;

    const {meta: {name}, files} = track;

    console.log(`Track: ${name}`);
    console.log(`Files: ${files.length}`);

    for (let fileName of files) {
      copyFile(path.join(trackBase, fileName), path.join(outputBase, fileName));
    }

    album.tracks.push(track);
  }

  const jsonPath = path.join(outputBase, 'album.json');
  fs.writeFileSync(jsonPath, JSON.stringify(album));
}

const jsonPath = path.join(__dirname, '../src/albums.json');
fs.writeFileSync(jsonPath, JSON.stringify(out));
