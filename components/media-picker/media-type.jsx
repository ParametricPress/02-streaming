import * as React from 'react';
import { Group } from '@vx/group';
import MediaTitle from './media-title';
import { Container } from './components';

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
const mediaTitlePadding = 16;

export default class MediaType extends React.Component {
  static height = data => {
    return data.titles.reduce((height, d, i) => {
      return height + MediaTitle.height(d) + (i === 0 ? 0 : mediaTitlePadding);
    }, 0);
  }

  render() {
    const type = this.props.type;
    const data = this.props.data;
    const xScaleVX = this.props.xScaleVX;

    const height = MediaType.height(data);

    let yOffset = 0;
    return (
      <Container height={height}>
        {
          data.titles.map((d, i) => {
            const mediaTitle = (
              <Container key={i} top={yOffset}>
                <MediaTitle type={type} data={d} xScaleVX={xScaleVX} />
              </Container>
            );

            yOffset += mediaTitlePadding + MediaTitle.height(d);

            return mediaTitle
          })
        }
      </Container>
    )
  }
}