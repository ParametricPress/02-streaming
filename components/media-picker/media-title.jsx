import * as React from 'react';
import { Group } from '@vx/group';
import { scaleBand } from '@vx/scale';
import MediaStrip from './media-strip';

/** Props:
type: 'timeline' | 'bar',
data: {
  title: string,
  packets: [...] | { 360, 720, 1080: [...] }
},
xScaleVX: {
  timeline, bar: vx.scaleLinear,
}
*/

const titleFontSize = 10;
const titleHeight = 12;
const titlePadding = 2;
const stripPadding = 4;

export default class MediaTitle extends React.Component {
  static height = data => {
    const numStrips = data.packets.length ? 1 : Object.keys(data.packets).length;
    return titleHeight + titlePadding + MediaStrip.height * numStrips + stripPadding * (numStrips - 1);
  }

  render() {
    const type = this.props.type;
    const data = this.props.data;
    const xScaleVX = this.props.xScaleVX;
    const height = MediaTitle.height(data);

    const xScale = {
      timeline: d => xScaleVX['timeline'](d.time),
      bar: d => xScaleVX['bar'](d.cumulative)
    };

    const widthScale = {
      timeline: _ => 8,
      bar: d => xScaleVX['bar'](d.size)
    };

    let strips;
    if (data.packets.length) {
      strips = (
        <Group top={titleHeight + titlePadding}>
          <MediaStrip type={type} data={data.packets} xScale={xScale} widthScale={widthScale}/>
        </Group>
      );
    } else {
      // has quality
      const qualities = Object.keys(data.packets);

      const yScale = scaleBand({
        domain: qualities,
        range: [titleHeight + titlePadding, height]
      });

      strips = qualities.map(q => {
        const packets = data.packets[q];
        return (
          <Group top={yScale(q)}>
            <MediaStrip type={type} data={packets} xScale={xScale} widthScale={widthScale}/>
          </Group>
        );
      });
    }

    return (
      <Group>
        <text
          dominantBaseline="hanging"
          style={{
            fontSize: titleFontSize,
            lineHeight: titleHeight,
            fontFamily: 'Helvetica'
          }}
        >{data.title}</text>
        {strips}
      </Group>
    );
  }
}