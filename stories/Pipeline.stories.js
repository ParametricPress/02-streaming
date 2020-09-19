import * as React from 'react';
import { withKnobs, optionsKnob as options, number } from '@storybook/addon-knobs';
import Pipeline from '../components/pipeline/pipeline';
import Graphic from '../components/pipeline/graphic';
import Emissions from '../components/pipeline/emissions';
import PipelineMap from '../components/pipeline/map';

export default {
  title: 'Pipeline',
  decorators: [withKnobs]
}

const knobs = () => {
  const stage = options('type', {
    none: 'none',
    worldmap: 'worldmap',
    datacenter: 'datacenter',
    cdn: 'cdn',
    internet: 'internet',
    residential: 'residential',
    cellular: 'cellular',
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
  return <Emissions stage={stage} progress={progress} />
}

export const pipeline = () => {
  const { stage, progress } = knobs();
  return <Pipeline stage={stage} progress={progress} />
}

export const map = () => {
  const dataType = options('type', { pops: 'pops', ggcs: 'ggcs' }, 'pops', { display: 'inline-radio'});
  return (
    <div style={{width: 500, height: 500 }}>
      <PipelineMap dataType={dataType}/>
    </div>
  )
}