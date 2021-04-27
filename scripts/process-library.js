const fs = require('fs');
const path = require('path');
const glob = require('glob');

const libraryPath = path.join(__dirname, '../library');
const musicPath = path.join(__dirname, '../public/music');

const out = [];

const libraries = glob.sync(path.join(libraryPath, '/**/library.json'));
for (let libraryFile of libraries) {
  const libraryBase = path.dirname(libraryFile);

  const library = JSON.parse(fs.readFileSync(libraryFile));
  const tracks = glob.sync(path.join(libraryBase, '/**/track.json'));

  const {name} = library;
  console.log(`Library: ${name}`);
  console.log(`Tracks: ${tracks.length}`);

  out.push(library);
  library.tracks = [];

  tracks.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
  for (let trackFile of tracks) {
    const trackBase = path.dirname(trackFile);

    const track = JSON.parse(fs.readFileSync(trackFile));
    const {name, files} = track;

    console.log(`Track: ${name}`);
    console.log(`Files: ${files.length}`);

    for (let fileName of files) {
      const srcPath = path.join(trackBase, fileName);
      const dstPath = path.join(musicPath, fileName);
      fs.copyFileSync(srcPath, dstPath);
    }

    library.tracks.push(track);
  }
}

const outPath = path.join(__dirname, '../src/library.json');
fs.writeFileSync(outPath, JSON.stringify(out));
