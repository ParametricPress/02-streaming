import React from 'react';
import { interpolateObject } from 'd3';

const ATTRIBUTES = {
  rect: ["x", "y", "width", "height", "fill", "stroke"],
  path: ["d"],
  circle: ["cx", "cy", "r", "fill", "stroke"]
}

const getAttributes = (type, tweened) => {
  return ATTRIBUTES[type].reduce((attributes, a) => {
    attributes[a] = tweened[a];
    return attributes;
  }, {});
}

export default class SvgElement extends React.Component {
  render() {
    console.log('props: ', this.props)
    let tweened;
    const descriptor = this.props.descriptor
    const start = descriptor.steps[this.props.step]
    if (this.props.step === descriptor.steps.length - 1) {
      tweened = start
    } else {
      const fin = descriptor.steps[this.props.step + 1]
      const interpolator = interpolateObject(start, fin)
      tweened = interpolator(this.props.progress)
    }
    
    if (tweened.path) {
      tweened.d = this.props.line(tweened.path)
    }

    if (descriptor.type === 'path') {
      const attributes = getAttributes('path', tweened);
      return <path {...attributes} />
    }

    if (descriptor.type === 'rect') {
      const attributes = getAttributes('rect', tweened);
      return <rect {...attributes} />
    }

    if (descriptor.type === 'circle') {
      const attributes = getAttributes('circle', tweened);
      return <circle {...attributes} />
    }

    throw new Error('Unsupported element type: ' + this.props.type);
  }
}