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

const maxTime = data.reduce((max, d) => {
  return Math.max(max, d.packets.reduce((m, p) => {
    return Math.max(m, p.time)
  }, 0));
}, 0);

const mediaBarSpec = (title, hasQuality, last) => {
  return {
    resolve: {
      scale: { y: 'independent' }
    },
    facet: {
      row: {
        field: 'title',
        title: null
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
              title: "Carbon Emissions"
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

const mediaTimelineSpec = (title, hasQuality, last) => {
  return {
    resolve: {
      scale: { y: 'independent' }
    },
    facet: {
      row: {
        field: 'title',
        title: null
      }
    },
    spec: {
      layer: [
        {
          mark: { type: 'rule', color: '#E0E0E0', strokeWidth: 1 },
          encoding: {
            x: null
          }
        },
        {
          mark: { type: 'tick', color: '#E0E0E0', strokeWidth: 1, x: 0, height: 5 },
          encoding: { x: null }
        },
        {
          mark: { type: 'tick', color: '#E0E0E0', strokeWidth: 1, x: 200, height: 5 },
          encoding: { x: null }
        },
        {
          mark: { type: 'square', color: '#7FE8BC' }
        }
      ],
      encoding: {
        x: {
          field: 'time',
          type: 'quantitative',
          title: false,
          scale: {
            domain: [0, maxTime]
          },
          ...(last ? {
            axis: {
              title: "Time",
              domain: true,
              ticks: true,
              tickCount: 2,
              labels: true
            }
          }: {})
        },
        ...(hasQuality ?
          {
            y: {
              field: 'quality',
              type: 'nominal',
              axis: false
            }
          } : {
            y: { value: 0 }
          })
      }
    }
  }
};

const config = {
  style: {
    cell: {
      stroke: 'transparent'
    }
  },
  axisX: {
    titleColor: 'rgba(0, 0, 0, 0.51)',
    titleFontSize: 10,
    titlePadding: 10,
    grid: false,
    ticks: false,
    labels: false,
    domain: false,
    domainColor: '#F1F1F1',
    tickColor: '#F1F1F1',
    labelExpr: "datum.value + ' s'",
    labelColor: '#AAAAAA',
    labelPadding: 5
  },
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

const barSpec = {
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
      ...mediaBarSpec('Video', true, false)
    },
    {
      transform: [ { filter: 'datum.mediaType === "website"' }],
      ...mediaBarSpec('Website', false, false)
    },
    {
      transform: [ { filter: 'datum.mediaType === "audio"' }],
      ...mediaBarSpec('Audio', false, true)
    }
  ],
  config
};

const timelineSpec = {
  data: {
    values: data
  },
  transform: [
    { flatten: ['packets']},
    { calculate: 'datum.packets.size', as: 'packetSize' },
    { calculate: 'datum.packets.time', as: 'time' }
  ],
  vconcat: [
    {
      transform: [ { filter: 'datum.mediaType === "video"' }],
      ...mediaTimelineSpec('Video', true, false)
    },
    {
      transform: [ { filter: 'datum.mediaType === "website"' }],
      ...mediaTimelineSpec('Website', false, false)
    },
    {
      transform: [ { filter: 'datum.mediaType === "audio"' }],
      ...mediaTimelineSpec('Audio', false, true)
    }
  ],
  config
};

export const Aggregate = () => <VegaLite spec={barSpec} />
export const Timeline = () => <VegaLite spec={timelineSpec} />