import * as React from 'react';
import ReactDOM from 'react-dom';
import MediaAll from './media-all';
import { debounceTimer, titleToPreview } from '../constants';

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

    this.resizeBounce = null;
    this._size = this._size.bind(this);
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
      this._size();
      window.addEventListener('resize', this._onResize.bind(this));
    }, 100);
  }

  _size() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.setState({
      width: rect.width,
    });
  }

  _onResize() {
    if (this.resizeBounce) {
      clearTimeout(this.resizeBounce);
    }
    
    this.resizeBounce = setTimeout(this._size, debounceTimer);
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
    const mediaTitle = this.props.mediaTitle;
    const inline = this.props.inline;
    const noAutoplayTimeline = this.props.noAutoplayTimeline;
    const shouldPreload = this.props.shouldPreload;

    let previews;
    if (shouldPreload) {
      previews = Object.keys(titleToPreview)
      .filter(title => data.filter(d => d.title === title).length > 0)
      .map(title => {
        const item = titleToPreview[title];
        
        const style = { position: 'absolute', width: 100, height: 100, top: 0, left: 0, opacity: 0};
  
        if (item.type === "video") {
          return (
            <video key={title + "-preload"} style={style} preload="auto" autoPlay loop muted playsInline>
              <source src={`./static/images/${item.url}`} type="video/mp4"/>
            </video>
          );
        } else {
          return <img style={style} src={`./static/images/${item.url}`} />
        }
      });
    }

    let preview;
    if (selectedTitle) {
      const item = titleToPreview[selectedTitle];
    
      const pType = item.type;
      const previewWidth = this.state.width - previewPadding * 2;
      const previewHeight = previewWidth * (pType === 'video' ? 0.6 : 1);

      const offset = selectedHeight + previewPadding;

      let translateY;
      let top;

      top = 0;
      let y = selectedY;

      if (!mediaType && y + offset + previewHeight >= this.height) {
        translateY = `translateY(calc(${y - previewPadding}px - 100%))`
      } else {
        translateY = `translateY(${y + offset}px)`;
      }

      const style = previewStyle(previewWidth, translateY, top);

      if (item.type === "video") {
        preview = (
          <video style={style} autoPlay loop muted playsInline>
              <source src={`./static/images/${item.url}`} type="video/mp4"/>
          </video>
        );
      } else {
        preview = <img style={style} src={`./static/images/${item.url}`} />
      }
    }
    

    return (
      <div className="media-picker"
        onContextMenu={function(e) { e.preventDefault();}}

        style={{
          width: width,
          position: 'relative',
          paddingBottom: '1em'
      }}>
        {previews}
        {preview}
        { this.state.width ?
          <MediaAll type={type}
            mediaType={mediaType} mediaTitle={mediaTitle} noAutoplayTimeline={noAutoplayTimeline}
            data={data} width={this.state.width} headers={headers} inline={inline}
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