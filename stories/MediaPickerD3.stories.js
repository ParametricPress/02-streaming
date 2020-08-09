import * as React from 'react';
import MediaStrip from '../components/media-picker/mediaStrip';
import { scaleLinear } from '@vx/scale';
import { withKnobs, boolean } from '@storybook/addon-knobs';

export default {
  title: 'Media Picker (D3)',
  decorators: [withKnobs]
}

const data = require('../data/dist/data.json');
const strip = data[0].packets;
const sum = strip.reduce((s, d) => {
  d.cumulative = s;
  return s + d.size;
}, 0);

const timeScale = scaleLinear({
  range: [0, 200],
  round: true,
  domain: [0, 60]
});

const stackScale = scaleLinear({
  range: [0, 200],
  round: true,
  domain: [0, sum]
})

export const stripTimeline = () => {
  return (
    <svg width={200} height={100}>
      <MediaStrip type="timeline" data={strip} rectX={d => timeScale(d.time)} rectWidth={d => 8} rectHeight={d => 8}/>
    </svg>
  );
};

export const stripBar = () => {
  return (
    <svg width={200} height={100}>
      <MediaStrip type="bar" data={strip} rectX={d => stackScale(d.cumulative)} rectWidth={d => stackScale(d.size)} rectHeight={d => 8} />
    </svg>
  )
}

export const both = () => {
  const bar = boolean('bar', true);
  return (
    <svg width={200} height={100}>
      <MediaStrip
        type={bar ? 'bar' : 'timeline' }
        data={strip}
        rectX={d => bar ? stackScale(d.cumulative) : timeScale(d.time)}
        rectWidth={d => bar ? stackScale(d.size) : 8}
        rectHeight={d => 8} />
    </svg>
  )
}