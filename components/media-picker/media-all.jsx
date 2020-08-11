import * as React from 'react';
import MediaType from './media-type';
import { Container } from './components';

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
      <Container>
        {
          data.map((d, i) => {
            const mediaType = (
              <Container key={i} top={yOffset}>
                <MediaType type={type} data={d} xScaleVX={xScaleVX} />
              </Container>
            );

            yOffset += MediaType.height(d) + mediaTypePadding;

            return mediaType;
          })
        }
      </Container>
    )
  }
}