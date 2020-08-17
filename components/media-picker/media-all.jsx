import * as React from 'react';
import MediaType from './media-type';
import { getMaxSize, groupByType, groupByTitle, addCumulativeSize, getMaxTime } from './util';
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

    this.data = this.props.data;
    this.data.forEach(d => addCumulativeSize(d.packets));

    this.maxTotal = getMaxSize(this.data);
    this.groupData = groupByType(groupByTitle(this.data));
    this.xScales = MediaAll.getXScaleVX(props.width, this.maxTotal);

    this.animateTimeout = -1;
    this.state = {
      mouse: null,
      animate: true
    };
  }

  render() {
    const type = this.props.type;
    const width = this.props.width;
    const mouse = this.state.mouse;

    let xScaleVX;

    if (type === 'timeline' && mouse) {
      const mouseTime = this.xScales.timeline.invert(mouse.x);
      const mouseMax = getMaxSize(this.data, d => d.time <= mouseTime);
      const maxTime = getMaxTime(this.data, mouseTime);

      xScaleVX = {
        timeline: this.xScales.timeline,
        bar: scaleLinear({
          range: [0, this.xScales.timeline(maxTime)],
          round: true,
          domain: [0, mouseMax]
        })
      }
    } else {
      xScaleVX = this.xScales; 
    }

    return (
      <div
        style={{
          width: width,
          paddingTop: 8,
          paddingBottom: 2,
          border: '1px solid #F1F1F1'
        }}

        onMouseMove={e => {
          clearTimeout(this.animateTimeout);
          const mouse = {x: e.clientX - e.target.getBoundingClientRect().x};
          const animate = false;

          this.setState({mouse, animate});
          this.animateTimeout = setTimeout(() => this.setState({animate: true}), 1000)
        }}

        onMouseOut={e => {
          clearTimeout(this.animateTimeout);
          this.setState({mouse: null, animate: false});
          this.animateTimeout = setTimeout(() => this.setState({animate: true}), 1000);
        }}
      >
        {
          this.groupData.map((d, i) => {
            const mediaType = (
              <div key={i} style={{
                width: '100%',
                marginBottom: i === this.groupData.length - 1 ? 0 : mediaTypePadding
              }}>
                <MediaType type={type} data={d} xScaleVX={xScaleVX} animate={this.state.animate}
                  mouse={type === 'timeline' ? this.state.mouse : null}/>
              </div>
            );

            return mediaType;
          })
        }
      </div>
    )
  }
}