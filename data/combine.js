const fs = require('fs');
const path = require('path');

const data = [];

const datadir = path.resolve(__dirname);

const files = fs.readdirSync(datadir);

files.forEach(f => {
  if (f.endsWith('json')) {
    const packets = JSON.parse(fs.readFileSync(f));
    const name = f.slice(0, f.indexOf('.json'));

    data.push({
      name,
      packets
    });
  }
});

const outpath = path.resolve(__dirname, 'dist', 'data.json');

fs.writeFileSync(outpath, JSON.stringify(data, null, 2));