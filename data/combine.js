const fs = require('fs');
const path = require('path');

let data = [];

const datadir = path.resolve(__dirname);

const files = fs.readdirSync(datadir);

files.forEach(f => {
  if (f.endsWith('json')) {
    const d = JSON.parse(fs.readFileSync(path.resolve(datadir,f)));

    if (d.media) {
      data.push({
        mediaType: d.media.type,
        title: d.media.title,
        ...(d.media.quality ? { quality: d.media.quality } : {}),
        packets: d.data
      });
    }
  }
});

const nolist = [
  'Digging into American Dirt (podcast) (old)',
  'Righteous (song)',
  'Slideshow',
  'Dr Strange Trailer',
  'The Daily (podcast)'
]

data = data.filter(d => !nolist.includes(d.title));

const outpath = path.resolve(__dirname, 'dist', 'media-emissions.json');

fs.writeFileSync(outpath, JSON.stringify(data, null, 2));