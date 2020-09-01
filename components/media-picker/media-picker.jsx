import * as React from 'react';
import ReactDOM from 'react-dom';
import MediaAll from './media-all';

const previewHeight = 135;
const previewPadding = 8;

const titleToPreview= {
  'Amazon': {
    type: 'video',
    url: 'amazon.mp4',
  },
  'Facebook': {
    type: 'video',
    url: 'facebook.mp4',
  },
  'Google': {
    type: 'video',
    url: 'google.mp4'
  },
  'New York Times': {
    type: 'video',
    url: 'nytimes.mp4'
  },
  'Parametric Press': {
    type: 'video',
    url: null
  },
  '3Blue1Brown': {
    type: 'video',
    url: '3blue1brown.mp4',
  },
  'Dr Strange Trailer': {
    type: 'video',
    url: 'drstrange.mp4',
  },
  'Slideshow': {
    type: 'video',
    url: 'slideshow.mp4',
  },
  'Digging into American Dirt (podcast)': {
    type: 'image',
    url: 'podcast.png'
  },
  'Righteous (song)': {
    type: 'image',
    url: 'song.png'
  }
}

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
    const mediaType = this.props.mediaType;

    let previewDiv;
    if (selectedTitle) {
      const preview = titleToPreview[selectedTitle];
      const pType = preview.type;

      const previewWidth = this.width - previewPadding * 2;
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
          y -= previewHeight + previewPadding;
        } else {
          y += offset;
        }

        translateY = `translateY(${y}px)`;
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
      <div style={{
        width: width,
        position: 'relative',
      }}>
        {previewDiv}
        <MediaAll type={type}
          mediaType={mediaType} data={data} width={width}
          selectTitle={this.selectTitle}
          hasSelected={this.state.selectedY !== null}
          selectedTitle={selectedTitle}
        />
      </div>
    );
  }
}