import * as React from 'react';

class Positionable extends React.Component {
  constructor(props) {
    super(props);
  }

  getStyleFromProps(props) {
    const left = props.left || 0;
    const top = props.top || 0;
    const style = props.style;

    const translate = getTranslates(left, top);

    return {
      position: 'absolute',
      transformOrigin: '0 0',
      ...style,
      transform: translate
    };
  }
}

class Scalable extends Positionable {
  constructor(props) {
    super(props);

    this.initialWidth = roundPixel(this.resolveWidth(props.width));
    this.initialHeight = roundPixel(this.resolveHeight(props.height));
  }

  resolveWidth(width) {
    return width;
  }

  resolveHeight(height) {
    return height;
  }

  getStyleFromProps(props) {
    const style = super.getStyleFromProps(props);

    const width = roundPixel(props.width);
    const height = roundPixel(props.height);

    const scale = getScales(this.initialWidth, this.initialHeight, width, height);
    
    return {
      ...style,
      width: this.initialWidth,
      height: this.initialHeight,
      transform: style.transform + ' ' + scale
    };
  }
}

export class Container extends Scalable {
  render() {
    const style = this.getStyleFromProps(this.props);
    return <div style={style}>{this.props.children}</div>
  }
}

export class Text extends React.Component {
  render() {
    const left = this.props.left || 0;
    const top = this.props.top || 0;
    const style = this.props.style;
    
    const translate = getTranslates(left, top);

    return (
      <div
        style={{
          ...style,
          width: '100%',
          position: 'absolute',
          transform: translate
        }}
      >
        {this.props.children}
      </div>
    )
  }
}

export class Rect extends React.Component {
  constructor(props) {
    super(props);
    
    this.initialWidth = roundPixel(props.width);
    this.initialHeight = roundPixel(props.height);

    if (this.initialWidth === 0 || this.initialWidth === 0) {
      throw Error('initial dimension of Rect cannot be 0');
    }
  }

  static getStyleFromProps(props, initialWidth, initialHeight) {
    const left = props.left || 0;
    const top = props.top || 0;
    const width = roundPixel(props.width);
    const height = roundPixel(props.height);
    const fill = props.fill;
    const style = props.style;

    const translate = getTranslates(left, top);
    const scale = getScales(initialWidth, initialHeight, width, height);
    
    const transform = [translate, scale].join(' ');
    const transition = props.transition ? getTransition(props.transition[0]) : null;

    return {
      ...style,
      width: initialWidth,
      height: initialHeight,
      backgroundColor: fill,
      position: 'absolute',
      transform,
      transformOrigin: '0 0',
      transition
    };
  }

  render() {
    if (this.props.transition && this.props.transition.length > 1) {
      const nextProps = {...this.props};
      const t = nextProps.transition[0];
      nextProps.transition = nextProps.transition.slice(1);
      
      const transitionProps = t.attrs.reduce((tp, a) => {
        tp[a] = nextProps[a];
        nextProps[a] = fill(a);
        return tp;
      }, {
        transition: [t]
      });

      const style = Rect.getStyleFromProps(
        transitionProps, this.initialWidth, this.initialHeight);

      return (
        <div
          style={style}
        >
          <Rect {...nextProps} />
        </div>
      ) 
    } else {
      const style = Rect.getStyleFromProps(
        this.props, this.initialWidth, this.initialHeight);
  
      return (
        <div
          style={style}
        >
        </div>
      )
    }
  }
}

const getTransition = t => {
  return `transform ${t.duration}ms ${t.delay || 0}ms ${t.easing || ''}`;
}

const fillAttributes = {
  width: '100%',
  height: '100%',
  left: 0,
  top: 0
}

const fill = attr => {
  if (fillAttributes.hasOwnProperty(attr)) {
    return fillAttributes[attr];
  }

  throw Error('unsupport attribute: ' + attr);
}

const getTranslates = (left, top) => {
  return `translateX(${left}px) translateY(${top}px)`;
}

const isString = s => typeof s === 'string';
const isNumber = n => typeof n === 'number';

const getScales = (initialWidth, initialHeight, width, height) => {
  const scales = [];

  if (isNumber(initialWidth) && isNumber(width)) {
    scales.push(`scaleX(${width / initialWidth})`);
  } else {
    scales.push(`scaleX(1)`);
  }

  if (isNumber(initialHeight) && isNumber(height)) {
    scales.push(`scaleY(${height / initialHeight})`);
  } else {
    scales.push(`scaleY(1)`);
  }

  return scales.join(' ');
}

const roundPixel = p => {
  if (isNumber(p)) {
    return Math.round(p * 6) / 6;  //  factor of 1/3 = super retina, 1/2 = retina
  }

  return p;
}