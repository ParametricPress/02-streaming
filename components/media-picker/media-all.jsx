import * as React from 'react';
import MediaType from './media-type';
import { getMaxSize, groupByType, groupByTitle, addCumulativeSize, getMaxTime } from './util';
import { scaleLinear } from '@vx/scale';
import { Rect, Text } from './components';

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

export default class MediaAll extends React.PureComponent {
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

    this.data = props.data;
    this.data.forEach(d => addCumulativeSize(d.packets));

    this.maxTotal = getMaxSize(this.data);

    const mediaType = props.mediaType;
    if (mediaType) {
      this.data = this.data.filter(d => d.mediaType === mediaType);
      console.log(this.data);
    }
    this.groupData = groupByType(groupByTitle(this.data));

    this.xScales = MediaAll.getXScaleVX(props.width, this.maxTotal);

    this.animateTimeout = -1;
    this.state = {
      mouseX: null,
      mouseMax: null,
      animate: true
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.clearMouse = this.clearMouse.bind(this);
  }

  render() {
    const type = this.props.type;
    const width = this.props.width;
    const hasSelected = this.props.hasSelected;
    const selectedTitle = this.props.selectedTitle;

    const mouseX = this.state.mouseX;

    let xScaleVX;

    if (type === 'timeline' && mouseX) {
      const mouseTime = this.xScales.timeline.invert(mouseX);
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
          position: 'relative',
        }}

        onMouseDown={this.handleMouseMove}

        onMouseMove={e => {
          if (this.state.mouseX !== null) {
            this.handleMouseMove(e);
          }
        }}

        onMouseLeave={this.clearMouse}
        onMouseUp={this.clearMouse}
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
                  mouseX={type === 'timeline' ? this.state.mouseX : null}
                  selectTitle={this.props.selectTitle} hasSelected={hasSelected}
                  selectedTitle={selectedTitle}/>
              </div>
            );

            return mediaType;
          })
        }
        {
          gridlines[type].map((d, i) => {
            const val = type === 'bar' ? d * 1000 + ' mg' : d + ' s';
            return <Label key={i} value={val} left={xScaleVX[type](d)}/>
          })
        }
      </div>
    )
  }

  handleMouseMove(e) {
    clearTimeout(this.animateTimeout);
    if (this.props.type === 'timeline') {
      const mouseX = e.clientX - e.target.getBoundingClientRect().x;
      const animate = false;

      this.setState({mouseX, animate});
      this.animateTimeout = setTimeout(() => this.setState({animate: true}), 1000)
    }
  }

  clearMouse() {
    console.log('clearMouse');
    clearTimeout(this.animateTimeout);
    this.setState({mouseX: null, animate: false});
    this.animateTimeout = setTimeout(() => this.setState({animate: true}), 1000);
  }
}

const Label = props => {
  return (
    <Text
      top={4}
      left={props.left - 30}
      style={{
        width:  60,
        fontSize: 10,
        fontFamily: 'Helvetica',
        textAlign: 'center',
        color: '#AAAAAA',
        transition: 'transform 700ms ease-in-out',
        pointerEvents: 'none',
      }}>
      {props.value}
    </Text>
  )
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