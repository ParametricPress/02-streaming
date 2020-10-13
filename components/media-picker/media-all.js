import * as React from "react";
import ReactDOM from 'react-dom';
import MediaType from "./media-type";
import {
  getMaxSize,
  groupByType,
  groupByTitle,
  addCumulativeSize,
  getMaxTime,
} from "./util";
import { scaleLinear } from "@vx/scale";
import { Rect, Text } from "./components";
import { guideColor, font, typeOrder } from "../constants";

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
  timeline: [20, 40, 60],
};

export default class MediaAll extends React.PureComponent {
  static getXScaleVX = (width, maxTotal) => {
    return {
      timeline: scaleLinear({
        range: [0, width - paddingRight],
        round: true,
        domain: [0, 60],
      }),
      bar: scaleLinear({
        range: [0, width - paddingRight],
        round: true,
        domain: [0, maxTotal],
      }),
    };
  };

  constructor(props) {
    super(props);

    this.data = props.data;
    this.data.forEach((d) => addCumulativeSize(d.packets));

    this.maxTotal = getMaxSize(this.data);

    const mediaType = props.mediaType;
    if (mediaType) {
      this.data = this.data.filter((d) => d.mediaType === mediaType);
    }

    const mediaTitle = props.mediaTitle;
    if (mediaTitle) {
      this.data = this.data.filter(d => mediaTitle.includes(d.title));
    }
    this.groupData = groupByType(groupByTitle(this.data));

    this.animateTimeout = -1;
    this.state = {
      mouseX: null,
      mouseMax: null,
      animate: true,
      autoplaying: false,
    };

    this.hasBeenTimeline = false;
    this.autoplayInterval = null;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.clearMouse = this.clearMouse.bind(this);
  }

  render() {
    const type = this.props.type;
    const width = this.props.width;
    const hasSelected = this.props.hasSelected;
    const selectedTitle = this.props.selectedTitle;
    const inline = this.props.inline;
    const noAutoplayTimeline = this.props.noAutoplayTimeline;

    const xScaleVX = MediaAll.getXScaleVX(width, this.maxTotal);

    if (type === "timeline" && !noAutoplayTimeline) {
      if (!this.hasBeenTimeline) {
        setTimeout(() => {
          this.autoplayInterval = setInterval(() => {
            if (this.state.mouseX >= width) {
              setTimeout(() => {
                clearInterval(this.autoplayInterval);
                this.setState({ mouseX: null, autoplaying: false });
              }, 0);
            }
            this.setState({
              mouseX: !this.state.autoplaying ? 0 : this.state.mouseX + 0.01 * width,
              autoplaying: true
            });
          }, 10);
        }, 700);
      }

      this.hasBeenTimeline = true;
    }

    return (
      <div
        style={{
          width: "100%",
          paddingTop: inline ? 2 : 8,
          paddingBottom: 2,
          border: inline ? null : "1px solid " + guideColor,
          position: "relative",
        }}
        onTouchStart={this.handleMouseMove}
        onTouchMoveCapture={this.handleMouseMove}
        onTouchEnd={this.clearMouse}

        onMouseEnter={this.handleMouseMove}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.clearMouse}
      >
        {inline ? null : gridlines[type].map((d, i) => (
          <Grid key={i} left={xScaleVX[type](d)} />
        ))}
        {this.groupData
          .sort((a, b) => {
            return (
              typeOrder.indexOf(a.mediaType) - typeOrder.indexOf(b.mediaType)
            );
          })
          .map((d, i) => {
            const mediaType = (
              <div
                key={i}
                style={{
                  width: "100%",
                  position: "relative",
                  marginBottom: inline ? 0 :
                    i === this.groupData.length - 1 ? 0 : mediaTypePadding,
                }}
              >
                <MediaType
                  type={type}
                  inline={inline}
                  data={d}
                  showCarEquivalent={this.props.mediaType}
                  xScaleVX={xScaleVX}
                  animate={this.state.animate}
                  mouseX={type === "timeline" ? this.state.mouseX : null}
                  selectTitle={this.props.selectTitle}
                  hasSelected={hasSelected}
                  selectedTitle={selectedTitle}
                  headers={this.props.headers}
                />
              </div>
            );

            return mediaType;
          })}
        {inline ? null : gridlines[type].map((d, i) => {
          const val = type === "bar" ? d * 1000 + " mg" : d + " s";
          return <Label key={i} value={val} left={xScaleVX[type](d)} />;
        })}
      </div>
    );
  }

  handleMouseMove(e) {
    clearTimeout(this.animateTimeout);
    if (this.props.type === "timeline" && !this.state.autoplaying) {
      let mouseX;

      const node = ReactDOM.findDOMNode(this);
      
      if (e.clientX !== undefined) {
        mouseX = e.clientX - node.getBoundingClientRect().x;
      } else {
        mouseX = e.touches[0].clientX - node.getBoundingClientRect().x;
      }

      const animate = false;
      this.setState({ mouseX, animate });
      this.animateTimeout = setTimeout(
        () => this.setState({ animate: true }),
        200
      );
    }
  }

  clearMouse() {
    clearTimeout(this.animateTimeout);
    if (!this.state.autoplaying) {
      this.setState({ mouseX: null, animate: false });
      this.animateTimeout = setTimeout(
        () => this.setState({ animate: true }),
        200
      );
    }
  }
}

const Label = (props) => {
  return (
    <Text
      top={4}
      left={props.left - 30}
      style={{
        width: 60,
        fontSize: 10,
        fontFamily: font,
        textAlign: "center",
        color: "#AAAAAA",
        transition: "transform 700ms ease-in-out",
        pointerEvents: "none",
      }}
    >
      {props.value}
    </Text>
  );
};

const Grid = (props) => {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 0,
        width: 1,
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: guideColor,
        transform: `translateX(${props.left}px)`,
        transition: "transform 700ms ease-in-out",
      }}
    ></div>
  );
};
