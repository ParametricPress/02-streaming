import * as React from 'react';
import { Group } from '@vx/group';
import { scaleBand } from '@vx/scale';
import MediaStrip from './media-strip';
import { Container, Text } from './components';

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
const titlePadding = {
  left: 2
};
const stripPadding = 2;

export default class MediaTitle extends React.Component {
  render() {
    const type = this.props.type;
    const data = this.props.data;
    const xScaleVX = this.props.xScaleVX;

    const widthScale = {
      timeline: _ => 8,
      bar: xScaleVX.bar
    };

    let strips;
    if (data.packets.length) {
      strips = (
        // <Container top={titleHeight + titlePadding.b}>
        <div style={{
          width: '100%',
          paddingTop: stripPadding
        }}>
          <MediaStrip type={type} data={data.packets} xScale={xScaleVX} widthScale={widthScale}/>
        </div>
      );
    } else {
      // has quality
      const qualities = Object.keys(data.packets);

      strips = qualities.map((q, i) => {
        const packets = data.packets[q];
        return (
          <div key={i} style={{
            width: '100%',
            paddingTop: stripPadding
          }}>
            <MediaStrip type={type} data={packets} xScale={xScaleVX} widthScale={widthScale}/>
          </div>
        );
      });
    }

    return (
      <div style={{
        width: '100%'
      }}>
        <div
          style={{
            paddingLeft: titlePadding.left,
            fontSize: titleFontSize,
            height: titleHeight,
            fontFamily: 'Helvetica'
          }}
        >{data.title}</div>
        {strips}
      </div>
    );
  }
}