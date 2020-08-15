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
const mediaTitlePadding = 16;
const mediaTypeHeight = 24;

const titleCase = s => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default class MediaType extends React.Component {
  static height = data => {
    return mediaTypeHeight + data.titles.reduce((height, d, i) => {
      return height + MediaTitle.height(d) + mediaTitlePadding;
    }, 0) - mediaTitlePadding;
  }

  render() {
    const type = this.props.type;
    const data = this.props.data;
    const xScaleVX = this.props.xScaleVX;

    const height = MediaType.height(data);

    let yOffset = mediaTypeHeight;
    return (
      <Container height={height}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Helvetica'
          }}
        >
          {titleCase(data.mediaType)}
        </Text>
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