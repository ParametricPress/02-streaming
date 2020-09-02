import * as React from 'react';
import { withKnobs, optionsKnob as options, number } from '@storybook/addon-knobs';
import Pipeline from '../components/pipeline/pipeline';

export default {
  title: 'Pipeline',
  decorators: [withKnobs]
}

export const pipeline = () => {
  const stage = options('type', {
    datacenter: 'datacenter',
    cdn: 'cdn',
    internet: 'internet',
    edge: 'edge',
    device: 'device'
  }, 'datacenter', { display: 'inline-radio'});

  const progress = number('progress', 0, { range: true, min: 0, max: 100, step: 1});
  return <Pipeline stage={stage} progress={progress}/>
}
