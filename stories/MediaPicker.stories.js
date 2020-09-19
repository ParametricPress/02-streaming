import * as React from 'react';
import MediaStrip from '../components/media-picker/media-strip';
import { withKnobs, radios } from '@storybook/addon-knobs';
import { getTotalSize, addCumulativeSize, getMaxSize, groupByTitle, groupByType } from '../components/media-picker/util';
import MediaTitle from '../components/media-picker/media-title';
import MediaType from '../components/media-picker/media-type';
import MediaAll from '../components/media-picker/media-all';
import MediaPicker from '../components/media-picker/media-picker';

export default {
  title: 'Media Picker',
  decorators: [withKnobs]
}

const typeKnob = () => {
  return radios('type', { Timeline: 'timeline', Bar: 'bar' }, 'bar');
}

const data = require('../data/dist/media-emissions.json');
data.forEach(d => addCumulativeSize(d.packets));

const width = 300;

const StoryContainer = (props) => {
  return (
    <div style={{
      width,
    }}>
      {props.children}
    </div>
  )
}

export const strip = () => {
  const type = typeKnob();

  const stripData = data[0].packets;
  const sum = getTotalSize(stripData);
  const xScale = MediaAll.getXScaleVX(width, sum);

  return (
    <StoryContainer>
      <MediaStrip
        type={type}
        data={stripData}
        xScale={xScale}
        animate={true}
        widthScale={{
          timeline: d => 8,
          bar: xScale.bar
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
  const xScaleVX = MediaAll.getXScaleVX(width, maxTotal);

  return (
    <StoryContainer>
      <MediaTitle
        type={type}
        data={groupData[0]}
        animate={true}
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
  const xScaleVX = MediaAll.getXScaleVX(width, maxTotal);

  return (
    <StoryContainer>
      <MediaType
        type={type}
        data={groupData[0]}
        animate={true}
        xScaleVX={xScaleVX}
      />
    </StoryContainer>
  )
}

export const all = () => {
  const type = typeKnob();

  return (
    <StoryContainer>
      <MediaAll
        type={type}
        data={data}
        width={width}
      />
    </StoryContainer>
  )
}

export const mediaPicker = () => {
  const type = typeKnob();

  return (
    <StoryContainer>
      <MediaPicker
        type={type}
        data={data}
        width={width}
        headers={true}
      />
    </StoryContainer>
  )
}

export const websites = () => {
  const type = typeKnob();

  return (
    <StoryContainer>
      <MediaPicker
        type={type}
        mediaType="website"
        data={data}
        width={width}
      />
    </StoryContainer>
  )
}

export const audio = () => {
  const type = typeKnob();

  return (
    <StoryContainer>
      <MediaPicker
        type={type}
        mediaType="audio"
        data={data}
        width={width}
      />
    </StoryContainer>
  )
}

export const video = () => {
  const type = typeKnob();

  return (
    <StoryContainer>
      <MediaPicker
        type={type}
        mediaType="video"
        data={data}
        width={width}
      />
    </StoryContainer>
  )
}