import * as React from 'react';
import { Container, Rect, Text } from './components';

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
const formatEmissions = n => Math.round(n * 1000) / 10 + ' mg';
const emissionsBarPadding = 4;
const emissionsTimelinePadding = 8;
const tickHeight = 6;
const tickWidth = 2;

export default class MediaStrip extends React.Component {
  static height = height.bar;

  render() {
    const type = this.props.type;
    const xScale = this.props.xScale;
    const widthScale = this.props.widthScale;
    const data = this.props.data;
    const mouse = this.props.mouse;
    const animate = this.props.animate;

    const timeline = type === 'timeline';

    const mouseTime = mouse ? xScale.timeline.invert(mouse.x) : xScale.timeline.domain()[1];
    const cumulative =
      data
        .filter(p => p.time <= mouseTime)
        .reduce((c, p) => c + p.size, 0)

    return (
      <div style={{
        height: MediaStrip.height,
        width: '100%'
      }}>
        <Rect
          left={timeline ? xScale.timeline.range()[1] : 0}
          top={MediaStrip.height / 2 - tickHeight / 2}
          width={tickWidth}
          height={tickHeight}
          fill="#E8E8E8"
          style={{
            transition: timeline ? 'transform 1s ease-in' : 'transform 1s ease-out',
            pointerEvents: 'none',
          }}
        />
        <Rect
          left={0}
          top={MediaStrip.height / 2 - 1}
          width={timeline ? xScale.timeline.range()[1] : 1}
          height={2}
          fill="#E8E8E8"
          style={{
            transition: timeline ? 'transform 1s ease-in' : 'transform 1s ease-out',
            pointerEvents: 'none',
          }}
        />
        <Text
          top={4}
          left={timeline ?
            xScale.timeline.range()[1] + emissionsTimelinePadding:
            xScale.bar(cumulative) + emissionsBarPadding}
          style={{
            fontSize: 10,
            fontFamily: 'Helvetica',
            color: mouse ? '#FF6CC4' : '#AAAAAA',
            transition: 'transform 700ms ease-in-out',
            pointerEvents: 'none',
          }}>
          {formatEmissions(cumulative)}
        </Text>
        {
          data.map((d, i) => {
            const rectType = !timeline ? 'bar' :
              !mouse ? 'timeline' :
                d.time < xScale.timeline.invert(mouse.x) ? 'bar' : 'timeline';
            const rTimeline = rectType === 'timeline';
            const y = rectType === 'timeline' ? MediaStrip.height / 2 - height[type] / 2 : 0;
            return (
              <Rect
                key={i}
                left={xScale[rectType](rTimeline ? d.time : d.cumulative)}
                top={y}
                width={widthScale[rectType](rTimeline ? d.time : d.size) + widthOffset[rectType]}
                height={height[rectType]}
                fill={fill}
                style={{
                  opacity: opacity[rectType],
                  transition: animate ? 'transform 700ms ease-in-out' : '',
                  pointerEvents: 'none',
                }}
              />
            )
          })
        }
        <Rect
          top={MediaStrip.height / 2 - tickHeight / 2}
          left={mouse ? Math.min(mouse.x, xScale.timeline.range()[1]) : 0}
          width={tickWidth}
          height={tickHeight}
          fill="#FF6CC4"
          style={{
            pointerEvents: 'none',
            opacity: mouse ? 1 : 0,
            zIndex: 100
          }}
        />
      </div>
    );
  }
}