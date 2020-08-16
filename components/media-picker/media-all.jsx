import * as React from 'react';
import MediaType from './media-type';
import { Container } from './components';
import { getMaxSize, groupByType, groupByTitle, addCumulativeSize } from './util';
import { scaleLinear } from '@vx/scale';

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
*/

const mediaTypePadding = 20;
const paddingRight = 48;

export default class MediaAll extends React.Component {
  static getXScaleVX = (width, maxTotal) => {
    return {
      timeline: scaleLinear({
        range: [0, width - paddingRight],
        round: true,
        domain: [0, 60]
      }),
      bar: scaleLinear({
        range: [0, width - paddingRight],
        round: true,
        domain: [0, maxTotal]
      })
    };
  }

  constructor(props) {
    super(props);

    const data = this.props.data;
    data.forEach(d => addCumulativeSize(d.packets));

    this.maxTotal = getMaxSize(data);
    this.groupData = groupByType(groupByTitle(data));
  }

  render() {
    const type = this.props.type;
    const width = this.props.width;

    const xScaleVX = MediaAll.getXScaleVX(width, this.maxTotal);

    return (
      <div
        style={{
          width: '100%',
          paddingTop: 4,
          paddingBottom: 2,
          border: '1px solid #F1F1F1'
        }}
      >
        {
          this.groupData.map((d, i) => {
            const mediaType = (
              <div key={i} style={{
                width: '100%',
                marginBottom: i === this.groupData.length - 1 ? 0 : mediaTypePadding
              }}>
                <MediaType type={type} data={d} xScaleVX={xScaleVX} />
              </div>
            );

            return mediaType;
          })
        }
      </div>
    )
  }
}