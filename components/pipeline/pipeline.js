import * as React from "react";
import Graphic from "./graphic";
import Emissions from "./emissions";
import { stages } from "./constants";

const youtubeData = [
  {
    stage: "cdn", // and also data center
    emissions: 360,
  },
  {
    stage: "internet",
    emissions: 1900,
  },
  {
    stage: "residential",
    emissions: 4400,
  },
  {
    stage: "cellular",
    emissions: 6100,
  },
  {
    stage: "device",
    emissions: 8500,
  },
]; // total = 21,260

const youtubeDataSimple = [
  {
    stage: "simple",
    emissions: 2,
    name: 'Data Centers + CDNs'
  },
  {
    stage: "simple",
    emissions: 58,
    name: 'Networks'
  },
  {
    stage: "simple",
    emissions: 40,
    name: 'Devices'
  },
];

const ict2010 = [
  {
    stage: "compare",
    emissions: 33,
    name: 'Data Centers + CDNs'
  },
  {
    stage: "compare",
    emissions: 28,
    name: 'Networks'
  },
  {
    stage: "compare",
    emissions: 39,
    name: 'Devices'
  },
];

const ict2020 = [
  {
    stage: "compare",
    emissions: 45,
    name: 'Data Centers + CDNs'
  },
  {
    stage: "compare",
    emissions: 24,
    name: 'Networks'
  },
  {
    stage: "compare",
    emissions: 31,
    name: 'Devices'
  },
];

export default class Pipeline extends React.PureComponent {
  render() {
    const stage = this.props.stage;
    const progress = this.props.progress;

    const stageIndex = stages.indexOf(stage);

    const showGraphic = stageIndex <= stages.indexOf("simple");

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: showGraphic
            ? "translateY(0)"
            : `translateY(calc(-${progress}% + ${(94 * progress) / 100}px))`,
        }}
      >
        <Graphic stage={stage} progress={progress} />
        <Emissions
          stage={stage}
          progress={progress}
          data={
            stageIndex < stages.indexOf("simple")
              ? youtubeData
              : youtubeDataSimple
          }
        />
        <div
          style={{
            position: "absolute",
            top: "100%",
            width: "100%",
            height: "calc(100% - 94px)",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <Emissions stage={stage} progress={progress} data={ict2010} />
          <div style={{ width: "100%", textAlign: "left", marginTop: 16 }}>
            ICT Sector as a Whole (2020)   [Belkhir & Elmeligi]
          </div>
          <Emissions stage={stage} progress={progress} data={ict2020} />
          <div style={{ width: "100%", textAlign: "left" }}>
            ICT Sector as a Whole (2010)   [Belkhir & Elmeligi]
          </div>
          <div
            style={{
              width: "100%",
              textAlign: "left",
              position: "absolute",
              top: 0,
            }}
          >
            YouTube (2016)   [Priest et al.]
          </div>
        </div>
      </div>
    );
  }
}
