const React = require('react');
const d3 = require('d3-interpolate');

export default class SvgScrollElement extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let tweened;
    const descriptor = this.props.descriptor
    const start = descriptor.steps[this.props.step]
    if (this.props.step < descriptor.steps.length) {
      tweened = start
    } else {
      const fin = descriptor.steps[this.props.step + 1]
      const interpolator = d3.interpolateObject(start, fin)
      tweened = interpolator(this.props.tween)
    }

    if (tweened.x) {
      tweened.x = this.props.xScale(tweened.x);
    }
    if (tweened.y) {
      tweened.y = this.props.yScale(tweened.y);
    }
    if (tweened.cx) {
      tweened.cx = this.props.xScale(tweened.cx);
    }
    if (tweened.cy) {
      tweened.cy = this.props.yScale(tweened.cy);
    }
    if (tweened.path) {
      tweened.path = this.props.line(tweened.path)
    }

    if (this.props.type === 'path') {
      return <path {...tweened} />
    }

    if (this.props.type === 'rect') {
      return <rect {...tweened} />
    }

    if (this.props.type === 'circle') {
      return <circle {...tweened} />
    }

    throw new Error('Unsupported element type: ' + this.props.type);
  }
}