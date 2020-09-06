import * as React from 'react';
import { withKnobs, optionsKnob as options, number } from '@storybook/addon-knobs';
import Pipeline from '../components/pipeline/pipeline';
import Graphic from '../components/pipeline/graphic';
import Emissions from '../components/pipeline/emissions';

export default {
  title: 'Pipeline',
  decorators: [withKnobs]
}

const emissionsData = [
  {
    stage: 'cdn',  // and also data center
    emissions: 100
  },
  {
    stage: 'internet',
    emissions: 50
  },
  {
    stage: 'edge',
    emissions: 150
  },
  {
    stage: 'device',
    emissions: 200
  }
];

const knobs = () => {
  const stage = options('type', {
    datacenter: 'datacenter',
    cdn: 'cdn',
    internet: 'internet',
    edge: 'edge',
    device: 'device',
    all: 'all'
  }, 'datacenter', { display: 'inline-radio'});

  const progress = number('progress', 0, { range: true, min: 0, max: 100, step: 1});

  return { stage, progress };
}

export const graphic = () => {
  const { stage, progress } = knobs();
  return <Graphic stage={stage} progress={progress}/>
}

export const emissions = () => {
  const { stage, progress } = knobs();
  return <Emissions stage={stage} progress={progress} data={emissionsData} />
}
