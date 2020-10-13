import * as React from "react";
import { stages } from "./constants";
import { markColor, backgroundColor } from "../constants";

const markHeight = 22;

export default class Emissions extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const data = this.props.data;
    const total = data.reduce((s, d) => s + d.emissions, 0);

    const stage = this.props.stage;
    const stageIndex = stages.indexOf(stage);
    const hasLabel = [
      "datacentersall",
      "internet",
      "residential",
      "cellular",
      "device",
      "all",
      "all2",
      "all3"
    ].includes(this.props.stage);

    const simplified =
      stage === "simple" || stage === "compare" || stage === "final";
    const filteredData =
      stage.startsWith("all")
        ? [
            data.reduce(
              (p, d) => {
                p.emissions += d.emissions;
                return p;
              },
              { stage: "all", emissions: 0 }
            ),
          ]
        : data;

    const current = data.filter((d) => d.stage === stage);
    return (
      <div
        id={this.props.id}
        style={{
          ...this.props.style,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          {filteredData.map((d, i) => {
            let opacity;
            if (stage === "final") {
              opacity = 0.2;
            } else if (
              stages.indexOf(d.stage) === stageIndex ||
              stageIndex >= stages.indexOf("all")
            ) {
              opacity = 1;
            } else if (stages.indexOf(d.stage) < stages.indexOf(stage)) {
              opacity = 0.2;
            } else {
              opacity = 0;
            }

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: (d.emissions / total) * 100 + "%",
                }}
              >
                <div
                  style={{
                    opacity:
                      stage === "final"
                        ? 0.2
                        : stage === "beforesimple"
                        ? 0
                        : opacity === 1
                        ? 1
                        : 0,
                    color: "white",
                    whiteSpace: "nowrap",
                    marginLeft: stage === "cdn" ? 2 : 0,
                    textAlign: stage === "cdn" ? "left" : "center",
                    fontSize: simplified ? '0.6em' : undefined,
                  }}
                >
                  {simplified
                    ? d.name
                    : stages.indexOf(d.stage) >= stages.indexOf("all")
                    ? "19.6 TWh"
                    : d.emissionsString + " GWh"}
                </div>
                <div
                  style={{
                    height: markHeight,
                    width: "100%",
                    opacity: opacity,
                    boxSizing: "border-box",
                    borderStyle: "solid",
                    borderColor: backgroundColor,
                    borderWidth: stage.startsWith("all") ? 0 : 2,
                    backgroundColor: "white",
                    marginTop: 4,
                    transition: "opacity 200ms linear",
                  }}
                />
                <div
                  style={{
                    opacity:
                      stageIndex <= stages.indexOf("beforesimple") ? 0 : 1,
                    color: "white",
                    whiteSpace: "nowrap",
                    marginLeft: stage === "cdn" ? 2 : 0,
                    textAlign: stage === "cdn" ? "left" : "center",
                    fontSize:
                      stageIndex <= stages.indexOf("beforesimple")
                        ? undefined
                        : 10,
                  }}
                >
                  {simplified ? d.emissionsString : "placeholder"}
                </div>
              </div>
            );
          })}
        </div>
        {this.props.showHomesText ? (
          <div
            id={this.props.id + "-text"}
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "white",
              opacity: hasLabel ? 1 : 0,
              transform: "translateY(-1em)",
            }}
          >
            {stages.indexOf(stage) >= stages.indexOf("all")
              ? "Enough to power over 1.7 million U.S. homes for a year"
              : `Enough to power over ${
                  current.length ? current[0].homes : ""
                } U.S. homes for a year`}
          </div>
        ) : null}
      </div>
    );
  }
}
