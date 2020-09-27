import * as React from "react";
import Graphic from "./pipeline-graphic";
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
    stage: "simple",
    emissions: 2,
    emissionsString: "2%*",
    name: "Data Centers",
  },
  {
    stage: "simple",
    emissions: 58,
    emissionsString: "58%",
    name: "Networks",
  },
  {
    stage: "simple",
    emissions: 40,
    emissionsString: "40%",
    name: "Devices",
  },
];

const ict2010 = [
  {
    stage: "compare",
    emissions: 33,
    emissionsString: "33%",
    name: "Data Centers",
  },
  {
    stage: "compare",
    emissions: 28,
    emissionsString: "28%",
    name: "Networks",
  },
  {
    stage: "compare",
    emissions: 39,
    emissionsString: "39%",
    name: "Devices",
  },
];

const ict2020 = [
  {
    stage: "compare",
    emissions: 45,
    emissionsString: "45%",
    name: "Data Centers",
  },
  {
    stage: "compare",
    emissions: 24,
    emissionsString: "24%",
    name: "Networks",
  },
  {
    stage: "compare",
    emissions: 31,
    emissionsString: "31%",
    name: "Devices",
  },
];

export default class Pipeline extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      youtubeEmissionsHeight: 0,
      youtubeEmissionsTextHeight: 0,
    };
  }
  
  componentDidMount() {
    setTimeout(() => {
      const youtubeEmissions = document.getElementById("youtube-emissions");
      const youtubeEmissionsText = document.getElementById("youtube-emissions-text");
      this.setState({
        youtubeEmissionsHeight: youtubeEmissions.clientHeight,
        youtubeEmissionsTextHeight: youtubeEmissionsText.clientHeight
      });
    }, 1000);
  }

  render() {
    const stage = this.props.stage;
    const progress = this.props.progress;

    const stageIndex = stages.indexOf(stage);

    const showGraphic = stageIndex <= stages.indexOf("simple");
    const compareProgress = stage === "compare" ? progress : 100;
    const final = stage === 'final';

    const showDatacenters = stage === "worldmap"
    const showPops = stage === "pop" && this.props.showPops
    const showGgcs = stage === "cdn" && this.props.showGgcs

    const yh = this.state.youtubeEmissionsHeight;
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
                (yh * compareProgress) / 100
              }px))`
            : `translateY(calc(-${100 + progress}% + ${yh}px))`
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
          opacity: showDatacenters ? 1 : 0,
          zIndex: showDatacenters ? 100 : 0,
          transform: 'translateZ(0)',
          transition: 'opacity 200ms linear, z-index 200ms linear',
        }}>
          <PipelineMap dataType="datacenters" animate={showDatacenters} />
        </div>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: backgroundColor,
          top: 0,
          left: 0,
          opacity: showPops ? 1 : 0,
          zIndex: showPops ? 100 : 0,
          transform: 'translateZ(0)',
          transition: 'opacity 200ms linear, z-index 200ms linear',
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
          zIndex: showGgcs ? 100 : 0,
          transform: 'translateZ(0)',
          transition: 'opacity 200ms linear, z-index 200ms linear',
        }}>
          <PipelineMap dataType="ggcs" animate={showGgcs}/>
        </div>
        <Emissions
          id="youtube-emissions"
          stage={stage}
          progress={progress}
          data={
            stageIndex < stages.indexOf("simple")
              ? youtubeData
              : youtubeDataSimple
          }
          style={{
            marginTop: 16
          }}
          showHomesText
        />
        <div
            style={{
              width: "100%",
              textAlign: "left",
              position: "absolute",
              fontSize: '0.75em',
              top: `calc(100% - ${this.state.youtubeEmissionsTextHeight}px)`,
              opacity: stageIndex < stages.indexOf('compare') ? 0 : compareProgress / 100
            }}
          >
            YouTube (2016) [Priest et al.]
            <br />
            {/* <span style={{ fontSize: '0.65em' }}>
              * Google purchases renewable energy to run its data centers.
            </span> */}
          </div>
        <div
          style={{
            position: "absolute",
            top: "100%",
            width: "100%",
            height: `calc(100% - ${yh}px)`,
            display: "flex",
            flexDirection: "column-reverse",
            // overflow: 'hidden'
          }}
        >
          <Emissions id="2020-emissions" stage={stage} progress={progress} data={ict2010} showHomesText={false}/>
          <div style={{ width: "100%", textAlign: "left", fontSize: '0.75em', lineHeight: '1.1em', marginTop: '1em'}}>
            ICT Sector (2020, projected) [Belkhir & Elmeligi, 2017]
          </div>
          <Emissions id="2010-emissions" stage={stage} progress={progress} data={ict2020} showHomesText={false}/>
          <div style={{ width: "100%", textAlign: "left", fontSize: '0.75em', lineHeight: '1.1em',
            opacity: stageIndex < stages.indexOf('compare') ? 0 : compareProgress / 100
          }}>
            ICT Sector (2010) [Belkhir & Elmeligi, 2017]
          </div>
        </div>
        <Projection
          style={{
            position: "absolute",
            top: `calc(200% - ${yh}px)`,
            width: "100%",
            height: "100%",
            opacity: stage === "final" ? 1 : 0,
          }}
        />
      </div>
    );
  }
}
