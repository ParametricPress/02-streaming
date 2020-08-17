import * as React from 'react';
import { Group } from '@vx/group';
import MediaTitle from './media-title';
import { Container, Text } from './components';

/** Props:
type: 'timeline' | 'bar'
data: {
  {
    mediaType: string,
    titles: [
      {
        title: string,
        packets: [...] | { 360, 720, 1080: [...] }
      }
    ]
  }
],
xScaleVX: vx.scaleLinear
*/
const mediaTitlePadding = {
  bottom: 8,
  left: 2
};

const titleCase = s => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default class MediaType extends React.Component {
  render() {
    const type = this.props.type;
    const data = this.props.data;
    const mouse = this.props.mouse;
    const animate = this.props.animate;
    const xScaleVX = this.props.xScaleVX;

    return (
      <div style={{
        width: '100%'
      }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Helvetica',
            paddingLeft: mediaTitlePadding.left,
            paddingBottom: mediaTitlePadding.bottom
          }}
        >
          {titleCase(data.mediaType)}
        </div>
        {
          data.titles.map((d, i) => {
            const mediaTitle = (
              <div key={i} style={{
                width: '100%',
                paddingBottom: mediaTitlePadding.bottom
              }}>
                <MediaTitle type={type} data={d} xScaleVX={xScaleVX} mouse={mouse} animate={animate}/>
              </div>
            );
            return mediaTitle
          })
        }
      </div>
    )
  }
}