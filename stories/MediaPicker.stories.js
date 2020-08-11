import * as React from 'react';
import MediaStrip from '../components/media-picker/media-strip';
import { scaleLinear } from '@vx/scale';
import { withKnobs, radios } from '@storybook/addon-knobs';
import { getTotalSize, addCumulativeSize, getMaxSize, groupByTitle, groupByType } from '../components/media-picker/util';
import { Group } from '@vx/group';
import MediaTitle from '../components/media-picker/media-title';
import MediaType from '../components/media-picker/media-type';
import MediaAll from '../components/media-picker/media-all';
import { Container } from '../components/media-picker/components';

export default {
  title: 'Media Picker',
  decorators: [withKnobs]
}

const typeKnob = () => {
  return radios('type', { Timeline: 'timeline', Bar: 'bar' }, 'bar');
}

const data = require('../data/dist/data.json');
data.forEach(d => addCumulativeSize(d.packets));

const width = 300;
const height = 1000;

const padding = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 20
};

const getXScaleVX = maxTotal => {
  return {
    timeline: scaleLinear({
      range: [0, width - padding.left - padding.right],
      round: true,
      domain: [0, 60]
    }),
    bar: scaleLinear({
      range: [0, width - padding.left - padding.right],
      round: true,
      domain: [0, maxTotal]
    })
  };
}

const StoryContainer = (props) => {
  return (
    <div style={{width, height}}>
      <Container
        top={padding.top}
        left={padding.left}
        width={width - padding.left - padding.right}
        height={height - padding.top - padding.bottom}
      >
        {props.children}
      </Container>
    </div>
  )
}

export const strip = () => {
  const type = typeKnob();

  const stripData = data[0].packets;
  const sum = getTotalSize(stripData);

  const timeScale = scaleLinear({
    range: [0, width - padding.left - padding.right],
    round: true,
    domain: [0, 60]
  });
  
  const stackScale = scaleLinear({
    range: [0, width - padding.left - padding.right],
    round: true,
    domain: [0, sum]
  });

  return (
    <StoryContainer>
      <MediaStrip
        type={type}
        data={stripData}
        xScale={{
          timeline: timeScale,
          bar: stackScale
        }}
        widthScale={{
          timeline: d => 8,
          bar: stackScale
        }}
      />
    </StoryContainer>
  )
}

export const group = () => {
  const type = typeKnob();

  const filteredData = data.filter(d => d.title === 'Dr Strange Trailer');
  const maxTotal = getMaxSize(filteredData);
  const groupData = groupByTitle(filteredData);
  const xScaleVX = getXScaleVX(maxTotal);

  return (
    <StoryContainer>
      <MediaTitle
        type={type}
        data={groupData[0]}
        xScaleVX={xScaleVX}
      />
    </StoryContainer>
  )
}

export const type = () => {
  const type = typeKnob();

  const filteredData = data.filter(d => d.mediaType === 'video');
  const maxTotal = getMaxSize(filteredData);
  const groupData = groupByType(groupByTitle(filteredData));
  const xScaleVX = getXScaleVX(maxTotal);

  return (
    <StoryContainer>
      <MediaType
        type={type}
        data={groupData[0]}
        xScaleVX={xScaleVX}
      />
    </StoryContainer>
  )
}

export const all = () => {
  const type = typeKnob();
  const maxTotal = getMaxSize(data);
  const groupData = groupByType(groupByTitle(data));
  const xScaleVX = getXScaleVX(maxTotal);

  return (
    <StoryContainer>
      <MediaAll
        type={type}
        data={groupData}
        xScaleVX={xScaleVX}
      />
    </StoryContainer>
  )
}