import * as React from 'react';
import { Container, Rect } from './components';

/** Props:
type: 'timeline' | 'bar',
data:
  [
    {
      size: number,
      time: number
    },
    ...
  ]
xScale: {
  timeline, bar: vx.scaleLinear,
},
widthScale: {
  timeline, bar: vx.scaleLinear,
}
*/

const widthOffset = {
  timeline: 0,
  bar: 1
}

const opacity = {
  timeline: 0.7,
  bar: 1
}

const height = {
  timeline: 8,
  bar: 22
}

const fill = '#7FE8BC';

export default class MediaStrip extends React.Component {
  static height = height.bar;

  render() {
    const type = this.props.type;
    const xScale = this.props.xScale;
    const widthScale = this.props.widthScale;
    const y = type === 'timeline' ? MediaStrip.height / 2 - height[type] / 2 : 0;
    const timeline = type === 'timeline';

    return (
      <Container height={MediaStrip.height}>
        <Rect
          left={0}
          top={MediaStrip.height / 2 - 1}
          width={timeline ? xScale.timeline.range()[1] : 1}
          height={2}
          fill="#E8E8E8"
          style={{
            transition: timeline ? 'transform 1s ease-in' : 'transform 1s ease-out'
          }}
        />
        {
          this.props.data.map((d, i) => {
            return (
              <Rect
                key={i}
                left={xScale[type](timeline ? d.time : d.cumulative)}
                top={y}
                width={widthScale[type](timeline ? d.time : d.size) + widthOffset[type]}
                height={height[type]}
                fill={fill}
                style={{
                  opacity: opacity[type],
                  transition: 'transform 700ms ease-in-out'
                }}
              />
            )
          })
        }
      </Container>
    );
  }
}