import * as React from "react";
import ReactDOM from "react-dom";
import MediaAll from "./media-all";
import { debounceTimer, titleToPreview } from "../constants";
import { stripPadding, titleFontSize } from "./media-title";
import { mediaTitlePadding } from "./media-type";

const previewHeight = 135;
const previewPadding = 8;

const boxShadow = "0px 0px 12px 0px rgba(0,0,0,0.75)";

const getOverlayStyle = (width, translateY, orient) => {
  return {
    position: "absolute",
    display: "flex",
    flexDirection: orient === 'bottom' ? "column" : 'column-reverse',
    alignItems: "center",
    zIndex: 2,
    left: 0,
    right: 0,
    top: translateY,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: width,
    transform: `translateY(${orient === 'bottom' ? 0 : '-100%'})`,
    // transform: `translateY(${translateY}px) translateZ(0)`,
    lineHeight: 0,
  };
};

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
    this.clearTitle = this.clearTitle.bind(this);

    this.resizeBounce = null;
    this._size = this._size.bind(this);
    this._measure = this._measure.bind(this);
  }

  selectTitle(y, h, t) {
    this.setState({
      selectedY: y,
      selectedHeight: h,
      selectedTitle: t,
    });
  }

  clearTitle() {
    this.selectTitle(null, null, null, null);
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    window.addEventListener("click", (e) => {
      if (!e.target.isSameNode(this.node)) {
        this.clearTitle();
      }
    });
    setTimeout(() => {
      this._size();
      window.addEventListener("resize", this._onResize.bind(this));
    }, 100);
  }

  _size() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.setState({
      width: rect.width,
    });

    this._measure();
  }

  _onResize() {
    if (this.resizeBounce) {
      clearTimeout(this.resizeBounce);
    }

    this.resizeBounce = setTimeout(this._size, debounceTimer);
  }

  _measure() {
    const node = ReactDOM.findDOMNode(this);
    if (node) {
      const rect = node.getBoundingClientRect();
      this.y = rect.y;
      this.height = rect.height;
      this.windowHeight = window.innerHeight;
    }
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
        .filter((title) => data.filter((d) => d.title === title).length > 0)
        .map((title) => {
          const item = titleToPreview[title];

          const style = {
            position: "absolute",
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            opacity: 0,
          };

          if (item.type === "video") {
            return (
              <video
                key={title + "-preload"}
                style={style}
                preload="auto"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={`./static/images/${item.url}`} type="video/mp4" />
              </video>
            );
          }
        });
    }

    let preview;
    let overlayStyle;
    let link;
    if (selectedTitle) {
      this._measure();
      const item = titleToPreview[selectedTitle];

      const offset = selectedHeight + previewPadding;
      const overlayWidth = this.state.width - previewPadding * 2;

      const impliedHeight = item.type === 'video' ? overlayWidth * 0.6 : overlayWidth;
      
      const buttonHeight = 20;
      let orient;
      if (selectedY + offset + impliedHeight + buttonHeight + this.y + 16 > this.windowHeight) {
        orient = 'top';
      } else {
        orient = 'bottom';
      }

      let translateY;
      if (orient === 'top') {
        translateY = selectedY - previewPadding;
      } else {
        translateY = selectedY + offset;
      }

      overlayStyle = getOverlayStyle(overlayWidth,  translateY, orient);

      let linkText;
      if (item.media === "website") {
        linkText = "visit webpage";
      } else {
        linkText = "visit source";
      }

      if (item.link) {
        link = (
          <button
            onClick={function () {
              window.open(item.link, "_blank");
            }}
            style={{
              margin: 0,
              width: "100%",
              // paddingTop: "1em",
              // paddingBottom: "1em",
              cursor: "pointer",
              boxShadow: boxShadow,
            }}
          >
            {linkText}
          </button>
        );
      }

      const style = {
        width: overlayWidth,
        backgroundColor: "#000",
        marginBottom: orient === 'bottom' ? previewPadding : 0,
        marginTop: orient === 'top' ? previewPadding : 0,
        boxShadow: boxShadow,
      };

      if (item.type === "video") {
        preview = (
          <video style={style} key={selectedTitle} autoPlay muted playsInline>
            <source src={`./static/images/${item.url}`} type="video/mp4" />
          </video>
        );
      } else {
        preview = <img style={style} src={`./static/images/${item.url}`}></img>;
      }
    }

    const overlay = (
      <div key={selectedTitle || "overlay"} style={overlayStyle}>
        {preview}
        {link}
      </div>
    );

    return (
      <div
        className="media-picker"
        // onContextMenu={function(e) { e.preventDefault();}}

        style={{
          width: width,
          position: "relative",
          paddingBottom: "1em",
        }}
      >
        {previews}
        {overlay}
        {this.state.width ? (
          <MediaAll
            type={type}
            mediaType={mediaType}
            mediaTitle={mediaTitle}
            noAutoplayTimeline={noAutoplayTimeline}
            data={data}
            width={this.state.width}
            headers={headers}
            inline={inline}
            selectTitle={this.selectTitle}
            hasSelected={this.state.selectedY !== null}
            selectedTitle={selectedTitle}
          />
        ) : null}
      </div>
    );
  }
}
