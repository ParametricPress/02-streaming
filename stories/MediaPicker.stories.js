import React from 'react';
import { VegaLite } from 'react-vega';

export default {
  title: 'Media Picker',
};

const data = require('../data/dist/data.json');

const maxSize = data.reduce((max, d) => {
  return Math.max(max, d.packets.reduce((s, p) => {
    return s + p.size
  }, 0));
}, 0);

console.log(maxSize);

const mediaSpec = (title, hasQuality, last) => {
  return {
    resolve: {
      scale: { y: 'independent' }
    },
    facet: {
      row: {
        field: 'title',
        title: null,
        header: {
          labelAngle: 0,
          labelAnchor: 'start',
          labelAlign: 'left',
          labelOrient: 'top',
          labelPadding: -8,
          labelFontWeight: 400,
          labelFontSize: 10
        }
      }
    },
    spec: {
      layer: [
        {
          mark: { type: 'bar', color: '#7FE8BC' }
        },
        {
          mark: {
            type: 'text',
            align: 'left',
            dx: 4,
            dy: 1,
            baseline: 'middle',
            color: '#AAAAAA',
            text: { signal: 'round(datum.size * 1000) / 10 + " mg"'}
          },
        },
        {
          transform: [
            { calculate: 'datum.quality && scale("concat_0_x", datum.size) > 25', as: 'showQuality' }
          ],
          mark: {
            type: 'text',
            align: 'left',
            x: 4,
            text: { signal: 'datum.showQuality ? datum.quality + "p" : ""'},
            color: '#FFFFFF',
            fontSize: 9
          },
          encoding: {
            x: null
          }
        }
      ],
      encoding: {
        x: {
          field: 'size',
          type: 'quantitative',
          title: false,
          scale: {
            domainMax: maxSize
          },
          ...(last ? {
            axis: {
              title: "Carbon Emissions",
              titleColor: 'rgba(0, 0, 0, 0.51)',
              titleFontSize: 10,
              titlePadding: 10,
              grid: false,
              ticks: false,
              labels: false,
              domain: false,
              domainColor: '#F1F1F1'
            }
          } : {axis: false})
        },
        ...(hasQuality ?
          {
            y: {
              field: 'quality',
              type: 'nominal',
              axis: false
            }
          } : {})
      }
    }
  };
};

const spec = {
  data: {
    values: data
  },
  transform: [
    { calculate: 'datum.quality ? datum.title + " (" + datum.quality + "p)" : datum.title', as: 'source' },
    { flatten: ['packets']},
    {
      calculate: 'datum.packets.size', as: 'packetSize'
    },
    {
      aggregate: [{op: 'sum', field: 'packetSize', as: 'size'}],
      groupby: ['mediaType', 'title', 'quality']
    }
  ],
  vconcat: [
    {
      transform: [ { filter: 'datum.mediaType === "video"' }],
      ...mediaSpec('Video', true, false)
    },
    {
      transform: [ { filter: 'datum.mediaType === "website"' }],
      ...mediaSpec('Website', false, false)
    },
    {
      transform: [ { filter: 'datum.mediaType === "audio"' }],
      ...mediaSpec('Audio', false, true)
    }
  ],
  config: {
    style: {
      cell: {
        stroke: 'transparent'
      }
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