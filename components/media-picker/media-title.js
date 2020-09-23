import * as React from 'react';
import ReactDOM from 'react-dom';
import { Group } from '@vx/group';
import { scaleBand } from '@vx/scale';
import MediaStrip from './media-strip';
import { Container, Text, Rect } from './components';
import { textColor, font } from '../constants';

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

export default class MediaTitle extends React.PureComponent {
  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    const rect = node.getBoundingClientRect();
    this.height = rect.height;
    this.y = node.parentElement.offsetTop + node.parentElement.parentElement.parentElement.offsetTop;

    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
  }

  _handleMouseDown() {
    if (this.props.type === 'bar') {
      this.props.selectTitle(this.y, this.height, this.props.data.title);
    }
  }

  _handleMouseUp() {
    this.props.selectTitle(null, null, null);
  }

  render() {
    const type = this.props.type;
    const data = this.props.data;
    const xScaleVX = this.props.xScaleVX;
    const mouseX = this.props.mouseX;
    const animate = this.props.animate;
    const hasSelected = this.props.hasSelected;
    const selectedTitle = this.props.selectedTitle;

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
          paddingTop: 0
        }}>
          <MediaStrip
            type={type}
            data={data.packets}
            xScale={xScaleVX}
            mouseX={mouseX}
            animate={animate}
            widthScale={widthScale}/>
        </div>
      );
    } else {
      // has quality
      const qualities = Object.keys(data.packets);

      strips = qualities.map((q, i) => {
        if (q === '720') {  // remove 720 for now
          return null;
        }
        const packets = data.packets[q];

        return (
          <div key={i} style={{
            width: '100%',
            paddingTop: i !== 0 ? stripPadding : 0
          }}>
            <MediaStrip
              type={type}
              data={packets}
              xScale={xScaleVX}
              mouseX={mouseX}
              animate={animate}
              widthScale={widthScale}
              quality={q}
            />
          </div>
        );
      });
    }

    return (
      <div style={{
        width: '100%',
        opacity: hasSelected ? selectedTitle === data.title ? 1 : 0.2 : 1
      }}
        onMouseDown={this._handleMouseDown}
        onMouseUp={this._handleMouseUp}
        onMouseLeave={this._handleMouseUp}

        onTouchStart={this._handleMouseDown}
        onTouchEnd={this._handleMouseUp}
      >
        <div
          style={{
            paddingLeft: titlePadding.left,
            fontSize: titleFontSize,
            fontFamily: font,
            userSelect: 'none',
            transform: 'translateZ(1)',
            color: textColor
          }}
        >{data.title}</div>
        {strips}
      </div>
    );
  }
}