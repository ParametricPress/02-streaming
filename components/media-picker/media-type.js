import * as React from "react";
import { Group } from "@vx/group";
import MediaTitle from "./media-title";
import { Container, Text } from "./components";
import { textColor, font, titleOrder, co2PerMeter } from "../constants";

/** Props:
type: 'timeline' | 'bar'
data: {
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
xScaleVX: vx.scaleLinear
*/
const mediaTitlePadding = {
  bottom: 8,
  left: 2,
};

const titleCase = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default class MediaType extends React.PureComponent {
  render() {
    const type = this.props.type;
    const data = this.props.data;
    const headers = this.props.headers;
    const mouseX = this.props.mouseX;
    const animate = this.props.animate;
    const xScaleVX = this.props.xScaleVX;
    const hasSelected = this.props.hasSelected;
    const selectedTitle = this.props.selectedTitle;

    const maxInType = data.titles.reduce((m, d) => {
      let maxInTitle;
      if (d.packets.length) {
        maxInTitle = d.packets.reduce((s, p) => s + p.size, 0);
      } else {
        maxInTitle = d.packets[1080].reduce((s, p) => s + p.size, 0);
      }

      if (maxInTitle > m.amount) {
        return { title: d.title, amount: maxInTitle };
      }

      return m;
    }, { title: '', amount: 0 });

    const carDistance = Math.round((maxInType.amount * 1000 / co2PerMeter) * 100) / 100;
    let maxTitle = maxInType.title.substring(0, maxInType.title.indexOf('(') - 1);
    if (data.mediaType === "video") {
      maxTitle += " at 1080p"
    }

    let maxVerb;
    if (data.mediaType === "website") {
      maxVerb = "scrolling through";
    } else if (data.mediaType === "audio") {
      maxVerb = "listening to";
    } else if (data.mediaType === "video") {
      maxVerb = "watching";
    }
    return (
      <div
        style={{
          width: "100%",
        }}
      >
        {headers ? (
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: font,
              paddingLeft: mediaTitlePadding.left,
              paddingBottom: mediaTitlePadding.bottom,
              color: textColor,
              opacity: hasSelected ? 0.2 : 1,
            }}
          >
            {titleCase(data.mediaType)}
          </div>
        ) : null}
        {data.titles
          .sort((a, b) => {
            return titleOrder.indexOf(a.title) - titleOrder.indexOf(b.title);
          })
          .map((d, i) => {
            const mediaTitle = (
              <div
                key={i}
                style={{
                  width: "100%",
                  paddingBottom: mediaTitlePadding.bottom,
                }}
              >
                <MediaTitle
                  type={type}
                  data={d}
                  xScaleVX={xScaleVX}
                  mouseX={mouseX}
                  animate={animate}
                  selectTitle={this.props.selectTitle}
                  hasSelected={hasSelected}
                  selectedTitle={selectedTitle}
                />
              </div>
            );
            return mediaTitle;
          })}
        <div
          style={{
            fontSize: 12,
            paddingLeft: 8,
            marginBottom: 4,
            lineHeight: '14px'
          }}
        >
          <b style={{ color: "#EE998B" }}>↑</b> A minute {maxVerb} {maxTitle} is equivalent to driving a car{" "}
          <b style={{ color: "#EE998B" }}>{carDistance}</b> meters
        </div>
      </div>
    );
  }
}
