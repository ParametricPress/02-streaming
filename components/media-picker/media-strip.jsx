import * as React from 'react';
import { Group } from '@vx/group';

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
  timeline, bar: d => number,
},
widthScale: {
  timeline, bar: d => number,
}
*/

const widthOffset = {
  timeline: 0,
  bar: 0.5
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
    const xScale = this.props.xScale[type];
    const widthScale = this.props.widthScale;
    const y = type === 'timeline' ? MediaStrip.height / 2 - height[type] / 2 : 0;
    const timeline = type === 'timeline';

    return (
      <Group>
        <rect
          x={0}
          y={MediaStrip.height / 2 - 1}
          width="100%"
          height={2}
          fill="#E8E8E8"
          style={{
            transform: timeline ? 'scaleX(1)' : 'scaleX(0)',
            transition: timeline ? 'transform 1s ease-in' : 'transform 1s ease-out'
          }}
        />
        {
          this.props.data.map((d, i) => {
            return (
              <rect
                key={i}
                x={xScale(d)}
                y={y}
                width={widthScale[type](d) + widthOffset[type] }
                height={height[type]}
                fill={fill}
                opacity={opacity[type]}
                style={{
                  transition: timeline ? 'x 700ms ease-in-out 700ms, y 700ms ease-in-out, width 700ms ease-in-out 700ms, height 700ms ease-in-out' : 'x 700ms ease-in-out, y 700ms ease-in-out 700ms, width 700ms ease-in-out, height 700ms ease-in-out 700ms'
                }}
              />
            )
          })
        }
      </Group>
    );
  }
}