import React from 'react';
import { VegaLite } from 'react-vega';

export default {
  title: 'Media Picker',
};

const data = require('../data/dist/data.json');

console.log(data);
const spec = {
  data: {
    values: data
  },
  transform: [ { flatten: ['packets']}],
  mark: 'bar',
  encoding: {
    x: {
      field: 'packets.size',
      type: 'quantitative',
      aggregate: 'sum'
    },
    y: {
      field: 'title',
      type: 'nominal'
    }
  }
}

class VLMediaPicker extends React.Component {
  render() {
    return (
      <VegaLite spec={spec} />
    );
  }
}

export const MediaPicker = () => <VLMediaPicker />