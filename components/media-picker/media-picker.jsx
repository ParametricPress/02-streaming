import * as React from 'react';
import ReactDOM from 'react-dom';
import MediaAll from './media-all';

const previewHeight = 135;
const previewWidth = 240;
const previewPadding = 8;

export default class MediaPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedY: null,
      offset: null,
      selectedTitle: null,
    };

    this.selectY = this.selectY.bind(this);
  }

  selectY(y, h, t) {
    this.setState({
      selectedY: y,
      selectedHeight: h,
      selectedTitle: t
    })
  }

  componentDidMount() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.height = rect.height;
    this.width = rect.width;
  }

  render() {
    const type = this.props.type;
    const data = this.props.data;
    const width = this.props.width;
    const selectedY = this.state.selectedY;
    const selectedHeight = this.state.selectedHeight;
    const selectedTitle = this.state.selectedTitle;

    const translateX = `translateX(${width / 2 - previewWidth / 2}px)`;

    const offset = selectedHeight + previewPadding;
    let y = selectedY;

    if (y + offset + previewHeight >= this.height) {
      y -= previewHeight + previewPadding;
    } else {
      y += offset;
    }

    const translateY = `translateY(${y}px)`;

    return (
      <div style={{
        width: width
      }}>
        {this.state.selectedY ?
          <div style={{
            position: 'absolute',
            zIndex: 101,
            transform: `${translateX} ${translateY} translateZ(0)`,
            width: previewWidth,
            height: previewHeight,
            backgroundColor: 'red'
          }}></div>
          : null
        }
        <MediaAll type={type} data={data} width={width}
          selectY={this.selectY}
          hasSelected={this.state.selectedY !== null}
          selectedTitle={selectedTitle}
        />
      </div>
    );
  }
}