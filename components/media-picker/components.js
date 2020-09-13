import * as React from 'react';

export class Container extends React.PureComponent {
  render() {
    const left = this.props.left || 0;
    const top = this.props.top || 0;
    const width = this.props.width || '100%';
    const height = this.props.height || '100%';
    const style = this.props.style;

    const translate = getTranslates(left, top);

    return (
      <div
        style={{
          ...style,
          width,
          height,
          position: 'absolute',
          transform: translate
        }}
      >
        {this.props.children}
      </div>
    )
  }
}

export class Text extends React.PureComponent {
  render() {
    const left = this.props.left || 0;
    const top = this.props.top || 0;
    const style = this.props.style;
    
    const translate = getTranslates(left, top);

    return (
      <div
        style={{
          ...style,
          position: 'absolute',
          userSelect: 'none',
          transform: translate
        }}
      >
        {this.props.children}
      </div>
    )
  }
}

export class Rect extends React.PureComponent {
  constructor(props) {
    super(props);
    
    this.initialWidth = roundPixel(props.width);
    this.initialHeight = roundPixel(props.height);

    if (this.initialWidth === 0 || this.initialHeight === 0) {
      throw Error('initial dimension of Rect cannot be 0');
    }
  }

  render() {
    const left = this.props.left || 0;
    const top = this.props.top || 0;
    const width = roundPixel(this.props.width);
    const height = roundPixel(this.props.height);
    const fill = this.props.fill;
    const style = this.props.style;

    const initialWidth = this.initialWidth;
    const initialHeight = this.initialHeight;

    const translate = getTranslates(left, top);
    const scale = getScales(initialWidth, initialHeight, width, height);
    
    const transform = [translate, scale].join(' ');
  
    return (
      <div
        style={{
          ...style,
          width: initialWidth,
          height: initialHeight,
          backgroundColor: fill,
          position: 'absolute',
          transform,
          transformOrigin: '0 0'
        }}
      >
      </div>
    )
  }
}

const isString = s => typeof s === 'string'

const getTranslates = (left, top) => {
  const l = isString(left) ? left : left + 'px';
  const t = isString(top) ? top : top + 'px';
  return `translateX(${l}) translateY(${t})`;
}

const getScales = (initialWidth, initialHeight, width, height) => {
  if (initialWidth === width && initialHeight === height) {
    return 'scaleX(1) scaleY(1)';
  }
  return `scaleX(${width / initialWidth}) scaleY(${height / initialHeight})`;
}

const roundPixel = p => {
  if (isString(p)) {
    return p;
  } 
  return Math.round(p * 12) / 12;  //  factor of 1/3 = super retina, 1/2 = retina
}