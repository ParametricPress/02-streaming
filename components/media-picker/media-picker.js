import * as React from 'react';
import ReactDOM from 'react-dom';
import MediaAll from './media-all';
import { titleToPreview } from '../constants';

const previewHeight = 135;
const previewPadding = 8;

const previewStyle = (previewWidth, translateY, top) => {
  return {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0,
    top,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: previewWidth,
    transform: `${translateY} translateZ(0)`,
    lineHeight: 0,
    boxShadow: '0px 0px 12px 0px rgba(0,0,0,0.75)',
    backgroundColor: '#000'
  }
}

export default class MediaPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedY: null,
      offset: null,
      selectedTitle: null,
      width: null,
    };

    this.selectTitle = this.selectTitle.bind(this);
  }

  selectTitle(y, h, t) {
    this.setState({
      selectedY: y,
      selectedHeight: h,
      selectedTitle: t
    })
  }

  componentDidMount() {
    setTimeout(() => {
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      this.setState({
        width: rect.width
      });

      window.addEventListener('resize', this._onResize.bind(this));
    }, 100);
  }

  _onResize() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    console.log('onResize', rect.width);
    this.setState({
      width: rect.width,
    });
  }

  componentDidUpdate() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.height = rect.height;
  }

  render() {
    const data = this.props.data;
    const type = this.props.type;
    const headers = this.props.headers;
    const width = this.props.width;
    const selectedY = this.state.selectedY;
    const selectedHeight = this.state.selectedHeight;
    const selectedTitle = this.state.selectedTitle;
    const mediaType = this.props.mediaType;


    let previewDiv;
    if (selectedTitle) {
      const preview = titleToPreview[selectedTitle];
      const pType = preview.type;

      const previewWidth = this.state.width - previewPadding * 2;
      const previewHeight = previewWidth * (pType === 'video' ? 0.6 : 1);
  
      // const translateX = `translateX(${width / 2 - previewWidth / 2}px)`;
  
      const offset = selectedHeight + previewPadding;

      let translateY;
      let top;
      if (mediaType) {
        top = '100%';
        translateY = `translateY(24px)`
      } else {
        top = 0;
        let y = selectedY;
  
        if (y + offset + previewHeight >= this.height) {
          translateY = `translateY(calc(${y - previewPadding}px - 100%))`
        } else {
          translateY = `translateY(${y + offset}px)`;
        }
      }

      if (pType === 'video') {
        previewDiv = (
          <video autoPlay
            style={previewStyle(previewWidth, translateY, top)}
          >
            <source src={`./static/images/${titleToPreview[selectedTitle].url}`} type="video/mp4"/>
          </video>
        );
      } else {
        previewDiv = (
          <img style={previewStyle(previewWidth, translateY, top)}
          src={`./static/images/${titleToPreview[selectedTitle].url}`}/>
        );
      }
    }

    return (
      <div className="media-picker"
        style={{
          width: width,
          position: 'relative',
      }}>
        {previewDiv}
        { this.state.width ?
          <MediaAll type={type}
            mediaType={mediaType} data={data} width={this.state.width} headers={headers}
            selectTitle={this.selectTitle}
            hasSelected={this.state.selectedY !== null}
            selectedTitle={selectedTitle}
          />
          : null
        }
      </div>
    );
  }
}