import * as React from 'react';
import { Group } from '@vx/group';
import MediaType from './media-type';

/* Props:
type: 'timeline' | 'bar',
data: [
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

const mediaTypePadding = 48;

export default class MediaAll extends React.Component {
  render() {
    const type = this.props.type;
    const data = this.props.data;
    const xScaleVX = this.props.xScaleVX;

    let yOffset = 0;
    return (
      <Group>
        {
          data.map(d => {
            const mediaType = (
              <Group top={yOffset}>
                <MediaType type={type} data={d} xScaleVX={xScaleVX} />
              </Group>
            );

            yOffset += MediaType.height(d) + mediaTypePadding;

            return mediaType;
          })
        }
      </Group>
    )
  }
}