import * as React from "react";
import Graphic from "./graphic";
import Emissions from "./emissions";
import { stages } from "./constants";
import Projection from "./projection";
import PipelineMap from "./map";
import { backgroundColor } from "../constants";

const youtubeData = [
  {
    stage: "cdn", // and also data center
    emissions: 360,
    emissionsString: "360",
    homes: "32,000"
  },
  {
    stage: "internet",
    emissions: 1900,
    emissionsString: "1,900",
    homes: "170,000"
  },
  {
    stage: "residential",
    emissions: 4400,
    emissionsString: "4,400",
    homes: "400,000"
  },
  {
    stage: "cellular",
    emissions: 6100,
    emissionsString: "6,100",
    homes: "500,000"
  },
  {
    stage: "device",
    emissions: 8500,
    emissionsString: "8,500",
    homes: "750,000"
  },
]; // total = 21,260

const youtubeDataSimple = [
  {
    stage: "simple*",
    emissions: 2,
    name: "Data Centers + CDNs",
  },
  {
    stage: "simple",
    emissions: 58,
    name: "Networks",
  },
  {
    stage: "simple",
    emissions: 40,
    name: "Devices",
  },
];

const ict2010 = [
  {
    stage: "compare",
    emissions: 33,
    name: "Data Centers + CDNs†",
  },
  {
    stage: "compare",
    emissions: 28,
    name: "Networks",
  },
  {
    stage: "compare",
    emissions: 39,
    name: "Devices",
  },
];

const ict2020 = [
  {
    stage: "compare",
    emissions: 45,
    name: "Data Centers + CDNs†",
  },
  {
    stage: "compare",
    emissions: 24,
    name: "Networks",
  },
  {
    stage: "compare",
    emissions: 31,
    name: "Devices",
  },
];

export default class Pipeline extends React.PureComponent {
  render() {
    const stage = this.props.stage;
    const progress = this.props.progress;

    const stageIndex = stages.indexOf(stage);

    const showGraphic = stageIndex <= stages.indexOf("simple");
    const compareProgress = stage === "compare" ? progress : 100;
    const final = stage === 'final';

    const showPops = stage === "pop" && this.props.showPops
    const showGgcs = stage === "cdn" && this.props.showGgcs

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
            : !final ? `translateY(calc(-${compareProgress}% + ${
                (94 * compareProgress) / 100
              }px))`
            : `translateY(calc(-${100 + progress}% + 94px))`
        }}
      >
        <Graphic stage={stage} progress={progress} />
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: backgroundColor,
          top: 0,
          left: 0,
          opacity: showPops ? 1 : 0,
          zIndex: showPops ? 100 : 0
        }}>
          <PipelineMap dataType="pops" animate={showPops} />
        </div>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: backgroundColor,
          top: 0,
          left: 0,
          opacity: showGgcs ? 1 : 0,
          zIndex: showGgcs ? 100 : 0
        }}>
          <PipelineMap dataType="ggcs" animate={showGgcs}/>
        </div>
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
            ICT Sector as a Whole (2020, projected) [Belkhir & Elmeligi, 2017]
          </div>
          <Emissions stage={stage} progress={progress} data={ict2020} />
          <div style={{ width: "100%", textAlign: "left" }}>
            <span style={{ fontSize: 12 }}>
              † Belkhir & Elmeligi do not distinguish between core data centers
              and those in the content delivery network, grouping them under a
              'Data Center' category
            </span>
            <br />
            <br />
            ICT Sector as a Whole (2010) [Belkhir & Elmeligi, 2017]
          </div>
          <div
            style={{
              width: "100%",
              textAlign: "left",
              position: "absolute",
              top: 0,
            }}
          >
            YouTube (2016) [Priest et al.]
            <br />
            <span style={{ fontSize: 12 }}>
              * Google purchases renewable energy to run its data centers. If
              this weren't the case, this category would still only account for
              less than 2% of YouTube's emissions.
            </span>
          </div>
        </div>
        <Projection
          style={{
            position: "absolute",
            top: 'calc(200% - 94px)',
            width: "100%",
            height: "100%",
            opacity: stage === "final" ? 1 : 0,
          }}
        />
      </div>
    );
  }
}
