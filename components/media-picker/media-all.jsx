import * as React from 'react';
import MediaType from './media-type';
import { getMaxSize, groupByType, groupByTitle, addCumulativeSize, getMaxTime } from './util';
import { scaleLinear } from '@vx/scale';
import { Rect } from './components';

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

const gridlines = {
  bar: [0.05, 0.1, 0.15],
  timeline: [20, 40, 60]
};

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
          border: '1px solid #F1F1F1',
          position: 'relative'
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
          gridlines[type].map((d, i)=> <Grid key={i} left={xScaleVX[type](d)}/>)
        }
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

const Grid = props => {
  return (
    <div style={{
      position: 'absolute',
      zIndex: -1,
      width: 1,
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: '#F1F1F1',
      transform: `translateX(${props.left}px)`,
      transition: 'transform 700ms ease-in-out'
    }}></div>
  );
}