import * as React from "react";
import { stages } from "./constants";
import { scaleLinear } from "@vx/scale";
import { extent } from "d3-array";

const x1 = 70;
const x2 = 182;
const y1 = 119;
const y2 = 77;
const w1 = 2;
const w2 = 16;
const h1 = 2;
const h2 = 16;

const getMarkInfo = (mark) => {
  const opacity = mark.getAttribute("opacity");
  const stroke = mark.getAttribute("stroke");
  const strokeWidth = mark.getAttribute("stroke-width");
  const fill = mark.getAttribute("fill");
  const width = mark.getAttribute("width");

  if (mark.tagName === "g") {
    if (mark.getAttribute("id") === "us-map") {
      return { stage: "datacenter", appear: true, substage: 2, of: 2, stay: true };
    }
    return { stage: "worldmap", appear: true, substage: 1, of: 2};
  } else if (mark.tagName === "rect") {
    if (mark.getAttribute("id") === "datacenter") {
      return { stage: "datacenter", id: "datacenter", substage: 1, of: 2, appear: true };
    } else if (width === "8") {
      return { stage: "pop", appear: true, substage: 1, of: 3 };
    } else if (width === "4") {
      return { stage: "cdn", appear: true };
    } else if (strokeWidth === "4") {
      return { stage: "none", appear: true };
    } else if (width === "2") {
      return { stage: "worldmap", appear: true, substage: 2, of: 2 };
    }
  } else if (mark.tagName === "path") {
    if (stroke === "#606060") {
      if (strokeWidth === "3" || strokeWidth === "2") {
        if (opacity === null) {
          return { stage: "internet", substage: 1, of: 6, draw: true };
        } else if (opacity === "0.99") {
          return { stage: "internet", substage: 3, of: 6, draw: true };
        } else {
          return { stage: "internet", substage: 5, of: 6, draw: true };
        }

      } if (strokeWidth === "5") {
        return { "stage": "border" };
      } else {
        if (opacity === null) {
          return { stage: "residential", substage: 1, of: 2, draw: true };
        } else if (opacity === "0.99") {
          return { stage: "residential", substage: 1, of: 2, draw: true };
        } else {
          return { stage: "cellular", substage: 1, of: 67, draw: true };
        }
      }
    } else if (stroke === "#1F1F1F") {
      return { stage: "pop", substage: 2, of: 3, draw: true };
    } else if (stroke === "white") {
      if (strokeWidth === "4") {
        if (opacity === null) {
          return { stage: "internet", substage: 2, of: 6, animate: true, speed: 'fast', appear: true };
        } else if (opacity === "0.99") {
          return { stage: "internet", substage: 4, of: 6, animate: true, speed: 'fast', appear: true };
        } else if (opacity === "0.98") {
          return { stage: "pop", substage: 3, of: 3, animate: true, speed: 'fast', appear: true };
        }
      } else if (strokeWidth === "2") {
        if (opacity === null) {
          return { stage: "residential", substage: 2, of: 2, animate: true, speed: 'slow', appear: true };
        } else if (opacity === "0.99") {
          return { stage: "residential", substage: 2, of: 2, animate: true, speed: 'fast', appear: true };
        } else {
          return { stage: "cellular", substage: 2, of: 7, animate: true, speed: 'fast', appear: true };
        }
      }
    } else if (fill === "white") {
      if (opacity === null) {
        return { stage: "datacenter", substage: 2, of: 2, appear: true, label: true };
      } else if (opacity === "0.99") {
        return { stage: "cdn", appear: true, label: true };
      } else if (opacity === "0.98") {
        return { stage: "internet", appear: true, label: true };
      } else if (opacity === "0.97") {
        return { stage: "residential", appear: true, label: true };
      } else if (opacity === "0.96") {
        return { stage: "cellular", appear: true, label: true };
      } else {
        return { stage: "device", appear: true, label: true };
      }
    }
  } else if (mark.tagName === "circle") {
    if (mark.getAttribute("r") === "1" && fill === "#D1FF99") {
      return { stage: "device", appear: true };
    } else {
      let substage;
      if (opacity === null) {
        substage = 3;
      } else if (opacity === "0.99") {
        substage = 4;
      } else if (opacity === "0.98") {
        substage = 5;
      } else if (opacity === "0.97") {
        substage = 6;
      }
      return { stage: "cellular", substage, of: 6, appear: true, blink: true };
    }
  }
};

const getSubprogress = (progress, substage, substageOf) => {
  const div = 100 / substageOf;
  const start = div * (substage - 1);
  const subProgress = Math.min(Math.max(progress - start, 0) / div, 1);
  return subProgress;
};

const interpolate = (start, end, i) => {
  const scale = scaleLinear({
    domain: [0, 1],
    range: [start, end]
  });

  return scale(i);
}

export default class PipelineGraphic extends React.PureComponent {
  constructor(props) {
    super(props);

    this.marks = [];
  }

  componentDidMount() {
    const svg = document.getElementById("pipeline-graphic");

    const pathLengths = [0];
    for (const e of svg.children) {
      const info = getMarkInfo(e);

      if (!info) {
        continue;
      }

      const ref = {
        element: e,
        ...info,
      };

      if (e.tagName === "path") {
        const pathLength = e.getTotalLength();
        e.setAttribute("stroke-dasharray", pathLength);
        e.setAttribute("stroke-dashoffset", pathLength);
        ref.pathLength = pathLength;

        if (ref.animate) {
          pathLengths.push(pathLength);
        }
      }

      if (info.appear) {
        e.style.transition = "opacity 200ms linear";
      }

      this.marks.push(ref);
    }

    const pathScale = scaleLinear({
      domain: extent(pathLengths),
      range: [0, 10],
    });

    for (const ref of this.marks) {
      if (ref.animate) {
        const e = ref.element;
        const strokeWidth = e.getAttribute("stroke-width");
        const pathLength = ref.pathLength;

        e.setAttribute(
          "stroke-dasharray",
          `${strokeWidth} ${pathLength - strokeWidth}`
        );
        e.setAttribute("data-length", pathLength);
        e.style.animationDelay = Math.random() + "s";
        if (ref.speed === 'slow') {
          e.style.animationDuration = pathScale(pathLength * 3) + "s";
        } else {
          e.style.animationDuration = pathScale(pathLength) + "s";
        }
        e.classList.add("packet-animated");
      }

      if (ref.blink) {
        const e = ref.element;
        e.style.animationDelay = ref.substage / ref.of + "s";
        e.style.animationDuration = 2 + "s";
        e.classList.add("radio-animated");
      }
    }

    this.redraw();
  }

  componentDidUpdate() {
    this.redraw();
  }

  redraw() {
    const currentStage = this.props.stage;

    const progress = this.props.progress;
    const currentStageIndex = stages.indexOf(currentStage);

    for (const m of this.marks) {
      const e = m.element;
      const visible = stages.indexOf(m.stage) <= currentStageIndex;

      if (m.draw) {
        if (m.stage === currentStage) {
          if (m.substage) {
            const subprog = getSubprogress(progress, m.substage, m.of);
            e.setAttribute(
              "stroke-dashoffset",
              m.pathLength - m.pathLength * subprog
            );
          } else {
            e.setAttribute(
              "stroke-dashoffset",
              m.pathLength - m.pathLength * (progress / 100)
            );
          }
        } else {
          e.setAttribute("stroke-dashoffset", visible ? 0 : m.pathLength);
        }
      }

      let opacity;

      if (m.id === 'datacenter') {
        let x;
        let y;
        let width;
        let height;
        const subprog = getSubprogress(progress, m.substage, m.of);

        if (m.stage === currentStage) {
          x = interpolate(x1, x2, subprog);
          y = interpolate(y1, y2, subprog);
          width = interpolate(w1, w2, subprog);
          height = interpolate(h1, h2, subprog);

          opacity = 1;
        } else if (stages.indexOf('datacenter') < stages.indexOf(currentStage)) {
          x = x2;
          y = y2;
          width = w2;
          height = h2;

          if (currentStage === "datacentersall") {
            opacity = 1;
          } else {
            opacity = 0.2
          }
        } else {
          x = x1;
          y = y1;
          width = w1;
          height = h1;

          if (currentStage === "worldmap") {
            opacity = getSubprogress(progress, m.of, m.of);
          } else if (currentStage === "worldmap2" || currentStage === "worldmap3") {
            opacity = 1
          } else {
            opacity = 0;
          }
        }

        e.setAttribute('x', x);
        e.setAttribute('y', y);
        e.setAttribute('width', width);
        e.setAttribute('height', height);
      } else if (m.stage === currentStage && m.substage && m.appear) {
        const subprog = getSubprogress(progress, m.substage, m.of);
        opacity = visible ? subprog : 0;
      } else {
        if (
          m.stage === currentStage || m.stage === "border" ||
          (m.stage === "worldmap" && (currentStage === "worldmap2" || currentStage === "worldmap3")) ||
          (currentStage.startsWith("all") && m.stage !== "worldmap") ||
          (m.stage === "datacenter" && currentStage === "datacentersall") ||
          ((m.stage === "pop" || m.stage === "pop2") && currentStage === "datacentersall") ||
          (m.stage === "cdn" && currentStage === "datacentersall") ||
          (m.id === "datacenter" && currentStage === "worldmap") ||
          (m.stay && stages.indexOf(m.stage) <= currentStageIndex)
        ) {
          opacity = 1;
        } else if (m.stage === "worldmap" && currentStage !== "worldmap") {
          opacity = 0;
        } else if (stages.indexOf(m.stage) < currentStageIndex) {
          opacity = 0.2;
        } else {
          opacity = 0;
        }
      }
      e.style.opacity = opacity;
    }
  }

  render() {
    const worldMap =
      stages.indexOf(this.props.stage) <= stages.indexOf("worldmap");

    return (
      <svg
        id="pipeline-graphic"
        width="100%"
        height="100%"
        viewBox="0 0 375 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={this.props.style}
      >
        <rect width="375" height="280" fill="#444444"/>
        {map}
        {/* West coast map (from figma) */}
        <g clipPath="url(#clip0)" id="us-map">
<path d="M357.152 262.522L372.15 262.491V281.973V302.085V309.368L372.037 324.565V335.289V343.367V349.918V370.159H349.936H340.238L335.671 368.439L304.775 357.11L281.546 348.668L281.772 346.776L283.012 344.471L286.057 343.759L287.015 340.827L286.226 338.715L283.971 338.594L283.181 337.537L283.745 334.977L282.843 333.473L282.899 331.614L284.478 331.008L286.057 328.853L286.508 326.107L285.887 321.781L287.466 319.848L287.522 318.707L290.285 317.066L292.146 314.616L288.988 311.805L286.959 306.845L284.309 303.711L284.365 301.292L285.324 298.674L284.985 295.048L283.632 291.735L284.027 289.464L283.238 287.761L283.914 284.536L282.617 282.338L282.448 280.282L284.478 279.29L287.861 279.165L290.623 281.764L291.977 281.566L293.612 278.266L293.499 265.551V262.459H311.597H317.235L334.938 262.438L345.369 262.406L357.152 262.522Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M224.771 342.906L223.643 341.972L222.177 338.553L225.673 342.213L224.771 342.906ZM226.406 333.594L224.094 333.089L222.967 330.29L225.729 331.584L226.406 333.594ZM198.272 322.38L196.355 320.204L199.4 319.695L200.02 321.475L198.272 322.38ZM203.741 321.15L201.993 320.682L201.317 318.89L207.011 320.438L203.741 321.15ZM164.106 160.441L177.355 160.68L186.263 160.748L200.076 160.714V177.749V207.934L200.02 213.517L199.964 216.203L200.02 219.253V220.319V221.232L200.076 222.623L201.542 223.947L206.673 228.463L210.619 231.951L213.326 234.376L224.771 244.742L234.074 253.303L244.561 263.04L264.576 281.993L268.353 285.691L284.365 301.292L284.309 303.711L286.959 306.845L288.988 311.805L292.146 314.616L290.285 317.066L287.522 318.707L287.466 319.847L285.887 321.781L286.508 326.107L286.057 328.853L284.478 331.008L282.899 331.614L282.843 333.473L283.745 334.977L283.181 337.536L283.971 338.594L286.226 338.714L287.015 340.826L286.057 343.759L283.012 344.471L261.249 346.335L245.237 347.907V345.323L243.489 344.491L242.756 342.143L243.264 341.56L242.305 337.567L239.204 332.907L237.851 331.948L233.284 327.82L233.228 327.769L232.664 327.617V327.647L229.62 325.194V325.072L229.451 324.96V325.041L227.985 324.808L227.195 325.488L224.715 324.656L225.335 323.376L224.094 320.784L222.967 319.654L219.189 319.959L216.596 319.511L212.367 317.616L211.465 315.372L208.308 313.267L206.898 312.49L201.993 312.664L199.964 311.631L195.453 311.426L192.578 311.754L192.07 310.464L189.871 309.398L190.548 306.834L189.871 301.786L190.153 299.138L185.981 296.567L187.052 294.872L185.812 292.678L184.233 292.44L181.64 289.007L179.779 288.508L178.934 285.983L177.073 284.276L176.284 281.868L175.325 281.534L173.126 278.234L170.251 276.089L169.011 270.74L171.435 269.205L171.717 265.319L170.477 263.462L166.981 263.367L164.049 260.355L162.019 257.761L162.358 255.374L161.568 252.994L160.554 252.26L160.779 248.479L160.61 247.145L162.132 246.451L162.414 248.479L162.978 250.77L164.557 251.164L166.812 253.281L168.842 253.345L166.868 252.548L166.135 249.322L163.485 246.676L163.767 244.71L162.414 243.619L164.782 241.509L166.192 242.195L168.165 241.52L172.112 242.377L174.874 240.662L175.213 241.863L175.325 240.501L173.69 240.812L174.029 239.032L171.83 241.413L170.082 241.67L167.77 240.008L166.586 241.798L164.839 241.241L164.049 239.547H163.88L164.726 241.048L162.301 239.568L162.189 239.525L160.779 240.426L159.99 239.514L161.005 240.555L160.666 244.089L161.738 245.052L160.328 246.27L155.818 242.805L153.901 241.927L152.829 242.495L153.619 240.308L152.829 236.754L150.913 233.676L148.939 232.426L144.485 227.273L141.271 223.6L142.061 222.145L139.918 215.57L140.82 211.779L139.524 205.705L136.817 202.218L135.464 200.135L131.518 196.91L130.785 193.212L132.927 187.825L134.788 185.564L133.716 186.6L135.239 182.629L134.675 180.124L135.577 176.818L136.141 171.873L134.788 166.277L133.209 165.236L133.886 160.646L140.031 160.714L144.767 160.589L149.334 160.544L164.106 160.441Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M414.942 181.612L416.972 181.623H431.349H436.593L450.575 181.556L458.073 181.545H461.118H472.507H473.071H481.979V186.801V187.869V193.19V195.062V202.174L482.035 210.948V211.068L482.092 219.906V221.657V228.701V230.365V237.303V237.432L482.148 247.882V249.748V254.801V262.597L467.094 262.47H465.741L451.251 262.554L433.266 262.565H432.195L424.414 262.554L419.848 262.565L412.518 262.597L397.634 262.47H396.675L382.58 262.491H372.15V252.91L372.206 245.052V239.622L371.924 232.674L372.037 215.167V212.501V209.184V197.673V188.771V181.578L389.853 181.545L399.269 181.522L406.485 181.545L414.942 181.612Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M262.151 3.41797V15.3067L262.095 22.0749V27.6463L265.534 32.891L267.225 34.1955L267.733 36.6252L266.662 37.6258L268.748 39.2998L266.662 40.6349L269.875 42.2301L271.003 43.8854L273.596 44.4699L273.878 46.0477L275.683 47.3878L277.825 51.1028L279.235 51.931L279.404 53.635L283.689 56.4329L284.985 58.7944L289.101 58.1921L286.677 73.3074L288.199 75.6492L285.38 78.3134L286.508 79.7521L285.436 83.1791L286.902 83.0224L288.876 85.3583L295.303 80.0783L297.276 82.0941L297.84 86.5367L299.137 89.7655L303.027 94.8859L302.238 96.7709L304.662 100.402L306.128 99.5695L308.383 101.626L309.906 106.119L309.962 107.799L312.894 109.417L313.458 107.018L318.306 107.125L319.659 107.81L320.11 106.013L321.689 105.125L324.057 106.226L327.778 105.267L328.511 106.474L331.725 105.575L333.416 105.279L334.036 102.065L335.502 101.127L337.983 103.987L337.814 104.947L340.689 107.267V118.006L340.746 128.505V132.5V138.875L340.689 149.725V160.578L333.473 160.623L324.001 160.68L323.099 160.657L310.018 160.646L293.668 160.748H289.89L277.994 160.691L266.549 160.68L246.929 160.646L246.759 160.612V124.602V121.121L247.436 120.267L248.225 117.935L247.605 116.586L248.789 114.33L245.406 111.505L243.715 111.045L243.658 107.03L244.673 106.143L246.477 101.281L248.789 99.1769L250.593 93.8706L252.116 89.6576L254.145 84.3113L255.611 82.2026L254.427 79.0511L250.368 76.4733L248.507 73.3316L247.436 71.1193L248.338 69.3416L246.196 65.3144L246.534 63.5407V63.5285V60.9061V47.4622V44.4201V41.9312V27.6841V26.0697L246.59 7.10343V3.45655L262.151 3.41797Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M293.217 3.45655L298.855 3.49513L322.704 3.46941L337.194 3.49513L345.482 3.46941L365.159 3.43083L384.835 3.45655L401.468 3.43083L418.213 3.45655H434.788L450.631 3.43083V12.1573V17.9652L450.688 27.2303V41.2084V42.7655V58.6346V60.9306V66.878V74.4485V75.8795L450.744 90.8918L450.462 95.6856L435.07 95.614H434.281L419.566 95.7691H415.845L402.877 95.6975L389.966 95.5901L384.666 95.6379L378.803 95.614L360.31 95.5782L346.046 95.8049L340.746 95.5901L340.52 103.015L340.689 107.267L337.814 104.947L337.983 103.987L335.502 101.127L334.036 102.065L333.416 105.279L331.725 105.575L328.511 106.474L327.778 105.267L324.057 106.226L321.689 105.125L320.111 106.013L319.659 107.81L318.306 107.125L313.458 107.018L312.894 109.417L309.962 107.799L309.906 106.119L308.383 101.626L306.128 99.5695L304.662 100.402L302.238 96.7709L303.027 94.8859L299.137 89.7655L297.84 86.5367L297.276 82.0941L295.303 80.0783L288.876 85.3583L286.902 83.0224L285.436 83.1791L286.508 79.7521L285.38 78.3134L288.199 75.6492L286.677 73.3074L289.101 58.1921L284.985 58.7944L283.689 56.4329L279.404 53.635L279.235 51.931L277.825 51.1028L275.683 47.3878L273.878 46.0477L273.597 44.4699L271.003 43.8854L269.875 42.2301L266.662 40.6349L268.748 39.2998L266.662 37.6258L267.733 36.6252L267.226 34.1955L265.534 32.891L262.095 27.6463V22.0749L262.151 15.3067V3.41797H282.843L293.217 3.45655Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M467.094 262.47L467.038 272.274H466.418L466.474 280.94V287.064V289.339L466.418 297.797V302.188V306.157V314.432V314.637L466.361 323.681L466.249 328.488L466.192 331.928L466.08 339.972V348.128V356.214V357.836H461.964H455.762H451.703H451.026H438.058H436.987L420.017 357.786L414.04 357.806L410.263 357.836L409.812 359.716L411.672 361.831H399.607H385.286V370.139L372.037 370.159V349.918V343.368V335.289V324.565L372.15 309.368V302.085V281.973V262.491H382.58L396.675 262.47H397.634L412.518 262.596L419.848 262.565L424.414 262.554L432.195 262.565H433.266L451.251 262.554L465.741 262.47H467.094Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M289.891 160.748H293.668V181.589L293.555 199.848V204.166V211.582V229.112L293.499 231.207L293.555 239.708L293.499 250.526V262.459V265.551L293.612 278.266L291.977 281.566L290.623 281.764L287.861 279.164L284.478 279.29L282.448 280.282L282.617 282.338L283.914 284.536L283.238 287.761L284.027 289.464L283.632 291.735L284.985 295.048L285.324 298.674L284.365 301.292L268.353 285.692L264.576 281.993L244.561 263.04L234.074 253.303L224.771 244.742L213.326 234.376L210.62 231.951L206.673 228.463L201.542 223.947L200.076 222.623L200.02 221.233V220.319V219.253L199.964 216.203L200.02 213.517L200.076 207.934V177.749V160.714L210.112 160.748H210.676L228.379 160.68L246.759 160.612L246.929 160.646L266.549 160.68L277.994 160.691L289.891 160.748Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M142.455 69.2809L144.485 67.8545L147.191 70.0118L149.616 69.3053L150.969 68.9884L154.465 71.3141L156.325 76.5825L156.607 79.3535L156.889 81.2015L158.637 82.0943L164.726 83.3962L169.8 81.117L171.661 79.8369L176.171 79.426L177.355 80.0423L181.02 80.7307L182.035 82.0702L183.67 80.9359L185.699 81.298L189.759 79.1359L192.465 80.0906L196.694 79.4381L200.076 77.4423L202.162 76.9217L205.263 76.4493L206.729 74.8976L208.984 75.0674L213.72 74.7399L215.976 73.2225L231.537 73.1982H231.819L237.739 73.2347L239.655 73.259L248.507 73.3318L250.368 76.4735L254.427 79.0513L255.611 82.2028L254.145 84.3115L252.116 89.6578L250.593 93.8708L248.789 99.1771L246.478 101.282L244.673 106.143L243.658 107.03L243.715 111.045L245.406 111.505L248.789 114.33L247.605 116.586L248.225 117.935L247.436 120.267L246.759 121.121V124.603V160.612L228.379 160.68L210.676 160.748H210.112L200.076 160.714L186.263 160.748L177.355 160.68L164.106 160.441L149.334 160.544L144.767 160.589L140.031 160.714L133.886 160.646L131.687 158.476L130.446 153.828L130.728 146.573L128.36 142.874L129.713 140.271L131.236 133.532L130.897 132.709L133.265 130.249L134.562 131.515V131.48L134.619 131.34V131.306V131.282L134.562 131.201L134.506 131.097L133.829 129.761L131.969 131.526L133.829 126.13L135.352 123.4L134.111 124.533L134.675 120.63L135.07 118.006L136.31 118.252V118.17L135.07 117.232L135.352 111.599L136.31 102.944L136.084 100.105L137.212 94.6353L137.72 91.79L137.494 87.8942L138.171 79.4986L137.776 78.1079L138.283 72.0073L137.438 68.513L139.524 69.6708L140.933 68.5862L142.455 69.2809Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M340.69 160.578L340.746 169.473L340.69 176.336V181.623L356.363 181.645H357.153L372.037 181.578V188.77V197.672V209.184V212.501V215.166L371.924 232.674L372.206 239.622V245.052L372.15 252.909V262.491L357.153 262.522L345.369 262.406L334.939 262.438L317.235 262.459H311.597H293.499V250.525L293.555 239.708L293.499 231.207L293.555 229.111V211.582V204.166V199.848L293.668 181.589V160.748L310.019 160.646L323.099 160.657L324.001 160.68L333.473 160.623L340.69 160.578Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M154.859 46.6435L154.183 43.9725L155.367 43.4625L154.859 46.6435ZM160.779 42.7655L161.174 38.5755L162.752 41.4702L160.779 42.7655ZM160.497 37.1006L159.313 35.0477L159.99 33.6689L160.497 37.1006ZM162.64 29.3845L159.031 26.4104V23.4417L156.607 21.9989L158.186 18.4987L160.666 20.1486L157.114 21.6696L159.144 22.2648L160.103 26.7763L160.384 24.8701L162.752 26.3347L162.64 29.3845ZM154.746 17.2789L153.901 16.4013L155.028 14.0709L154.746 17.2789ZM152.999 14.5042L152.322 16.325L150.18 13.9051L151.251 12.4509L152.999 14.5042ZM154.69 13.2293L152.435 12.2339L153.901 10.3685L157.002 11.5187L154.69 13.2293ZM158.355 17.4696L159.144 14.81L161.287 16.0705L160.948 11.8891L160.103 8.76908L158.468 10.215L158.524 8.58982L156.212 5.94895L156.776 3.37939L173.014 3.49514L186.658 3.43084L198.723 3.45656L218.344 3.43084H228.379L240.388 3.41798L246.59 3.45656V7.10344L246.534 26.0697V27.6841V41.9312V44.4201V47.4622V60.9061V63.5285V63.5407L246.196 65.3144L248.338 69.3417L247.436 71.1193L248.507 73.3316L239.655 73.2588L237.738 73.2345L231.819 73.198H231.537L215.976 73.2223L213.72 74.7397L208.984 75.0672L206.729 74.8974L205.263 76.4491L202.162 76.9215L200.076 77.4421L196.693 79.4379L192.465 80.0904L189.759 79.1357L185.699 81.2979L183.67 80.9357L182.035 82.07L181.02 80.7305L177.355 80.0421L176.171 79.4259L171.661 79.8367L169.8 81.1168L164.726 83.396L158.637 82.0941L156.889 81.2013L156.607 79.3533L156.325 76.5823L154.464 71.3139L150.969 68.9883L149.616 69.3051V69.232L148.15 69.7071L145.556 67.0367L141.497 66.6216L139.185 67.7811L136.31 64.8498L136.141 59.5806L136.817 59.9858L136.987 64.5808L138.678 63.3081L138.847 60.7344L137.889 59.3227L139.749 56.876L135.746 56.4329L135.69 55.1272L135.07 52.5734L136.423 52.845L140.031 51.3625L134.9 49.6677L133.435 43.562L132.194 42.1803L131.687 38.0383L130.503 33.0416L127.627 29.9382L126.669 27.974L125.654 23.3532L126.838 19.3747L125.767 18.1431L127.233 18.0033L136.648 23.0242L142.568 23.3911L146.74 24.4532L151.194 23.6314L154.07 25.6153L156.043 25.0596L158.806 29.7494L155.028 32.3387L154.69 34.4588L153.111 36.3625L151.194 39.7866L151.082 41.7194L152.604 38.3506L154.183 36.0996L156.832 34.9099L157.904 31.8615L160.384 29.1957L161.23 33.0793L158.919 35.3359L160.892 38.588L159.99 41.0838L159.426 44.4947L157.96 43.7859L158.806 41.0588H158.637L155.536 44.793L156.043 42.0931L155.536 42.6037V42.8029L154.07 43.9103L153.901 45.8242L151.758 48.1193L153.788 46.4573L155.705 46.4201L157.678 48.1565L160.328 43.8854L162.019 42.9896L163.485 42.3422L162.019 37.0506L163.091 37.1756L163.203 37.1881L161.738 35.0477L162.414 32.3387L163.767 28.3268L165.402 26.4231L162.922 24.2004L162.414 21.7456L160.61 23.9981L160.272 21.3402L162.301 21.2389L162.64 20.1486L159.99 16.6812L158.355 17.4696Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
<path d="M378.803 95.6139L384.666 95.6378L389.966 95.5901L402.877 95.6974L415.845 95.769H419.566L434.281 95.6139H435.07L450.462 95.6855L450.519 105.125V113.706V114.577V120.84V128.447V129.005L450.575 139.209V147.628V160.577V166.977V169.788V173.381V181.556L436.593 181.623H431.349H416.972L414.943 181.611L406.485 181.544L399.269 181.522L389.853 181.544L372.037 181.578L357.153 181.645H356.363L340.689 181.623V176.336L340.746 169.472L340.689 160.577V149.725L340.746 138.875V132.5V128.505L340.689 118.005V107.267L340.52 103.015L340.746 95.5901L346.046 95.8048L360.31 95.5781L378.803 95.6139Z" fill="#2D2D2D" stroke="#222222" strokeMiterlimit="10"/>
</g>
        {/* REST OF FIGMA GRAPHIC (lock the data center and west coast map) */}
<path d="M182 81H164.5V40" stroke="#1F1F1F" strokeWidth="2"/>
<path d="M182 89H161V248" stroke="#1F1F1F" strokeWidth="2"/>
<path d="M182 89H161V257H168" stroke="#1F1F1F" strokeWidth="2"/>
<path d="M163 26V21H167V19" stroke="#606060"/>
<path opacity="0.99" d="M165 21V23.5" stroke="#606060"/>
<path d="M165 28H171V24H173" stroke="#606060"/>
<path opacity="0.99" d="M171 28V29.5" stroke="#606060"/>
<path d="M167 34H204.5V37H307.5V42.5H371" stroke="#606060" strokeWidth="3"/>
<path d="M167 34H200V69L324 171V186" stroke="#606060" strokeWidth="3"/>
<path opacity="0.99" d="M317 44V149H297" stroke="#606060" strokeWidth="3"/>
<path d="M166.5 255V269.5H190.5L220 298" stroke="#606060" strokeWidth="3"/>
<path d="M176 259H181V235H200V216L236 186H353V176H371" stroke="#606060" strokeWidth="3"/>
<path d="M166.5 255V245H155V85" stroke="#606060" strokeWidth="3"/>
<path opacity="0.99" d="M155.5 162H173V85H219.5" stroke="#606060" strokeWidth="3"/>
<path d="M161.5 40V76H155V85H219.5" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M173.5 110H176" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M200 279V266" stroke="#606060" strokeWidth="3"/>
<path d="M176 259H181V229H155V85" stroke="#606060" strokeWidth="3"/>
<path d="M278.5 284.5L321 250.5V186H353V176H371" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M243 37.5V60" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M289 37.5V48" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M332 44V39" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M163 32V30" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M154.5 112H149" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M173 230V227" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M200 216V211" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M297 271V260" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M309 260H327" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M284 138L284 145" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M256 115V123" stroke="#606060" strokeWidth="3"/>
<path opacity="0.98" d="M208 38.5V40" stroke="#606060" strokeWidth="2"/>
<path opacity="0.98" d="M194 35.5V36" stroke="#606060" strokeWidth="2"/>
<path d="M277 286L263 298" stroke="#606060" strokeWidth="3"/>
<path d="M180.5 242H179" stroke="#606060" strokeWidth="3"/>
<path d="M163 30V32" stroke="#606060" strokeWidth="2"/>
<path d="M161 256V258" stroke="#606060" strokeWidth="2"/>
<path d="M172 261V263" stroke="#606060" strokeWidth="2"/>
<path d="M277 282V280" stroke="#606060" strokeWidth="2"/>
<path opacity="0.98" d="M295 258L257 258L257 234.5" stroke="#606060"/>
<circle cx="257" cy="235" r="1" stroke="#606060" strokeWidth="2"/>
<circle cx="206" cy="150" r="1" stroke="#606060" strokeWidth="2"/>
<circle opacity="0.99" cx="257" cy="235" r="7.5" stroke="#606060"/>
<circle opacity="0.99" cx="206" cy="150" r="7.5" stroke="#606060"/>
<circle opacity="0.98" cx="257" cy="235" r="20.5" stroke="#606060"/>
<circle opacity="0.98" cx="206" cy="150" r="20.5" stroke="#606060"/>
<circle opacity="0.97" cx="257" cy="235" r="36.5" stroke="#606060"/>
<path opacity="0.98" d="M174.5 150H206" stroke="#606060"/>
<path d="M153 83H151.222V78H149" stroke="#606060"/>
<path d="M151 81H147" stroke="#606060"/>
<path d="M157 82.5H159.5V80H166" stroke="#606060"/>
<path d="M162 80V81.5" stroke="#606060"/>
<path d="M177 244V247.5H170V251" stroke="#606060"/>
<path opacity="0.99" d="M171.5 247V243H169" stroke="#606060"/>
<path opacity="0.99" d="M174 248V252" stroke="#606060"/>
<path d="M177 240V236.5H160V240" stroke="#606060"/>
<path opacity="0.99" d="M164 236L164 234" stroke="#606060"/>
<path opacity="0.99" d="M168 236.5V240" stroke="#606060"/>
<path d="M321 181V177H315" stroke="#606060"/>
<path d="M319 183H311V180" stroke="#606060"/>
<path opacity="0.99" d="M318 176.5V173" stroke="#606060"/>
<path opacity="0.99" d="M315 182.5V180" stroke="#606060"/>
<path d="M163 26V21H167V19" stroke="#606060"/>
<path opacity="0.99" d="M165 21V23.5" stroke="#606060"/>
<path d="M165 28H171V24H173" stroke="#606060"/>
<path opacity="0.99" d="M171 28V29.5" stroke="#606060"/>
<path d="M147 110V105H144" stroke="#606060"/>
<path d="M145 112H143V109.5" stroke="#606060"/>
<path d="M147 114V116H151.5" stroke="#606060"/>
<path d="M180 110H183V107.5" stroke="#606060"/>
<path d="M178 112V114H182.5" stroke="#606060"/>
<path d="M321 123V118H324" stroke="#606060"/>
<path d="M313.5 137V132H310.5" stroke="#606060"/>
<path d="M311 139H308V136.5" stroke="#606060"/>
<path d="M243 64L243 68L245.5 68" stroke="#606060"/>
<path d="M241 62L239 62L239 66" stroke="#606060"/>
<path d="M287 50L282 50L282 53" stroke="#606060"/>
<path d="M289 52L289 56L286.5 56" stroke="#606060"/>
<path d="M330 37L325 37L325 34" stroke="#606060"/>
<path d="M334 37L336 37L336 33" stroke="#606060"/>
<path d="M258 125H260V129" stroke="#606060"/>
<path d="M256 127V132H258" stroke="#606060"/>
<path d="M282 147H279.5" stroke="#606060"/>
<path d="M171 225H164V222.5" stroke="#606060"/>
<path d="M173 223V220H177" stroke="#606060"/>
<path d="M200 207V204" stroke="#606060"/>
<path d="M202 264H204V260" stroke="#606060"/>
<path d="M329 258V253H332" stroke="#606060"/>
<path d="M331 260H335" stroke="#606060"/>
<path d="M174 265H186V260" stroke="#606060"/>
<path opacity="0.99" d="M177 265V267" stroke="#606060"/>
<path opacity="0.99" d="M183 264.5V263" stroke="#606060"/>
<path d="M161 262V264" stroke="#606060"/>
<path d="M194 40V43.5H187V47" stroke="#606060"/>
<path opacity="0.99" d="M191 44V48" stroke="#606060"/>
<path d="M208 44V47.5H215V51" stroke="#606060"/>
<path opacity="0.99" d="M213.5 47V43H219.5" stroke="#606060"/>
<path d="M277 276V270H270V272.5" stroke="#606060"/>
<path opacity="0.99" d="M277.5 273H280" stroke="#606060"/>
<path opacity="0.99" d="M272 269.5V267" stroke="#606060"/>
<path d="M275 278H271" stroke="#606060"/>
<path d="M161 28H158V25" stroke="#606060"/>
<path d="M241 184.5L241 171H248" stroke="#606060"/>
<path d="M318 66L331 66L331 73" stroke="#606060"/>
<path d="M232 94L246 94L246 90" stroke="#606060"/>
<path d="M156.5 182H166M201.5 64H211M254 35.5V22.5" stroke="#606060"/>
<path d="M163 64H169V68" stroke="#606060"/>
<path d="M153.5 199H147V201.5" stroke="#606060"/>
<path d="M319.5 213H308.5" stroke="#606060"/>
<path opacity="0.98" d="M182 81H164.5V40" stroke="white" strokeWidth="4"/>
<path opacity="0.98" d="M182 89H161V248" stroke="white" strokeWidth="4"/>
<path opacity="0.98" d="M182 89H161V241V257H168" stroke="white" strokeWidth="4"/>
<path d="M163 26V21H167V19" stroke="white" strokeWidth="2"/>
<path d="M163 26V21H165V24" stroke="white" strokeWidth="2"/>
<path d="M165 28H171V24H173" stroke="white" strokeWidth="2"/>
<path d="M165 28H171V30" stroke="white" strokeWidth="2"/>
<path d="M153 83H151.222V78H149" stroke="white" strokeWidth="2"/>
<path d="M153 83H151.222V81H147" stroke="white" strokeWidth="2"/>
<path d="M157 82.5H159.5V80H166" stroke="white" strokeWidth="2"/>
<path opacity="0.99" d="M162 80V81.5" stroke="white" strokeWidth="2"/>
<path d="M177 244V247.5H170V251" stroke="white" strokeWidth="2"/>
<path d="M177 244V247.5H171.5V243H169" stroke="white" strokeWidth="2"/>
<path d="M177 244V247.5H174V251" stroke="white" strokeWidth="2"/>
<path d="M177 240V236.5H160V240" stroke="white" strokeWidth="2"/>
<path d="M177 240V236.5H164V234" stroke="white" strokeWidth="2"/>
<path d="M177 240V236.5H168V240" stroke="white" strokeWidth="2"/>
<path d="M321 181V177H315" stroke="white" strokeWidth="2"/>
<path d="M321 181V177H318V173" stroke="white" strokeWidth="2"/>
<path d="M319 183H311V180" stroke="white" strokeWidth="2"/>
<path d="M319 183H315V180" stroke="white" strokeWidth="2"/>
<path d="M176 259H181V229H173V227" stroke="white" strokeWidth="4"/>
<path d="M167 34H204.5V37H307.5V42H371" stroke="white" strokeWidth="4"/>
<path d="M167 34H204.5V37H307.5V42H317V125H321" stroke="white" strokeWidth="4"/>
<path opacity="0.99" d="M167 34H204.5V37H307.5V42H317V66H331V73" stroke="white" strokeWidth="2"/>
<path d="M167 34H204.5V37H307.5V42H332V39" stroke="white" strokeWidth="4"/>
<path d="M167 34H204.5V37H289V48" stroke="white" strokeWidth="4"/>
<path opacity="0.99" d="M167 34H204.5V37H254V22" stroke="white" strokeWidth="2"/>
<path d="M167 34H204.5V37H243V60" stroke="white" strokeWidth="4"/>
<path d="M167 34H204.5V37H208V40" stroke="white" strokeWidth="4"/>
<path d="M167 34H194V36" stroke="white" strokeWidth="4"/>
<path d="M167 34H200V69L256 115V123" stroke="white" strokeWidth="4"/>
<path d="M167 34H200V69L284 138V145" stroke="white" strokeWidth="4"/>
<path d="M167 34H200V69L298 149.5H317V139H315" stroke="white" strokeWidth="4"/>
<path opacity="0.99" d="M167 34H200V64H211" stroke="white" strokeWidth="2"/>
<path d="M162 40V76H155V81" stroke="white" strokeWidth="4"/>
<path d="M162 40V76H155V81V85H173V110H176" stroke="white" strokeWidth="4"/>
<path opacity="0.99" d="M162 40V64H169V68" stroke="white" strokeWidth="2"/>
<path d="M166.5 255V269.5H190.5L220 298" stroke="white" strokeWidth="4"/>
<path d="M166 255V269.5H190L200 278.5V266" stroke="white" strokeWidth="4"/>
<path d="M176 259H181V235H200V216L236 186H353V176H371" stroke="white" strokeWidth="4"/>
<path d="M176 259H181V235H200V216L236 186H321V185" stroke="white" strokeWidth="4"/>
<path d="M176 259H181V235H200V211" stroke="white" strokeWidth="4"/>
<path opacity="0.99" d="M176 259H181V235H200V215.5L236 186H241V171H248" stroke="white" strokeWidth="2"/>
<path d="M166.5 255V245H155V112H149" stroke="white" strokeWidth="4"/>
<path opacity="0.98" d="M166.5 255V245H155V162H173V150H206" stroke="white" strokeWidth="2"/>
<path opacity="0.99" d="M166.5 255V245H155V199H147V202" stroke="white" strokeWidth="2"/>
<path opacity="0.99" d="M166.5 255V245H155V182L155.5 182H166" stroke="white" strokeWidth="2"/>
<path d="M278.5 284.5L321 251V186H353V176H372" stroke="white" strokeWidth="4"/>
<path opacity="0.99" d="M278 284.5L320.5 251V213H308" stroke="white" strokeWidth="2"/>
<path d="M279 284L297 269.5V260" stroke="white" strokeWidth="4"/>
<path d="M279 284L310 260H327" stroke="white" strokeWidth="4"/>
<path opacity="0.98" d="M295 258L257 258L257 234.5" stroke="white" strokeWidth="2"/>
<path d="M275 287.5L263 298" stroke="white" strokeWidth="4"/>
<path d="M147 110V105H144" stroke="white" strokeWidth="2"/>
<path d="M145 112H143V109" stroke="white" strokeWidth="2"/>
<path d="M147 114V116H151" stroke="white" strokeWidth="2"/>
<path d="M180 110H183V107" stroke="white" strokeWidth="2"/>
<path d="M178 112V114H183" stroke="white" strokeWidth="2"/>
<path d="M321 123V118H324" stroke="white" strokeWidth="2"/>
<path d="M313.5 137V132H310.5" stroke="white" strokeWidth="2"/>
<path d="M311 139H308V136.5" stroke="white" strokeWidth="2"/>
<path d="M287 50L282 50L282 53" stroke="white" strokeWidth="2"/>
<path d="M289 52L289 56L286 56" stroke="white" strokeWidth="2"/>
<path d="M330 37L325 37L325 34" stroke="white" strokeWidth="2"/>
<path d="M334 37L336 37L336 33" stroke="white" strokeWidth="2"/>
<path d="M258 125H260V129" stroke="white" strokeWidth="2"/>
<path d="M256 127V132H258" stroke="white" strokeWidth="2"/>
<path d="M282 147H279" stroke="white" strokeWidth="2"/>
<path d="M171 225H164V222.5" stroke="white" strokeWidth="2"/>
<path d="M173 223V220H177" stroke="white" strokeWidth="2"/>
<path d="M200 207V204" stroke="white" strokeWidth="2"/>
<path d="M329 258V253H333" stroke="white" strokeWidth="2"/>
<path d="M331 260H335" stroke="white" strokeWidth="2"/>
<path d="M174 265H186V260" stroke="white" strokeWidth="2"/>
<path opacity="0.99" d="M177 265V267" stroke="white" strokeWidth="2"/>
<path opacity="0.99" d="M183 264.5V263" stroke="white" strokeWidth="2"/>
<path d="M194 40V43.5H187V47" stroke="white" strokeWidth="2"/>
<path d="M194 40V43.5H191V48" stroke="white" strokeWidth="2"/>
<path d="M208 44V47.5H215V51" stroke="white" strokeWidth="2"/>
<path d="M208 44V47.5H213.5V43H219" stroke="white" strokeWidth="2"/>
<path d="M277 276V270H270V272" stroke="white" strokeWidth="2"/>
<path d="M277 276V270H272V267" stroke="white" strokeWidth="2"/>
<path d="M277 276V273H280" stroke="white" strokeWidth="2"/>
<path d="M275 278H271" stroke="white" strokeWidth="2"/>
<path d="M161 261V264" stroke="white" strokeWidth="2"/>
<path d="M202 264H204V260" stroke="white" strokeWidth="2"/>
<path d="M243 64L243 68L246 68" stroke="white" strokeWidth="2"/>
<path d="M241 62L239 62L239 66" stroke="white" strokeWidth="2"/>
<path d="M161 28H158V25" stroke="white" strokeWidth="2"/>
<rect x="159" y="32" width="8" height="8" fill="#D1FF99"/>
<rect x="157" y="248" width="8" height="8" fill="#D1FF99"/>
<rect x="168" y="253" width="8" height="8" fill="#D1FF99"/>
<rect x="273" y="282" width="8" height="8" fill="#D1FF99"/>
<circle cx="248" cy="264" r="1" fill="#D1FF99"/>
<circle cx="271" cy="239" r="1" fill="#D1FF99"/>
<circle cx="252" cy="225" r="1" fill="#D1FF99"/>
<circle cx="248" cy="171" r="1" fill="#D1FF99"/>
<circle cx="216" cy="137" r="1" fill="#D1FF99"/>
<circle cx="196" cy="143" r="1" fill="#D1FF99"/>
<circle cx="211" cy="160" r="1" fill="#D1FF99"/>
<circle cx="289" cy="235" r="1" fill="#D1FF99"/>
<circle cx="308" cy="213" r="1" fill="#D1FF99"/>
<circle cx="335" cy="260" r="1" fill="#D1FF99"/>
<circle cx="333" cy="253" r="1" fill="#D1FF99"/>
<circle cx="280" cy="273" r="1" fill="#D1FF99"/>
<circle cx="271" cy="278" r="1" fill="#D1FF99"/>
<circle cx="272" cy="267" r="1" fill="#D1FF99"/>
<circle cx="270" cy="272" r="1" fill="#D1FF99"/>
<circle cx="230" cy="250" r="1" fill="#D1FF99"/>
<circle cx="204" cy="260" r="1" fill="#D1FF99"/>
<circle cx="251" cy="246" r="1" fill="#D1FF99"/>
<circle cx="167" cy="19" r="1" fill="#D1FF99"/>
<circle cx="173" cy="24" r="1" fill="#D1FF99"/>
<circle cx="171" cy="30" r="1" fill="#D1FF99"/>
<circle cx="165" cy="24" r="1" fill="#D1FF99"/>
<circle cx="158" cy="25" r="1" fill="#D1FF99"/>
<circle cx="166" cy="80" r="1" fill="#D1FF99"/>
<circle cx="162" cy="82" r="1" fill="#D1FF99"/>
<circle cx="149" cy="78" r="1" fill="#D1FF99"/>
<circle cx="147" cy="81" r="1" fill="#D1FF99"/>
<circle cx="169" cy="243" r="1" fill="#D1FF99"/>
<circle cx="164" cy="234" r="1" fill="#D1FF99"/>
<circle cx="164" cy="222" r="1" fill="#D1FF99"/>
<circle cx="177" cy="220" r="1" fill="#D1FF99"/>
<circle cx="200" cy="204" r="1" fill="#D1FF99"/>
<circle cx="160" cy="240" r="1" fill="#D1FF99"/>
<circle cx="168" cy="240" r="1" fill="#D1FF99"/>
<circle cx="170" cy="251" r="1" fill="#D1FF99"/>
<circle cx="174" cy="251" r="1" fill="#D1FF99"/>
<circle cx="186" cy="260" r="1" fill="#D1FF99"/>
<circle cx="183" cy="263" r="1" fill="#D1FF99"/>
<circle cx="177" cy="267" r="1" fill="#D1FF99"/>
<circle cx="161" cy="264" r="1" fill="#D1FF99"/>
<circle cx="318" cy="173" r="1" fill="#D1FF99"/>
<circle cx="315" cy="177" r="1" fill="#D1FF99"/>
<circle cx="311" cy="180" r="1" fill="#D1FF99"/>
<circle cx="315" cy="180" r="1" fill="#D1FF99"/>
<circle cx="144" cy="105" r="1" fill="#D1FF99"/>
<circle cx="143" cy="109" r="1" fill="#D1FF99"/>
<circle cx="151" cy="116" r="1" fill="#D1FF99"/>
<circle cx="183" cy="107" r="1" fill="#D1FF99"/>
<circle cx="219" cy="43" r="1" fill="#D1FF99"/>
<circle cx="215" cy="51" r="1" fill="#D1FF99"/>
<circle cx="191" cy="48" r="1" fill="#D1FF99"/>
<circle cx="187" cy="47" r="1" fill="#D1FF99"/>
<circle cx="169" cy="68" r="1" fill="#D1FF99"/>
<circle cx="211" cy="64" r="1" fill="#D1FF99"/>
<circle cx="147" cy="202" r="1" fill="#D1FF99"/>
<circle cx="166" cy="182" r="1" fill="#D1FF99"/>
<circle cx="239" cy="66" r="1" fill="#D1FF99"/>
<circle cx="246" cy="68" r="1" fill="#D1FF99"/>
<circle cx="254" cy="22" r="1" fill="#D1FF99"/>
<circle cx="331" cy="73" r="1" fill="#D1FF99"/>
<circle cx="246" cy="90" r="1" fill="#D1FF99"/>
<circle r="1" transform="matrix(-1 0 0 1 282 53)" fill="#D1FF99"/>
<circle r="1" transform="matrix(-1 0 0 1 286 56)" fill="#D1FF99"/>
<circle cx="310" cy="132" r="1" transform="rotate(-180 310 132)" fill="#D1FF99"/>
<circle cx="308" cy="136" r="1" transform="rotate(-180 308 136)" fill="#D1FF99"/>
<circle cx="279" cy="147" r="1" transform="rotate(-180 279 147)" fill="#D1FF99"/>
<circle cx="260" cy="129" r="1" transform="rotate(-180 260 129)" fill="#D1FF99"/>
<circle cx="258" cy="132" r="1" transform="rotate(-180 258 132)" fill="#D1FF99"/>
<circle cx="324" cy="118" r="1" transform="rotate(-180 324 118)" fill="#D1FF99"/>
<circle cx="325" cy="34" r="1" transform="rotate(-180 325 34)" fill="#D1FF99"/>
<circle cx="336" cy="33" r="1" transform="rotate(-180 336 33)" fill="#D1FF99"/>
<circle cx="183" cy="114" r="1" fill="#D1FF99"/>
<rect x="161" y="26" width="4" height="4" fill="#D1FF99"/>
<rect x="145" y="110" width="4" height="4" fill="#D1FF99"/>
<rect x="176" y="108" width="4" height="4" fill="#D1FF99"/>
<rect x="254" y="123" width="4" height="4" fill="#D1FF99"/>
<rect x="282" y="145" width="4" height="4" fill="#D1FF99"/>
<rect x="198" y="207" width="4" height="4" fill="#D1FF99"/>
<rect x="198" y="262" width="4" height="4" fill="#D1FF99"/>
<rect x="295" y="256" width="4" height="4" fill="#D1FF99"/>
<rect x="275" y="276" width="4" height="4" fill="#D1FF99"/>
<rect x="327" y="258" width="4" height="4" fill="#D1FF99"/>
<rect x="153" y="81" width="4" height="4" fill="#D4FFA0"/>
<rect x="175" y="240" width="4" height="4" fill="#D1FF99"/>
<rect x="159" y="258" width="4" height="4" fill="#D1FF99"/>
<rect x="170" y="263" width="4" height="4" fill="#D1FF99"/>
<rect x="171" y="223" width="4" height="4" fill="#D1FF99"/>
<rect x="311" y="137" width="4" height="4" fill="#D1FF99"/>
<rect x="319" y="123" width="4" height="4" fill="#D1FF99"/>
<rect x="319" y="181" width="4" height="4" fill="#D1FF99"/>
<rect x="206" y="40" width="4" height="4" fill="#D1FF99"/>
<rect x="241" y="60" width="4" height="4" fill="#D1FF99"/>
<rect x="287" y="48" width="4" height="4" fill="#D1FF99"/>
<rect x="330" y="35" width="4" height="4" fill="#D1FF99"/>
<rect x="192" y="36" width="4" height="4" fill="#D1FF99"/>
<path opacity="0.99" d="M90.75 257.42V253.43H91.2C92.44 253.43 92.98 254.01 92.98 255.37V255.45C92.98 256.78 92.44 257.42 91.22 257.42H90.75ZM88.69 259H91.28C93.8 259 95.12 257.65 95.12 255.42V255.34C95.12 253.12 93.83 251.85 91.29 251.85H88.69V259ZM97.3828 259.12C98.2228 259.12 98.6828 258.77 98.9328 258.39V259H100.673V255.61C100.673 254.22 99.7528 253.63 98.3128 253.63C96.8828 253.63 95.8928 254.25 95.8128 255.51H97.4928C97.5328 255.18 97.7128 254.89 98.2028 254.89C98.7728 254.89 98.8928 255.22 98.8928 255.72V255.84H98.3928C96.6528 255.84 95.6128 256.32 95.6128 257.55C95.6128 258.66 96.4428 259.12 97.3828 259.12ZM98.0028 257.91C97.5828 257.91 97.3828 257.72 97.3828 257.42C97.3828 256.99 97.7028 256.85 98.4228 256.85H98.8928V257.17C98.8928 257.62 98.5128 257.91 98.0028 257.91ZM103.725 259.12C104.145 259.12 104.485 259.03 104.715 258.97V257.61C104.555 257.67 104.405 257.7 104.205 257.7C103.865 257.7 103.675 257.53 103.675 257.15V254.99H104.705V253.77H103.675V252.68H101.885V253.77H101.255V254.99H101.885V257.32C101.885 258.55 102.545 259.12 103.725 259.12ZM107.002 259.12C107.842 259.12 108.302 258.77 108.552 258.39V259H110.292V255.61C110.292 254.22 109.372 253.63 107.932 253.63C106.502 253.63 105.512 254.25 105.432 255.51H107.112C107.152 255.18 107.332 254.89 107.822 254.89C108.392 254.89 108.512 255.22 108.512 255.72V255.84H108.012C106.272 255.84 105.232 256.32 105.232 257.55C105.232 258.66 106.062 259.12 107.002 259.12ZM107.622 257.91C107.202 257.91 107.002 257.72 107.002 257.42C107.002 256.99 107.322 256.85 108.042 256.85H108.512V257.17C108.512 257.62 108.132 257.91 107.622 257.91ZM116.806 259.12C118.656 259.12 119.996 258.16 120.136 256.31H118.096C117.996 257.1 117.486 257.48 116.766 257.48C115.786 257.48 115.236 256.75 115.236 255.46V255.38C115.236 254.08 115.816 253.36 116.736 253.36C117.456 253.36 117.856 253.76 117.936 254.49H120.046C119.876 252.6 118.586 251.74 116.726 251.74C114.636 251.74 113.076 253.19 113.076 255.39V255.47C113.076 257.66 114.306 259.12 116.806 259.12ZM123.483 259.12C125.063 259.12 125.973 258.45 126.133 257.27H124.453C124.383 257.62 124.133 257.89 123.543 257.89C122.903 257.89 122.503 257.49 122.453 256.8H126.133V256.33C126.133 254.45 124.903 253.63 123.473 253.63C121.893 253.63 120.643 254.69 120.643 256.37V256.45C120.643 258.16 121.843 259.12 123.483 259.12ZM122.473 255.79C122.563 255.16 122.933 254.81 123.473 254.81C124.053 254.81 124.363 255.16 124.393 255.79H122.473ZM126.899 259H128.689V256.07C128.689 255.4 129.049 255.08 129.579 255.08C130.099 255.08 130.329 255.37 130.329 255.96V259H132.119V255.6C132.119 254.26 131.419 253.63 130.409 253.63C129.539 253.63 128.969 254.07 128.689 254.61V253.77H126.899V259ZM135.219 259.12C135.639 259.12 135.979 259.03 136.209 258.97V257.61C136.049 257.67 135.899 257.7 135.699 257.7C135.359 257.7 135.169 257.53 135.169 257.15V254.99H136.199V253.77H135.169V252.68H133.379V253.77H132.749V254.99H133.379V257.32C133.379 258.55 134.039 259.12 135.219 259.12ZM139.586 259.12C141.166 259.12 142.076 258.45 142.236 257.27H140.556C140.486 257.62 140.236 257.89 139.646 257.89C139.006 257.89 138.606 257.49 138.556 256.8H142.236V256.33C142.236 254.45 141.006 253.63 139.576 253.63C137.996 253.63 136.746 254.69 136.746 256.37V256.45C136.746 258.16 137.946 259.12 139.586 259.12ZM138.576 255.79C138.666 255.16 139.036 254.81 139.576 254.81C140.156 254.81 140.466 255.16 140.496 255.79H138.576ZM143.003 259H144.793V256.52C144.793 255.68 145.393 255.34 146.483 255.37V253.7C145.673 253.69 145.123 254.03 144.793 254.81V253.77H143.003V259ZM149.33 259.12C150.78 259.12 151.7 258.56 151.7 257.32C151.7 256.2 151 255.82 149.55 255.64C148.91 255.56 148.67 255.46 148.67 255.21C148.67 254.97 148.87 254.8 149.26 254.8C149.67 254.8 149.86 254.97 149.93 255.32H151.55C151.43 254.07 150.53 253.63 149.24 253.63C148.03 253.63 147 254.19 147 255.35C147 256.44 147.59 256.85 148.99 257.03C149.71 257.13 149.96 257.25 149.96 257.5C149.96 257.76 149.76 257.93 149.32 257.93C148.81 257.93 148.64 257.72 148.58 257.34H146.93C146.97 258.5 147.84 259.12 149.33 259.12Z" fill="white"/>
<path opacity="0.98" d="M89.06 175H91.12V169.43H92.97V167.85H87.21V169.43H89.06V175ZM93.7116 175H95.5016V172.07C95.5016 171.4 95.8616 171.08 96.3916 171.08C96.9116 171.08 97.1416 171.37 97.1416 171.96V175H98.9316V171.6C98.9316 170.26 98.2316 169.63 97.2216 169.63C96.3516 169.63 95.7816 170.07 95.5016 170.61V167.47H93.7116V175ZM102.512 175.12C104.092 175.12 105.002 174.45 105.162 173.27H103.482C103.412 173.62 103.162 173.89 102.572 173.89C101.932 173.89 101.532 173.49 101.482 172.8H105.162V172.33C105.162 170.45 103.932 169.63 102.502 169.63C100.922 169.63 99.6719 170.69 99.6719 172.37V172.45C99.6719 174.16 100.872 175.12 102.512 175.12ZM101.502 171.79C101.592 171.16 101.962 170.81 102.502 170.81C103.082 170.81 103.392 171.16 103.422 171.79H101.502ZM108.101 175H110.171V167.85H108.101V175ZM111.417 175H113.207V172.07C113.207 171.4 113.567 171.08 114.097 171.08C114.617 171.08 114.847 171.37 114.847 171.96V175H116.637V171.6C116.637 170.26 115.937 169.63 114.927 169.63C114.057 169.63 113.487 170.07 113.207 170.61V169.77H111.417V175ZM119.737 175.12C120.157 175.12 120.497 175.03 120.727 174.97V173.61C120.567 173.67 120.417 173.7 120.217 173.7C119.877 173.7 119.687 173.53 119.687 173.15V170.99H120.717V169.77H119.687V168.68H117.897V169.77H117.267V170.99H117.897V173.32C117.897 174.55 118.557 175.12 119.737 175.12ZM124.104 175.12C125.684 175.12 126.594 174.45 126.754 173.27H125.074C125.004 173.62 124.754 173.89 124.164 173.89C123.524 173.89 123.124 173.49 123.074 172.8H126.754V172.33C126.754 170.45 125.524 169.63 124.094 169.63C122.514 169.63 121.264 170.69 121.264 172.37V172.45C121.264 174.16 122.464 175.12 124.104 175.12ZM123.094 171.79C123.184 171.16 123.554 170.81 124.094 170.81C124.674 170.81 124.984 171.16 125.014 171.79H123.094ZM127.52 175H129.31V172.52C129.31 171.68 129.91 171.34 131 171.37V169.7C130.19 169.69 129.64 170.03 129.31 170.81V169.77H127.52V175ZM131.798 175H133.588V172.07C133.588 171.4 133.948 171.08 134.478 171.08C134.998 171.08 135.228 171.37 135.228 171.96V175H137.018V171.6C137.018 170.26 136.318 169.63 135.308 169.63C134.438 169.63 133.868 170.07 133.588 170.61V169.77H131.798V175ZM140.598 175.12C142.178 175.12 143.088 174.45 143.248 173.27H141.568C141.498 173.62 141.248 173.89 140.658 173.89C140.018 173.89 139.618 173.49 139.568 172.8H143.248V172.33C143.248 170.45 142.018 169.63 140.588 169.63C139.008 169.63 137.758 170.69 137.758 172.37V172.45C137.758 174.16 138.958 175.12 140.598 175.12ZM139.588 171.79C139.678 171.16 140.048 170.81 140.588 170.81C141.168 170.81 141.478 171.16 141.508 171.79H139.588ZM146.094 175.12C146.514 175.12 146.854 175.03 147.084 174.97V173.61C146.924 173.67 146.774 173.7 146.574 173.7C146.234 173.7 146.044 173.53 146.044 173.15V170.99H147.074V169.77H146.044V168.68H144.254V169.77H143.624V170.99H144.254V173.32C144.254 174.55 144.914 175.12 146.094 175.12Z" fill="white"/>
<path opacity="0.97" d="M50.69 24H52.73V21.44H53.21L54.66 24H56.82L55.11 21.04C55.86 20.75 56.4 20.18 56.4 19.16V19.12C56.4 17.61 55.36 16.85 53.49 16.85H50.69V24ZM52.73 20.11V18.39H53.4C54.06 18.39 54.42 18.62 54.42 19.2V19.24C54.42 19.82 54.08 20.11 53.39 20.11H52.73ZM59.8088 24.12C61.3888 24.12 62.2988 23.45 62.4588 22.27H60.7788C60.7088 22.62 60.4588 22.89 59.8688 22.89C59.2288 22.89 58.8288 22.49 58.7788 21.8H62.4588V21.33C62.4588 19.45 61.2288 18.63 59.7988 18.63C58.2188 18.63 56.9688 19.69 56.9688 21.37V21.45C56.9688 23.16 58.1688 24.12 59.8088 24.12ZM58.7988 20.79C58.8888 20.16 59.2588 19.81 59.7988 19.81C60.3788 19.81 60.6888 20.16 60.7188 20.79H58.7988ZM65.3241 24.12C66.7741 24.12 67.6941 23.56 67.6941 22.32C67.6941 21.2 66.9941 20.82 65.5441 20.64C64.9041 20.56 64.6641 20.46 64.6641 20.21C64.6641 19.97 64.8641 19.8 65.2541 19.8C65.6641 19.8 65.8541 19.97 65.9241 20.32H67.5441C67.4241 19.07 66.5241 18.63 65.2341 18.63C64.0241 18.63 62.9941 19.19 62.9941 20.35C62.9941 21.44 63.5841 21.85 64.9841 22.03C65.7041 22.13 65.9541 22.25 65.9541 22.5C65.9541 22.76 65.7541 22.93 65.3141 22.93C64.8041 22.93 64.6341 22.72 64.5741 22.34H62.9241C62.9641 23.5 63.8341 24.12 65.3241 24.12ZM68.4706 24H70.2606V18.77H68.4706V24ZM69.3606 18.27C69.9206 18.27 70.3506 17.88 70.3506 17.35C70.3506 16.82 69.9206 16.42 69.3606 16.42C68.8006 16.42 68.3806 16.82 68.3806 17.35C68.3806 17.88 68.8006 18.27 69.3606 18.27ZM73.3098 24.12C74.0998 24.12 74.6798 23.69 74.9398 23.15V24H76.7298V16.47H74.9398V19.51C74.6398 18.98 74.1498 18.63 73.3298 18.63C72.0898 18.63 71.1098 19.58 71.1098 21.36V21.44C71.1098 23.25 72.0998 24.12 73.3098 24.12ZM73.9398 22.75C73.3198 22.75 72.9298 22.3 72.9298 21.42V21.34C72.9298 20.43 73.2898 19.98 73.9598 19.98C74.6198 19.98 74.9898 20.45 74.9898 21.33V21.41C74.9898 22.3 74.5898 22.75 73.9398 22.75ZM80.3459 24.12C81.9259 24.12 82.8359 23.45 82.9959 22.27H81.3159C81.2459 22.62 80.9959 22.89 80.4059 22.89C79.7659 22.89 79.3659 22.49 79.3159 21.8H82.9959V21.33C82.9959 19.45 81.7659 18.63 80.3359 18.63C78.7559 18.63 77.5059 19.69 77.5059 21.37V21.45C77.5059 23.16 78.7059 24.12 80.3459 24.12ZM79.3359 20.79C79.4259 20.16 79.7959 19.81 80.3359 19.81C80.9159 19.81 81.2259 20.16 81.2559 20.79H79.3359ZM83.7624 24H85.5524V21.07C85.5524 20.4 85.9124 20.08 86.4424 20.08C86.9624 20.08 87.1924 20.37 87.1924 20.96V24H88.9824V20.6C88.9824 19.26 88.2824 18.63 87.2724 18.63C86.4024 18.63 85.8324 19.07 85.5524 19.61V18.77H83.7624V24ZM92.0827 24.12C92.5027 24.12 92.8427 24.03 93.0727 23.97V22.61C92.9127 22.67 92.7627 22.7 92.5627 22.7C92.2227 22.7 92.0327 22.53 92.0327 22.15V19.99H93.0627V18.77H92.0327V17.68H90.2427V18.77H89.6127V19.99H90.2427V22.32C90.2427 23.55 90.9027 24.12 92.0827 24.12ZM93.9394 24H95.7294V18.77H93.9394V24ZM94.8294 18.27C95.3894 18.27 95.8194 17.88 95.8194 17.35C95.8194 16.82 95.3894 16.42 94.8294 16.42C94.2694 16.42 93.8494 16.82 93.8494 17.35C93.8494 17.88 94.2694 18.27 94.8294 18.27ZM98.3086 24.12C99.1486 24.12 99.6086 23.77 99.8586 23.39V24H101.599V20.61C101.599 19.22 100.679 18.63 99.2386 18.63C97.8086 18.63 96.8186 19.25 96.7386 20.51H98.4186C98.4586 20.18 98.6386 19.89 99.1286 19.89C99.6986 19.89 99.8186 20.22 99.8186 20.72V20.84H99.3186C97.5786 20.84 96.5386 21.32 96.5386 22.55C96.5386 23.66 97.3686 24.12 98.3086 24.12ZM98.9286 22.91C98.5086 22.91 98.3086 22.72 98.3086 22.42C98.3086 21.99 98.6286 21.85 99.3486 21.85H99.8186V22.17C99.8186 22.62 99.4386 22.91 98.9286 22.91ZM102.67 24H104.45V16.47H102.67V24ZM107.692 24H109.492V19.51L112.102 24H114.082V16.85H112.292V20.88L110.002 16.85H107.692V24ZM117.817 24.12C119.397 24.12 120.307 23.45 120.467 22.27H118.787C118.717 22.62 118.467 22.89 117.877 22.89C117.237 22.89 116.837 22.49 116.787 21.8H120.467V21.33C120.467 19.45 119.237 18.63 117.807 18.63C116.227 18.63 114.977 19.69 114.977 21.37V21.45C114.977 23.16 116.177 24.12 117.817 24.12ZM116.807 20.79C116.897 20.16 117.267 19.81 117.807 19.81C118.387 19.81 118.697 20.16 118.727 20.79H116.807ZM123.313 24.12C123.733 24.12 124.073 24.03 124.303 23.97V22.61C124.143 22.67 123.993 22.7 123.793 22.7C123.453 22.7 123.263 22.53 123.263 22.15V19.99H124.293V18.77H123.263V17.68H121.473V18.77H120.843V19.99H121.473V22.32C121.473 23.55 122.133 24.12 123.313 24.12ZM126.26 24H128L128.81 21.08L129.59 24H131.3L132.96 18.77H131.26L130.41 21.9L129.63 18.77H128.19L127.31 21.9L126.55 18.77H124.68L126.26 24ZM135.903 22.79C135.213 22.79 134.863 22.3 134.863 21.4V21.32C134.863 20.44 135.233 19.97 135.903 19.97C136.583 19.97 136.933 20.46 136.933 21.34V21.42C136.933 22.29 136.573 22.79 135.903 22.79ZM135.893 24.12C137.503 24.12 138.753 23.1 138.753 21.4V21.32C138.753 19.66 137.513 18.63 135.903 18.63C134.283 18.63 133.033 19.69 133.033 21.37V21.45C133.033 23.14 134.283 24.12 135.893 24.12ZM139.534 24H141.324V21.52C141.324 20.68 141.924 20.34 143.014 20.37V18.7C142.204 18.69 141.654 19.03 141.324 19.81V18.77H139.534V24ZM143.811 24H145.601V21.71L147.011 24H149.011L147.161 21.12L148.871 18.77H147.011L145.601 20.84V16.47H143.811V24ZM151.486 24.12C152.936 24.12 153.856 23.56 153.856 22.32C153.856 21.2 153.156 20.82 151.706 20.64C151.066 20.56 150.826 20.46 150.826 20.21C150.826 19.97 151.026 19.8 151.416 19.8C151.826 19.8 152.016 19.97 152.086 20.32H153.706C153.586 19.07 152.686 18.63 151.396 18.63C150.186 18.63 149.156 19.19 149.156 20.35C149.156 21.44 149.746 21.85 151.146 22.03C151.866 22.13 152.116 22.25 152.116 22.5C152.116 22.76 151.916 22.93 151.476 22.93C150.966 22.93 150.796 22.72 150.736 22.34H149.086C149.126 23.5 149.996 24.12 151.486 24.12Z" fill="white"/>
<path opacity="0.96" d="M226.05 218.12C227.9 218.12 229.24 217.16 229.38 215.31H227.34C227.24 216.1 226.73 216.48 226.01 216.48C225.03 216.48 224.48 215.75 224.48 214.46V214.38C224.48 213.08 225.06 212.36 225.98 212.36C226.7 212.36 227.1 212.76 227.18 213.49H229.29C229.12 211.6 227.83 210.74 225.97 210.74C223.88 210.74 222.32 212.19 222.32 214.39V214.47C222.32 216.66 223.55 218.12 226.05 218.12ZM232.727 218.12C234.307 218.12 235.217 217.45 235.377 216.27H233.697C233.627 216.62 233.377 216.89 232.787 216.89C232.147 216.89 231.747 216.49 231.697 215.8H235.377V215.33C235.377 213.45 234.147 212.63 232.717 212.63C231.137 212.63 229.887 213.69 229.887 215.37V215.45C229.887 217.16 231.087 218.12 232.727 218.12ZM231.717 214.79C231.807 214.16 232.177 213.81 232.717 213.81C233.297 213.81 233.607 214.16 233.637 214.79H231.717ZM236.193 218H237.973V210.47H236.193V218ZM239.133 218H240.913V210.47H239.133V218ZM244.155 218H245.955V213.51L248.565 218H250.545V210.85H248.755V214.88L246.465 210.85H244.155V218ZM254.279 218.12C255.859 218.12 256.769 217.45 256.929 216.27H255.249C255.179 216.62 254.929 216.89 254.339 216.89C253.699 216.89 253.299 216.49 253.249 215.8H256.929V215.33C256.929 213.45 255.699 212.63 254.269 212.63C252.689 212.63 251.439 213.69 251.439 215.37V215.45C251.439 217.16 252.639 218.12 254.279 218.12ZM253.269 214.79C253.359 214.16 253.729 213.81 254.269 213.81C254.849 213.81 255.159 214.16 255.189 214.79H253.269ZM259.776 218.12C260.196 218.12 260.536 218.03 260.766 217.97V216.61C260.606 216.67 260.456 216.7 260.256 216.7C259.916 216.7 259.726 216.53 259.726 216.15V213.99H260.756V212.77H259.726V211.68H257.936V212.77H257.306V213.99H257.936V216.32C257.936 217.55 258.596 218.12 259.776 218.12ZM262.723 218H264.463L265.273 215.08L266.053 218H267.763L269.423 212.77H267.723L266.873 215.9L266.093 212.77H264.653L263.773 215.9L263.013 212.77H261.143L262.723 218ZM272.366 216.79C271.676 216.79 271.326 216.3 271.326 215.4V215.32C271.326 214.44 271.696 213.97 272.366 213.97C273.046 213.97 273.396 214.46 273.396 215.34V215.42C273.396 216.29 273.036 216.79 272.366 216.79ZM272.356 218.12C273.966 218.12 275.216 217.1 275.216 215.4V215.32C275.216 213.66 273.976 212.63 272.366 212.63C270.746 212.63 269.496 213.69 269.496 215.37V215.45C269.496 217.14 270.746 218.12 272.356 218.12ZM275.997 218H277.787V215.52C277.787 214.68 278.387 214.34 279.477 214.37V212.7C278.667 212.69 278.117 213.03 277.787 213.81V212.77H275.997V218ZM280.274 218H282.064V215.71L283.474 218H285.474L283.624 215.12L285.334 212.77H283.474L282.064 214.84V210.47H280.274V218ZM287.949 218.12C289.399 218.12 290.319 217.56 290.319 216.32C290.319 215.2 289.619 214.82 288.169 214.64C287.529 214.56 287.289 214.46 287.289 214.21C287.289 213.97 287.489 213.8 287.879 213.8C288.289 213.8 288.479 213.97 288.549 214.32H290.169C290.049 213.07 289.149 212.63 287.859 212.63C286.649 212.63 285.619 213.19 285.619 214.35C285.619 215.44 286.209 215.85 287.609 216.03C288.329 216.13 288.579 216.25 288.579 216.5C288.579 216.76 288.379 216.93 287.939 216.93C287.429 216.93 287.259 216.72 287.199 216.34H285.549C285.589 217.5 286.459 218.12 287.949 218.12Z" fill="white"/>
<path opacity="0.95" d="M221.75 153.42V149.43H222.2C223.44 149.43 223.98 150.01 223.98 151.37V151.45C223.98 152.78 223.44 153.42 222.22 153.42H221.75ZM219.69 155H222.28C224.8 155 226.12 153.65 226.12 151.42V151.34C226.12 149.12 224.83 147.85 222.29 147.85H219.69V155ZM229.522 155.12C231.102 155.12 232.012 154.45 232.172 153.27H230.492C230.422 153.62 230.172 153.89 229.582 153.89C228.942 153.89 228.542 153.49 228.492 152.8H232.172V152.33C232.172 150.45 230.942 149.63 229.512 149.63C227.932 149.63 226.682 150.69 226.682 152.37V152.45C226.682 154.16 227.882 155.12 229.522 155.12ZM228.512 151.79C228.602 151.16 228.972 150.81 229.512 150.81C230.092 150.81 230.402 151.16 230.432 151.79H228.512ZM234.213 155H236.163L238.073 149.77H236.363L235.293 153.14L234.203 149.77H232.293L234.213 155ZM238.721 155H240.511V149.77H238.721V155ZM239.611 149.27C240.171 149.27 240.601 148.88 240.601 148.35C240.601 147.82 240.171 147.42 239.611 147.42C239.051 147.42 238.631 147.82 238.631 148.35C238.631 148.88 239.051 149.27 239.611 149.27ZM244.09 155.12C245.78 155.12 246.67 154.26 246.72 152.94H245.11C245.05 153.51 244.7 153.81 244.2 153.81C243.52 153.81 243.17 153.34 243.17 152.43V152.35C243.17 151.47 243.54 151.02 244.17 151.02C244.69 151.02 244.93 151.29 245.01 151.78H246.69C246.59 150.19 245.41 149.63 244.13 149.63C242.59 149.63 241.34 150.63 241.34 152.37V152.45C241.34 154.21 242.53 155.12 244.09 155.12ZM250.01 155.12C251.59 155.12 252.5 154.45 252.66 153.27H250.98C250.91 153.62 250.66 153.89 250.07 153.89C249.43 153.89 249.03 153.49 248.98 152.8H252.66V152.33C252.66 150.45 251.43 149.63 250 149.63C248.42 149.63 247.17 150.69 247.17 152.37V152.45C247.17 154.16 248.37 155.12 250.01 155.12ZM249 151.79C249.09 151.16 249.46 150.81 250 150.81C250.58 150.81 250.89 151.16 250.92 151.79H249ZM255.525 155.12C256.975 155.12 257.895 154.56 257.895 153.32C257.895 152.2 257.195 151.82 255.745 151.64C255.105 151.56 254.865 151.46 254.865 151.21C254.865 150.97 255.065 150.8 255.455 150.8C255.865 150.8 256.055 150.97 256.125 151.32H257.745C257.625 150.07 256.725 149.63 255.435 149.63C254.225 149.63 253.195 150.19 253.195 151.35C253.195 152.44 253.785 152.85 255.185 153.03C255.905 153.13 256.155 153.25 256.155 153.5C256.155 153.76 255.955 153.93 255.515 153.93C255.005 153.93 254.835 153.72 254.775 153.34H253.125C253.165 154.5 254.035 155.12 255.525 155.12Z" fill="white"/>
<rect x="2" y="2" width="371" height="276" stroke="#606060" strokeWidth="5"/>
        {/* DATA CENTERS (from figma) */}
        <rect
          id="datacenter"
          x={x1}
          y={y1}
          width={w1}
          height={h1}
          fill="#DEFFB6"
        />
        <rect x="70" y="129" width="2" height="2" fill="#DEFFB6"/>
        <rect x="89" y="125" width="2" height="2" fill="#DEFFB6"/>
        <rect x="90" y="124" width="2" height="2" fill="#DEFFB6"/>
        <rect x="88" y="129" width="2" height="2" fill="#DEFFB6"/>
        <rect x="97" y="127" width="2" height="2" fill="#DEFFB6"/>
        <rect x="104" y="125" width="2" height="2" fill="#DEFFB6"/>
        <rect x="107" y="126" width="2" height="2" fill="#DEFFB6"/>
        <rect x="101" y="129" width="2" height="2" fill="#DEFFB6"/>
        <rect x="104" y="132" width="2" height="2" fill="#DEFFB6"/>
        <rect x="176" y="109" width="2" height="2" fill="#DEFFB6"/>
        <rect x="190" y="107" width="2" height="2" fill="#DEFFB6"/>
        <rect x="203" y="101" width="2" height="2" fill="#DEFFB6"/>
        <rect x="303" y="143" width="2" height="2" fill="#DEFFB6"/>
        <rect x="289" y="169" width="2" height="2" fill="#DEFFB6"/>
        <rect x="187" y="109" width="2" height="2" fill="#DEFFB6"/>
        <rect x="184" y="113" width="2" height="2" fill="#DEFFB6"/>
        <rect x="98" y="132" width="2" height="2" fill="#DEFFB6"/>
        <rect x="100" y="134" width="2" height="2" fill="#DEFFB6"/>
        <rect x="112" y="210" width="2" height="2" fill="#DEFFB6"/>
        <rect x="85" y="132" width="2" height="2" fill="#DEFFB6"/>
        <defs>
        <clipPath id="clip0">
        <rect width="375" height="280" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    );
  }
}

const map = (
  <g>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M255.061 128.358H254.068L253.369 128.266L252.909 128.799L252.522 128.928L252.246 129.167L251.768 128.781L251.584 127.788L251.289 127.733V127.366L250.701 127.09L250.388 127.513L250.425 127.991L250.314 128.156L249.725 128.138L249.56 128.689L249.173 128.45L248.566 128.836L248.235 128.689L247.444 128.432H246.91L246.616 128.395L246.082 128.082L246.027 128.505L245.273 128.726L245.291 129.682L244.831 130.049L244.095 130.215L244.021 130.766L243.304 130.913L242.218 130.472L242.126 131.943L242.034 132.807L242.494 132.972L242.2 133.615L242.697 134.553L242.899 135.288L243.69 135.49L243.893 136.226L243.175 137.292L244.941 137.88L245.917 137.714L246.524 137.861L246.689 137.604L247.389 137.696L248.603 137.218L248.456 136.226L248.879 135.564H249.615L249.652 135.251L250.388 135.086L250.774 135.196L251.087 134.865L250.885 134.167L251.161 133.468L251.713 133.174L251.161 132.402L252.099 132.439L252.265 132.016L252.117 131.557L252.485 131.06L252.228 130.472L251.878 129.957L252.32 129.443L253.295 129.204L254.362 129.057L254.804 128.836L255.319 128.707L255.061 128.358V128.358Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M199.567 179.054L196.513 179.036L196.163 179.165L195.85 179.146L195.427 179.312L195.335 179.532L195.85 180.268L196.053 181.058L196.347 182.179L196.034 182.657L195.979 182.896L196.218 183.595L196.494 184.312L196.789 184.716L196.844 185.378L196.715 186.26L196.384 186.775L195.777 187.547L195.538 188.025L195.188 189.072L195.133 189.569L194.765 190.653L194.599 191.664L194.691 192.399L195.188 192.179L195.795 191.995L196.458 192.013L197.046 192.546L197.212 192.473L201.352 192.418L202.033 192.969L204.498 193.135L206.394 192.675L205.75 191.94L205.087 190.984L205.234 187.253L207.369 187.271L207.277 186.867L207.442 186.425L207.277 185.874L207.406 185.323L207.314 184.955L206.835 184.881L206.191 185.065L205.75 185.028L205.492 185.139L205.584 183.742L205.234 183.319L205.179 182.584L205.345 181.885L205.124 181.444V180.709H203.873L203.965 180.286H203.431L203.376 180.488L202.75 180.543L202.474 181.223L202.309 181.518L201.757 181.352L201.407 181.518L200.726 181.609L200.34 181.003L200.101 180.617L199.806 179.918L199.567 179.054V179.054ZM195.556 178.815L195.593 178.319L195.758 178.007L196.126 177.768L195.758 177.363L195.427 177.565L195.022 178.062L195.28 178.944L195.556 178.815V178.815Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M201.26 122.237L200.892 122.807L200.984 123.156L201.168 123.34L201.076 123.689L201.058 124.479L201.186 125.031L201.738 125.417L201.775 125.674L201.959 125.748L202.346 125.196L202.364 124.81L202.658 124.645V124.351L202.235 124.057L202.07 123.579L202.143 123.193L202.051 122.77L201.812 122.66L201.573 122.365L201.334 122.457L201.26 122.237V122.237Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M239.238 142.108L238.999 141.703L238.446 142.42L237.766 143.174L237.158 143.964L236.551 143.927L235.705 143.891L234.932 144.074L234.877 143.762L234.693 143.817L234.766 144.093L235.245 145.269L238.336 145.857L238.52 145.618L238.502 145.14L238.759 144.663L238.704 144.185L239.146 143.946L238.943 143.799L238.962 143.027H239.477L239.238 142.108V142.108Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M126.243 236.239L126.409 235.688L125.066 235.412L123.649 234.75L122.858 233.905L122.306 233.39L123.391 235.872H124.311L124.845 235.908L125.452 236.294L126.243 236.239V236.239ZM116.97 197.987L115.608 197.711L114.872 198.759L115.038 199.053L114.835 200.266L113.805 200.855L114.099 202.803L113.934 203.171L114.302 203.63L113.713 204.366L113.234 205.45L113.069 206.516L113.382 207.656L112.995 208.851L113.897 210.854L114.191 211.075L114.43 212.159L114.136 213.299L114.394 214.292L113.86 215.082L114.136 216.167L114.743 217.325L114.283 217.766L114.338 218.814L114.467 219.99L115.074 221.387L114.78 221.608L115.442 222.913L116.013 223.335L115.866 223.813L116.381 224.052L116.62 224.475L116.289 224.677L116.62 225.357L116.822 226.865L116.694 227.839L117.025 228.427L117.006 229.144L116.51 229.64L117.08 230.853L117.558 231.258L118.129 231.184L118.46 232.03L119.104 232.692L121.312 232.839L122.195 233.004L122.6 233.078L121.735 232.416L120.981 231.258L121.146 230.725L121.79 230.265L121.882 228.942L122.747 228.298L122.71 227.269L121.754 227.03L120.576 226.203L120.558 225.339L121.091 224.769L121.956 224.751L121.993 224.144L121.772 223.023L122.306 222.306L123.06 221.957L122.6 221.369L122.195 221.736L121.459 221.387L120.999 220.247L121.275 219.953L122.306 220.376L123.226 220.211L123.686 219.806L123.354 219.236L123.336 218.354L122.968 217.655L124.035 217.766L125.912 217.527L127.182 216.902L127.789 215.376L127.734 214.788L127.016 214.273L126.998 213.446L125.562 212.435L125.507 211.829L125.434 211.056L125.599 210.799L125.397 209.641L125.452 208.446L125.544 207.509L126.63 205.928L127.605 204.788L128.212 204.31L128.985 203.667L128.893 202.73L128.322 202.049L127.844 202.27L127.789 203.318L126.998 204.2L126.225 204.402L125.084 204.219L124.035 203.888L124.808 202.123L124.606 201.608L123.52 201.149L122.195 200.285L121.349 200.101L119.288 198.189L119.104 197.95L117.945 197.895L117.65 198.833L116.97 197.987V197.987Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M227.296 126.759L227.13 125.95L226.67 125.748L226.21 125.435L226.394 125.068L225.824 124.663L225.953 124.388L225.548 124.186L225.29 123.873L224.021 124.057L224.26 124.461V125.031L225.033 125.307L225.474 125.656L225.658 125.619L225.99 125.932H226.413L226.45 126.116L226.965 126.796L227.296 126.759V126.759Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M320.713 219.935L320.161 219.843L319.811 220.376L319.701 221.369L319.314 222.104L319.222 223.079L319.774 223.115L319.921 223.17L321.136 222.38L321.246 222.693L321.982 221.792L322.571 221.387L323.399 220.046L322.884 219.954L322.001 220.174L321.375 220.34L320.713 219.935ZM329.931 188.264L330.023 187.841L330.041 187.179L329.747 186.591L329.765 186.095L329.526 185.948L329.545 185.231L329.324 184.643L328.901 185.084L328.827 185.415L328.551 186.058L328.22 186.683L328.33 187.069L328.109 187.308L327.833 188.19L327.852 188.87L327.723 189.201L327.778 189.771L327.3 190.69L327.061 191.333L326.748 191.867L326.435 192.492L325.681 192.878L324.779 192.492L324.687 192.124L324.227 191.83H323.933L323.325 191.131L322.865 190.727L322.148 190.359L321.43 189.716L321.412 189.385L321.872 188.815L322.258 188.227L322.203 187.749L322.553 187.712L323.013 187.253L323.381 186.628L322.976 186.04L322.7 186.26L322.332 186.168L321.688 186.499L321.099 186.131L320.786 186.26L319.958 185.966L319.461 185.47L318.817 185.194L318.247 185.359L318.965 185.745L318.909 186.334L318.026 186.554L317.511 186.426L316.849 186.83L316.315 187.51L316.425 187.786L315.929 188.098L315.303 189.036L315.413 189.679L314.788 189.569H314.144L313.684 188.87L313.003 188.337L312.488 188.484L312.009 188.65L311.954 188.944L311.513 188.815L311.457 189.146L310.905 189.348L310.593 189.808L309.949 190.378L309.691 191.26L309.268 191.021L308.863 191.591L309.139 192.142L308.661 192.363L308.403 191.352L307.52 192.344L307.373 192.988L307.244 193.447L306.545 194.054L306.177 194.679L305.533 195.194L304.41 195.543L303.84 195.506L303.564 195.616L303.361 195.874L302.717 196.002L301.853 196.444L301.595 196.297L301.117 196.388L300.27 196.811L299.681 197.308L298.798 197.694L298.228 198.502L298.301 197.62L297.731 198.466L297.713 199.146L297.473 199.734L297.197 200.01L296.958 200.69L297.124 201.039L297.142 201.407L297.437 202.326L297.308 202.932L297.124 202.473L296.701 202.142L296.774 203.226L296.461 202.712L296.48 203.226L296.811 204.145L296.701 205.065L297.013 205.524L296.94 205.873L297.105 206.627L296.866 207.289L296.811 207.95L296.94 209.145L296.811 209.825L296.406 210.634L296.296 211.057L296.02 211.333L295.486 211.48L295.21 212.16L295.652 212.38L296.388 213.134H297.05L297.749 213.189L298.357 212.803L298.982 212.472L299.24 212.527L300.068 211.903L300.767 211.847L301.521 211.719L302.294 211.939L302.957 211.829L303.803 211.792L304.355 211.314L304.778 210.708L305.735 210.432L307.005 209.844L307.925 209.917L309.194 209.531L310.629 209.109L312.433 208.998L313.169 209.568L313.849 209.605L314.825 210.303L314.53 210.579L314.861 211.02L315.101 211.866L314.806 212.491L315.34 212.969L316.131 212.031L316.922 211.645L318.155 210.634L317.861 211.498L317.235 212.086L316.775 212.766L315.965 213.41L316.922 213.189L317.787 212.38L317.621 213.263L317.033 213.833L317.897 213.98L318.137 214.458L318.063 215.064L317.787 215.965L318.045 216.7L318.781 217.049L319.296 217.123L319.737 217.307L320.381 217.638L321.706 216.774L322.35 216.553L321.853 217.178L322.332 217.38L322.829 217.895L323.693 217.399L324.393 216.939L325.552 216.443L326.656 216.406L327.429 215.983L327.594 215.616L328.146 214.788L328.864 213.906L329.526 213.318L330.336 212.289L330.943 211.719L331.753 210.8L332.746 210.23L333.666 209.164L334.237 208.336L334.494 207.675L335.193 206.627L335.58 206.094L336.04 205.046L335.911 204.054L336.224 203.337L336.426 202.657V201.719L335.911 200.782L335.561 200.322L335.028 199.605L335.157 198.374L334.881 198.557L334.586 198.043L334.126 198.3L334.016 197.032L333.611 196.297L333.795 196.021L333.225 195.506L332.636 194.955L331.661 194.348L331.495 193.558L331.734 192.951L331.661 191.94L331.421 191.811L331.385 191.223L331.348 190.212L331.55 189.698L331.127 189.238L330.869 188.742L330.152 189.183L329.931 188.264V188.264Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M198.077 115.527L197.653 115.307L197.23 115.362L196.494 115.013L196.181 115.105L195.703 115.564L195.004 115.197L194.728 115.73L194.415 115.877L194.599 116.612L194.525 116.814L194.213 116.575L193.771 116.538L193.146 116.759L192.336 116.704L192.226 116.998L191.747 116.685L191.471 116.741L191.508 116.943L191.379 117.237L191.802 117.439L192.281 117.476L192.851 117.641L192.943 117.421L193.826 117.218L194.065 117.623L195.39 117.917L196.163 117.991L196.605 117.733L197.396 117.715L197.561 117.513L197.801 116.777L197.598 116.538H198.113L198.15 116.06L198.021 115.674L198.077 115.527V115.527Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M225.658 125.619L225.474 125.656L225.695 126.097L226.284 126.63L226.965 126.795L226.449 126.115L226.413 125.932H225.989L225.658 125.619V125.619ZM227.572 123.91L226.781 123.211L226.505 123.174L226.302 123.34L226.891 123.965L226.781 124.093L226.265 124.02L225.493 123.689L225.29 123.873L225.548 124.185L225.953 124.388L225.824 124.663L226.394 125.068L226.21 125.435L226.67 125.748L227.13 125.95L227.296 126.759L228.271 125.895L228.621 125.803L228.97 126.152L228.75 126.722L229.449 127.347L229.688 127.292L229.541 126.704L229.854 126.428L229.927 126.023L229.909 125.104L230.682 125.012L230.314 124.7L229.854 124.663L229.21 123.836L228.584 123.248L228.106 123.707L228.014 123.983L227.572 123.91V123.91Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.269 175.452L214.214 174.992L213.662 174.918L213.349 175.58L212.705 175.488L212.962 176.021L212.981 176.224L213.349 177.345L213.33 177.4L213.441 177.382L213.827 176.959L214.232 176.352L214.49 176.095V175.727L214.269 175.452V175.452Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M187.129 112.255L186.319 112.494L185.657 112.402L184.958 112.623L185.086 113.027L185.491 113.046L185.933 113.487L186.558 114.02L187.018 113.946L187.828 114.461L187.901 113.818L188.141 113.781L188.214 113.009L187.699 112.752L187.129 112.255V112.255Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M186.429 158.54L185.638 157.86H185.27L184.921 158.21L184.7 158.559L184.203 158.669L183.982 159.184L183.633 159.313L183.504 159.919L183.817 160.268L184.185 160.691L184.222 161.261L184.424 161.5L184.387 164.184L184.645 164.992L185.491 164.845L185.546 162.97L185.528 162.217L185.712 161.482L186.025 161.132L186.521 160.397L186.411 160.085L186.613 159.625L186.393 158.926L186.429 158.54V158.54Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M183.099 154.717H182.437L182.179 154.497L181.627 154.662L180.671 155.14L180.468 155.508L179.677 156.041L179.53 156.335L179.107 156.574L178.61 156.408L178.315 156.702L178.168 157.511L177.34 158.467L177.377 158.871L177.083 159.368L177.156 160.048L177.616 160.305L177.8 160.691L178.26 160.93L178.61 160.636L179.107 160.599L179.806 160.893L179.659 160.011L179.695 159.349L181.48 159.294L181.922 159.386L182.253 159.202L182.731 159.294L183.633 159.313L183.983 159.184L184.203 158.669L184.7 158.559L184.921 158.21L184.939 157.401L183.762 157.144L183.725 156.574L183.155 155.82L183.007 155.287L183.099 154.717V154.717Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M276.516 146.391L275.688 144.534L275.412 144.552L275.375 145.288L274.731 144.681L274.934 144.019L275.375 143.946L275.67 142.972L275.044 142.769L274.124 142.788L273.13 142.622L272.91 141.813L272.413 141.74L271.53 141.244L271.309 142.034L272.155 142.659L271.585 143.1L271.438 143.523L272.118 143.835L272.045 144.534L272.523 145.416L272.818 146.372L273.222 146.482L273.535 146.611L273.646 146.391L274.106 146.629L274.345 145.986L274.179 145.508L275.118 145.545L275.633 146.225L275.909 146.795L276.056 147.383L276.424 147.99L276.222 147.052L276.608 147.236L276.516 146.391V146.391Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M209.374 121.097L208.822 120.969L208.086 120.564L207.019 120.822L206.596 121.116L205.216 121.061L204.48 120.877L204.13 120.969L203.799 120.491L203.597 120.748L203.725 121.171L204.241 121.649L203.928 121.998L203.799 122.366L203.909 122.494L203.781 122.66L204.296 123.027L204.443 123.781L205.142 123.818L205.86 123.505L206.578 123.891L207.424 123.781L207.369 123.23L208.289 122.862L209.117 123.009L208.73 122.366L208.97 121.557L209.374 121.097Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M198.445 119.369L198.022 119.388L197.838 119.626L197.488 119.369L197.323 119.829L197.819 120.362L198.059 120.711L198.519 121.134L198.887 121.391L199.291 121.851L200.156 122.292L200.23 121.667L200.506 121.41L200.671 121.299L200.892 121.244L200.984 120.711L200.487 120.288L200.671 119.792H200.34L199.898 119.535L199.255 119.553L198.445 119.369V119.369Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M207.755 107.329L206.798 107.054L205.952 107.476L205.474 107.66L205.639 108.138L204.995 108.506L204.903 109.131L204.02 109.535H203.174L203.284 110.032L203.597 110.454L203.652 110.895L203.155 111.116L203.505 111.649L203.597 112.145L204.002 112.09L204.443 111.796L205.124 111.759L206.044 111.851L207.074 112.127L207.774 112.145L208.142 112.311L208.436 112.109L208.712 112.384L209.503 112.329L209.871 112.44L209.834 111.87L210.055 111.612L210.81 111.557L210.442 110.84L210.166 110.473L210.313 110.362L211.03 110.399L211.325 110.16L211.012 109.866L210.386 109.664L210.405 109.462L210 109.26L209.319 108.543L209.43 108.249L209.246 107.715L208.362 107.458L207.939 107.587L207.755 107.329V107.329Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M91.78 153.596L92.0376 153.191L92.2216 153.155L92.4608 152.842L92.6448 152.254L92.5896 152.144L92.7552 151.721L92.6816 151.537L92.9208 151.041L92.976 150.71H92.7736L92.792 150.544H92.608L92.148 151.261L91.9824 151.114L91.8536 151.169L91.8352 151.353L91.7064 152.272L91.4856 153.596H91.78V153.596Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M123.649 195.763L123.943 195.524L123.796 194.863L124.035 194.348L124.127 193.429L123.833 192.694L123.244 192.381L123.097 191.903L123.207 191.241L121.238 191.186L120.741 189.826L121.036 189.808L120.981 189.293L120.76 188.962L120.668 188.282L120.061 187.933L119.417 187.951L118.957 187.602L118.257 187.381L117.816 186.94L116.657 186.756L115.479 185.709L115.534 184.918L115.369 184.459L115.442 183.595L114.099 183.797L113.584 184.22L112.701 184.698L112.498 185.047L111.965 185.084L111.192 184.973L112.204 186.867L112.001 187.253L112.02 188.08L112.075 189.072L111.725 189.661L111.946 190.102L111.744 190.488L112.259 191.462L111.744 192.73L112.314 193.521L112.535 194.366L113.124 194.863L112.921 196.002L113.602 197.307L114.173 198.925L114.872 198.76L115.608 197.712L116.969 197.988L117.65 198.833L117.945 197.896L119.104 197.951L119.288 198.19L119.564 196.793L119.527 196.168L119.913 195.138L121.661 194.789L122.6 194.808L123.593 195.414L123.649 195.763V195.763Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M124.256 169.956L123.998 169.993L123.428 169.901L123.097 170.213L122.618 170.415L122.306 170.452L122.177 170.691L121.68 170.636L121.036 170.084L120.981 169.551L120.723 168.945L120.907 167.952L121.202 167.548L120.981 166.996L120.631 166.831L120.778 166.316L120.539 166.041L120.006 166.096L120.134 166.427L119.748 166.868L118.57 167.309L117.834 167.493L117.522 167.768L116.712 167.474L115.939 167.327L115.755 167.438L116.197 167.732L116.142 168.522L116.27 169.257L117.154 169.349L117.209 169.607L116.454 169.937L116.326 170.434L115.902 170.618L115.13 170.893L114.927 171.243L114.118 171.334L113.566 170.709L113.363 170.857L113.179 170.158L112.885 169.79L112.535 170.195L110.53 170.176V170.893L111.137 171.022L111.1 171.463L110.898 171.353L110.309 171.537V172.382L110.769 172.823L110.934 173.485L110.916 174L110.511 177.198L109.573 177.143L109.444 177.327L108.598 177.547L107.457 178.338L107.383 178.889L107.144 179.294L107.273 179.919L106.666 180.268L106.684 180.764L106.408 180.966L106.886 182.033L107.494 182.731L107.31 183.246L107.99 183.301L108.414 183.926L109.315 183.963L110.125 183.264L110.162 185.047L110.64 185.176L111.192 184.974L111.965 185.084L112.498 185.047L112.701 184.698L113.584 184.22L114.099 183.797L115.442 183.595L115.369 184.459L115.534 184.918L115.479 185.709L116.657 186.757L117.816 186.94L118.258 187.382L118.957 187.602L119.417 187.951L120.061 187.933L120.668 188.282L120.76 188.962L120.981 189.293L121.036 189.808L120.742 189.826L121.238 191.187L123.207 191.242L123.097 191.903L123.244 192.381L123.833 192.694L124.127 193.429L124.035 194.348L123.796 194.863L123.943 195.525L123.649 195.764L123.998 196.425L124.072 198.006L125.176 198.227L125.562 198.006L126.28 198.319L126.501 198.668L126.685 199.734L126.85 200.194L127.218 200.249L127.586 200.047L127.973 200.267L128.028 200.91L127.973 201.609L127.844 202.271L128.322 202.05L128.893 202.73L128.985 203.668L128.212 204.311L127.605 204.789L126.63 205.929L125.544 207.509L126.17 207.381L127.31 208.281L127.66 208.245L128.801 208.998L129.684 209.642L130.383 210.432L130.034 210.984L130.42 211.664L130.954 210.984L131.23 209.881L131.818 209.329L132.536 208.41L133.364 206.351L133.99 205.708L134.137 205.138L134.192 203.962L133.953 203.318L134.008 202.436L134.762 201.278L135.866 200.341L136.97 200.01L137.633 199.477L139.197 199.036H140.282L140.485 198.337L141.258 197.822L141.368 196.628L142.306 195.102L142.398 193.539L142.693 193.062L142.748 192.308L142.95 190.488L142.766 188.301L143.024 187.437L143.282 187.418L143.999 186.407L144.606 185.084L146.023 183.466L146.52 182.694L146.888 180.764L146.704 180.047L146.336 178.558L145.95 178.191L145.066 178.154L144.275 177.805L142.932 176.5L141.386 175.525L139.841 175.581L137.835 174.956L136.639 175.323L136.786 174.68L136.29 173.981L134.56 173.283L133.254 172.86L132.481 173.614L132.426 172.456L130.604 172.272L130.291 171.904L131.064 170.948L131.046 170.14L130.494 169.956L129.942 167.897L129.702 167.254L129.353 167.309L128.709 168.375L128.378 169.239L127.991 169.68L127.494 169.772L127.347 169.441L127.126 169.386L126.795 169.717L126.354 169.478L125.765 169.221L125.268 169.349L124.845 169.239L124.753 169.57L124.918 169.809L124.826 170.048L124.256 169.956V169.956Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M300.675 166.886L301.172 167.492L301.374 167.088L301.871 167.125L301.89 166.371L301.908 165.801L301.062 166.445L300.675 166.886V166.886Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M274.345 139.699L273.848 139.368L273.314 139.35L272.542 139.074L272.063 139.368L271.585 140.251L271.64 140.471L272.652 140.931L273.241 140.747L274.106 140.82L274.915 140.784L274.842 140.067L274.345 139.699Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M208.473 192.914L208.289 192.822L207.7 193.098H207.406L206.725 193.558L206.357 193.08L204.774 193.484L204.02 193.521L203.854 197.693L202.861 197.73L202.75 201.131L203.008 201.315L203.56 202.436L203.431 203.134L203.634 203.557L204.37 203.428L204.885 202.914L205.382 202.565L205.658 201.995L206.154 201.719L206.578 201.866L207.038 202.197L207.847 202.252L208.51 201.976L208.62 201.609L208.841 201.057L209.393 200.965L209.706 200.524L210.074 199.734L211.03 198.87L212.502 198.006L211.877 197.473L211.104 197.307L210.828 196.554L210.846 196.149L210.423 196.021L209.319 194.734L209.025 194.054L208.822 193.852L208.473 192.914V192.914Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M207.332 162.089L207.24 162.033L206.872 161.703L206.817 161.335L206.964 160.857V160.379L206.357 159.644L206.228 159.147L205.584 159.35L205.069 159.809L204.333 161.096L203.376 161.629L202.382 161.555L202.088 161.666L202.198 162.089L201.665 162.493L201.242 162.952L199.935 163.394L199.678 163.136L199.512 163.1L199.328 163.412L198.463 163.486L197.966 164.68L197.709 164.883L197.635 165.802L197.746 166.298L197.672 166.647L198.15 167.254L198.242 167.677L198.629 168.265L199.107 168.651L199.162 169.184L199.273 169.515L199.806 168.43L200.414 167.805L201.113 168.007L201.775 168.081L201.867 167.254L202.272 166.666L202.824 166.298L203.67 166.684L204.333 167.125L205.087 167.235L205.86 167.456L206.154 166.757L206.302 166.666L206.78 166.776L207.921 166.206L208.326 166.445L208.657 166.408L208.822 166.132L209.19 166.022L209.982 166.151L210.644 166.169L210.975 166.059L210.81 165.673L210.037 165.213L209.761 164.515L209.319 164.019L208.62 163.394L208.602 163.026L208.031 162.548L207.332 162.089V162.089Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M124.256 117.862L124.127 117.311L123.667 117.66L123.759 118.046L124.79 118.524L125.139 118.45L125.746 117.991L124.882 118.009L124.256 117.862V117.862ZM126.906 114.939L126.942 114.737L126.188 114.259L125.102 113.965L124.753 114.075L125.397 114.608L126.446 114.958L126.906 114.939V114.939ZM70.7304 115.619L70.7672 114.994L70.1785 114.516L70.1049 113.983L70.0865 113.597L69.332 113.469L68.8905 113.303L68.1361 113.046L67.8785 113.322L67.7681 113.928L68.5592 114.13L68.4856 114.461L69.0192 114.866V115.27L70.1785 115.785L70.7304 115.619V115.619ZM132.573 113.138L133.29 112.439L133.548 112.127L133.162 112.072L132.26 112.476L131.487 113.119L129.997 114.921L129.022 115.601L129.316 115.913L128.617 116.318L128.654 116.667L130.42 116.686L131.414 116.63L132.223 116.906L131.414 117.439L131.947 117.476L133.29 116.483L133.511 116.63L133.051 117.568L133.603 117.788L134.026 117.752L134.67 116.741L134.578 116.024L134.634 115.417L133.953 115.619L134.468 114.774L133.677 114.425L133.18 114.7L132.462 114.388L132.904 114.002L132.37 113.763L131.671 114.13L132.573 113.138V113.138ZM66.9217 109.241L66.5721 109.609L66.3145 110.087L66.4801 110.436L66.3697 110.95L66.4985 111.465H66.8481L66.8112 110.564L68.1176 109.296L67.2161 109.388L66.9217 109.241ZM118.607 100.602L118.534 100.381L118.221 100.363L117.706 100.675L117.632 100.749L117.65 101.061L117.963 101.153L118.607 100.602V100.602ZM116.841 100.013L116.988 99.8112L115.884 99.7928L114.982 100.289V100.565L115.534 100.602L116.841 100.013ZM116.27 96.962L115.774 96.8701L114.854 97.826L114.191 98.6348L113.142 99.1495L114.302 99.0392L114.154 99.6641L115.663 99.1127L116.804 98.5612L116.951 99.0392L118.037 99.2781L118.938 98.9473L118.589 98.6164L117.963 98.6899L118.202 98.1936L117.522 97.8811L116.896 97.5319L116.62 97.2561L116.105 97.4216L116.27 96.962V96.962ZM124.477 95.4547L125.158 95.1423L125.342 95.0136L125.599 94.5908L125.176 94.3151L124.403 94.4438L123.704 95.0136L123.575 95.4915L124.477 95.4547ZM110.898 93.4879L110.75 93.1203L110.695 92.9365L110.401 92.7526L109.849 92.4769L108.947 92.8997L108.027 93.2122L108.671 93.6533L109.37 93.5431L110.125 93.8372L110.898 93.4879V93.4879ZM115.019 93.1019L113.805 92.9181L114.854 92.4402L114.78 91.3373L114.43 90.9145L113.602 90.7674L112.112 91.4659L111.1 92.5321L111.634 92.9181L111.928 93.5247L110.769 94.5357L110.18 94.4989L109.039 95.3077L109.812 94.3518L108.929 94.021L108.101 94.1864L107.659 94.8114L106.574 94.793L105.249 94.9401L104.31 94.4989L103.39 94.5724L103.114 94.0394L102.728 93.8004L102.029 93.8923L101.072 93.9475L100.262 94.2783L100.63 94.7011L99.3424 95.2158L99.0848 94.6092L98.2752 94.793L96.104 94.9033L94.9264 94.6827L96.4904 94.2048L95.9752 93.6901L95.1656 93.7636L94.3008 93.5798L92.9208 93.2306L92.2216 92.8078L91.3936 92.7526L90.7864 93.0468L89.7008 93.2122L90.4184 92.4585L88.6888 93.1203L88.4312 92.2563L88.0448 92.1461L87.3456 92.6056L86.5176 92.8262L86.4808 92.4218L84.972 92.6791L83.3528 93.1019L82.396 92.9916L81.108 93.2857L79.9672 93.7085L79.2864 93.6166L78.6792 93.1387L77.5936 92.8997L73.1224 96.6128L66.6089 102.568L67.3817 102.587L67.8785 102.881L67.9889 103.359L68.0256 104.076L69.424 103.469L70.6016 103.12L70.5096 103.671L70.6384 104.112L70.9512 104.609L70.7489 105.381L70.4729 106.631L71.3192 107.329L70.7489 108.009L69.8105 108.542L69.3505 109.112L69.7369 109.921L69.1665 110.822L69.9209 111.3L69.2585 111.98L69.0192 112.991L70.2889 113.45L70.5832 113.947L71.5769 115.068H71.7056H74.2632H76.9496H77.8328H80.5928H83.2608H85.9656H88.6888H91.7616H94.8528H96.7112L96.9504 114.627H97.2448L97.0976 115.252L97.2816 115.436L97.8704 115.509L98.7168 115.693L99.416 116.042L100.226 115.895L101.201 116.189L101.79 115.748L102.378 115.564L102.71 115.289L102.986 115.141L103.722 115.362L104.329 115.399L104.476 115.546L104.494 116.189L105.451 116.373L105.138 116.686L105.359 117.035L105.01 117.458L105.341 117.605L104.991 117.991L105.212 118.027L105.451 117.862L105.543 118.119L106.169 118.248L106.868 118.266L107.567 118.377L108.303 118.597L108.45 118.965L108.708 119.829L108.266 120.196L107.567 120.049L107.383 119.351L107.218 120.068L106.518 120.693L106.371 121.226L106.169 121.538L105.414 121.906L104.734 122.531L104.366 122.935L104.862 123.009L105.69 122.641L106.224 122.329L106.518 122.274L106.997 122.384L107.31 122.218L107.825 122.071L108.69 121.924L108.745 121.593L108.69 121.612L108.377 121.667L108.046 121.557L108.469 121.171L108.818 121.042L109.536 120.877L110.382 120.711L110.714 120.932L111.063 120.674L111.413 120.527L111.578 120.601L111.597 120.619L112.83 119.847L113.326 119.627H114.743H116.454L116.638 119.332L116.951 119.277L117.411 119.112L117.908 118.597L118.497 117.697L119.509 116.833L119.711 117.145L120.392 116.943L120.668 117.274L120.153 118.836L120.539 119.48L121.625 119.332L123.115 119.296L121.202 120.233L120.926 121.189L121.606 121.281L122.913 120.454L123.98 120.013L126.225 119.332L127.605 118.579L127.126 118.174L127.31 117.347L126.004 118.634L124.422 118.781L123.41 118.211L123.391 117.366L123.502 116.116L124.624 115.362L124.017 114.792L122.618 114.903L120.392 115.858L118.386 117.366L117.54 117.549L118.975 116.502L120.834 114.976L122.158 114.48L123.207 113.671L124.164 113.579L125.507 113.597L127.347 113.836L128.93 113.653L130.365 112.715L131.966 112.311L132.738 111.925L133.511 111.502L133.879 110.252L133.677 109.829L133.051 109.682V108.745L132.628 108.395L131.358 108.101L130.843 107.476L129.96 106.851L130.586 106.171L130.218 104.866L129.739 103.488L129.555 102.532L128.764 103.028L127.402 104.223L125.912 104.811L125.618 104.186L124.937 104.002L125.342 102.66L125.82 101.76L124.403 101.668L124.385 101.263L123.722 100.657L123.17 100.289L122.342 100.565L121.57 100.473L120.355 100.179L119.638 100.418L118.938 102.072L118.754 103.046L117.135 104.168L117.706 104.995L117.798 105.914L117.485 106.649L116.62 107.403L115.24 108.175L113.584 108.69L113.897 109.278L113.492 111.042L112.462 112.2L111.615 112.55L110.806 111.484L110.787 110.234L111.1 109.131L111.762 108.175L110.879 108.065L109.499 107.991L108.837 107.531L107.954 107.237L107.641 106.704L107.034 106.3L105.746 105.822L104.439 106.043L104.568 105.215L104.844 104.204L103.74 104.021L104.642 102.771L105.543 101.925L107.273 100.73L108.855 99.8847L109.886 99.756L110.419 99.0759L111.358 98.6348L112.535 98.5612L113.952 97.8627L114.486 97.4216L115.847 96.5576L116.436 96.043L117.025 96.3554L118.221 96.19L120.208 95.4915L120.631 94.9952L120.484 94.4621L121.404 93.9291L121.717 93.4328L121.073 92.9548L120.079 92.8078L119.067 92.7343L118.221 93.8188L117.025 94.6643L115.7 95.3996L115.461 94.7195L116.234 93.9842L115.829 93.3409L114.228 94.1129L115.019 93.1019V93.1019ZM101.127 89.6278L100.612 89.444L98.0176 90.0322L97.0792 90.3998L95.644 91.1167L96.6376 91.374L97.7784 91.3556L95.6624 91.7417V92.0909L96.6928 92.1093L98.3488 92.0358L99.5448 92.2563L98.404 92.4402L97.392 92.385L96.0856 92.5504L95.4784 92.6607L95.5888 93.4328L96.3616 93.3225L97.116 93.5982L97.0608 94.0577L98.496 93.9658L100.557 93.8188L102.286 93.4879L103.206 93.4144L104.255 93.6901L105.488 93.8372L106.058 93.4879L105.93 93.1019L107.218 93.0284L107.696 92.5872L106.776 92.1277L106.003 91.6497L106.445 90.988L106.942 90.0505L106.537 89.6829L105.985 89.5175L105.212 89.6645L104.697 90.6388L103.906 91.0248L104.31 90.0873L103.998 89.7748L102.654 90.2711L102.176 89.7932L100.262 90.0689L101.127 89.6278V89.6278ZM108.322 89.352L108.009 89.1498L107.015 89.1866L106.629 89.3153L107.034 89.977L108.322 89.352ZM128.138 89.6462L127.329 89.1315L125.783 89.0396L125.397 89.0947L125.084 89.4256L125.452 89.9403L125.618 89.9954L126.501 89.8667L127.255 89.8851L128.01 89.9035L128.138 89.6462V89.6462ZM120.889 89.591L121.938 89.0028L119.877 89.2418L118.81 89.6278L117.503 90.4733L116.896 91.4292L117.926 91.4475L116.804 91.8703L117.135 92.2196L118.221 92.3666L119.564 92.6424L122.103 92.8629L123.557 92.7526L124.146 92.4585L124.514 92.7894L125.121 92.8446L125.489 93.4511L124.845 93.7085L126.151 94.0394L126.998 94.5173L127.09 94.8665L127.016 95.3077L125.434 96.3003L124.845 96.7966L124.882 97.1642L123.189 97.2929L121.717 97.3113L120.723 98.0833L121.165 98.4326L123.557 98.2671L123.722 97.973L124.587 98.4693L125.452 99.0024L125.01 99.2965L125.71 99.8112L127.108 100.418L129.077 100.841L129.132 100.473L128.617 99.8296L127.973 98.9289L129.537 99.7744L130.402 100.05L131.064 99.2965V98.2671L130.88 97.9914L130.07 97.5319L129.574 96.9253L129.997 96.3371L131.064 96.2084L131.763 97.201L132.499 97.6422L134.468 96.4474L135.075 95.7305L133.898 95.6753L133.309 94.7379L132.223 94.5173L130.806 93.8739L132.462 93.4144L132.315 92.4953L131.91 92.1093L130.383 91.7233L130.034 91.1167L128.525 91.3373L128.727 90.9145L128.065 90.4549L126.814 89.977L125.857 90.363L124.201 90.6388L124.808 90.0138L124.385 89.0396L122.25 89.4256L120.944 90.1792L120.889 89.591V89.591ZM111.689 88.966L110.382 89.4072L110.548 90.0322L109.186 89.9035L108.874 90.216L109.941 90.9329L110.106 91.3005L110.732 91.3924L112.278 91.0248L113.216 90.1608L112.517 89.7564L113.621 89.3153L113.713 89.0396L112.333 89.1498L111.689 88.966V88.966ZM115.792 89.9586L116.822 89.7748L118.662 88.9476L117.54 88.7271L116.105 88.6903L115.148 88.9476L114.375 89.3337L113.915 89.8116L113.584 90.6388L114.375 90.6755L115.792 89.9586V89.9586ZM94.6872 91.2821L95.1656 90.8593L96.84 90.1976L99.3792 89.5359L100.557 89.2969L100.262 88.9109L99.9128 88.6352L98.1832 88.5984L97.4288 88.3962L94.8528 88.5433L94.7976 89.1131L93.3992 89.7197L92.0376 90.4182L91.2464 90.8226L92.332 91.3189L92.2216 91.7417L94.6872 91.2821V91.2821ZM117.522 87.9183L117.577 87.6242L117.319 87.3117L116.05 87.5506L115.24 87.955L115.829 88.194L116.767 88.2675L117.522 87.9183V87.9183ZM115.921 86.3375L115.718 86.4661L114.835 86.411L113.437 86.7051L112.738 86.6867L111.946 87.3852L113.161 87.3117L112.535 87.8448L113.124 87.9918L114.375 87.8999L115.442 87.2198L115.958 86.7602L115.921 86.3375ZM108.726 86.797L109.058 86.3742L108.487 86.2823L107.438 86.5948L107.31 87.4587L106.187 87.3852L105.672 86.8521L104.163 86.558L103.17 86.8154L101.035 87.6977L101.79 87.8448L105.065 87.7528L103.114 88.1572L102.838 88.4513L103.924 88.433L106.169 88.0286L108.708 87.8815L109.646 87.4587L110.07 87.0176L109.389 86.9808L108.598 87.1279L108.726 86.797V86.797ZM118.883 86.0066L117.577 85.9514L116.878 86.3191L117.356 86.5948L118.644 86.7051L118.902 87.0911L118.497 87.5323L118.221 88.0469L119.785 88.3411L120.797 88.4513L122.269 88.433L124.403 88.2859L125.194 88.3962L126.427 88.2124L127.071 87.955L127.255 87.5874L126.832 87.2382L125.765 87.183L124.293 87.2565L123.005 87.4587L122.066 87.3852L121.183 87.3301L120.962 87.1279L120.392 86.9257L120.907 86.5764L120.65 86.2823L119.306 86.3007L118.883 86.0066V86.0066ZM105.083 85.5287L103.979 85.6573L102.967 85.639L100.741 86.2088L98.6064 86.8889L99.2688 87.0727L100.557 86.9441L102.36 86.558L103.059 86.5029L104.016 86.2088L105.083 85.5287V85.5287ZM119.895 85.639L120.079 85.547L119.803 85.3816L118.478 85.3632L118.368 85.6022L119.546 85.6573L119.895 85.639V85.639ZM109.15 85.4919L109.738 85.2346L108.984 85.0875L107.898 85.1794L106.96 85.4551L107.567 85.7309L109.15 85.4919ZM110.585 84.7199L109.978 84.5544L109.683 84.5177L108.634 84.7566L108.45 84.8853H109.554L110.585 84.7199V84.7199ZM119.122 85.1794L119.674 84.8669L119.251 84.5728L118.938 84.5177L118.129 84.4993L117.742 84.8302L117.614 85.161L117.908 85.3632L119.122 85.1794ZM116.602 84.9588L116.62 84.5544L115.258 84.242L114.136 84.1317L113.75 84.4442L114.265 84.6463L113.29 84.9037L114.706 84.9405L115.442 85.2162L116.399 85.3081L116.602 84.9588V84.9588ZM126.482 83.8376L126.593 83.3229L125.728 83.1758L124.863 83.0104L124.569 82.606L123.06 82.6428L123.115 82.8082L122.398 82.8633L121.643 83.1023L120.742 83.4515L120.686 83.8008L121.054 84.0765H122.25L121.459 84.2971L121.073 84.5912L121.367 84.9405L122.6 85.0507L123.851 84.9772L125.783 84.3522L126.961 84.1133L126.482 83.8376V83.8376ZM140.926 81.3009L139.638 81.2641L138.369 81.209L136.492 81.3193L136.234 81.2457L134.339 81.2825L133.162 81.356L132.223 81.4663L131.303 81.834L130.88 81.6501L130.162 81.6134L128.93 81.8707L127.568 81.981L126.814 81.9994L125.71 82.1464L125.507 82.3854L125.967 82.606L126.114 82.9001L126.924 83.1758L129.206 83.1207L130.53 83.2126L129.206 83.4883L128.801 83.4148L127.09 83.378L126.887 83.7824L127.439 84.0949L126.924 84.389L125.544 84.5912L124.642 84.9037L125.526 85.0691L125.838 85.6206L124.458 85.2529L123.998 85.3081L123.63 85.9331L122.158 86.1353L121.79 86.558L123.023 86.6132L123.925 86.7235L126.078 86.5764L127.623 86.8338L129.942 86.2823L130.126 86.0801L128.948 86.1169L129.04 85.9147L130.236 85.6573L130.898 85.3081L132.15 85.0691L133.07 84.775L132.922 84.3706L133.53 84.2236L132.738 84.1133L134.781 84.0398L135.37 83.8743L136.823 83.7273L138.534 83.0839L139.786 82.8817L141.681 82.4222H140.319L141.037 82.2567L142.693 82.1097L144.478 81.8156L144.68 81.6134L143.723 81.4296L142.49 81.356L140.926 81.3009V81.3009Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M191.471 116.74L190.478 116.391L190.294 116.648H189.521L189.282 116.832L188.858 116.722L188.895 117.016L188.251 117.659V118.174L188.693 118.009L189.024 118.505L189.429 118.744L189.87 118.689L190.367 118.303L190.533 118.487L190.974 118.45L191.14 117.99L191.839 118.137L192.226 117.935L192.281 117.476L191.802 117.439L191.379 117.237L191.508 116.943L191.471 116.74V116.74Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M122.306 233.391L121.625 233.262L121.018 233.721L121.054 234.475L120.834 234.99L119.509 234.585L117.926 233.85L117.098 233.611L118.883 234.861L120.042 235.449L121.422 236.074L122.398 236.24L123.189 236.571L123.741 236.663L124.164 236.681L124.753 236.35L124.845 235.909L124.311 235.872H123.391L122.306 233.391V233.391ZM113.602 197.307L112.922 196.002L113.124 194.863L112.535 194.366L112.314 193.521L111.744 192.73L111.523 193.337L111.026 193.631L111.413 195.286L111.689 197.197L111.67 199.807V202.234L111.836 204.495L111.486 205.928L111.873 207.362L111.781 208.336L112.37 210.083L112.351 211.829L112.13 213.704L112.02 215.634L111.634 215.671L112.075 217.013L112.682 218.171L112.48 218.961L112.83 221.093L113.106 222.711L113.75 222.876L113.547 221.461L114.283 221.755L114.614 224.089L113.437 223.703L113.805 225.578L113.308 226.589L114.817 226.92L114.191 227.803L114.228 228.905L115.148 230.854L115.921 231.608L115.958 232.269L116.565 232.968L117.945 233.611L119.306 234.383L120.447 234.751L120.815 234.732L120.484 233.685L121.11 233.28L121.422 233.005H122.195L121.312 232.839L119.104 232.692L118.46 232.03L118.129 231.185L117.558 231.258L117.08 230.854L116.51 229.641L117.006 229.144L117.025 228.428L116.694 227.839L116.822 226.865L116.62 225.358L116.289 224.678L116.62 224.476L116.381 224.053L115.866 223.814L116.013 223.336L115.442 222.913L114.78 221.608L115.074 221.387L114.467 219.99L114.338 218.814L114.283 217.766L114.743 217.325L114.136 216.167L113.86 215.083L114.394 214.292L114.136 213.299L114.43 212.16L114.191 211.075L113.897 210.855L112.995 208.851L113.382 207.656L113.069 206.517L113.234 205.451L113.713 204.366L114.302 203.631L113.934 203.171L114.099 202.804L113.805 200.855L114.835 200.267L115.038 199.054L114.872 198.76L114.173 198.925L113.602 197.307V197.307Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M295.045 150.324L295.155 149.662L295.523 149.147L295.229 148.688L294.64 148.669L293.573 149L293.168 149.515L293.352 150.526L294.254 150.894L295.045 150.324V150.324ZM297.474 114.204L296.351 113.083L295.542 112.402L294.843 111.906L293.426 110.785L292.34 110.362L290.776 110.031L289.635 110.068L288.697 110.27L288.384 110.822L289.065 111.097L289.525 111.704L289.304 112.072L289.323 113.266L289.672 113.763L288.863 114.48L287.519 114.057L287.63 114.902L287.685 116.042L288.182 116.52L288.623 116.373L289.617 116.557L290.077 116.134L291.015 116.502L292.34 117.292L292.469 117.696L291.678 117.568L290.427 117.715L289.985 118.046L289.727 118.799L288.568 119.24L287.998 119.847L286.912 119.608L286.323 119.516L286.25 120.251L286.783 120.674L287.133 121.06L286.673 121.428L286.323 122.034L285.422 122.439L284.042 122.476L282.717 122.88L281.907 123.487L281.319 123.119L280.178 123.137L278.467 122.439L277.455 122.273L276.277 122.42L274.216 122.181L273.204 122.2L272.339 121.538L271.438 120.49L270.812 120.362L269.359 119.663L268.034 119.498L266.856 119.314L266.304 118.818L266.065 117.476L264.998 116.557L263.507 116.134L262.459 115.527L261.851 114.719L261.539 114.81L261.207 115.582L260.508 115.693L260.968 116.832L260.674 117.347L258.705 116.979L258.889 119.02L258.521 119.277L256.865 119.718L258.466 121.685L257.932 121.979L258.245 122.623L258.208 122.88L256.957 123.505L256.773 123.946L255.595 124.093L255.485 124.828L254.436 124.663L253.847 124.884L253.111 125.435L253.314 125.711L253.13 125.986L253.682 127.071L253.976 126.961L254.62 127.218L254.731 127.678L255.062 128.358L255.319 128.707L256.184 129.258L256.718 130.178L258.447 130.655L259.846 132.034L259.993 132.99L260.545 133.596L260.655 134.203L259.901 134.038L260.49 135.324L261.631 136.06L263.195 136.868L263.544 136.593L264.409 136.96L265.587 137.714L266.175 137.879L266.635 138.449L267.463 138.67L268.383 139.184L269.561 139.46L270.757 139.571L271.309 139.313L271.585 140.251L272.063 139.368L272.542 139.074L273.315 139.35L273.848 139.368L274.345 139.699L275.118 139.552L275.835 138.67L276.811 137.935L277.712 138.21L278.301 137.732L278.945 138.449L278.724 138.946L279.847 139.111L280.399 139.037L280.895 139.718L281.392 139.993L281.631 140.894L281.779 141.868L281.024 142.842L281.153 144.221L282.183 144.037L282.607 145.103L283.287 145.342L283.14 146.298L283.968 146.739L284.428 146.96L285.127 146.629L285.238 147.107L285.367 147.383L285.9 147.401L285.551 146.078L286.047 145.894L286.544 145.618H287.335L288.311 145.489L289.065 144.864L289.617 145.306L290.574 145.508L290.537 146.188L291.089 146.666L292.175 146.96L292.616 146.776L294.033 147.144L293.867 147.603L294.272 148.449L294.824 148.375L294.971 147.144L296.002 146.978L297.327 146.39L297.787 145.802L298.21 146.188L298.725 145.655L299.847 145.526L301.062 144.552L302.221 143.467L302.828 142.07L303.251 140.526L303.638 139.258L304.153 139.166L304.135 138.229L303.987 137.291L303.288 136.924L302.828 136.299L303.343 135.986L303.049 135.122L302.055 134.221L301.062 133.155L300.215 131.997L298.909 131.354L299.075 130.508L299.774 129.92L299.958 129.277L301.191 128.946L300.749 128.321L300.123 128.284L299.056 127.825L298.339 128.67L297.437 128.321L297.161 127.788L296.296 127.604L295.431 126.795L295.652 126.244L296.572 126.189L296.793 125.435L297.455 124.626L298.081 124.222L298.891 124.828L298.541 125.6L298.964 126.06L298.707 126.611L299.59 126.281L300.031 125.748L301.191 125.398L301.577 124.663L302.276 124.038L302.46 123.229L303.123 123.597L303.969 123.634L303.472 123.027L304.631 122.549L304.613 121.906L305.625 122.568L305.275 121.998L305.735 121.979L305.036 120.637L304.171 119.663L304.705 119.259L305.956 119.461L305.846 118.358L305.331 117.108L305.404 116.685L305.165 115.656L303.895 115.987L303.417 116.446H302.037L300.933 115.38L299.295 114.553L297.474 114.204V114.204Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M177.156 160.048L176.733 160.213L176.494 160.36L176.328 159.864L176.034 159.992L175.85 159.974L175.666 160.323L174.874 160.305L174.58 160.121L174.451 160.231L174.249 160.323L174.157 160.728L174.396 161.206L174.635 162.143L174.267 162.29L174.157 162.456L174.23 162.676L174.175 163.191H174.01L173.954 163.522L174.065 164.092L173.844 164.606L174.138 164.937L174.47 165.011L174.893 165.507L174.93 165.966L174.838 166.113L174.746 167.069L174.948 167.106L175.978 166.665L176.696 166.334L177.91 166.132L178.573 166.113L179.29 166.352L179.769 166.334L179.806 165.875L179.364 164.864L179.64 163.54L180.063 162.566L179.806 160.893L179.106 160.599L178.61 160.636L178.26 160.93L177.8 160.691L177.616 160.305L177.156 160.048V160.048Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M198.058 159.441L198.095 158.651L198.003 157.879L197.598 157.125L197.304 157.199L197.267 157.566L197.69 158.044L197.58 158.246L197.525 158.632L196.678 159.551L196.402 160.287L196.274 160.893L196.053 161.151L195.85 161.978L195.298 162.456L195.151 163.044L194.93 163.522L194.838 164L194.121 164.404L193.532 163.926L193.146 163.945L192.538 164.625L192.244 164.643L191.747 165.764L191.49 166.592V166.922L191.747 167.088L191.95 167.603L192.428 167.805L192.833 168.577L192.686 169.496L194.378 169.533L194.857 169.459L195.482 169.606L196.108 169.459L196.237 169.514L197.543 169.569L198.371 169.882L199.199 170.158L199.273 169.514L199.162 169.183L199.107 168.65L198.629 168.264L198.242 167.676L198.15 167.253L197.672 166.647L197.746 166.297L197.635 165.801L197.709 164.882L197.966 164.68L198.463 163.485L198.629 163.173L198.298 162.364L198.15 161.886L197.69 161.684L197.083 161.004L197.304 160.452L197.764 160.562L198.058 160.489L198.629 160.507L198.058 159.441V159.441Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M209.982 166.15L209.19 166.021L208.822 166.132L208.657 166.407L208.326 166.444L207.921 166.205L206.78 166.775L206.302 166.665L206.154 166.757L205.86 167.455L205.087 167.235L204.333 167.124L203.67 166.683L202.824 166.297L202.272 166.665L201.867 167.253L201.775 168.08L201.72 168.779L201.426 169.404L201.223 170.139L201.094 171.168L201.15 171.83L200.984 172.234L200.947 172.676L200.837 173.043L200.156 173.613L199.678 174.201L199.218 175.341L199.254 176.315L198.997 176.683L198.39 177.253L197.764 177.988L197.396 177.786L197.322 177.455L196.752 177.436L196.402 177.878L196.126 177.767L195.758 178.006L195.593 178.319L195.556 178.815L195.28 178.944L195.427 179.311L195.85 179.146L196.163 179.164L196.513 179.036L199.567 179.054L199.806 179.918L200.101 180.616L200.34 181.002L200.726 181.609L201.407 181.517L201.757 181.352L202.309 181.517L202.474 181.223L202.75 180.543L203.376 180.488L203.431 180.286H203.965L203.873 180.708H205.124V181.444L205.345 181.885L205.179 182.583L205.234 183.319L205.584 183.741L205.492 185.138L205.75 185.028L206.191 185.065L206.835 184.881L207.314 184.955L207.663 184.973L207.718 185.341L208.197 185.322L208.841 185.432L209.172 185.947L210 186.113L210.626 185.745L210.846 186.37L211.638 186.517L212.006 187.032L212.392 187.675H213.183L213.128 186.407L212.852 186.627L212.134 186.168L211.877 185.966L212.024 184.789L212.245 183.41L212.024 182.896L212.318 182.142L212.613 182.013L213.993 181.811L214.177 181.866L214.214 181.664L213.938 181.352L213.809 180.708L213.183 180.065L212.852 179.238L213.036 178.742L212.76 178.08L212.962 176.205L212.981 176.223L212.962 176.021L212.705 175.488L212.815 174.845L212.962 174.771L212.999 174.073L213.294 173.742L213.312 172.859L213.551 172.418L213.606 171.481L213.827 170.929L214.214 170.323L214.618 170.01L214.95 169.588L214.526 169.44L214.582 168.062L213.662 167.29L213.404 166.794L212.834 167.032L212.355 166.959L212.079 167.161L211.619 167.014L210.975 166.058L210.644 166.169L209.982 166.15V166.15Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M201.775 168.08L201.113 168.007L200.414 167.805L199.806 168.43L199.273 169.514L199.199 170.158L198.371 169.882L197.543 169.569L196.237 169.514L196.163 170.029L196.439 170.635L197.212 170.544L197.47 170.764L197.028 172.124L197.525 172.823L197.635 173.724L197.488 174.514L197.175 175.065L196.274 175.01L195.722 174.459L195.63 174.974L194.93 175.121L194.581 175.415L194.967 176.187L194.176 176.83L195.022 178.062L195.427 177.565L195.758 177.363L196.126 177.768L196.402 177.878L196.752 177.437L197.322 177.455L197.396 177.786L197.764 177.988L198.39 177.253L198.997 176.683L199.254 176.315L199.218 175.341L199.678 174.201L200.156 173.613L200.837 173.043L200.947 172.676L200.984 172.235L201.15 171.83L201.094 171.169L201.223 170.139L201.426 169.404L201.72 168.779L201.775 168.08V168.08Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M109.407 158.394L109.628 158.008L109.389 157.695L109.021 157.622L108.487 158.191L108.064 158.449L107.218 159.037L106.426 158.945L106.334 159.184L105.672 159.202L105.065 159.754L104.807 160.746L104.789 161.132L104.347 161.261L103.538 162.07L103.004 162.033L102.875 162.199L103.078 162.897L102.875 163.246L102.544 163.154L102.378 163.724L102.783 164.349L102.894 165.342L102.673 165.636L102.875 166.72L102.654 167.401L103.022 167.676L102.618 168.283L102.158 169.018L101.642 169.092L101.385 169.514L101.422 170.103L101.035 170.195L101.182 170.562L102.213 171.224L102.397 171.206L102.654 171.702L103.519 171.867L103.814 171.684L104.329 172.07L104.77 172.345L105.046 172.235L105.727 172.786L106.058 173.338L106.555 173.65L107.181 174.882L107.954 175.029L108.506 174.716L108.892 174.919L109.499 174.808L110.309 175.36L109.665 176.555L109.978 176.573L110.511 177.198L110.916 174L110.934 173.485L110.769 172.823L110.309 172.382V171.536L110.898 171.353L111.1 171.463L111.137 171.022L110.53 170.893V170.176L112.535 170.195L112.885 169.79L113.179 170.158L113.363 170.856L113.566 170.709L113.253 169.533L112.995 169.128L112.627 168.871L113.161 168.301L113.124 168.026L112.848 167.676L112.664 166.904L112.756 166.059L112.995 165.673L113.216 165.048L112.848 164.846L112.259 164.974L111.523 164.919L111.1 165.048L110.401 164.037L109.812 163.89L108.487 164L108.248 163.596L108.009 163.485L107.972 163.246L108.119 162.805L108.046 162.346L107.843 162.088L107.733 161.555L107.199 161.463L107.53 160.783L107.696 159.956L108.027 159.515L108.432 159.184L108.726 158.596L109.407 158.394V158.394Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M96.6743 159.386L96.4167 159.625L96.1039 159.551L95.9567 159.313L95.6439 159.221L95.3863 159.368L94.7423 159.055L94.5767 159.202L94.3191 159.423L94.5951 159.588L94.4295 159.956L94.4111 160.324L94.5399 160.562L94.8527 160.673L95.0735 161.004L95.2943 160.71L95.2391 160.379L95.4967 160.581L95.5519 160.93L95.9015 161.077L96.2879 161.316L96.5639 161.592L96.5823 161.849L96.4535 162.051L96.6559 162.29L97.1895 162.548L97.2631 162.327L97.3551 162.088L97.3367 161.868L97.4839 161.739L97.2815 161.555L97.2999 161.096L97.7047 160.985L97.2631 160.489L96.8951 160.011L96.6743 159.386V159.386Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M102.176 145.545L101.274 145.159L100.483 145.14L99.6185 145.048L99.3609 145.177L98.5881 145.287L98.0361 145.526L97.5393 145.784L97.2633 146.206L96.6929 146.574L97.0977 146.684L97.6313 146.556L97.7969 146.262L98.2201 146.243L99.0297 145.637L100.023 145.692L99.6001 145.986L99.9313 146.225L101.219 146.409L101.495 146.648L102.397 146.96L102.986 146.923L103.133 147.585L103.446 147.916L104.09 147.989L104.476 148.302L103.722 148.945L105.175 148.835L105.874 148.927L106.555 148.872L107.255 148.725L107.402 148.449L106.684 147.971L105.948 147.916L106.058 147.603L105.488 147.364H105.138L104.586 146.85L103.814 146.114L103.482 145.839L102.526 145.986L102.176 145.545V145.545Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M196.09 112.679L195.703 112.789L195.446 112.66L195.243 112.881L194.618 113.101L194.305 113.377L193.679 113.616L193.863 113.965L193.992 114.443L194.47 114.719L195.004 115.197L195.703 115.564L196.182 115.105L196.494 115.013L197.23 115.362L197.654 115.307L198.077 115.528L198.187 115.27L198.592 115.289L198.886 115.178L198.905 115.068L199.07 115.013L199.107 114.756L199.31 114.701L199.42 114.498H199.696L199.218 113.928L198.555 113.873L198.426 113.506L197.801 113.395L197.69 113.671L197.194 113.451L197.212 113.138L196.531 113.028L196.09 112.679V112.679Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M195.023 109.701L194.581 109.351L193.569 108.91L193.109 109.223L192.244 109.425L192.226 109.039L191.324 108.782L191.287 108.359L190.735 108.524L190.073 108.377L190.147 109.002L190.367 109.407L189.815 109.958L189.631 109.719L188.914 109.774L188.748 110.013L188.932 110.381L188.748 111.41L188.546 111.833H188.012L188.215 113.009L188.141 113.781L188.325 114.039L188.288 114.535L188.73 114.829L190.036 115.05L189.613 115.822L189.521 116.649H190.294L190.478 116.392L191.471 116.741L191.747 116.686L192.226 116.998L192.336 116.704L193.146 116.759L193.771 116.539L194.213 116.575L194.526 116.814L194.599 116.612L194.415 115.877L194.728 115.73L195.004 115.197L194.471 114.719L193.992 114.443L193.863 113.965L193.679 113.616L194.305 113.377L194.618 113.101L195.243 112.881L195.446 112.66L195.703 112.789L196.09 112.679L195.667 111.962L195.685 111.576L195.427 110.969L195.059 110.565L195.28 110.271L195.023 109.701V109.701Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M227.075 158.761L226.615 158.448L227.186 158.173L227.204 157.676L226.947 157.327L226.652 157.603L226.211 157.511L225.861 158.026L225.53 158.577L225.622 158.89L225.659 159.257L226.229 159.276L226.468 159.184L226.707 159.386L227.075 158.761V158.761Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M193.606 107.66L193.293 107.109L192.06 107.477L192.226 107.936L193.164 108.561L193.606 107.66ZM192.023 106.723L191.545 106.557L191.416 106.263L191.655 105.896L191.637 105.344L190.974 105.638L190.698 105.951L189.962 106.024L189.742 106.337L189.613 106.631L189.686 107.752L190.073 108.377L190.735 108.524L191.287 108.359L191.011 107.807L191.582 107.017L191.839 107.146L192.023 106.723V106.723Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M109.646 151.078V151.409L109.904 151.592L110.382 150.784L110.75 150.618L110.861 150.912L111.266 150.839L111.468 150.618L111.799 150.673L112.278 150.637L112.738 150.876L113.161 150.398L112.701 149.975L112.259 149.938L112.314 149.589L111.762 149.607L111.615 149.203L111.358 149.221L110.787 148.927L109.978 148.909L109.83 149.111L109.867 149.754L109.738 150.195L109.462 150.398L109.683 150.747L109.646 151.078V151.078Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M190.864 128.928L190.202 129.001L189.797 128.726H188.766L187.865 129.204L187.368 129.02L185.767 129.112L184.13 129.332L183.21 129.7L182.584 130.178L181.535 130.398L180.597 131.042L180.965 131.795L181.02 132.512L181.351 133.744L181.609 134.001L181.425 134.461L180.137 134.644L179.677 135.086L179.106 135.178L179.051 136.041L177.892 136.501L177.506 137.089L176.696 137.402L175.702 137.586L174.065 138.449L174.046 139.828V139.902L174.028 140.122L177.763 142.971L181.149 145.526L184.571 148.063L184.81 148.615L185.436 148.945L185.914 149.148L185.933 149.883L187.055 149.773L188.49 149.258L191.398 146.96L194.82 144.718L194.36 143.982L193.569 143.449L193.091 143.67L192.723 143.008L192.686 142.512L192.06 141.648L192.447 141.17L192.355 140.435L192.465 139.791L192.373 139.258L192.539 138.302L192.465 137.751L192.115 136.722L191.637 134.644L191.011 134.167V133.891L190.183 133.192L190.073 132.31L190.662 131.648L190.864 130.674L190.68 129.534L190.864 128.928V128.928Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M104.77 172.345L104.329 172.069L103.814 171.683L103.519 171.867L102.654 171.702L102.397 171.205L102.213 171.224L101.182 170.562L100.465 171.022L99.8944 171.279L99.968 171.757L99.5632 172.51L99.3792 173.227L99.0296 173.411L99.2136 174.477L99.0112 174.808L99.6368 175.304L100.023 174.771L100.262 175.286L99.7288 176.15L99.8576 176.646L99.5816 176.922L99.6184 177.345L100.042 177.253L100.465 177.382L100.925 177.97L101.495 177.492L101.661 176.701L102.268 175.69L103.501 175.231L104.605 173.999L104.918 173.246L104.77 172.345Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M210.865 135.894L209.853 135.545L208.878 135.232L207.571 135.269L207.24 135.821L207.442 136.317L207.222 137.034L207.59 137.971L207.829 142.144L208.013 146.445H212.079H216.017H220.028L219.844 146.206L218.593 145.158L218.519 144.386L218.703 144.184L217.728 142.898L217.36 142.236L216.937 141.592L216.054 139.773L215.336 138.596L214.821 137.365L214.913 137.254L215.759 138.927L216.256 139.46L216.624 139.828L216.845 139.626L217.066 139.019L217.194 138.137L217.434 137.677L217.305 137.365L216.587 135.674L216.127 135.968L215.354 135.894L214.545 135.618L214.342 136.004L214.03 135.416L213.312 135.269L212.447 135.379L212.061 135.71L211.343 136.078L210.865 135.894V135.894Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M223.45 154.129L222.861 153.559L222.53 152.474L221.849 151.132L221.371 151.794L220.635 151.978L220.341 152.346L220.267 153.118L219.917 154.845L220.046 155.305L221.242 155.544L221.518 154.68L222.162 155.213L222.751 154.937L223.009 155.176L223.726 155.195L224.628 155.654L224.922 156.059L225.382 156.445L225.842 157.125L226.21 157.511L226.652 157.603L226.946 157.327L226.431 156.978L226.081 156.573L225.493 155.893L224.904 155.231L223.45 154.129V154.129Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M204.149 103.304L203.137 103.469L202.143 103.763L202.309 104.388L202.916 104.774L203.192 104.627L203.21 105.271L203.891 105.087L204.278 105.215L205.087 105.62H205.787L206.081 105.271L205.621 104.26L206.099 103.635L205.934 103.451L205.087 103.488L204.149 103.304V103.304Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M221.518 154.68L221.242 155.544L220.046 155.305L219.918 156.316L219.531 157.456L218.942 158.044L218.519 158.926L218.427 159.404L217.949 159.735L217.691 160.967V161.095L217.728 162.014L217.581 162.382L217.029 162.4L216.698 163.062L217.323 163.154L217.857 163.724L218.041 164.183L218.519 164.459L219.163 165.728L219.697 165.93V166.591L220.065 166.977H220.782L222.107 167.97H222.438L222.678 167.952L222.898 168.08L223.598 168.172L223.892 167.676L224.83 167.198L225.254 167.584H225.953L226.229 167.216L226.891 167.198L227.793 166.371L229.154 166.316L231.988 162.805L231.105 162.823L227.701 161.426L227.296 161.022L226.91 160.452L226.505 159.809L226.707 159.386L226.468 159.184L226.229 159.276L225.658 159.257L225.622 158.89L225.53 158.577L225.861 158.026L226.21 157.511L225.842 157.125L225.382 156.445L224.922 156.059L224.628 155.654L223.726 155.195L223.009 155.176L222.751 154.938L222.162 155.213L221.518 154.68V154.68Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M204.185 93.543L204.333 92.8445L203.284 92.4585L202.217 92.7894L202.014 93.5062L201.389 93.9474L200.524 93.7084L199.549 93.7636L198.61 93.2305L198.224 93.4879L199.309 93.9842L200.634 94.6643L200.947 96.2083L201.297 96.6127L202.474 97.0907L202.64 97.5134L202.161 97.734L200.561 98.8553L199.953 99.517L199.677 100.124L200.211 101.079L200.193 102.127L201.057 102.476L201.628 103.046L202.934 102.826L204.314 102.44L205.786 102.348L207.24 100.988L207.847 100.381L208.013 99.8479L206.669 99.131L206.835 98.4509L205.933 97.6973L206.246 96.8149L205.069 95.6569L205.584 94.9033L204.259 94.2231L204.185 93.543V93.543Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M366.713 190.966L366.032 191.333L365.683 191.389L365.112 191.628L365.149 192.069L365.867 191.83L366.584 191.536L366.713 190.966V190.966ZM364.689 192.455L364.395 192.639L363.971 192.491L363.475 192.896L363.438 193.411L363.971 193.558L364.634 193.392L364.965 192.786L364.689 192.455V192.455Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M196.237 169.515L196.108 169.459L195.482 169.607L194.857 169.459L194.378 169.533V170.93H192.87L192.52 170.985L192.318 171.867L192.078 172.713L191.839 173.081L191.802 173.467L192.428 174.68L193.109 175.654L194.176 176.83L194.967 176.187L194.581 175.415L194.93 175.121L195.63 174.974L195.722 174.459L196.274 175.011L197.175 175.066L197.488 174.514L197.635 173.724L197.525 172.823L197.028 172.125L197.47 170.765L197.212 170.544L196.439 170.636L196.163 170.029L196.237 169.515V169.515Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M177.8 108.818L176.898 108.138L176.181 108.193L176.328 108.781L176.125 109.369L176.659 109.351L177.303 109.59L177.8 108.818V108.818ZM180.192 104.351L179.18 104.443L178.517 104.369L177.837 105.252L177.487 106.373L177.892 106.925L177.91 107.991L178.389 107.476L178.646 107.77L178.333 108.266L178.517 108.56L179.566 108.763H179.585L180.155 109.461L180.008 110.105L178.701 109.994L178.517 110.73L178.996 111.336L178.057 111.685L178.297 112.127L179.677 112.31L178.885 112.549L177.542 113.744L178.002 113.965L178.646 113.542L179.474 113.671L180.081 113.138L180.486 113.358L182.013 113.046L183.209 113.064L184.001 112.457L183.651 111.888L184.093 111.557L184.185 110.84L183.117 110.619L182.878 110.196L182.345 108.928L181.756 108.744L181.001 107.439L180.928 107.329L180.045 107.255L180.817 106.281L181.057 105.38H180.137L179.272 105.528L180.192 104.351V104.351Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M223.8 122.181L222.42 121.648L221.003 121.464L220.175 121.262L220.083 121.391L220.488 121.74L221.04 121.869L221.666 122.292L222.052 123.064L221.997 123.56L222.99 123.505L224.021 124.056L225.29 123.872L225.493 123.689L226.266 124.019L226.781 124.093L226.891 123.964L226.302 123.339L226.505 123.174L225.861 122.917L225.474 122.457L224.536 122.218L224.002 122.402L223.8 122.181Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M182.731 159.294L182.253 159.202L181.922 159.386L181.48 159.294L179.695 159.349L179.658 160.011L179.806 160.893L180.063 162.566L179.64 163.54L179.364 164.864L179.806 165.875L179.769 166.334L180.689 166.665L181.609 166.316L182.198 165.93L183.798 165.231L183.578 164.827L183.302 164.092L183.228 163.503L183.449 162.456L183.191 162.033L183.081 161.095L183.099 160.25L182.658 159.643L182.731 159.294V159.294Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M170.882 157.621L170.734 157.695L170.182 157.603L170.109 157.731L169.87 157.75L169.134 157.474L168.637 157.456L168.618 157.842L168.508 157.97L168.582 158.356L168.434 158.522H168.195L167.938 158.706L167.625 158.687L167.146 159.257L167.441 159.459L167.588 159.717L167.717 160.231L167.956 160.452L168.232 160.617L168.618 161.077L169.06 161.757L169.612 161.242L169.741 160.93L169.925 160.672L170.201 160.636L170.44 160.415H171.268L171.544 160.838L171.765 161.334L171.728 161.665L171.894 161.977V162.4L172.17 162.345L172.391 162.308L172.667 162.18L173.09 162.897L173.016 163.374L173.219 163.613L173.513 163.632L173.715 163.154L174.01 163.191H174.175L174.231 162.676L174.157 162.455L174.267 162.29L174.635 162.143L174.396 161.205L174.157 160.728L174.249 160.323L174.451 160.231L174.139 159.9L174.194 159.551L174.065 159.422L173.844 159.533L173.881 159.147L174.102 158.853L173.679 158.356L173.568 158.044L173.329 157.786L173.127 157.75L172.887 157.915L172.556 158.062L172.262 158.32L171.82 158.228L171.544 157.933L171.379 157.897L171.102 158.044H170.937L170.882 157.621V157.621Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M165.435 156.794L166.355 156.813L166.613 156.647H166.797L167.183 156.372L167.625 156.629L168.066 156.647L168.508 156.372L168.305 156.041L167.974 156.243L167.643 156.224L167.257 155.949L166.925 155.967L166.686 156.243L165.564 156.28L165.435 156.794V156.794Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M168.637 157.456L166.742 157.401L166.466 157.53L166.135 157.493L165.583 157.695L165.638 157.934L165.951 158.191V158.357L166.171 158.688L166.613 158.78L167.147 159.257L167.625 158.688L167.938 158.706L168.195 158.522H168.435L168.582 158.357L168.508 157.971L168.619 157.842L168.637 157.456V157.456Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M194.378 169.532L192.686 169.496L192.336 170.819L192.52 170.985L192.87 170.929H194.378V169.532Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M205.75 130.398L205.602 130.913L206.817 131.134V131.336L208.215 131.225L208.307 130.876L207.792 131.023V130.821L207.074 130.729L206.32 130.803L205.75 130.398ZM207.866 123.524L207.369 123.229L207.424 123.781L206.578 123.891L205.86 123.505L205.142 123.818L204.443 123.781L204.259 123.818L204.13 124.02L203.615 124.002L203.266 124.24L202.658 124.351V124.645L202.364 124.81L202.346 125.196L201.959 125.748L202.051 126.097L202.585 126.759L203.008 127.31L203.247 128.101L203.67 129.038L204.517 129.571L205.142 129.553L204.701 128.505L205.308 128.376L204.958 127.77L205.878 128.082L205.805 127.402L205.308 127.071L204.719 126.52L205.05 126.262L204.535 125.711L204.241 125.013L204.406 124.774L204.958 125.362H205.492L205.952 125.178L205.234 124.516L206.357 124.222L206.854 124.332L207.442 124.369L207.645 124.24L207.866 123.524V123.524Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M166.281 81.0252L161.497 80.9517L159.326 81.0068L158.406 81.2458L156.29 81.2274L153.953 81.6134L153.659 81.9259L154.892 82.3119L153.751 82.0729L152.923 82.0178L151.635 81.7605L149.685 82.1465L149.188 81.9259H147.274L145.269 82.0362L143.631 82.22L143.594 82.5509L142.619 82.6428L139.933 83.1758L139.086 83.4883L140.577 83.764L140.061 84.0582L137.32 84.4625L134.468 84.8669L134.063 85.1794L135.241 85.5471L137.909 85.7676L136.529 85.8044L134.523 86.0801L135.222 86.65L135.774 86.9257L137.504 86.8705L139.362 86.8338L140.761 86.8889L142.233 87.422L141.975 87.808L142.637 88.1573L142.895 89.1315L143.079 89.7932L143.337 90.1425L142.049 91.0248L142.527 91.2637L143.337 91.1167L143.815 91.4476L144.79 92.0725L143.41 91.8152H142.711L142.159 92.3299L141.883 92.9916L142.656 93.3225L143.392 93.1754L143.87 93.0284L144.882 92.6791L144.367 93.4512L143.889 93.8739L142.582 94.2416L141.294 95.3996L141.662 95.7672L141.037 96.5025L141.717 97.4583L141.441 98.3774L141.57 99.0575L142.453 100.363L142.601 101.392L143.171 101.98H144.809L145.729 102.844L146.925 102.789L147.679 101.741L148.323 100.859L148.268 100.05L149.85 99.2046L150.457 98.5245L150.715 97.8076L151.58 97.1642L152.776 96.9253L153.898 96.6679L154.45 96.6312L156.327 95.9143L157.689 94.8665L158.572 94.4805L159.418 94.4621L161.718 94.1313L163.945 93.3409L166.134 92.4953L165.122 92.4402L163.172 92.4034L164.147 91.8887L164.055 91.227L164.828 91.7784L165.325 92.1644L166.668 91.9806L166.557 91.1902L165.729 90.6204L164.809 90.3814L165.251 90.1241L166.576 90.5101L166.668 90.0873L165.913 89.4623H166.907L167.937 89.3153L168.25 88.9844L167.514 88.5984L169.097 88.5433L168.361 87.7529L169.115 87.6609L169.133 86.8889L167.993 86.4294L169.17 86.1353L170.237 86.1169L169.575 85.5287L169.777 84.5912L170.44 84.0582L171.341 83.4699L169.869 83.4332L171.949 83.3045L172.353 83.1207L175.04 82.5876L174.745 82.2751L172.905 82.1281L169.796 82.4038L168.103 82.6795L168.931 82.2568L168.508 81.9994L167.22 82.22L165.435 81.9626L163.209 82.0546L162.951 81.9259L166.318 81.8524L168.692 81.8156L169.906 81.5583L166.281 81.0252V81.0252Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M91.8354 151.353L90.897 151.335H89.9402L89.8666 151.997H89.3882L89.7194 152.383L90.069 152.658L90.161 152.916L90.3082 152.989L90.2346 153.375H88.9282L88.321 154.331L88.4498 154.552L88.3026 154.827L88.229 155.177L88.7258 155.655L89.1858 155.894L89.8114 155.912L90.3266 156.114L90.3634 155.93L90.7498 155.636L90.9522 155.508L90.9154 155.379L91.173 155.305L91.4122 155.011L91.357 154.772L91.449 154.552L91.9642 154.221L92.4794 153.78L92.2034 153.633L92.093 153.798L91.7802 153.596H91.4858L91.7066 152.272L91.8354 151.353V151.353Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M123.722 165.195L123.336 164.772L122.802 164.202L122.416 164.184L122.398 163.577L121.79 162.823L121.128 162.382L120.282 163.081L120.171 163.504L120.521 163.926L120.245 164.147L119.619 164.349V164.882L119.325 165.213L120.006 166.095L120.539 166.04L120.778 166.316L120.631 166.831L120.981 166.996L121.202 167.548L120.907 167.952L120.723 168.945L120.981 169.551L121.036 170.084L121.68 170.636L122.177 170.691L122.306 170.452L122.618 170.415L123.097 170.213L123.428 169.9L123.998 169.992L124.256 169.956L123.649 168.926L123.52 168.283L123.189 168.264L122.747 167.419L122.95 166.812L122.894 166.537L123.538 166.242L123.722 165.195V165.195Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M97.5944 154.644L97.3552 154.313L97.0056 154.129L96.7296 153.872L96.4352 153.651L96.288 153.633L95.828 153.467L95.6256 153.559L95.3496 153.596L95.1104 153.522L94.7976 153.449L94.6504 153.577L94.3192 153.706L93.8408 153.743L93.3808 153.633L93.2152 153.706L93.1232 153.596L92.8288 153.614L92.5896 153.816L92.4792 153.78L91.964 154.221L91.4489 154.552L91.3569 154.772L91.412 155.011L91.1729 155.305L91.4489 155.397L91.6512 155.636L91.9456 155.82L91.964 155.985L92.424 155.838L92.6264 155.93L92.7552 156.059L92.6448 156.518L92.9576 156.629L93.0864 156.996L93.4176 156.941L93.5648 156.666H93.712L93.7488 156.096L93.988 156.059H94.2088L94.4664 155.746L94.7424 155.985L94.8528 155.838L95.0552 155.71L95.4416 155.379L95.4968 155.14L95.5888 155.158L95.736 154.882L95.8464 154.846L96.012 155.011L96.2144 155.066L96.4536 154.919H96.7112L97.0792 154.772L97.2448 154.607L97.5944 154.644Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M198.96 118.542L198.224 118.064L197.93 117.917L197.212 118.229L197.157 118.689L196.844 118.799L196.881 119.112L196.513 119.093L196.182 118.91L196.034 119.093L195.39 119.057L195.354 119.075V119.479L195.666 119.847L195.906 119.369L196.513 119.553L196.568 119.921L197.028 120.399L196.844 120.49L197.69 121.318L198.574 121.648L199.144 122.053L200.064 122.476L200.156 122.292L199.291 121.851L198.886 121.391L198.518 121.134L198.058 120.711L197.819 120.362L197.322 119.829L197.488 119.369L197.838 119.626L198.022 119.388L198.445 119.369L199.254 119.553L199.898 119.535L200.34 119.792L200.653 119.369L200.34 119.038L200.064 118.597L199.733 118.763L198.96 118.542V118.542Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M109.83 149.111L108.984 148.927L108.358 148.89L108.101 149.203L108.726 149.386L108.671 149.828L109.076 150.342L108.69 150.6L107.917 150.508L106.997 150.342L106.868 150.728L107.383 151.078L107.88 150.875L108.487 150.949L108.984 150.875L109.646 151.078L109.683 150.747L109.462 150.397L109.738 150.195L109.867 149.754L109.83 149.111Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M201.554 115.491L201.26 115.564L201.076 115.84L200.671 115.969L200.561 115.895L200.138 116.079L199.788 116.116L199.733 116.336L198.978 116.483L198.629 116.355L198.15 116.061L198.114 116.538H197.598L197.801 116.777L197.562 117.513L197.709 117.531L197.93 117.917L198.224 118.064L198.96 118.542L199.733 118.763L200.064 118.597L200.745 118.303L201.334 118.34L202.033 118.138L202.511 117.347L202.861 116.575L203.394 116.336L203.284 116.042L202.75 115.73L202.566 115.84L201.554 115.491V115.491Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M306.95 184.146L307.042 183.834L306.71 183.485L306.195 183.117L305.22 183.356L306.508 184.165L306.95 184.146V184.146ZM310.795 184.036L311.531 183.154L311.55 182.804L311.458 182.565L310.409 183.043L309.894 183.76L309.765 184.146L309.875 184.293L310.795 184.036V184.036ZM304.245 181.646L303.95 182.051L303.38 182.069L302.975 182.731L303.527 182.749L304.245 182.584L305.459 182.363L305.238 181.849L304.594 181.959L304.245 181.646V181.646ZM309.415 181.646L308.458 182.069L307.759 182.161L307.134 181.812L306.306 182.051L306.269 182.474L307.63 182.621L309.213 182.29L309.415 181.646V181.646ZM294.787 180.102L294.658 179.68L294.235 179.588L293.426 179.146L292.174 179.073L291.42 180.194L292.358 180.268L292.506 180.782L294.346 181.26L294.787 181.113L295.542 181.224L296.701 181.665L297.658 181.885L298.725 181.977L299.663 181.94L300.749 182.4L301.963 181.959L300.749 181.26L299.222 181.058L298.89 180.305L296.995 179.735L296.756 180.213L294.787 180.102V180.102ZM321.762 179.441L321.798 178.889L321.578 178.54L321.338 178.944L321.118 179.349L321.173 180.231L321.762 179.441V179.441ZM314.218 176.224L313.96 175.838L312.911 175.893L313.095 176.389L313.813 176.61L314.218 176.224ZM317.548 175.783L316.426 175.452L315.156 175.507L314.88 176.15L315.598 176.187L316.186 176.114L317.033 176.205L317.898 176.683L317.548 175.783V175.783ZM321.412 173.522L321.265 173.081L319.609 172.603L319.075 172.989L317.677 173.264L318.1 173.853L319.02 174.073L319.406 174.753L320.934 174.772L321.007 175.066L320.271 175.047L319.13 175.47L319.903 176.04L319.885 176.555L320.106 176.977L320.492 176.886L320.823 176.316L322.332 177.4L323.178 177.492L325.129 178.485L325.552 179.459L325.736 180.727L325.055 181.058L324.54 182.014L325.846 181.977L326.141 181.646L327.153 181.885L327.999 182.841L328.275 179.018L328.459 175.213L327.355 174.992L326.601 174.569L325.736 174.165H324.816L323.602 174.864L322.7 176.114L321.651 175.415L321.412 173.522V173.522ZM312.212 170.507L312.028 170.25L311.016 171.095L309.82 171.15L308.514 170.985L307.704 170.636L306.839 171.518L306.618 171.996L306.085 173.761L305.919 174.68L305.478 175.452L305.772 176.242L306.195 176.261L306.306 177.382L305.956 178.466L306.379 178.816L307.042 178.632L307.097 176.959L307.06 175.599L307.759 175.25L307.63 176.389L308.348 177.069L308.201 177.529L308.44 177.841L309.47 177.4L308.918 178.356L309.305 178.76L309.875 178.411L309.93 177.658L309.066 176.297L309.268 175.893L308.33 174.404L309.25 173.944L309.728 173.264L310.17 173.43L310.262 172.897L308.33 173.283L307.759 173.816L306.839 172.786L307.005 171.904L307.906 171.72L309.618 171.665L310.611 171.904L311.402 171.665L312.212 170.507V170.507ZM315.782 170.856L315.671 170.378L315.064 170.268L314.972 169.625L314.641 170.048L314.457 170.985L314.77 172.492L315.174 173.228L315.469 173.081L315.046 172.474L315.211 171.757L315.745 171.867L315.782 170.856V170.856ZM304.576 170.029L304.742 169.496L303.95 168.393L304.502 167.327L303.582 167.143H302.405L302.092 168.467L301.724 168.871L301.227 170.507L300.399 170.746L299.406 170.415L298.909 170.525L298.32 171.114L297.658 171.04L296.995 171.261L296.278 170.617L296.094 169.827L295.486 170.599L295.376 171.684L295.523 172.713L296.002 173.706L296.517 174.036L296.646 175.599L297.492 175.746L298.154 175.672L298.522 176.242L299.755 175.819L300.27 176.187L301.006 176.261L301.374 176.977L302.57 176.444L302.718 176.867L303.178 175.084L303.233 173.908L304.245 173.117L304.208 172.051L304.539 171.261L305.772 171.114L304.576 170.029V170.029ZM291.935 179.018L292.064 177.216L292.377 175.746L291.898 175.011L291.144 174.919L290.794 174.257L290.629 173.448L290.261 173.411L289.672 173.007L290.095 172.051L289.304 171.518L288.697 170.544L287.814 169.735L286.765 169.717L285.753 168.467L285.164 167.97L284.336 167.18L283.379 166.04L281.76 165.82L281.098 165.765L281.208 166.353L282.33 167.64L283.14 168.301L283.71 169.312L284.649 170.048L285.054 170.948L285.366 171.959L286.268 172.933L287.022 174.569L287.519 175.452L288.274 176.408L288.678 177.106L289.966 178.062L290.794 179.036L291.935 179.018V179.018Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M263.194 136.869L261.63 136.06L260.49 135.325L259.901 134.038L260.655 134.203L260.545 133.597L259.993 132.99L259.846 132.034L258.447 130.656L257.766 131.648L256.718 131.832L255.154 131.538L254.804 132.053L255.393 133.082L255.926 133.873L256.846 134.442L256.166 135.122L256.35 135.95L255.632 137.108L255.246 138.303L254.418 139.534L253.24 139.442L252.338 140.655L253.074 141.188L253.314 142.089L253.958 142.677L254.289 143.688H252.081L251.492 144.46L252.798 145.453L253.148 145.913L252.706 146.335L254.178 147.751L254.914 147.898L256.313 147.199L256.626 148.284L256.773 149.718L257.233 151.206L257.895 153.467L258.962 155.085L259.202 155.802L259.57 157.272L260.195 158.394L260.6 158.945L261.06 160.121L261.63 161.757L262.642 162.86L263.047 162.529L263.36 161.721L264.28 161.39L263.949 161.004L264.354 160.121L264.887 160.066L264.758 158.081L265.108 156.96L264.979 155.986L264.63 154.478L264.85 153.578L265.31 153.522L266.194 153.1L266.672 152.806L266.617 152.273L267.537 151.501L268.218 150.765L269.193 149.387L270.554 148.615L270.996 147.916L270.83 147.034L272.045 146.795L272.726 146.813L272.818 146.372L272.523 145.416L272.045 144.534L272.118 143.835L271.438 143.523L271.585 143.1L272.155 142.659L271.309 142.034L271.53 141.244L272.413 141.74L272.91 141.813L273.13 142.622L274.124 142.788L275.044 142.769L275.67 142.971L275.375 143.946L274.934 144.019L274.731 144.681L275.375 145.288L275.412 144.552L275.688 144.534L276.516 146.39L276.958 146.115L276.792 145.618L276.958 145.232L276.792 144.019L277.638 144.277L277.914 143.321L277.859 142.751L278.246 141.758L278.08 141.097L279.202 140.288L279.957 140.49L279.718 139.773L280.012 139.552L279.846 139.111L278.724 138.946L278.945 138.45L278.301 137.733L277.712 138.211L276.81 137.935L275.835 138.67L275.118 139.552L274.345 139.7L274.842 140.067L274.915 140.784L274.106 140.821L273.241 140.747L272.652 140.931L271.64 140.472L271.585 140.251L271.309 139.314L270.757 139.571L270.775 140.067L271.051 140.821L271.033 141.28L270.186 141.299L268.935 141.023L268.144 140.913L267.445 140.324L266.046 140.159L264.63 139.516L263.562 138.946L262.514 138.486L262.679 137.402L263.194 136.869V136.869Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M177.303 109.59L176.659 109.351L176.126 109.369L176.328 108.781L176.181 108.193L175.5 108.708L174.267 109.571L174.654 110.693L173.881 111.869L175.114 112.035L176.714 111.373L177.432 110.38L177.303 109.59Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M226.284 126.63L225.695 126.097L225.474 125.656L224.867 125.987L225.401 127.328L225.272 127.696L225.953 128.652L226.818 130.086L227.498 130.435L227.682 131.133L227.259 131.538L227.167 132.457L228.014 133.578L229.302 134.203L229.946 135.104L229.909 135.949H230.222L230.314 136.556L230.939 137.181L231.252 136.721L231.933 137.108L232.448 136.924L233.386 138.468L234.178 139.589L235.19 139.92L236.312 140.821L237.582 141.207L238.52 140.637L239.256 140.435L239.771 140.637L240.36 142.071L241.519 142.218L242.642 142.493L244.574 142.843L244.794 141.482L246.156 140.876L245.99 140.343L245.494 140.159L245.31 139.111L244.279 138.615L243.764 137.898L243.175 137.291L243.893 136.225L243.69 135.49L242.899 135.288L242.697 134.552L242.2 133.615L242.494 132.972L242.034 132.806L242.126 131.942L242.218 130.472L241.924 129.461L241.206 129.424L239.863 128.376L239.072 128.248L237.876 127.641L237.177 127.531L236.79 127.751L236.146 127.715L235.594 128.395L234.785 128.615L234.748 128.909L233.294 129.222L231.896 129.02L231.105 128.413L230.148 128.174L229.688 127.292L229.449 127.347L228.75 126.722L228.97 126.152L228.621 125.803L228.271 125.895L227.296 126.759L226.965 126.795L226.284 126.63V126.63Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M225.143 128.56L224.002 128.395L223.616 128.578L223.23 129.332L222.733 129.626L222.954 130.49L222.788 131.924L220.764 133.155L221.334 134.571L222.567 134.883L224.131 135.71L227.204 138.045L229.081 138.137L229.67 137.016L230.35 137.107L230.939 137.181L230.313 136.556L230.221 135.949H229.909L229.945 135.104L229.302 134.203L228.014 133.578L227.167 132.457L227.259 131.538L227.682 131.133L227.498 130.435L226.818 130.086L225.953 128.652L225.53 128.854L225.143 128.56V128.56Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M171.489 96.1531L170.219 96.0796L168.876 96.6127L167.938 96.3369L166.668 96.8884L165.583 96.1899L164.387 96.3369L163.724 97.0171L165.325 97.256L165.307 97.5501L163.871 97.7523L165.491 98.2486L164.644 98.7082L166.797 99.039L167.827 99.1861L168.545 99.0023L170.919 98.2854L172.041 97.5134L171.231 96.8149L171.489 96.1531V96.1531Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M217.875 133.266L217.618 133.284L217.544 133.486H217.213L217.194 133.505L217.084 133.799L216.974 134.681L216.771 135.214L216.845 135.288L216.587 135.674L217.305 137.365L217.434 137.677L217.746 135.802L217.673 135.361L217.231 135.508L217.25 135.196L217.47 135.049L217.213 134.92L217.342 134.13L217.71 134.295L217.838 133.927H217.82L217.93 133.744L217.875 133.266V133.266Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M197.635 127.402L196.899 127.494L195.942 127.622L194.802 127.512L194.691 128.137L196.071 128.744L196.568 128.872L197.341 129.313L197.506 128.707L197.341 128.339L197.635 127.402V127.402ZM191.434 123.928L190.974 124.277L190.459 124.222L190.698 124.883L190.772 126.28L191.158 126.593L191.526 126.207L191.968 126.28L192.042 124.736L191.434 123.928V123.928ZM194.066 117.623L193.826 117.218L192.943 117.42L192.851 117.641L192.281 117.476L192.226 117.935L191.839 118.137L191.14 117.99L190.974 118.45L190.533 118.487L190.367 118.303L189.87 118.689L189.429 118.744L189.024 118.505L188.987 118.817L189.282 119.259L188.969 119.589L189.245 120.472L189.742 120.619L189.65 121.115L190.036 121.023L190.551 120.509L190.974 120.343L191.747 120.729L192.226 120.858L192.575 121.961L193.238 122.622L194.139 123.358L194.912 123.872L195.63 123.946L196.053 124.405L196.678 124.626L196.991 125.122L197.396 125.269L197.727 125.858L198.15 126.538L197.948 126.777L197.801 127.42L197.819 127.788L198.206 127.696L198.666 126.666L199.052 126.593L199.126 125.986L198.408 125.564L198.758 124.81L199.586 124.994L200.156 125.545L200.303 125.122L200.193 124.902L199.328 124.314L198.61 123.964L197.727 123.542L197.985 123.321L197.727 123.064L196.991 123.082L195.887 122.163L195.354 121.225L194.452 120.656L194.102 120.086L194.194 119.755L194.121 119.203L194.838 118.799L195.593 118.965L195.335 118.468L195.39 117.917L194.066 117.623V117.623Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M104.329 151.28L105.047 151.261L104.899 150.931L104.403 150.655L103.722 150.545L103.501 150.508L103.059 150.581L102.912 150.857L103.446 151.28L103.998 151.464L104.329 151.28V151.28Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M221.334 134.571L220.764 133.156L218.998 134.387L217.838 133.928L217.71 134.295L217.783 135.012L217.673 135.362L217.746 135.803L217.434 137.678L217.489 137.843L218.611 138.027L218.998 137.659L219.2 137.236L219.936 137.089L220.065 136.685L220.378 136.501L219.255 135.325L221.169 134.755L221.334 134.571V134.571Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M314.42 132.237L313.592 131.998L313.39 132.494L312.783 132.347L312.543 133.046L312.764 133.597L313.537 133.928L313.519 133.248L313.905 132.972L314.475 133.358L314.715 132.641L314.42 132.237V132.237ZM318.91 128.689L318.247 127.457L318.486 126.281L317.971 125.325L316.481 123.726L315.598 123.947L315.635 124.663L316.573 125.969L316.757 127.421L316.444 127.88L315.616 129.075L314.696 128.505V130.619L313.537 130.38L311.771 130.729L311.421 131.538L310.703 132.145L310.501 132.88L309.71 133.248L310.446 134.038L311.2 134.387L311.366 135.435L312.01 135.895L312.47 135.398L312.323 133.413L310.979 132.549L312.102 132.531L313.022 131.979L314.604 131.722L315.046 132.604L315.892 133.046L316.702 131.704L318.376 131.63L319.37 131.079L319.48 130.233L319.02 129.645L318.91 128.689V128.689ZM316.739 120.564L315.763 120.178L313.85 119.002L314.199 119.884L314.991 121.447L314.034 121.52L314.144 122.384L314.991 123.505H316.039L315.745 122.256L317.732 123.028L317.806 121.906L318.983 121.594L317.879 120.325L317.567 120.803L316.739 120.564Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M243.819 108.138L242.163 107.899L241.593 108.358L239.606 108.763L239.293 109.039L236.202 109.425L235.944 109.811L236.864 110.564L236.146 110.858L236.422 111.171L235.76 111.704L237.49 112.476L237.453 113.027L236.183 112.972L236.036 113.303L234.693 112.715L233.294 112.752L232.503 113.211L231.289 112.77L229.099 111.98L227.719 112.016L226.229 113.23L226.358 114.075L225.254 113.413L224.867 114.663L225.18 114.884L224.867 115.748L225.842 116.538L226.505 116.502L227.278 117.255L227.314 117.843L227.83 118.027L228.639 117.788L229.559 117.292L230.424 117.568L231.326 117.513L231.675 118.229L231.786 119.332L230.939 119.167L230.203 119.351L230.369 120.178L229.449 120.068L229.559 120.435L230.148 120.729L230.829 121.74L232.006 122.126L232.282 122.512L232.154 122.99L232.282 123.266L232.614 122.898L233.626 122.659L234.325 122.972L235.226 123.873L235.686 123.817L234.546 119.626L236.735 118.965L236.938 119.057L238.612 119.884L239.495 120.307L240.691 121.318L241.74 121.152L243.322 121.06L244.702 121.887L244.978 123.027L245.438 123.045L245.917 123.964L247.131 124.001L247.554 124.553H247.904L248.07 123.725L249.063 122.935L249.523 122.715L249.578 122.218L250.149 122.071L251.823 122.457L251.731 121.795L252.191 121.556L253.682 122.034L253.976 121.906L255.558 121.942L256.994 122.053L257.601 122.457L258.245 122.623L257.932 121.979L258.466 121.685L256.865 119.718L258.521 119.277L258.889 119.02L258.705 116.979L260.674 117.347L260.968 116.832L260.508 115.693L261.207 115.582L261.538 114.81L260.747 114.112L259.643 114.277L259.036 113.799L258.318 113.579L257.564 112.917L256.975 112.715L255.834 113.009L254.307 112.347L254.105 112.954L250.774 110.105L249.247 109.241L249.394 108.892L247.72 109.939L246.91 110.013L246.69 109.406L245.402 109.02L244.61 109.296L243.819 108.138V108.138Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M225.953 167.584H225.254L224.83 167.198L223.892 167.676L223.598 168.172L222.898 168.08L222.678 167.952L222.438 167.97H222.107L220.782 166.977H220.065L219.697 166.591V165.93L219.163 165.728L218.464 166.5L217.838 167.198L218.335 168.007L218.464 168.595L218.942 169.937L218.556 170.801L218.059 171.573L217.765 172.051V172.106L218.022 172.547L217.949 173.411L221.666 175.801L221.739 176.481L223.211 177.639L223.616 177.253L223.837 176.481L224.168 176.003L224.334 175.176L224.72 175.102L224.978 174.606L225.714 174.146L225.107 173.172L225.07 168.908L225.953 167.584V167.584Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M258.245 122.623L257.601 122.457L256.994 122.053L255.558 121.943L253.976 121.906L253.682 122.035L252.191 121.557L251.731 121.796L251.823 122.457L250.149 122.071L249.578 122.218L249.523 122.715L249.854 122.825L249.284 123.579L250.13 124.001L250.719 123.707L252.026 124.314L251.069 125.141L250.314 125.031L250.057 125.398L248.971 125.196L249.082 125.876L250.075 125.784L251.382 126.152L253.13 125.987L253.314 125.711L253.111 125.435L253.847 124.884L254.436 124.663L255.485 124.829L255.595 124.093L256.773 123.946L256.957 123.505L258.208 122.88L258.245 122.623V122.623Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M292.763 155.562L291.806 155.14L291.438 155.93L290.537 155.489L289.562 155.305L288.255 155.544L287.703 156.5L288.09 157.915L288.715 159.128L289.194 159.735L290.058 159.9L290.923 159.441L291.99 159.349L291.475 158.651L293.113 157.75L293.094 156.334L292.763 155.562V155.562Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M304.263 127.972L305.404 128.983L304.778 129.185L305.735 130.435L305.938 131.317L306.324 131.961L307.152 131.869L307.741 131.372L308.514 131.152L308.606 130.49L307.98 129.111L307.373 128.339L305.864 126.942L305.882 127.236L305.496 127.31L304.852 127.365L304.723 127.898L304.282 127.861L304.263 127.972V127.972Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M230.35 137.108L229.67 137.016L229.081 138.137L229.982 138.247L230.295 138.817L230.994 138.78L230.553 137.898L230.608 137.622L230.35 137.108V137.108Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M292.763 155.562L292.8 154.386L292.432 153.559L291.549 152.75L290.758 151.721L289.709 150.342L288.366 149.643L288.605 149.221L289.212 148.908L288.66 147.897L287.409 147.879L286.783 146.831L286.047 145.894L285.55 146.077L285.9 147.401L285.366 147.382L285.238 147.107L284.483 147.86L284.336 148.302L284.814 148.651L284.98 149.349L285.679 149.404L285.606 150.636L285.79 151.684L286.765 150.985L287.096 151.206L287.685 151.169L287.832 150.765L288.623 150.838L289.525 151.794L289.764 152.952L290.721 153.963L290.813 154.956L290.537 155.489L291.438 155.93L291.806 155.14L292.763 155.562V155.562Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M217.875 133.266L218.041 132.622L218.519 132.181L218.298 131.722L217.857 131.667L217.838 131.703L217.452 132.53L217.213 133.486H217.544L217.618 133.284L217.875 133.266V133.266Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M174.01 163.191L173.715 163.154L173.513 163.632L173.218 163.614L173.016 163.375L173.09 162.897L172.666 162.18L172.39 162.309L172.17 162.346L171.691 162.897L171.213 163.522L171.158 163.871L170.918 164.239L171.599 164.993L172.482 165.636L173.421 166.518L174.47 167.088L174.746 167.07L174.838 166.114L174.93 165.967L174.893 165.507L174.47 165.011L174.138 164.937L173.844 164.607L174.065 164.092L173.954 163.522L174.01 163.191V163.191Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M207.571 135.269L207.295 134.883L206.302 134.736L205.97 134.534H205.602L205.234 134.019L203.891 133.78L203.229 133.927L202.548 134.479L202.272 135.049L202.548 135.931L202.106 136.483L201.646 136.777L200.561 136.207L199.144 135.71L198.242 135.49L197.727 134.442L196.402 133.927L195.574 133.725L195.17 133.836L193.992 133.431L193.974 134.332L193.495 134.663L193.219 135.03L192.538 135.49L192.667 135.968L192.594 136.464L192.115 136.721L192.465 137.751L192.538 138.302L192.373 139.258L192.465 139.791L192.354 140.435L192.446 141.17L192.06 141.648L192.686 142.512L192.722 143.008L193.09 143.67L193.569 143.449L194.36 143.982L194.82 144.717L196.439 145.232L197.01 145.876L197.727 145.434L198.721 144.791L202.824 147.034L206.946 149.276V148.78H208.105L208.013 146.445L207.829 142.144L207.59 137.971L207.222 137.034L207.442 136.317L207.24 135.821L207.571 135.269V135.269Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M266.525 164.919L266.948 164.588L267.058 163.375L266.506 162.161L265.973 161.334L265.218 160.691L264.869 162.584L265.126 164.257L265.641 165.194L266.525 164.919V164.919Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M210.57 207.895L210.773 207.527L211.343 207.344L211.545 206.958L211.895 206.388L211.582 206.039L211.159 205.671L210.681 205.91L210.11 206.369L209.521 207.105L210.202 208.005L210.57 207.895V207.895Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M205.474 107.66L204.554 107.127L204.094 107.053L203.928 106.814L203.118 106.925L201.665 106.851L200.745 107.2L201.058 108.12L201.978 108.322L202.382 108.487L202.346 108.8L202.456 109.075L202.916 109.186L203.174 109.535H204.02L204.903 109.131L204.995 108.506L205.639 108.138L205.474 107.66V107.66Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M188.288 114.535L188.325 114.039L188.141 113.781L187.901 113.818L187.828 114.461L188.03 114.553L188.288 114.535V114.535Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M205.786 105.619H205.087L204.278 105.215L203.891 105.086L203.21 105.27L203.174 106.116L202.511 106.134L201.702 105.307L200.966 105.693L200.653 106.373L200.745 107.2L201.665 106.851L203.118 106.925L203.928 106.814L204.094 107.053L204.554 107.127L205.474 107.66L205.952 107.476L206.798 107.053L206.412 106.392L206.228 105.877L205.786 105.619Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M180.597 131.041L180.174 131.023L179.162 130.766L178.242 130.839L177.671 130.343H176.954L176.622 131.06L175.942 132.291L175.206 132.769L174.212 133.302L173.568 134.093L173.402 134.718L173.016 135.71L173.218 137.162L172.354 138.137L171.857 138.449L171.047 139.258L170.109 139.387L169.594 139.828L169.575 139.846L168.913 141.041L168.232 141.464L167.846 142.199L167.809 142.806L167.514 143.504L167.165 143.688L166.594 144.423L166.226 145.25L166.282 145.655L165.932 146.261L165.527 146.574L165.472 147.125H165.49L167.772 147.033L167.901 146.611L168.324 146.077L168.692 144.46L170.127 143.21L170.642 141.721L170.955 141.647L171.305 140.728L172.151 140.6L172.501 140.765H172.961L173.292 140.489L173.918 140.453L173.899 139.828H174.046L174.065 138.449L175.702 137.585L176.696 137.401L177.506 137.089L177.892 136.501L179.051 136.041L179.106 135.177L179.677 135.085L180.137 134.644L181.425 134.46L181.609 134.001L181.351 133.743L181.02 132.512L180.965 131.795L180.597 131.041V131.041Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M208.804 119.075L209.025 118.947L209.117 118.561L209.319 118.193L209.227 117.991L209.411 117.899L209.522 118.064L210.074 118.101L210.294 118.009L210.11 117.899L210.147 117.715L209.779 117.439L209.577 116.962L209.227 116.759V116.373L208.767 116.079L208.399 116.024L207.682 115.675L207.093 115.785L206.89 115.951L207.185 116.061L207.516 116.41L207.866 116.888L208.491 117.568L208.602 118.064L208.565 118.561L208.804 119.075V119.075Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M234.049 188.025L233.846 187.253L233.589 186.757L233.258 186.26L232.89 186.775L232.834 187.473L232.227 188.301L231.804 188.154L231.914 188.65L231.583 189.238L230.7 189.955L230.074 190.635H229.633L229.228 190.856L228.658 191.095L228.142 191.131L227.958 191.885L227.554 192.528L227.572 193.613L227.719 194.348L227.922 194.9L227.774 195.653L227.241 196.536L227.204 196.922L226.726 197.124L226.486 197.969L226.523 198.815L226.818 199.734L226.799 200.782L227.02 201.388L227.793 201.811L228.345 202.124L229.265 201.627L230.111 201.352L230.682 199.991L231.197 198.355L231.988 196.15L232.595 194.532L233.092 193.172L233.239 192.179L233.534 191.903L233.662 191.407L233.515 190.543L233.736 190.194L234.03 190.892L234.233 190.543L234.38 189.973L234.141 189.44L234.049 188.025V188.025Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M84.7698 141.96L84.1074 141.703L83.3898 141.335L83.2426 140.784L83.2058 139.957L82.7642 139.295L82.5802 138.615L82.2858 137.806L81.7154 137.347L80.9058 137.365L80.0226 138.284L79.2866 137.935L78.8818 137.586L78.8082 136.942L78.661 136.336L78.2194 135.821L77.833 135.453L77.5938 135.049H75.8826L75.7354 135.527H74.9442H72.9754L71.0066 134.718L69.7002 134.148L69.8842 133.909L68.5962 134.038L67.437 134.13L67.4738 135.178L67.6026 136.115L67.7314 136.869L67.8786 137.604L68.357 137.935L68.8906 138.762L68.7066 139.295L68.2098 139.718L67.8234 139.663L67.713 139.755L68.1362 140.435L68.6698 140.71L68.8538 141.023L69.0194 140.857L69.5898 141.39L69.9762 141.758L69.9946 142.383L69.7738 143.247L70.2338 143.541L70.841 144.111L71.3746 144.773L71.5034 145.49H71.6874L72.1842 145.067L72.2578 144.846L71.9818 144.332L71.6874 143.798L71.209 143.762L71.2826 143.137L71.117 142.585L70.933 142.071L70.841 140.986L70.3626 140.398L70.2522 139.975L70.0314 139.681V138.927L69.8474 138.946L69.829 138.541L69.7002 138.449L69.6266 138.192L69.1298 137.383L68.9274 136.905L69.1114 136.023L69.1298 135.472L69.461 134.994L69.9026 135.306L70.2522 135.269L70.8226 135.729L70.657 136.17L70.7306 137.071L71.0066 137.935L70.933 138.302L71.2458 138.872L71.669 139.497L72.1658 139.589L72.221 140.398L72.6626 140.968L73.1226 141.243L72.7914 141.979L72.9202 142.254L73.6746 142.732L74.0242 143.468L74.8522 144.368L75.5514 145.545L75.7906 146.133V146.592L76.0482 147.126L75.993 147.53L75.6986 147.824L75.7538 148.155L75.4042 148.284L75.5514 148.853L75.9562 149.589L76.9314 150.25L77.281 150.783L78.2746 151.151L78.8266 151.225L79.0474 151.537L79.8202 152.089L80.9058 152.64L81.6418 152.805L82.525 153.339L83.261 153.559L83.9418 153.872L84.4754 153.743L85.3586 153.302L85.929 153.228L86.7386 153.522L87.217 153.908L88.229 155.177L88.3026 154.827L88.4498 154.552L88.321 154.331L88.9282 153.375H90.2346L90.3082 152.989L90.161 152.916L90.069 152.658L89.7194 152.383L89.3882 151.997H89.8666L89.9402 151.335H90.897L91.8354 151.353L91.8538 151.17L91.9826 151.114L92.1482 151.261L92.6082 150.545H92.7922L93.013 150.526L93.2338 150.82L93.6018 149.901L93.8226 149.405L93.657 149.203L93.9882 148.486L94.6322 147.787L94.7426 147.217L94.5218 146.979L93.8962 147.07L93.013 147.034L91.909 147.309L91.173 147.622L90.9522 147.953L90.7314 148.945L90.4002 149.625L89.6826 150.103L89.0202 150.306L88.229 150.508L87.4378 150.618L86.4994 150.949L86.1498 150.471L85.1194 150.159L84.7882 149.57L84.6594 148.909L84.1074 148.045L84.0338 147.126L83.813 146.556L83.721 145.931L83.9234 145.361L84.2546 143.78L84.5858 142.953L85.1562 141.924L84.7698 141.96V141.96Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M204.296 123.027L203.781 122.66L203.339 122.678L203.026 122.752L202.824 122.788L202.29 122.972L202.272 123.193H202.143L202.07 123.579L202.235 124.057L202.658 124.351L203.266 124.24L203.615 124.002L204.13 124.02L204.259 123.818L204.443 123.781L204.296 123.027Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M187.055 149.773L185.933 149.883L185.914 149.148L185.436 148.946L184.81 148.615L184.571 148.063L181.149 145.527L177.763 142.972L176.218 142.99L176.659 148.027L177.101 153.082L177.285 153.229L177.046 154.037L172.942 154.056L172.777 154.313L172.39 154.24L171.802 154.479L171.102 154.148L170.771 154.184L170.587 154.865L170.238 155.085L170.274 155.802L170.477 156.482L170.863 156.813L170.937 157.254L170.882 157.622L170.937 158.045H171.102L171.378 157.898L171.544 157.934L171.82 158.228L172.262 158.32L172.556 158.063L172.887 157.916L173.126 157.751L173.329 157.787L173.568 158.045L173.678 158.357L174.102 158.853L173.881 159.147L173.844 159.534L174.065 159.423L174.194 159.552L174.138 159.901L174.451 160.232L174.58 160.122L174.874 160.306L175.666 160.324L175.85 159.975L176.034 159.993L176.328 159.864L176.494 160.361L176.733 160.214L177.156 160.048L177.082 159.368L177.377 158.872L177.34 158.467L178.168 157.512L178.315 156.703L178.61 156.409L179.106 156.574L179.529 156.335L179.677 156.041L180.468 155.508L180.67 155.14L181.627 154.662L182.179 154.497L182.437 154.718H183.099L183.761 154.662L184.129 154.258L185.528 154.148L186.429 153.964L186.521 153.247L187.073 152.457L187.055 149.773V149.773Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M285.238 147.107L285.127 146.629L284.428 146.96L283.968 146.74L283.14 146.298L283.287 145.343L282.606 145.104L282.183 144.037L281.153 144.221L281.024 142.843L281.778 141.868L281.631 140.894L281.392 139.993L280.895 139.718L280.398 139.038L279.846 139.111L280.012 139.552L279.718 139.773L279.957 140.49L279.202 140.288L278.08 141.096L278.246 141.758L277.859 142.751L277.914 143.321L277.638 144.276L276.792 144.019L276.958 145.232L276.792 145.618L276.958 146.115L276.516 146.39L276.608 147.236L276.222 147.052L276.424 147.989L277.27 148.945L277.896 149.111L277.822 149.515L278.816 150.875L279.166 151.96L279 153.412L279.662 153.688L280.251 153.798L281.318 152.953L281.907 152.383L282.478 153.339L282.846 154.827L283.324 156.224L283.802 156.831L283.839 158.099L284.244 158.798L284.005 159.68L284.17 160.563L284.575 159.349L285.054 158.265L284.538 157.199L284.502 156.647L284.318 156.004L283.545 155.066L283.232 154.478L283.545 154.276L283.802 153.247L283.269 152.475L282.514 151.629L281.87 150.6L282.275 150.397L282.551 149.129L283.269 149.074L283.784 148.559L284.336 148.302L284.483 147.861L285.238 147.107V147.107Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M201.72 122.108L201.794 121.998L201.426 121.777L201.094 121.649L200.947 121.502L200.671 121.299L200.506 121.41L200.23 121.667L200.156 122.292L200.064 122.476L200.487 122.696L200.782 123.082L200.984 123.156L200.892 122.807L201.26 122.237L201.334 122.457L201.573 122.365L201.72 122.108V122.108Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M274.161 113.34L273.48 112.494L272.266 112.218L271.383 112.071L270.113 111.612L269.874 112.788L270.61 113.45L270.168 114.24L268.715 113.946L267.795 113.91L266.93 113.376L265.991 113.358L265.016 113.009L263.931 113.542L262.716 114.534L261.851 114.718L262.459 115.527L263.507 116.134L264.998 116.556L266.065 117.476L266.304 118.817L266.856 119.314L268.034 119.498L269.359 119.663L270.812 120.361L271.438 120.49L272.339 121.538L273.204 122.2L274.216 122.181L276.277 122.42L277.455 122.273L278.467 122.439L280.178 123.137L281.319 123.119L281.907 123.486L282.717 122.88L284.042 122.475L285.422 122.439L286.323 122.034L286.673 121.428L287.133 121.06L286.783 120.674L286.25 120.251L286.323 119.516L286.912 119.608L287.998 119.847L288.568 119.24L289.727 118.799L289.985 118.045L290.427 117.715L291.678 117.567L292.469 117.696L292.34 117.292L291.015 116.501L290.077 116.134L289.617 116.556L288.623 116.373L288.182 116.52L287.685 116.042L287.63 114.902L287.519 114.057L286.507 114.148L285.79 113.762L285.183 113.634L284.355 114.443L283.287 114.626L282.625 114.921L281.392 114.737H280.564L279.663 114.167L278.467 113.615L277.473 113.468L276.424 113.615L275.707 113.818L274.161 113.34V113.34Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M224.352 184.771L224.205 184.238L223.358 184.918L222.218 185.378L221.61 185.36L221.224 185.709L220.506 185.727L220.249 185.874L219.016 185.543L218.63 185.599L218.335 186.701L218.464 188.043H218.519L218.869 188.411L219.274 189.256L219.292 190.764L218.832 191.003L218.482 191.83L217.857 191.095L217.82 190.267L218.059 189.734L218.004 189.256L217.618 188.962L217.323 189.073L216.771 188.521L213.625 189.477L213.68 190.304L213.735 190.745L214.582 190.727L215.06 190.966L215.262 191.26L215.741 191.352L216.256 191.72L216.201 193.209L215.962 194.017L215.87 194.881L216.017 195.23L215.87 195.911L215.704 196.021L215.41 196.866L214.269 198.19L214.674 199.844L214.876 200.671L214.618 201.977L214.692 202.399L214.802 202.932L214.858 203.447H215.612L215.741 202.84L215.483 202.749L215.428 202.271L215.906 201.83L217.158 201.205L218.004 200.8L218.464 200.377L218.63 199.899L218.409 199.697L218.611 199.146L218.703 198.006L218.519 198.061V197.712L218.372 197.032L217.93 196.15L218.059 195.304L218.482 195.047L219.237 194.201L219.642 193.999L220.874 192.749L222.052 192.179L223.009 191.72L223.69 191.003L224.131 190.194L224.481 189.348L224.315 188.779L224.352 186.959L224.278 185.929L224.352 184.771V184.771Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M177.763 142.971L174.028 140.122L173.991 141.905L170.698 141.85L170.661 144.846L169.704 144.938L169.447 145.545L169.612 147.236L165.638 147.217L165.417 147.622L165.932 148.118L166.19 148.67L166.061 149.258L166.171 149.846L166.263 151.004L166.116 152.088L165.803 152.677L165.877 153.302L166.245 152.934L166.742 153.026L167.257 152.769H167.827L168.306 153.099L168.987 153.412L169.575 154.276L170.238 155.085L170.587 154.864L170.771 154.184L171.103 154.147L171.802 154.478L172.391 154.239L172.777 154.313L172.943 154.055L177.046 154.037L177.285 153.228L177.101 153.081L176.659 148.026L176.218 142.99L177.763 142.971V142.971Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M218.133 188.594L218.151 188.172L217.93 187.822L217.949 187.308L217.673 186.444L217.986 185.8L217.967 184.385L217.618 183.631L217.654 183.503L217.452 183.19L216.458 182.97L216.937 183.484L217.158 184.477L216.974 184.808L216.753 185.745L216.918 186.72L216.587 187.124L216.238 188.208L216.771 188.521L217.323 189.072L217.618 188.962L218.004 189.256L218.059 189.734L217.82 190.267L217.857 191.094L218.482 191.83L218.832 191.002L219.292 190.764L219.274 189.256L218.869 188.411L218.519 188.043H218.464V188.19L218.666 188.245L218.85 188.87L218.814 189.017L218.464 188.558L218.28 188.852L218.133 188.594V188.594Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M287.022 164.919L286.158 164.404L285.992 164.606L286.25 165.103L286.176 165.967L286.562 166.592L286.746 167.566L287.372 168.356L287.519 168.944L288.752 169.863L289.746 170.746L290.482 170.654L290.5 170.268L290.077 169.238L289.69 168.908L289.598 168.209L289.488 167.823L289.58 167.29L289.488 166.5L289.01 165.709L288.366 165.011L288.126 164.9L287.814 165.378L287.133 165.525L287.022 164.919V164.919ZM305.238 166.941L305.018 166.371L305.717 166.297L305.772 165.856L304.889 165.489L304.19 165.176L304.116 164.661L303.546 164.073H303.122L302.662 164.992L301.908 165.801L301.89 166.371L301.871 167.125L301.374 167.088L301.172 167.492L300.675 166.886L300.197 167.621L299.498 168.54L298.265 168.797L297.823 169.018L297.658 170.011L296.848 170.231L296.094 169.827L296.278 170.617L296.995 171.26L297.658 171.04L298.32 171.113L298.909 170.525L299.406 170.415L300.399 170.746L301.227 170.507L301.724 168.871L302.092 168.466L302.405 167.143H303.582L304.502 167.327L305.238 166.941V166.941Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M206.394 192.675L204.498 193.135L202.033 192.969L201.352 192.418L197.212 192.473L197.046 192.547L196.458 192.013L195.795 191.995L195.188 192.179L194.691 192.4L194.728 193.3L195.538 194.44L195.74 195.175L196.255 196.591L196.752 197.546L197.138 198.024L197.249 198.668V200.065L197.543 201.866L197.764 202.712L197.948 203.851L198.298 204.715L199.015 205.598L199.512 205.009L199.898 205.34L200.046 205.836L200.487 205.928L201.094 206.149L201.628 206.057L202.548 205.469L202.75 201.131L202.861 197.73L203.854 197.693L204.02 193.521L204.774 193.484L206.357 193.08L206.725 193.558L207.406 193.098H207.7L208.289 192.822V192.73L207.902 192.473L207.24 192.4L206.394 192.675Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M196.439 145.232L194.82 144.718L191.398 146.96L188.49 149.258L187.055 149.773L187.074 152.456L186.522 153.247L186.43 153.964L185.528 154.148L184.129 154.258L183.761 154.662L183.099 154.717L183.007 155.287L183.154 155.82L183.725 156.574L183.761 157.144L184.939 157.401L184.921 158.21L185.27 157.861H185.638L186.43 158.541L186.485 157.493L186.779 157.015L186.926 156.353L187.184 156.096L188.288 155.949L189.318 156.39L189.705 156.831L190.238 156.85L190.717 156.574L191.968 157.181L192.483 157.144L193.09 156.647L193.698 156.684L193.992 156.519L194.544 156.592L195.335 156.923L196.126 156.28L196.366 156.317L197.083 157.603L197.267 157.567L197.304 157.199L197.598 157.125L197.69 156.592L197.028 156.556V155.802L196.586 155.379L197.01 153.835L198.279 152.732L198.316 151.206L198.647 148.835L198.85 148.339L198.426 147.935L198.39 147.549L198.022 147.254L197.727 145.435L197.01 145.876L196.439 145.232V145.232Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M197.267 157.566L197.083 157.603L196.366 156.316L196.126 156.28L195.335 156.923L194.544 156.592L193.992 156.519L193.698 156.684L193.09 156.647L192.483 157.144L191.968 157.18L190.717 156.574L190.238 156.849L189.705 156.831L189.318 156.39L188.288 155.949L187.184 156.096L186.926 156.353L186.779 157.015L186.485 157.493L186.43 158.541L186.393 158.927L186.614 159.625L186.411 160.085L186.522 160.397L186.025 161.132L185.712 161.482L185.528 162.217L185.546 162.971L185.491 164.845H186.393H187.184L187.902 165.617L188.251 166.463L188.803 167.18L189.631 167.217L190.036 166.959L190.422 167.014L191.49 166.592L191.747 165.765L192.244 164.643L192.538 164.625L193.146 163.945L193.532 163.926L194.121 164.404L194.838 164L194.93 163.522L195.151 163.044L195.298 162.456L195.85 161.978L196.053 161.151L196.274 160.893L196.402 160.287L196.678 159.552L197.525 158.632L197.58 158.246L197.691 158.044L197.267 157.566V157.566Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M97.5945 154.644L97.2449 154.607L97.0793 154.772L96.7113 154.919H96.4537L96.2145 155.066L96.0121 155.011L95.8465 154.846L95.7361 154.883L95.5889 155.158L95.4969 155.14L95.4417 155.379L95.0553 155.71L94.8529 155.839L94.7425 155.986L94.4665 155.747L94.2089 156.059H93.9881L93.7489 156.096L93.7121 156.666H93.5649L93.4177 156.941L93.0865 156.997L93.0129 157.07L92.8473 156.886L92.7185 157.07L93.1969 157.603L93.6017 157.971L93.7857 158.357L94.2457 158.835L94.5769 159.202L94.7425 159.055L95.3865 159.368L95.6441 159.221L95.9569 159.313L96.1041 159.552L96.4169 159.625L96.6745 159.386L96.5273 159.184L96.5089 158.871L96.7297 158.577L96.6929 158.265L96.8217 157.769L96.9873 157.64L97.0057 157.125L96.9689 156.813L97.0425 156.298L97.2081 155.839L97.4657 155.434L97.4105 155.011L97.4841 154.754L97.5945 154.644V154.644Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M188.012 111.833H188.546L188.748 111.41L188.932 110.381L188.748 110.013L188.031 109.977L186.835 110.454L186.117 112.09L185.657 112.403L186.319 112.495L187.129 112.256L187.699 112.752L188.215 113.01L188.012 111.833V111.833Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M203.339 91.4658L202.07 91.668L200.727 91.6129L199.788 92.4217L198.555 92.3665L196.991 92.7893L195.133 94.0393L193.955 94.7745L192.336 96.7413L191.03 98.1751L189.539 99.2412L187.479 100.124L186.761 100.785L187.111 103.248L187.46 104.406L188.638 104.958L189.742 104.701L191.306 103.451L191.913 104.112L192.226 103.506L192.851 102.771L193.017 101.502L192.447 100.969L192.263 99.5721L192.686 98.5979L193.477 98.6163L193.716 98.2119L193.385 97.8626L194.434 96.4105L195.059 95.2892L195.464 94.5723L196.2 94.5907L196.311 94.0209L197.764 94.1863V93.5429L198.224 93.4878L198.611 93.2305L199.549 93.7635L200.524 93.7084L201.389 93.9473L202.015 93.5062L202.217 92.7893L203.284 92.4584L204.333 92.8444L204.186 93.5429L204.775 93.451L205.952 93.0466L204.959 92.44L205.842 92.1827L203.339 91.4658V91.4658ZM199.181 85.3447L198.151 85.1609L197.801 84.8484L196.476 85.0139L196.955 85.2896L196.55 85.5102L197.783 85.7124L199.181 85.3447V85.3447ZM194.507 83.8191L193.624 83.525L192.686 83.5617L192.502 83.8375H191.582L191.177 83.5617L189.466 83.8558L190.055 84.4992L191.453 85.1977L192.502 85.455L191.95 85.7675L193.495 86.3006L194.305 86.2638L194.471 85.5469L195.023 85.3815L195.243 84.7565L196.807 84.4257L194.507 83.8191V83.8191ZM198.96 83.2492L197.286 83.0654L196.697 83.286L195.722 83.1022L193.808 83.3228L194.599 83.6904H195.538L195.703 83.9294L197.654 84.058L199.512 83.9661L200.303 83.525L198.96 83.2492V83.2492Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M270.757 139.571L269.561 139.46L268.383 139.185L267.463 138.67L266.635 138.449L266.175 137.879L265.586 137.714L264.409 136.96L263.544 136.593L263.194 136.868L262.679 137.402L262.514 138.486L263.562 138.946L264.63 139.515L266.046 140.159L267.445 140.324L268.144 140.912L268.935 141.023L270.186 141.298L271.033 141.28L271.051 140.821L270.775 140.067L270.757 139.571V139.571Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M346.822 220.082L346.988 219.605L345.921 220.138L345.295 220.763L344.706 221.057L343.621 221.902L342.59 222.49L341.302 223.079L340.29 223.52L339.499 223.722L337.42 224.843L336.242 225.689L336.04 226.112L336.978 226.185L337.254 226.571L338.082 226.59L338.818 226.259L339.978 225.744L341.468 224.604L342.333 223.851L343.474 223.428L344.21 223.41L344.32 222.876L345.166 222.417L346.454 221.59L347.227 221.057L347.614 220.579L347.706 220.101L346.675 220.56L346.822 220.082V220.082ZM352.122 214.476L352.471 213.428L351.901 213.116L351.754 212.454L351.33 212.546L351.257 213.392L351.404 214.439L351.57 214.936L351.404 215.138L351.294 215.947L350.852 216.7L350.079 217.619L349.104 218.024L348.791 218.465L349.472 218.924L349.325 219.568L348.055 220.505L348.313 220.671L348.239 220.965L349.325 220.505L350.41 219.733L351.238 219.108L351.533 218.888L351.809 218.391L352.324 218.024L353.023 218.061L353.796 217.362L354.734 216.314L354.348 216.167L353.502 216.627L352.913 216.535L352.379 216.149L352.802 215.248L352.582 214.917L352.048 215.726L352.122 214.476V214.476Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M242.384 147.475L242.77 147.107L242.918 146.776L243.212 146.078L243.194 145.82L242.807 145.673L242.513 145.287L241.979 144.607L241.372 144.405L240.618 144.239L240.01 143.817L239.477 143.026H238.962L238.943 143.798L239.146 143.945L238.704 144.184L238.759 144.662L238.502 145.14L238.52 145.618L239.054 146.445L238.575 148.78L235.613 149.956L236.57 151.886L236.956 152.695L237.416 152.64L238.078 152.235L238.649 152.346L239.109 152.015L239.072 151.555L239.458 151.261H240.084L240.305 151.022L240.342 150.452L240.949 150.011H241.427L241.501 149.864L241.317 149.092L241.427 148.504L241.611 148.228L242.071 148.283L242.384 147.475V147.475ZM239.33 141.887L239.366 141.409L239.238 141.298L238.998 141.703L239.238 142.107L239.33 141.887V141.887Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M258.447 130.655L256.718 130.178L256.184 129.258L255.319 128.707L254.804 128.836L254.363 129.056L253.295 129.203L252.32 129.442L251.878 129.957L252.228 130.472L252.486 131.06L252.118 131.556L252.265 132.016L252.099 132.438L251.161 132.402L251.713 133.174L251.161 133.468L250.885 134.166L251.087 134.865L250.774 135.196L250.388 135.085L249.652 135.251L249.615 135.563H248.879L248.456 136.225L248.603 137.218L247.389 137.696L246.69 137.604L246.524 137.861L245.917 137.714L244.942 137.879L243.175 137.291L243.764 137.898L244.279 138.615L245.31 139.111L245.494 140.159L245.99 140.343L246.156 140.876L244.794 141.482L244.574 142.842L245.972 142.677L247.61 142.659L249.431 142.438L250.333 143.32L250.719 144.166L251.492 144.46L252.081 143.688H254.289L253.958 142.677L253.314 142.089L253.075 141.188L252.338 140.655L253.24 139.442L254.418 139.534L255.246 138.302L255.632 137.107L256.35 135.949L256.166 135.122L256.847 134.442L255.927 133.872L255.393 133.082L254.804 132.052L255.154 131.538L256.718 131.832L257.767 131.648L258.447 130.655V130.655Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M103.004 162.033L102.636 161.702L102.323 161.353L101.863 161.151L101.293 161.114L101.348 161.004L100.778 160.93L100.41 161.279L99.7657 161.518L99.3057 161.812L98.8089 161.904L98.5329 161.61L98.4409 161.702L98.0177 161.647L98.0545 161.408L97.7049 160.985L97.3001 161.096L97.2817 161.555L97.4841 161.739L97.3369 161.868L97.3553 162.088L97.2633 162.327L97.1897 162.548L97.3001 162.732L97.3553 162.474H97.7969L98.0545 162.603L98.4777 162.695L98.6617 163.154L98.9929 163.228L99.1401 163.026L99.2873 163.724L99.7657 163.669L99.9313 163.504L100.207 163.338L99.7473 162.713L99.8577 162.474L100.097 162.419L100.52 162.125L100.741 161.721L101.201 161.647L101.698 161.978L101.882 162.364L102.139 162.437L101.863 162.75L102.047 163.393L102.378 163.724L102.544 163.154L102.875 163.246L103.078 162.897L102.875 162.199L103.004 162.033V162.033Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M110.511 177.198L109.978 176.573L109.665 176.555L110.309 175.36L109.499 174.808L108.892 174.919L108.506 174.716L107.954 175.029L107.181 174.882L106.555 173.65L106.059 173.338L105.727 172.786L105.047 172.235L104.771 172.345L104.918 173.246L104.605 173.999L103.501 175.231L102.268 175.691L101.661 176.702L101.495 177.492L100.925 177.97L100.465 177.382L100.042 177.253L99.6186 177.345L99.5818 176.922L99.8578 176.646L99.729 176.15L98.9194 176.885L98.625 177.713L99.177 178.834L98.8642 179.349L99.6186 179.826L100.447 180.58L100.815 181.444L101.256 181.977L102.36 184.312L103.501 186.462L104.495 188.006L104.347 188.337L104.863 189.311L105.709 190.028L107.678 191.297L109.812 192.473L109.941 192.951L111.027 193.631L111.523 193.337L111.744 192.73L112.259 191.462L111.744 190.488L111.947 190.102L111.726 189.661L112.075 189.072L112.02 188.08L112.002 187.253L112.204 186.867L111.192 184.973L110.64 185.176L110.162 185.047L110.125 183.264L109.315 183.962L108.414 183.926L107.991 183.301L107.31 183.245L107.494 182.731L106.887 182.032L106.408 180.966L106.684 180.764L106.666 180.268L107.273 179.918L107.144 179.293L107.383 178.889L107.457 178.338L108.598 177.547L109.444 177.327L109.573 177.143L110.511 177.198Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M312.966 162.327L312.856 161.905L312.709 161.316L311.826 160.765L311.973 161.666L311.255 161.702L311.126 162.217L310.354 162.53L309.949 162.015L309.434 162.456L308.808 162.769L308.458 163.761L308.661 164.11L309.378 163.449L309.875 163.504L310.151 163.008L310.85 163.559L310.574 164.129L310.924 164.974L312.175 165.654L312.433 165.103L312.046 164.239L312.488 163.651L312.948 164.827L313.224 163.761L313.114 163.118L312.966 162.327V162.327ZM310.298 160.158V159.037L309.636 160.158L309.728 159.386L309.176 159.441L309.121 160.177L308.9 160.508L308.716 160.82L309.415 161.629L309.71 161.28L309.967 160.544L310.298 160.158V160.158ZM304.76 161.28L305.238 160.471L305.864 159.827L305.588 158.872L305.146 160.03L304.613 160.838L303.914 161.574L303.472 162.383L304.76 161.28V161.28ZM307.962 158.265L308.182 158.816L308.164 159.423L308.256 159.956L308.863 159.607L309.305 159.111L309.268 158.633H308.606L307.962 158.265V158.265ZM311.642 157.953L311.31 157.511L310.317 157.493L311.053 158.375L311.108 158.816L310.501 158.725L310.722 159.441L311.034 159.497L311.163 160.324L311.623 160.066L311.31 159.331L311.237 158.945L312.065 159.258L311.642 157.953V157.953ZM307.428 156.886L307.023 156.464L306.14 156.427L306.766 157.309L307.281 157.897L307.428 156.886ZM306.25 150.526H305.643L305.478 151.593L305.68 153.412L305.202 153.045L305.422 154.148L305.643 154.662L306.25 155.342L306.324 154.92L306.655 155.177L306.379 155.489L306.398 155.967L306.931 156.225L307.851 156.059L308.587 156.758L308.79 156.317L309.25 156.942L310.133 157.511L310.17 156.978L309.802 156.684L309.82 156.059L308.44 155.398L308.017 155.545L307.446 155.416L307.078 154.478L307.097 153.541L307.649 153.155L307.759 152.181L307.262 151.335L307.336 150.857L307.207 150.563L306.931 150.857L306.25 150.526V150.526Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M343.529 180.157L343.694 179.826L343.253 179.422L342.793 178.686L342.498 178.411L342.406 178.061L342.259 178.19L342.425 179.072L342.83 179.808L343.234 180.267L343.529 180.157V180.157ZM339.628 178.576L340.014 177.859L340.088 177.216L339.886 177.032L339.26 177.051L339.334 177.731L338.726 178.153L338.414 178.558L337.825 178.65L337.751 178.025L337.604 178.043L337.42 178.613L336.85 178.705L335.93 178.539L335.819 178.889L336.39 179.22L337.218 179.569H337.751L338.303 179.293L338.892 178.999L339.076 178.668L339.628 178.576V178.576ZM334.513 180.819L334.347 180.028L335.304 179.9L335.102 179.293L333.427 178.558L333.317 177.878L332.783 177.289L332.102 176.683L330.226 176.021L328.459 175.212L328.275 179.017L327.999 182.841L329.048 182.877L329.618 183.08L330.465 182.675L330.41 181.811L331.072 181.425L331.974 181.094L333.262 181.609L333.703 182.639L334.237 183.282L334.954 184.017L335.966 184.201L336.85 184.33L337.052 184.624L337.751 184.55L337.898 184.219L336.868 183.723L337.199 183.502L336.426 183.3L336.518 182.786L335.93 182.822L335.378 181.572L334.513 180.819V180.819ZM340.898 177.437L340.806 176.83L340.438 176.444L340.051 175.966L339.628 175.69L339.278 175.433L338.745 175.102L338.45 175.378L339.168 175.727L339.738 176.223L340.18 176.609L340.401 177.051L340.548 177.749L340.898 177.437V177.437Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M199.77 108.965L198.923 108.946L198.831 108.689L197.948 108.487L196.899 108.873L195.593 109.388L195.022 109.7L195.28 110.27L195.059 110.564L195.427 110.968L195.685 111.575L195.666 111.961L196.09 112.678L196.531 113.027L197.212 113.137L197.194 113.45L197.69 113.67L197.801 113.395L198.426 113.505L198.555 113.873L199.218 113.928L199.696 114.498L199.751 114.571L200.101 114.406L200.598 114.81L201.113 114.571L201.554 114.681L202.18 114.534L203.082 114.957L203.284 115.031L202.99 114.516L203.689 113.579L204.112 113.45L204.167 113.119L203.597 112.145L203.505 111.648L203.155 111.115L203.652 110.895L203.597 110.454L203.284 110.031L203.174 109.535L202.916 109.185L202.456 109.075L200.855 109.093L199.77 108.965V108.965Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M305.625 122.567L304.613 121.906L304.631 122.549L303.472 123.027L303.969 123.634L303.122 123.597L302.46 123.229L302.276 124.038L301.577 124.663L301.19 125.398L301.797 125.711L302.423 125.839L302.57 126.023L302.644 126.667L302.846 126.887L302.681 127.016L302.662 127.549L303.012 127.733L303.306 127.843L303.453 128.064L303.693 127.972V127.733L304.263 127.972L304.281 127.861L304.723 127.898L304.852 127.365L305.496 127.31L305.882 127.236L305.864 126.942L305.073 126.428L304.594 126.244L304.631 126.115L304.41 125.6L304.649 125.288L305.183 125.104L305.367 124.755L305.422 124.553L305.772 124.295L305.257 123.468L305.312 123.082L305.477 122.715L305.882 122.77L305.625 122.567V122.567Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M175.519 128.744L175.445 128.358L175.813 127.898L175.96 127.586L175.629 127.237L175.923 126.446L175.555 125.748L175.96 125.656L176.015 125.104L176.181 124.939L176.218 124.038L176.659 123.726L176.42 123.156L175.868 123.119L175.703 123.266H175.151L174.93 122.696L174.543 122.862L174.194 123.156L174.212 123.542L174.378 123.946L174.396 124.443L174.157 125.141L174.083 125.601L173.679 126.023L173.568 126.795L173.789 127.237L174.212 127.347L174.286 128.082L174.102 129.02L174.617 128.891L175.114 129.056L175.519 128.744V128.744Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M123.649 195.763L123.594 195.414L122.6 194.807L121.662 194.789L119.914 195.138L119.527 196.167L119.564 196.792L119.288 198.189L121.349 200.101L122.195 200.285L123.52 201.149L124.606 201.608L124.808 202.123L124.035 203.887L125.084 204.218L126.225 204.402L126.998 204.2L127.789 203.318L127.844 202.27L127.973 201.608L128.028 200.91L127.973 200.266L127.586 200.046L127.218 200.248L126.85 200.193L126.685 199.733L126.501 198.667L126.28 198.318L125.562 198.005L125.176 198.226L124.072 198.005L123.998 196.425L123.649 195.763V195.763Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M217.71 134.295L217.342 134.129L217.213 134.92L217.471 135.048L217.25 135.196L217.231 135.508L217.673 135.361L217.783 135.012L217.71 134.295V134.295Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M234.472 143.376L234.619 142.677L234.527 141.997L234.178 141.629L233.92 141.758L233.718 142.365L233.865 143.229L234.196 143.449L234.472 143.376V143.376Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M206.89 115.951H206.504L206.32 116.226L205.658 116.337L205.363 116.502L204.922 116.226H204.333L203.744 116.098L203.394 116.337L202.861 116.576L202.511 117.348L202.033 118.138L201.333 118.34L201.867 118.8L202.014 119.149L202.603 119.425L202.732 119.884L203.302 120.215L203.56 119.976L203.818 120.105L203.615 120.307L203.799 120.491L204.13 120.969L204.48 120.877L205.216 121.061L206.596 121.116L207.019 120.822L208.086 120.564L208.822 120.969L209.374 121.098L209.448 119.737L209.742 119.829L210.166 119.59L210.092 119.296L209.65 119.094L209.246 119.278L208.804 119.076L208.565 118.561L208.602 118.065L208.491 117.568L207.866 116.888L207.516 116.41L207.185 116.061L206.89 115.951Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M248.143 84.4809L247.315 83.7456L244.813 82.992L243.083 82.606L241.942 82.7714L240.967 83.3045L242.034 83.4515L243.249 84.0397L244.721 84.3522L246.837 84.5912L248.143 84.4809V84.4809ZM215.262 83.139L215.428 83.0287L214.379 82.8633L213.864 82.992L213.625 83.1758L213.349 82.9552L212.392 82.9736L211.251 83.1206L212.668 83.139L212.466 83.378L213.275 83.5618L213.938 83.4331L213.956 83.3045L214.49 83.2493L215.262 83.139V83.139ZM252.154 84.9588L251.878 84.6279L249.578 84.15L249.026 84.0949L248.622 84.1868L248.842 85.2897L252.154 84.9588V84.9588ZM254.951 86.1168L253.258 85.9882L253.884 85.7676L252.375 85.4919L251.253 85.8411L251.069 86.2088L251.345 86.5948L250.075 86.5764L249.1 87.0543L248.309 86.8521L246.598 86.944L246.653 87.183L244.96 87.3117L244.058 87.7528L243.286 87.7896L243.065 88.3962L244.077 88.8741L242.66 89.0028L240.912 88.9476L239.845 89.1498L240.728 90.1424L241.998 90.9328L240.231 90.3814L238.778 90.4365L237.839 90.8042L238.667 91.5027L237.766 91.3188L237.379 90.3998L236.606 89.8851L236.275 89.9035L236.938 90.5836L236.091 91.2269L237.582 91.999L237.655 92.9916L238.189 93.5246L239.054 93.6165L239.127 94.2599L239.937 94.8297L239.587 95.3077L239.679 95.804L238.998 96.0613L238.906 96.4289L237.931 96.2819L238.575 94.8481L238.483 94.1864L237.25 93.5798L236.551 92.2379L235.87 91.5578L235.208 91.2637L235.355 90.4917L234.822 89.9586L232.742 89.7013L232.356 89.8851L232.448 90.749L231.657 91.6129L231.878 91.9254L232.742 92.6791L232.761 93.157L233.736 93.2489L233.883 93.4511L234.95 93.9842L234.766 94.4989L231.362 93.3776L230.148 93.0651L227.793 92.771L227.572 93.0835L228.658 93.6533L228.161 94.315L226.983 93.7268L226.063 94.1312L224.665 94.1496L224.278 94.4989L223.303 94.3886L223.763 93.782L223.174 93.7452L220.911 94.5908L219.513 95.0687L219.586 95.712L218.482 95.9326L217.746 95.5834L217.526 95.0319L218.446 94.9033L217.783 94.3518L215.538 94.0209L216.33 94.6459L216.182 95.2341L217.047 95.8407L216.845 96.5392L215.998 96.19L215.262 96.1348L213.79 97.1274L214.563 97.8811L213.974 98.1384L211.877 97.4951L211.49 97.8811L212.098 98.3222L212.134 98.8185L211.435 98.5612L210.331 98.2487L209.982 97.1826L209.798 96.7047L208.326 95.9694L208.859 95.8407L212.558 96.6128L213.735 96.337L214.416 95.804L214.122 95.1422L213.386 94.6643L210.147 93.543L208.013 93.3041L206.614 92.7158L205.952 93.0467L204.774 93.4511L204.186 93.543L204.259 94.2231L205.584 94.9033L205.069 95.6569L206.246 96.8149L205.934 97.6973L206.835 98.4509L206.67 99.131L208.013 99.8479L207.847 100.381L207.24 100.988L205.786 102.348L206.762 102.863L205.934 103.451L206.099 103.635L205.621 104.26L206.081 105.27L205.786 105.62L206.228 105.877L206.412 106.392L206.798 107.054L207.755 107.329L207.939 107.587L208.362 107.458L209.246 107.715L209.43 108.248L209.319 108.542L210 109.259L210.405 109.462L210.386 109.664L211.012 109.866L211.325 110.16L211.03 110.399L210.313 110.362L210.166 110.472L210.442 110.84L210.81 111.557L211.141 111.594L211.325 111.336L211.601 111.392L212.484 111.3L213.183 111.925L213.018 112.164L213.146 112.513L213.882 112.55L214.287 113.046L214.324 113.266L215.538 113.671L216.182 113.487L216.845 114.02L217.378 114.002L218.777 114.369L218.85 114.719L218.611 115.307L218.942 115.932L218.887 116.318L218.022 116.41L217.618 116.722L217.691 117.237L218.464 117.053L218.538 117.292L217.286 117.77L217.875 118.211L217.286 119.167L216.661 119.351L217.581 120.013L218.722 120.454L220.083 121.391L220.175 121.263L221.003 121.465L222.42 121.649L223.8 122.182L224.002 122.402L224.536 122.218L225.474 122.457L225.861 122.917L226.505 123.174L226.781 123.211L227.572 123.909L228.014 123.983L228.106 123.707L228.584 123.248L227.241 121.906L227.167 121.152L226.082 120.068L226.726 118.91L227.572 118.707L227.83 118.027L227.314 117.844L227.278 117.255L226.505 116.502L225.842 116.538L224.867 115.748L225.18 114.884L224.867 114.663L225.254 113.414L226.358 114.075L226.229 113.23L227.719 112.017L229.099 111.98L231.289 112.77L232.503 113.211L233.294 112.752L234.693 112.715L236.036 113.303L236.183 112.972L237.453 113.028L237.49 112.476L235.76 111.704L236.422 111.171L236.146 110.859L236.864 110.564L235.944 109.811L236.202 109.425L239.293 109.039L239.606 108.763L241.593 108.359L242.163 107.899L243.819 108.138L244.61 109.296L245.402 109.02L246.69 109.406L246.91 110.013L247.72 109.939L249.394 108.892L249.247 109.241L250.774 110.105L254.105 112.954L254.307 112.347L255.834 113.009L256.975 112.715L257.564 112.917L258.318 113.579L259.036 113.8L259.643 114.277L260.747 114.112L261.538 114.811L261.851 114.719L262.716 114.535L263.93 113.542L265.016 113.009L265.991 113.358L266.93 113.377L267.794 113.91L268.714 113.947L270.168 114.241L270.61 113.45L269.874 112.789L270.113 111.612L271.382 112.072L272.266 112.219L273.48 112.494L274.161 113.34L275.706 113.818L276.424 113.616L277.473 113.469L278.466 113.616L279.662 114.167L280.564 114.737H281.392L282.625 114.921L283.287 114.627L284.354 114.443L285.182 113.634L285.79 113.763L286.507 114.149L287.519 114.057L288.862 114.48L289.672 113.763L289.322 113.266L289.304 112.072L289.525 111.704L289.065 111.097L288.384 110.822L288.697 110.27L289.635 110.068L290.776 110.031L292.34 110.362L293.426 110.785L294.842 111.906L295.542 112.403L296.351 113.083L297.474 114.204L299.295 114.553L300.933 115.38L302.037 116.447H303.417L303.895 115.987L305.165 115.656L305.404 116.685L305.33 117.108L305.846 118.358L305.956 119.461L304.705 119.259L304.171 119.663L305.036 120.638L305.735 121.979L305.275 121.998L305.625 122.568L305.882 122.77L305.809 122.402L306.545 121.575L307.483 122.126L308.072 122.108L308.882 121.446L309.066 120.766L309.452 119.461L309.802 118.138L309.562 117.347L309.746 115.693L308.79 113.873L307.778 112.531L307.538 111.392L306.674 110.454L304.337 109.223L303.306 109.149L303.251 109.7L302.184 109.462L301.135 108.763L299.663 108.634L300.565 106.043L301.209 103.929L303.619 103.598L306.361 103.782L306.821 103.267L308.274 103.414L309.066 104.204L310.243 104.094L311.789 103.8L310.372 103.157V101.355L312.046 101.006L314.273 102.311L314.935 101.135L314.346 100.271L315.211 100.179L316.407 101.668L315.966 102.513L315.818 103.616L315.874 104.995L314.825 105.234L315.34 105.73L315.322 106.392L316.499 107.917L319.443 110.381L321.375 111.998L322.424 112.789L322.718 111.741L321.89 110.601L322.939 110.325L321.946 109.057L322.866 108.487L322.001 108.009L321.375 107.09L322.13 107.054L320.474 105.473L319.241 105.215L318.707 104.774L318.505 103.745L317.934 103.028L319.222 103.175L319.462 102.715L320.326 103.12L321.449 102.274L323.546 103.01L323.234 102.532L323.602 101.87L323.878 101.135L324.448 101.006L325.644 100.216L327.447 100.436L327.282 100.16L326.582 99.7376L325.828 99.4435L324.154 98.598L322.663 98.0465L323.786 98.12L324.154 97.6605L318.1 93.6349L316.37 93.2122L313.482 92.7342L312.028 92.7894L309.231 92.532L309.562 92.9548L311.126 93.5798L310.666 93.9107L308.054 93.0283L306.802 93.1386L305.11 92.9364L303.822 92.9732L303.104 93.1754L301.779 92.8813L300.841 92.1828L299.645 91.7784L297.952 91.6129L295.247 91.7968L292.285 91.0615L290.85 90.5101L283.471 89.8851L283.085 90.2895L284.796 91.1718L283.416 91.0431L283.232 91.3188L281.447 91.0247L280.527 91.2821L278.816 90.8409L279.368 91.8519L277.73 91.4659L275.89 90.7123L275.817 90.3079L274.713 89.7013L272.91 89.2233H271.787L270.076 89.0579L270.941 89.7748L267.776 89.6277L267.058 89.205L264.611 89.0395L263.636 89.1866L263.618 89.4255L262.55 88.8373L262.127 89.0028L260.802 88.7822L259.772 88.6535L259.974 88.3778L261.189 87.8631L261.612 87.5874L261.17 87.1278L260.158 86.7786L258.042 86.3558L256.055 86.3374L255.706 86.558L254.951 86.1168V86.1168ZM225.106 91.9254L223.285 91.135L222.714 90.3446L223.322 89.4439L223.837 88.5248L225.419 87.6609L227.222 87.2197L229.302 86.7786L229.541 86.5029L228.768 86.1536L227.554 86.2639L226.652 86.5948L224.499 86.7602L222.641 87.33L221.39 87.8263L221.85 88.2307L220.635 89.0395L221.353 89.1682L220.359 89.9586L220.654 90.4733L220.028 90.6755L220.378 91.1902L221.831 91.4475L222.236 91.8703L224.702 91.999L225.106 91.9254V91.9254ZM282.882 87.3852L279.589 86.9073L277.712 86.8705L277.086 87.0359L277.712 87.6609L279.994 88.2491L280.822 88.0285L283.434 88.0653L282.882 87.3852V87.3852ZM287.519 87.808L285.366 87.569L283.858 87.4403L284.17 87.7344L286.066 88.1021L287.317 88.1756L287.519 87.808V87.808ZM285.219 89.5542L284.759 89.2969L283.232 88.9476L282.478 89.0395L282.33 89.4072L282.533 89.4439L284.152 89.5542H285.219V89.5542ZM315.138 91.8151L314.034 91.1534L313.776 91.5578L314.42 91.8519L315.138 91.8151ZM202.456 109.075L202.346 108.8L202.382 108.487L201.978 108.322L201.058 108.12L199.898 108.487L199.77 108.965L200.855 109.094L202.456 109.075V109.075ZM310.961 113.083L309.636 111.943L308.698 110.84L307.446 109.774L306.545 109.039L306.306 109.186L307.115 109.7L306.766 110.215L308.017 111.741L309.452 112.844L310.63 114.369L311.071 115.215L312.083 116.465L312.782 117.568L313.629 118.524L313.61 117.641L314.806 118.34L314.254 117.531L312.506 116.373L311.826 114.719L313.463 115.086L310.961 113.083V113.083Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.158 173.503L213.551 173.853L213.294 173.742L212.999 174.073L212.962 174.772L212.815 174.845L212.705 175.489L213.349 175.581L213.662 174.919L214.214 174.992L214.508 174.845L214.582 174.165L214.158 173.503V173.503Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M174.047 139.828H173.899L173.918 140.453L173.292 140.489L172.961 140.765H172.501L172.151 140.6L171.305 140.728L170.955 141.647L170.643 141.721L170.127 143.21L168.692 144.46L168.324 146.077L167.901 146.61L167.772 147.033L165.491 147.125H165.472L165.417 147.621L165.638 147.217L169.612 147.235L169.447 145.544L169.704 144.938L170.661 144.846L170.698 141.85L173.991 141.905L174.028 140.122L174.047 139.901V139.828V139.828Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M229.081 138.137L227.204 138.045L224.131 135.71L222.567 134.883L221.334 134.571L221.169 134.755L219.255 135.324L220.378 136.501L220.065 136.685L219.936 137.089L219.2 137.236L218.998 137.659L218.611 138.027L217.489 137.843L217.397 138.302V138.707L217.286 139.35H217.783L218.372 140.159L219.053 141.096L219.513 141.96L219.826 142.236L220.138 142.843L220.102 143.1L220.488 143.78L221.04 144.019L221.555 144.478L222.218 145.765V146.464L222.383 147.272L223.119 148.394L223.579 148.578L224.334 149.386L224.683 150.342L225.272 151.316L225.824 151.739L225.934 152.199L226.266 152.548L226.431 153.063L226.854 152.677L226.726 152.18L226.946 151.611L227.388 151.923L227.664 151.813L228.842 151.776L229.026 151.905L230.019 152.015L230.406 151.96L230.7 152.346L231.16 152.162L231.804 150.93L232.724 150.397L235.613 149.956L238.575 148.78L239.054 146.445L238.52 145.618L238.336 145.857L235.245 145.269L234.766 144.092L234.693 143.817L234.472 143.376L234.196 143.449L233.865 143.229L233.681 142.934L233.515 142.548L233.202 142.218L233.018 141.832L233.092 141.446L232.982 140.949L232.246 140.471L232.025 140.049L231.491 139.791L230.994 138.78L230.295 138.817L229.982 138.247L229.081 138.137V138.137Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M220.267 153.118L220.341 152.346L220.635 151.978L221.371 151.794L221.85 151.133L221.279 150.691L220.874 150.397L220.414 149L220.212 147.806L220.414 147.585L220.028 146.445H216.017H212.079H208.013L208.105 148.78H206.946V149.276L207.148 153.908L206.265 153.835L205.823 154.699L205.566 155.416L205.786 155.691L205.455 156.041L205.584 156.537L205.326 157.015L205.234 157.456L205.602 157.382L205.823 157.842L205.842 158.522L206.228 158.853V159.147L206.357 159.643L206.964 160.379V160.857L206.817 161.334L206.872 161.702L207.24 162.033L207.332 162.088L207.645 161.959L207.994 161.739L208.234 160.691L208.51 160.158L209.246 159.993L209.43 160.323L209.982 161.004L210.258 161.095L210.626 160.893L211.38 160.948L211.527 161.187H212.539L212.576 160.948L213.11 160.728L213.202 160.379L213.588 160.14L214.471 160.82L214.986 160.691L215.483 159.864L216.035 159.221L215.925 158.504L215.667 158.173L216.293 158.118L216.348 157.842L216.826 157.934L216.734 158.798L216.882 159.643L217.415 160.103L217.544 160.507V161.077L217.691 161.095V160.967L217.949 159.735L218.427 159.404L218.519 158.926L218.942 158.044L219.531 157.456L219.918 156.316L220.046 155.305L219.918 154.846L220.267 153.118V153.118Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M217.544 160.507L217.415 160.103L216.882 159.643L216.734 158.798L216.826 157.934L216.348 157.842L216.293 158.118L215.667 158.173L215.925 158.504L216.035 159.22L215.483 159.864L214.986 160.691L214.471 160.82L213.588 160.14L213.202 160.378L213.11 160.728L212.576 160.948L212.539 161.187H211.527L211.38 160.948L210.626 160.893L210.258 161.095L209.982 161.003L209.43 160.323L209.246 159.992L208.51 160.158L208.234 160.691L207.994 161.739L207.645 161.959L207.332 162.088L208.031 162.547L208.602 163.025L208.62 163.393L209.319 164.018L209.761 164.514L210.037 165.213L210.81 165.672L210.975 166.058L211.619 167.014L212.079 167.161L212.355 166.959L212.834 167.033L213.404 166.794L213.662 167.29L214.582 168.062L215.005 167.749L215.649 168.007L216.477 167.731L217.213 167.749L217.838 167.198L218.464 166.5L219.163 165.728L218.519 164.459L218.041 164.183L217.857 163.724L217.323 163.154L216.698 163.062L217.029 162.4L217.581 162.382L217.728 162.014L217.691 161.095L217.544 161.077V160.507V160.507Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M170.238 155.085L169.575 154.276L168.986 153.412L168.306 153.099L167.827 152.769H167.257L166.742 153.026L166.245 152.934L165.877 153.302L165.638 153.908L165.122 154.717L164.662 154.938L165.159 155.36L165.564 156.279L166.686 156.243L166.926 155.967L167.257 155.949L167.643 156.224L167.974 156.243L168.306 156.04L168.508 156.371L168.066 156.647L167.625 156.629L167.183 156.371L166.797 156.647H166.613L166.355 156.813L165.435 156.794L165.582 157.695L166.134 157.493L166.466 157.529L166.742 157.401L168.637 157.456L169.134 157.474L169.87 157.75L170.109 157.732L170.182 157.603L170.734 157.695L170.882 157.621L170.937 157.254L170.863 156.813L170.477 156.482L170.274 155.802L170.238 155.085V155.085Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M172.17 162.345L171.894 162.4V161.977L171.728 161.665L171.765 161.334L171.544 160.838L171.268 160.415H170.44L170.201 160.636L169.925 160.672L169.741 160.93L169.612 161.242L169.06 161.757L169.189 162.621L169.354 163.044L169.888 163.687L170.642 164.147L170.918 164.238L171.158 163.871L171.213 163.522L171.691 162.897L172.17 162.345Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M92.6448 156.518L92.7552 156.059L92.6264 155.93L92.424 155.838L91.964 155.985L91.9456 155.82L91.6512 155.636L91.4488 155.397L91.1728 155.305L90.9152 155.379L90.952 155.507L90.7496 155.636L90.3632 155.93L90.3264 156.114L90.584 156.353L91.1544 156.426L91.5592 156.665L91.9088 156.776L92.516 156.794L92.6448 156.518V156.518Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M202.603 119.424L202.014 119.148L201.867 118.799L201.334 118.339L200.745 118.303L200.064 118.597L200.34 119.038L200.653 119.369L200.34 119.792H200.671L200.487 120.288L200.984 120.711L200.892 121.244L200.671 121.299L200.947 121.501L201.094 121.648L201.426 121.777L201.794 121.997L201.72 122.108L201.941 122.016L202.033 121.648L202.198 121.575L202.346 121.74L202.53 121.814L202.677 121.997L202.824 122.053L203.026 122.255H203.174L203.082 122.531L202.99 122.659L203.026 122.751L203.339 122.678L203.781 122.659L203.91 122.494L203.799 122.365L203.928 121.997L204.241 121.648L203.726 121.17L203.597 120.747L203.799 120.49L203.615 120.306L203.818 120.104L203.56 119.975L203.302 120.214L202.732 119.884L202.603 119.424V119.424Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M125.912 165.121L125.065 165.213L124.955 165.415L123.722 165.195L123.538 166.242L122.894 166.536L122.949 166.812L122.747 167.419L123.189 168.264L123.52 168.283L123.649 168.926L124.256 169.955L124.826 170.047L124.918 169.808L124.753 169.569L124.845 169.239L125.268 169.349L125.765 169.22L126.353 169.478L126.611 168.981L126.721 168.448L126.905 167.933L126.519 167.253L126.445 166.445L127.016 165.434L125.912 165.121V165.121Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M203.081 114.958L202.18 114.535L201.554 114.682L201.113 114.572L200.597 114.811L200.101 114.406L199.751 114.572L199.696 114.498H199.42L199.309 114.7L199.107 114.756L199.07 115.013L198.905 115.068L198.886 115.178L198.592 115.289L198.187 115.27L198.077 115.528L198.021 115.675L198.15 116.061L198.629 116.355L198.978 116.483L199.733 116.336L199.788 116.116L200.137 116.079L200.561 115.895L200.671 115.969L201.076 115.84L201.26 115.564L201.554 115.491L202.566 115.84L202.75 115.73L202.879 115.27L203.081 114.958V114.958Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M197.93 117.918L197.709 117.532L197.562 117.513L197.396 117.715L196.605 117.734L196.163 117.991L195.39 117.918L195.335 118.469L195.593 118.965L195.39 119.057L196.034 119.094L196.182 118.91L196.513 119.094L196.881 119.112L196.844 118.8L197.157 118.69L197.212 118.23L197.93 117.918Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M201.297 96.6127L200.947 96.2083L200.634 94.6642L199.31 93.9841L198.224 93.4878L197.764 93.5429V94.1863L196.31 94.0209L196.2 94.5907L195.464 94.5723L195.059 95.2892L194.434 96.4105L193.385 97.8626L193.716 98.2119L193.477 98.6163L192.686 98.5979L192.262 99.5721L192.446 100.969L193.017 101.502L192.851 102.771L192.226 103.506L191.913 104.112L192.686 105.656L193.495 106.888L193.863 107.936L194.838 107.881L195.243 107.017L196.292 107.109L196.66 106.098L196.77 104.259L197.617 104.02L198.224 102.807L197.341 102.201L196.678 101.465L197.065 99.9765L198.482 99.0758L199.604 98.2486L199.383 97.6053L200.009 96.8884L201.297 96.6127V96.6127Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.692 202.399L214.195 202.179L213.901 202.271L213.772 202.601L213.478 203.043L213.459 203.447L214.011 204.09L214.618 203.962L214.858 203.447L214.802 202.932L214.692 202.399V202.399Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M220.764 133.156L222.788 131.924L222.954 130.49L222.733 129.626L223.23 129.332L223.616 128.579L222.53 128.781L222.015 128.744L220.966 129.204H220.175L219.623 128.983L218.611 129.314L218.262 129.075L218.28 129.737L218.059 130.012L217.838 130.27L217.654 130.748L217.857 131.667L218.298 131.722L218.519 132.181L218.041 132.623L217.875 133.266L217.93 133.744L217.82 133.928H217.838L218.998 134.387L220.764 133.156V133.156Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M206.946 149.276L202.824 147.034L198.721 144.791L197.727 145.434L198.022 147.254L198.39 147.548L198.426 147.934L198.85 148.339L198.647 148.835L198.316 151.206L198.279 152.732L197.01 153.835L196.586 155.379L197.028 155.802V156.555L197.69 156.592L197.598 157.125L198.003 157.879L198.095 158.651L198.058 159.441L198.629 160.507L198.058 160.489L197.764 160.562L197.304 160.452L197.083 161.004L197.69 161.684L198.15 161.886L198.298 162.364L198.629 163.173L198.463 163.485L199.328 163.412L199.512 163.099L199.678 163.136L199.935 163.393L201.242 162.952L201.665 162.493L202.198 162.088L202.088 161.665L202.382 161.555L203.376 161.629L204.333 161.096L205.069 159.809L205.584 159.349L206.228 159.147V158.853L205.842 158.522L205.823 157.842L205.602 157.382L205.234 157.456L205.326 157.015L205.584 156.537L205.455 156.041L205.786 155.691L205.566 155.416L205.823 154.699L206.265 153.835L207.148 153.908L206.946 149.276V149.276Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M183.633 159.312L182.731 159.294L182.658 159.643L183.099 160.25L183.081 161.095L183.191 162.033L183.449 162.456L183.228 163.503L183.302 164.092L183.578 164.827L183.798 165.231L184.645 164.992L184.387 164.183L184.424 161.5L184.222 161.261L184.185 160.691L183.817 160.268L183.504 159.919L183.633 159.312V159.312Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M290.537 155.489L290.813 154.956L290.721 153.964L289.764 152.953L289.525 151.795L288.623 150.839L287.832 150.765L287.685 151.17L287.096 151.207L286.765 150.986L285.79 151.684L285.606 150.637L285.679 149.405L284.98 149.35L284.814 148.652L284.336 148.302L283.784 148.56L283.269 149.074L282.551 149.129L282.275 150.398L281.87 150.6L282.514 151.629L283.269 152.475L283.802 153.247L283.545 154.276L283.232 154.478L283.545 155.067L284.318 156.004L284.502 156.648L284.538 157.199L285.054 158.265L284.575 159.35L284.17 160.563L283.931 161.684L283.876 162.401L284.097 163.063L284.226 162.364L284.759 162.934L285.348 163.577L285.55 164.166L285.992 164.607L286.158 164.405L287.022 164.919L287.133 165.526L287.814 165.379L288.126 164.901L287.556 164.294L286.93 164.147L286.323 163.485L286.066 162.474L285.587 161.408L284.906 161.372L284.778 160.526L285.035 159.497L285.44 157.787L285.403 156.5L286.305 156.482L286.25 157.401L287.114 157.383L288.09 157.916L287.703 156.5L288.255 155.545L289.562 155.306L290.537 155.489V155.489Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M250.314 125.031L249.928 125.068L249.689 124.737L249.726 124.204L248.548 124.479L248.456 125.215L248.18 125.858L247.37 125.803L247.26 126.317L248.033 126.612L248.474 127.476L248.235 128.689L248.566 128.836L249.174 128.45L249.56 128.689L249.726 128.137L250.314 128.156L250.425 127.99L250.388 127.512L250.701 127.09L251.29 127.365V127.733L251.584 127.788L251.768 128.781L252.246 129.167L252.522 128.928L252.909 128.799L253.369 128.266L254.068 128.358H255.062L254.73 127.678L254.62 127.218L253.976 126.961L253.682 127.071L253.13 125.987L251.382 126.152L250.075 125.784L249.082 125.876L248.971 125.196L250.057 125.398L250.314 125.031V125.031Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M246.91 128.431L246.763 127.696L245.346 127.2L244.205 126.611L243.433 126.06L242.145 125.251L241.353 124.075L240.985 123.854L239.973 123.909L239.55 123.67L239.201 122.77L237.765 122.163L237.158 122.825L236.459 123.229L236.753 123.799L235.686 123.817L235.226 123.873L234.325 122.972L233.625 122.659L232.613 122.898L232.282 123.266L232.742 124.001L232.65 123.174L233.331 122.88L233.773 123.542L234.619 124.222L233.883 124.589L232.908 124.314L232.926 125.27L233.57 125.343L233.497 126.152L234.325 126.538L234.453 127.788L234.785 128.615L235.594 128.394L236.146 127.714L236.79 127.751L237.177 127.531L237.876 127.641L239.072 128.247L239.863 128.376L241.206 129.424L241.924 129.461L242.218 130.472L243.304 130.913L244.021 130.766L244.095 130.214L244.831 130.049L245.291 129.681L245.273 128.725L246.027 128.505L246.082 128.082L246.616 128.394L246.91 128.431V128.431Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M311.531 183.154L312.433 182.823L313.537 182.308L313.942 181.996L313.574 181.849L313.243 181.996L312.507 182.032L311.605 182.29L311.458 182.566L311.55 182.804L311.531 183.154V183.154Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M193.992 133.431L193.624 133.247L193.348 132.696L192.833 132.677L192.63 132.034L193.256 131.446L193.348 130.417L192.998 130.122L192.98 129.571L193.44 128.983L193.366 128.744L192.557 129.185L192.575 128.578L191.895 128.45L190.864 128.928L190.68 129.534L190.864 130.674L190.662 131.648L190.073 132.31L190.183 133.192L191.011 133.891V134.166L191.637 134.644L192.115 136.721L192.594 136.464L192.667 135.968L192.538 135.49L193.219 135.03L193.495 134.663L193.974 134.332L193.992 133.431V133.431Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M217.654 123.781L215.869 122.972L214.305 123.009L213.257 123.321L212.226 124.057L210.405 123.91L210.11 124.792L208.657 124.829L207.718 125.95L208.381 126.501L208.013 127.42L208.785 128.082L209.466 129.259L210.533 129.24L211.527 129.884L212.189 129.737L212.355 129.24L213.404 129.277L214.25 129.92L215.722 129.792L216.293 129.112L217.139 129.387L217.728 129.277L217.415 129.718L217.838 130.27L218.059 130.012L218.28 129.737L218.261 129.075L218.611 129.314L219.623 128.983L220.175 129.203H220.966L222.015 128.744L222.53 128.781L223.616 128.578L224.002 128.395L225.143 128.56L225.529 128.854L225.953 128.652L225.272 127.696L225.401 127.329L224.867 125.987L225.474 125.656L225.033 125.307L224.26 125.031V124.461L224.021 124.057L222.99 123.505L221.997 123.56L220.985 124.149L220.157 124.038L219.089 124.222L217.654 123.781V123.781ZM208.528 124.516L208.896 124.167L210.018 124.093L210.147 123.818L209.282 123.45L209.117 123.009L208.289 122.862L207.369 123.229L207.865 123.524L207.645 124.24L207.442 124.369L207.461 124.608L207.81 125.141L208.528 124.516V124.516Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M305.183 145.526L305.404 143.651L305.422 142.934L304.889 142.585L304.282 143.467L303.932 144.625L304.208 145.489L304.944 146.482L305.183 145.526V145.526Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.526 173.356L214.158 173.503L214.582 174.165L214.508 174.845L214.214 174.992L214.269 175.451L214.49 175.727V176.095L214.232 176.352L213.827 176.959L213.441 177.382L213.33 177.4L213.275 177.896L213.478 178.062L213.441 178.558L213.625 179.036L213.386 179.477L214.214 180.267L214.269 180.984L214.766 182.179L214.821 182.216L215.226 182.418L215.87 182.62L216.458 182.97L217.452 183.19L217.654 183.503L217.728 183.282L218.243 183.907L218.298 185.139L218.63 185.58V185.598L219.016 185.543L220.249 185.874L220.506 185.727L221.224 185.708L221.61 185.359L222.218 185.378L223.358 184.918L224.205 184.238L223.837 183.981L223.432 182.822L223.101 182.106L223.174 181.536L223.119 181.187L223.432 180.47L223.395 180.176L222.751 179.753L222.696 179.091L223.211 177.639L221.739 176.481L221.666 175.801L217.949 173.411L217.434 173.926L217.084 174.459L217.489 174.863L216.9 175.157L216.771 175.01L216.182 175.084L215.722 175.341L215.428 174.9L215.63 174.073L215.667 173.374L214.526 173.356V173.356Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M217.838 167.198L217.213 167.75L216.477 167.731L215.649 168.007L215.005 167.75L214.582 168.062L214.526 169.441L214.95 169.588L214.618 170.011L214.214 170.323L213.827 170.93L213.606 171.481L213.551 172.419L213.312 172.86L213.294 173.742L213.551 173.852L214.158 173.503L214.526 173.356L215.667 173.374L215.612 172.915L216.09 172.235L216.734 172.069L217.176 171.794L217.71 172.014L217.765 172.106V172.051L218.059 171.573L218.556 170.801L218.942 169.937L218.464 168.595L218.335 168.007L217.838 167.198V167.198Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M212.484 111.3L211.601 111.392L211.325 111.337L211.141 111.594L210.81 111.557L210.055 111.612L209.834 111.87L209.871 112.439L209.503 112.329L208.712 112.384L208.436 112.109L208.142 112.311L207.774 112.145L207.074 112.127L206.044 111.851L205.124 111.759L204.443 111.796L204.002 112.09L203.597 112.145L204.167 113.12L204.112 113.45L203.689 113.579L202.99 114.517L203.284 115.031L203.082 114.958L202.879 115.27L202.75 115.73L203.284 116.042L203.394 116.336L203.744 116.097L204.333 116.226H204.922L205.363 116.502L205.658 116.336L206.32 116.226L206.504 115.95H206.89L207.093 115.785L207.682 115.675L208.399 116.024L208.767 116.079L209.227 116.373V116.759L209.577 116.961L209.779 117.439L210.147 117.715L210.11 117.899L210.294 118.009L210.074 118.101L209.522 118.064L209.411 117.899L209.227 117.991L209.319 118.193L209.117 118.561L209.025 118.947L208.804 119.075L209.246 119.277L209.65 119.094L210.092 119.296L210.699 118.45L210.938 117.825L211.766 117.678L211.895 118.119L213.367 118.395L213.68 118.652L212.852 119.038L212.723 119.259L213.79 119.59L213.68 120.123L214.232 120.362L215.391 119.7L216.366 119.498L216.477 119.094L215.538 119.167L215.042 118.891L214.858 118.175L215.575 117.752L216.422 117.697L216.974 117.329L217.691 117.237L217.618 116.722L218.022 116.41L218.887 116.318L218.942 115.932L218.611 115.307L218.85 114.719L218.777 114.37L217.378 114.002L216.845 114.02L216.182 113.487L215.538 113.671L214.324 113.267L214.287 113.046L213.882 112.55L213.146 112.513L213.018 112.164L213.183 111.925L212.484 111.3V111.3Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M130.42 211.663L130.034 210.983L130.383 210.432L129.684 209.641L128.801 208.998L127.66 208.244L127.311 208.281L126.17 207.38L125.544 207.509L125.452 208.447L125.397 209.641L125.599 210.799L125.434 211.057L125.507 211.829L126.225 212.472L126.887 212.435L127.881 212.932L128.378 212.821L129.151 213.042L130.126 212.399L130.42 211.663V211.663Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24.4728 149.846L24.8408 149.68L25.3008 149.423L25.3376 149.349L25.172 148.945L25.0432 148.798L24.896 148.688L24.5464 148.486L24.4728 148.467L24.3992 148.577V148.816L24.1784 149L24.1048 149.129L24.1784 149.552L24.068 149.883L24.2888 150.048L24.4728 149.846V149.846ZM24.3624 148.026L24.4728 147.897L24.252 147.713L23.9208 147.603L23.792 147.695V147.769L23.884 147.861L23.9944 148.118L24.3624 148.026V148.026ZM23.8104 147.401L23.332 147.364L23.2216 147.493L23.7552 147.53L23.8104 147.401V147.401ZM22.9456 147.236L22.7432 146.85L22.688 146.776L22.3752 146.941L22.3936 146.978L22.4672 147.254L22.7984 147.291L22.872 147.309L22.9456 147.236V147.236ZM21.4184 146.464L21.4736 146.188L21.2344 146.169L21.0504 146.28L20.9768 146.372L21.2712 146.574L21.4184 146.464V146.464ZM97.2448 114.627H96.9504L96.7112 115.068H94.8528H91.7616H88.6888H85.9656H83.2608H80.5928H77.8328H76.9496H74.2632H71.7056L71.4112 116.005L70.9696 116.943L70.5464 117.237L70.7488 116.152L69.6816 115.766L69.424 115.987L69.3504 116.52L69.0192 117.512L68.2464 119.038L67.5104 120.068L66.7744 121.097L65.7808 122.163L65.5784 123.027L65.0632 124.001L64.3456 124.957L64.5296 125.582L64.18 126.538L64.456 127.53L64.6952 127.935L64.548 128.211L64.6216 129.865L65.0816 131.06L64.9344 131.703L65.1184 131.887L65.9648 132.016L66.204 132.328L66.7192 132.383L66.7008 132.732L67.1056 132.861L67.492 133.541L67.4368 134.129L68.596 134.038L69.884 133.909L69.7 134.148L71.0064 134.718L72.9752 135.526H74.944H75.7352L75.8824 135.049H77.5936L77.8328 135.453L78.2192 135.821L78.6608 136.335L78.808 136.942L78.8816 137.585L79.2864 137.934L80.0224 138.284L80.9056 137.365L81.7152 137.346L82.2856 137.806L82.58 138.615L82.764 139.295L83.2056 139.956L83.2424 140.784L83.3896 141.335L84.1072 141.703L84.7696 141.96L85.156 141.923L85.0456 141.519L85.1192 140.949L85.3032 140.14L85.6528 139.626L86.3336 139.056L87.4376 138.559L88.56 137.695L89.4616 137.42L90.1056 137.346L90.7496 137.604L91.6512 137.457L92.2584 138.082L92.9576 138.118L93.3992 137.898L93.712 138.063L93.9512 137.916L93.7856 137.677L93.9144 137.218L93.8224 136.905L94.264 136.721L95.0368 136.648L95.9016 136.776L97.0424 136.629L97.5944 136.905L97.9624 137.457L98.128 137.512L99.2504 136.979L99.6 137.162L100.152 138.137L100.299 138.78L99.9312 139.552L100.005 140.012L100.299 140.912L100.667 141.923L100.998 142.181L101.072 142.695L101.55 142.842L101.863 142.695L102.231 141.978L102.36 141.519L102.526 140.728L102.305 139.368L102.397 138.872L102.121 138.045L101.992 137.052L102.01 136.243L102.342 135.416L102.986 134.718L103.666 134.166L104.936 133.413L105.175 133.008L105.782 132.585L106.298 132.512L107.107 131.813L108.211 131.464L109.058 130.582L109.223 129.387L109.242 128.983L108.984 128.909L109.26 127.769L108.708 127.383L109.297 127.567V126.814L109.646 126.317L109.462 127.292L109.83 127.751L109.297 128.56L109.37 128.597L110.18 127.659L110.622 127.2L110.732 126.74L110.566 126.538L110.548 125.894L110.769 126.189L110.971 126.262L110.953 126.556L111.91 125.656L112.37 124.828L112.112 124.773L112.498 124.442L112.425 124.589H113.032L114.467 124.24L114.265 124.02L112.811 124.24L113.694 123.909L114.265 123.854L114.706 123.799L115.461 123.597L115.902 123.615L116.602 123.431L116.786 123.119L116.583 122.862L116.546 123.266L116.16 123.248L116.05 122.641L116.252 122.034L116.51 121.795L117.227 121.115L118.313 120.784L119.417 120.398L120.576 119.847L120.539 119.479L120.153 118.836L120.668 117.274L120.392 116.943L119.711 117.145L119.509 116.832L118.497 117.696L117.908 118.597L117.411 119.112L116.951 119.277L116.638 119.332L116.454 119.626H114.743H113.326L112.83 119.847L111.597 120.619L111.634 120.784L111.523 121.226L110.677 121.593L109.959 121.501L109.223 121.465L108.745 121.593L108.69 121.924L108.671 122.034L107.604 122.714L106.776 123.045L106.242 123.192L105.562 123.505L104.826 123.67L104.366 123.615L103.869 123.376L104.366 122.935L104.734 122.531L105.414 121.906L105.543 121.446L105.635 120.803L105.341 120.674L104.55 121.189L104.384 121.17L104.439 120.895L105.138 120.435L105.433 119.92L105.562 119.406L105.065 118.965L104.384 118.726L104.071 119.167L103.814 119.277L103.409 119.847L103.482 119.461L103.004 119.737L102.618 120.104L102.139 120.674L101.9 121.152L101.918 121.851L101.587 122.586L100.98 123.137L100.722 123.303L100.428 123.431H100.097L100.042 123.358L100.023 122.751L100.152 122.457L100.281 122.181L100.391 121.63L100.851 120.987L101.385 120.196L102.231 119.332H102.102L101.109 120.068L101.035 119.939L101.569 119.516L102.434 118.781L103.114 118.689L103.924 118.45L104.605 118.579H104.623L105.488 118.487L105.212 118.027L104.991 117.99L104.734 117.935L104.66 117.623L103.722 117.715L102.802 117.972L102.342 117.549L101.882 117.402L102.452 116.796L101.477 117.163L100.575 117.549L99.7288 117.825L99.3424 117.439L98.3304 117.678L98.404 117.512L99.2504 117.035L100.115 116.575L101.201 116.189L100.226 115.895L99.416 116.042L98.7168 115.693L97.8704 115.509L97.2816 115.435L97.0976 115.252L97.2448 114.627V114.627ZM52.9744 106.006L54.244 105.491V105.16L53.7656 105.087L53.14 105.252L51.9624 105.638L51.5576 106.134L51.6864 106.428L52.9744 106.006V106.006ZM45.8536 102.991L46.2768 102.568L45.7432 102.476L44.6944 102.66L44.8416 102.954L45.136 103.156L45.8536 102.991V102.991ZM46.0744 98.8919L45.504 99.2963L45.5776 99.3882L46.3504 99.3147L46.4056 99.5169L46.7184 99.7375L47.62 99.5169L47.8408 99.4066L47.2336 99.2595L46.9392 98.9838L46.3136 99.0941L46.0744 98.8919V98.8919ZM69.056 91.5025L68.2464 91.3003L66.3696 91.815L65.7808 91.7598L63.7568 92.1826L62.8736 92.2929L61.4384 92.7524L60.5552 93.2304L58.9728 93.6899L57.5744 93.7083L56.4152 94.2414L57.004 94.5538L57.1328 94.9766L56.9856 95.4729L57.4088 95.8589L57.188 96.5023L55.4952 96.5391L56.2864 96.0244H55.6608L53.2504 96.5207L51.576 96.9434L51.76 97.55L51.5392 97.9544L52.3672 98.2118L53.6368 98.0831L53.968 98.3221L54.5016 98.0831L55.624 97.8625H56.1208L55.0352 98.2485L55.2376 98.4324L54.7776 98.9103L53.7656 99.2412L53.3056 99.1492L52.0176 99.6455L51.6864 99.4801L50.932 99.5536L49.9568 100.105L48.5584 100.675L47.4912 101.3L47.5464 101.741L46.8104 102.348L47.068 102.605L47.16 103.101L48.4848 102.899L48.5584 103.285L47.9512 103.671L47.2888 104.314H47.804L49.1288 103.892L48.8344 104.425L49.4968 104.039L49.4232 104.59L50.3064 104.186L50.38 104.388L51.7048 104.057L50.564 104.682L49.5152 105.509L48.4664 105.895L48.0432 106.116L46.148 106.778L45.2464 107.219L44.0504 107.347L42.4864 107.954L41.272 108.285L39.7816 108.8L39.708 108.983L41.548 108.671L42.652 108.303L43.9216 107.936L45.044 107.623L45.5592 107.715L47.0496 107.237L47.8776 106.722L49.8096 106.153L50.5272 105.675L51.7416 105.344L53.14 104.884L54.7776 104.112L54.7408 103.579L56.7832 102.826L58.1448 102.109L59.8376 101.52L59.764 101.778L58.5312 102.109L57.004 103.156L56.4152 103.8L57.5928 103.561L58.7152 103.212L59.9112 102.973L60.4448 102.917L61.0888 102.164L62.248 101.943L62.7264 102.403L63.8304 102.899L65.0632 102.807L66.112 103.175L66.7008 103.377L67.308 104.498L67.9888 104.811L69.2952 104.848L70.0496 104.921L69.5528 105.932L69.8472 106.833L69.24 107.789L69.7 108.138L69.8104 108.542L70.7488 108.009L71.3192 107.329L70.4728 106.631L70.7488 105.381L70.9512 104.609L70.6384 104.112L70.5096 103.671L70.6016 103.12L69.424 103.469L68.0256 104.076L67.9888 103.359L67.8784 102.881L67.3816 102.587L66.6088 102.568L73.1224 96.6126L77.5936 92.8995L76.9496 92.7708L76.1952 92.4767L74.9992 92.6238L74.5944 92.4951L73.288 92.4032L72.1472 92.1091L71.264 92.201L70.3624 92.0356L70.7304 91.815L69.5712 91.7598L68.964 91.9436L69.056 91.5025V91.5025Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M249.523 122.714L249.063 122.935L248.07 123.725L247.904 124.552H247.554L247.131 124.001L245.917 123.964L245.438 123.045L244.978 123.027L244.702 121.887L243.322 121.06L241.74 121.152L240.691 121.317L239.495 120.306L238.612 119.883L236.938 119.056L236.735 118.964L234.546 119.626L235.686 123.817L236.754 123.799L236.459 123.229L237.158 122.824L237.766 122.163L239.201 122.769L239.55 123.67L239.974 123.909L240.986 123.854L241.354 124.074L242.145 125.251L243.433 126.06L244.206 126.611L245.346 127.199L246.763 127.696L246.91 128.431H247.444L248.235 128.688L248.474 127.475L248.033 126.611L247.26 126.317L247.37 125.802L248.18 125.857L248.456 125.214L248.548 124.479L249.726 124.203L249.689 124.736L249.928 125.067L250.314 125.03L251.069 125.141L252.026 124.313L250.719 123.707L250.13 124.001L249.284 123.578L249.854 122.824L249.523 122.714V122.714Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M121.128 162.383L120.723 162.107L120.19 162.144L120.061 161.206L119.306 160.618L118.497 160.544L118.166 159.993L119.049 159.644L117.816 159.662L116.546 159.736L116.51 160.03L115.921 160.379L115.148 160.25L114.578 159.717L113.474 159.846L112.554 159.828L112.535 159.442L111.891 158.798L111.174 158.78L110.861 157.953L110.474 158.32L110.585 158.872L109.278 159.35V160.232L109.573 160.636L109.297 161.482L108.855 161.555L108.506 160.636L109.002 159.956L109.058 159.35L108.745 158.817L109.352 158.67L109.407 158.394L108.726 158.596L108.432 159.184L108.027 159.515L107.696 159.956L107.53 160.783L107.199 161.464L107.733 161.555L107.843 162.089L108.046 162.346L108.119 162.805L107.972 163.247L108.009 163.486L108.248 163.596L108.487 164L109.812 163.89L110.401 164.037L111.1 165.048L111.523 164.919L112.259 164.974L112.848 164.846L113.216 165.048L112.995 165.673L112.756 166.059L112.664 166.904L112.848 167.677L113.124 168.026L113.161 168.301L112.627 168.871L112.995 169.129L113.253 169.533L113.566 170.709L114.118 171.334L114.927 171.243L115.13 170.893L115.902 170.618L116.326 170.434L116.454 169.937L117.209 169.607L117.154 169.349L116.27 169.257L116.142 168.522L116.197 167.732L115.755 167.438L115.939 167.327L116.712 167.474L117.522 167.768L117.834 167.493L118.57 167.309L119.748 166.868L120.134 166.427L120.006 166.096L119.325 165.213L119.619 164.883V164.349L120.245 164.147L120.521 163.927L120.171 163.504L120.282 163.081L121.128 162.383V162.383Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M292.174 146.96L291.089 146.666L290.537 146.188L290.574 145.508L289.617 145.305L289.065 144.864L288.31 145.489L287.335 145.618H286.544L286.047 145.894L286.783 146.831L287.409 147.879L288.66 147.897L289.212 148.908L288.605 149.221L288.366 149.643L289.709 150.342L290.758 151.721L291.549 152.75L292.432 153.559L292.8 154.386L292.763 155.562L293.094 156.334L293.113 157.75L291.475 158.65L291.99 159.349L290.923 159.441L290.058 159.9L290.886 160.58L290.647 161.371L291.07 162.106L292.285 161.022L293.039 160.047L294.162 159.294L294.953 158.522L294.879 156.463L294.143 154.312L293.389 153.375L292.358 152.64L291.181 151.114L290.206 149.882L290.298 149.074L290.978 147.971L292.174 146.96V146.96Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M354.182 191.425L353.686 190.763L353.575 191.076L353.814 191.59L354.182 191.425ZM353.814 189.642L353.391 189.274L353.226 190.175L353.318 190.506L353.538 190.432L353.778 190.58L353.814 189.642V189.642Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M236.956 152.695L236.57 151.887L235.613 149.957L232.724 150.398L231.804 150.931L231.16 152.162L230.7 152.346L230.406 151.96L230.019 152.015L229.026 151.905L228.842 151.776L227.664 151.813L227.388 151.923L226.946 151.611L226.726 152.181L226.854 152.677L226.431 153.063L226.505 153.559L226.394 153.798L226.523 154.331L226.321 154.387L226.634 154.864L226.873 155.728L227.057 156.078V156.703L227.351 157.401L228.069 157.456L228.4 157.291L228.897 157.328L229.044 157.015L229.32 156.942L229.522 156.629L229.78 156.556L230.645 156.5L231.289 156.28L231.859 155.784L232.172 155.857L232.614 155.802L233.478 154.975L235.098 154.423L236.073 153.927V153.541L236.238 153.008L236.956 152.695V152.695Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.269 198.189L213.735 198.079L213.386 198.226L212.907 198.024L212.502 198.005L211.03 198.869L210.074 199.733L209.706 200.524L209.393 200.965L208.841 201.057L208.62 201.608L208.51 201.976L207.847 202.252L207.038 202.196L206.578 201.866L206.154 201.718L205.658 201.994L205.382 202.564L204.885 202.913L204.37 203.428L203.634 203.557L203.431 203.134L203.56 202.435L203.008 201.314L202.75 201.13L202.548 205.468L201.628 206.057L201.094 206.148L200.487 205.928L200.046 205.836L199.898 205.34L199.512 205.009L199.015 205.597L199.659 207.104V207.123L200.119 208.097L200.708 209.2L200.671 210.082L200.358 210.303L200.616 211.075L200.579 211.773L200.69 212.086L200.745 211.92L201.131 212.453L201.462 212.472L201.849 212.895L202.29 212.858L202.934 212.417L203.781 212.233L204.811 211.773L205.216 211.828L205.823 211.681L206.872 211.902L207.369 211.681L207.958 211.865L208.105 211.534L208.602 211.479L209.669 211.02L210.46 210.487L211.214 209.788L212.447 208.593L213.073 207.748L213.404 207.159L213.864 206.553L214.085 206.387L214.802 205.799L215.097 205.266L215.299 204.31L215.612 203.446H214.858L214.618 203.961L214.011 204.09L213.459 203.446L213.478 203.042L213.772 202.601L213.901 202.27L214.195 202.178L214.692 202.399L214.618 201.976L214.876 200.671L214.674 199.844L214.269 198.189V198.189ZM210.57 207.895L210.202 208.005L209.522 207.104L210.11 206.369L210.681 205.909L211.159 205.671L211.582 206.038L211.895 206.387L211.546 206.957L211.343 207.343L210.773 207.527L210.57 207.895V207.895Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.453 182.198L214.103 182.106L214.177 181.867L213.993 181.812L212.613 182.014L212.318 182.142L212.024 182.896L212.245 183.411L212.024 184.789L211.877 185.966L212.134 186.168L212.852 186.628L213.128 186.407L213.183 187.675H212.392L212.006 187.032L211.638 186.517L210.846 186.37L210.626 185.745L210 186.113L209.172 185.947L208.841 185.433L208.197 185.322L207.718 185.341L207.663 184.973L207.314 184.955L207.406 185.322L207.277 185.874L207.442 186.425L207.277 186.866L207.369 187.271L205.234 187.252L205.087 190.984L205.75 191.94L206.394 192.675L207.24 192.399L207.902 192.473L208.289 192.73V192.822L208.473 192.914L209.614 193.043L209.926 193.171L210.276 193.153L210.865 192.399L211.803 191.425L212.171 191.333L212.3 190.929L212.907 190.469L213.68 190.304L213.625 189.477L216.771 188.521L216.238 188.208L216.587 187.124L216.918 186.719L216.753 185.745L216.974 184.808L217.158 184.477L216.937 183.484L216.458 182.97L215.87 182.62L215.226 182.418L214.821 182.216L214.766 182.179L214.858 182.381L214.674 182.455L214.453 182.198V182.198Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.269 198.19L215.409 196.866L215.704 196.021L215.869 195.911L216.017 195.23L215.869 194.881L215.961 194.017L216.201 193.208L216.256 191.72L215.741 191.352L215.262 191.26L215.06 190.966L214.581 190.727L213.735 190.745L213.68 190.304L212.907 190.47L212.3 190.929L212.171 191.334L211.803 191.425L210.865 192.4L210.276 193.153L209.926 193.172L209.613 193.043L208.473 192.914L208.822 193.852L209.025 194.054L209.319 194.734L210.423 196.021L210.846 196.15L210.828 196.554L211.104 197.308L211.877 197.473L212.502 198.006L212.907 198.024L213.385 198.227L213.735 198.08L214.269 198.19V198.19Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M228.106 159.955L227.627 159.459L227.407 158.981L227.075 158.761L226.707 159.386L226.505 159.808L226.91 160.452L227.296 161.021L227.701 161.426L231.105 162.823L231.988 162.805L229.155 166.315L227.793 166.371L226.891 167.198L226.229 167.216L225.953 167.584L225.07 168.907L225.107 173.172L225.714 174.146L225.953 173.87L226.192 173.245L227.315 171.83L228.29 170.948L229.817 169.771L230.847 168.834L232.025 167.234L232.89 165.929L233.736 164.22L234.325 162.713L234.785 161.407L235.024 160.158L235.227 159.735L235.19 159.11L235.263 158.43L235.227 158.117H234.84L234.362 158.522L233.828 158.632L233.368 158.797L233.037 158.834L232.448 158.871L232.099 159.073L231.583 159.165L230.7 159.514L229.578 159.661L228.621 159.955H228.106V159.955Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M128.378 169.239L128.709 168.375L129.353 167.309L129.187 166.831L128.12 165.838L127.366 165.562L127.016 165.434L126.446 166.445L126.519 167.253L126.906 167.933L126.722 168.43L126.611 168.963L126.354 169.478L126.795 169.717L127.126 169.386L127.347 169.441L127.494 169.772L127.991 169.68L128.378 169.239V169.239Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M191.729 122.843L191.526 121.887L190.938 122.31L190.754 122.733L191.011 123.505L191.453 123.726L191.729 122.843ZM185.933 113.487L185.491 113.046L185.086 113.027L184.958 112.623L184.166 112.844L183.909 113.781L181.83 114.663L180.983 114.185L181.241 115.472L179.732 115.178L178.554 115.417L178.628 116.263L180.008 116.704L180.67 117.274L181.609 118.468L181.425 120.729L180.928 121.409L181.296 121.851L183.026 122.365L183.375 122.126L184.424 122.641L185.528 122.494L185.62 121.814L186.982 121.446L188.822 121.74L189.65 121.115L189.742 120.619L189.245 120.472L188.969 119.59L189.282 119.259L188.987 118.818L189.024 118.505L188.693 118.009L188.251 118.174V117.66L188.895 117.016L188.858 116.722L189.282 116.832L189.521 116.649L189.613 115.821L190.036 115.049L188.73 114.829L188.288 114.535L188.03 114.553L187.828 114.461L187.018 113.947L186.558 114.02L185.933 113.487V113.487Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M184.24 126.869V126.832H184.148L184.093 126.759L184.074 126.795L184.056 126.832V126.869H184.148L184.222 126.887L184.24 126.869ZM184.093 126.575H184.148L184.258 126.446V126.391L184.203 126.354L184.001 126.391L183.964 126.446V126.501L183.909 126.52L183.89 126.593L183.909 126.63L184.056 126.648L184.093 126.575V126.575ZM180.928 121.41L179.419 121.373L178.646 121.428L177.653 121.244H176.402L175.261 121.042L173.899 121.869L174.267 122.347L174.194 123.156L174.543 122.862L174.93 122.696L175.15 123.266H175.702L175.868 123.119L176.42 123.156L176.659 123.726L176.218 124.038L176.181 124.939L176.015 125.104L175.96 125.656L175.555 125.748L175.923 126.446L175.629 127.237L175.96 127.586L175.813 127.898L175.445 128.358L175.518 128.744L176.402 128.928L176.659 129.608L177.027 130.012L177.487 130.123L177.874 129.663L178.481 129.24L179.401 129.259H180.634L181.333 128.34L182.05 128.101L182.271 127.329L182.823 126.795L182.455 126.115L182.823 125.178L183.394 124.535L183.486 124.148L184.7 123.91L185.583 123.137L185.528 122.494L184.424 122.641L183.375 122.127L183.026 122.365L181.296 121.851L180.928 121.41V121.41ZM185.712 125.564L185.73 125.509L185.749 125.472L185.767 125.454L185.73 125.417V125.398L185.767 125.362L185.73 125.343L185.491 125.417L185.362 125.49L184.976 125.766V125.821L184.994 125.858H185.068L185.105 125.932L185.178 125.858L185.234 125.84L185.289 125.858L185.344 125.895L185.362 126.005L185.381 126.042L185.491 126.06L185.657 126.134L185.73 126.097L185.822 126.042L185.859 125.932L185.914 125.84L185.97 125.748L186.025 125.674L186.006 125.601L185.951 125.582L185.896 125.564L185.804 125.601L185.712 125.564V125.564ZM186.816 125.509L186.834 125.435V125.417L186.742 125.288L186.577 125.233L186.393 125.251L186.374 125.27V125.343L186.393 125.362L186.503 125.38L186.798 125.509H186.816V125.509Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M110.934 157.603L110.916 157.585L110.861 157.475L110.806 157.419L110.787 157.438L110.769 157.493L110.824 157.548L110.879 157.622L110.934 157.64V157.603V157.603Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M118.533 150.857L118.551 150.82L118.514 150.802L118.368 150.893V150.911L118.533 150.857Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M184.314 122.457L184.332 122.421L184.35 122.384V122.366L184.314 122.347L184.185 122.31L184.13 122.292L184.093 122.31L184.056 122.347L184.038 122.402L184.056 122.421V122.457V122.494L184.074 122.531H184.111H184.148L184.203 122.513L184.295 122.457H184.314V122.457Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119.711 152.254L119.748 152.235V152.217V152.18L119.73 152.162L119.711 152.125L119.638 152.088L119.546 152.18V152.217L119.564 152.272L119.674 152.291L119.711 152.254V152.254ZM119.748 151.61V151.519L119.73 151.482H119.674L119.656 151.463H119.638L119.619 151.482L119.638 151.592L119.73 151.647L119.748 151.61V151.61Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M108.69 147.382L108.727 147.272L108.671 147.254L108.579 147.382L108.469 147.438H108.414L108.285 147.382H108.193L108.119 147.474L108.009 147.493L108.027 147.511V147.548L107.991 147.603V147.64L108.009 147.695L108.285 147.677L108.524 147.64L108.653 147.474L108.69 147.382V147.382ZM108.837 147.015L108.763 146.96L108.69 147.015L108.708 147.07L108.837 147.015V147.015ZM108.837 145.949L108.763 145.912L108.708 146.004L108.763 146.022L108.892 146.004L108.984 146.022L109.076 146.096L109.131 146.059L109.113 146.041L109.039 145.985L108.929 145.967H108.892L108.837 145.949V145.949ZM107.623 146.188L107.751 146.077L107.88 146.022L108.046 145.82L108.027 145.655L108.064 145.581L107.954 145.599L107.935 145.655L107.917 145.71L107.972 145.783V145.82L107.935 145.894L107.88 145.912L107.862 145.949L107.807 145.967L107.733 146.059L107.586 146.169L107.549 146.224L107.623 146.188V146.188ZM107.843 145.599L107.733 145.563L107.696 145.489L107.623 145.471L107.604 145.508V145.544L107.623 145.618L107.659 145.599L107.807 145.673L107.88 145.618L107.843 145.599V145.599ZM107.089 145.397V145.269L107.015 145.177L106.905 145.103L106.887 144.883L106.831 144.754L106.795 144.644L106.721 144.497V144.588L106.739 144.607L106.758 144.717L106.831 144.883L106.85 144.956L106.831 145.03L106.758 145.048L106.739 145.085L106.831 145.14L106.979 145.195L107.071 145.434L107.089 145.397V145.397ZM106.335 144.754L106.243 144.699L106.206 144.644L106.077 144.515L106.022 144.497L105.985 144.57L106.059 144.588L106.224 144.717L106.298 144.754H106.335V144.754ZM107.678 144.019L107.659 143.963H107.641L107.586 143.982L107.531 144.147H107.586L107.678 144.019ZM104.439 143.816L104.403 143.761L104.347 143.798H104.255L104.219 143.816H104.145L104.09 143.853L104.163 144L104.219 144.055L104.237 144.239L104.274 144.258L104.255 144.386L104.458 144.405L104.531 144.258V144.202V144.184V144.147V144.111V143.945L104.476 143.853L104.403 143.963L104.329 143.908L104.439 143.835V143.816V143.816ZM106.813 143.872L106.629 143.614V143.577L106.537 143.302L106.482 143.283L106.463 143.302L106.445 143.338L106.519 143.412V143.486L106.574 143.522L106.647 143.725L106.721 143.798L106.703 143.853L106.629 143.908L106.611 143.945H106.629L106.739 143.927H106.813V143.872V143.872ZM104.881 142.916L104.973 142.879L104.918 142.842H104.789L104.715 142.861L104.679 142.897L104.697 142.916L104.771 142.934L104.881 142.916V142.916ZM104.439 143.283L104.347 143.173L104.292 143.008L104.255 142.934L104.274 142.842L104.219 142.769L104.108 142.695L104.053 142.714L104.071 142.916L104.035 143.026L103.887 143.228L103.906 143.302L103.924 143.338L103.832 143.412V143.357L103.722 143.375L103.777 143.467L103.887 143.541L103.943 143.559L103.998 143.522V143.614L104.053 143.688L104.071 143.761L104.127 143.706L104.237 143.669L104.274 143.633L104.403 143.559V143.522L104.421 143.412L104.439 143.283V143.283ZM105.672 142.364L105.617 142.272L105.599 142.291L105.58 142.364L105.525 142.438L105.617 142.419L105.691 142.438L105.801 142.53L105.93 142.566L105.985 142.677L106.095 142.787V142.897L106.022 143.008L106.003 143.136L105.893 143.155L105.911 143.173L105.967 143.228L105.985 143.302L106.022 143.338V143.21L106.077 143.063L106.151 142.824L106.132 142.769L106.077 142.714L105.948 142.548L105.819 142.493L105.672 142.364V142.364ZM104.053 140.912L103.961 140.839L103.924 140.912V140.931L103.906 140.986L103.814 141.059L103.722 141.078L103.593 140.967L103.556 140.949L103.703 141.151L103.759 141.169H103.832L103.998 141.114L104.292 141.022L104.605 140.986L104.623 140.949L104.605 140.894L104.458 140.931L104.274 140.912L104.237 140.949H104.163L104.053 140.912V140.912ZM105.175 141.868L105.212 141.813L105.286 141.482L105.433 141.372L105.451 141.151L105.359 141.059L105.286 141.022L105.267 140.986L105.286 140.949L105.249 140.931L105.194 140.894L105.12 140.783L105.047 140.71L104.918 140.692L104.807 140.673L104.734 140.655L104.642 140.71H104.789L105.065 140.765L105.194 141.041L105.286 141.114L105.304 141.188L105.267 141.261V141.335L105.212 141.427L105.194 141.574L105.139 141.647L105.01 141.739L105.083 141.776L105.139 141.886L105.175 141.868V141.868Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M118.957 134.424L119.03 134.313H119.012L118.92 134.405L118.81 134.442L118.828 134.461H118.846L118.957 134.424Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M121.662 156.868L121.735 156.794L121.68 156.739L121.57 156.592L121.514 156.611V156.794L121.533 156.85L121.625 156.905L121.662 156.868V156.868Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M227.682 186.573L227.609 186.499H227.535V186.536L227.554 186.609L227.756 186.646L227.682 186.573V186.573ZM228.4 186.297H228.382L228.345 186.315L228.326 186.352L228.308 186.407H228.253H228.216H228.142L228.29 186.499L228.382 186.591L228.418 186.628L228.437 186.591L228.455 186.462L228.4 186.297ZM227.37 186.095L227.406 186.04L227.37 185.911L227.296 185.764L227.314 185.506L227.278 185.47H227.222L227.204 185.488L227.186 185.543L227.13 185.911L227.204 186.021L227.259 186.04L227.351 186.113L227.37 186.095Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M157.817 154.791L157.836 154.717L157.799 154.607L157.744 154.589L157.633 154.662L157.615 154.717L157.633 154.772L157.689 154.828L157.744 154.846L157.817 154.791V154.791ZM158.977 154.478L159.05 154.442V154.313L159.032 154.258H158.958L158.922 154.331V154.35V154.423L158.958 154.478H158.977ZM158.719 154.625L158.627 154.46L158.572 154.442L158.462 154.313V154.258L158.406 154.239V154.276V154.35L158.369 154.442V154.533L158.443 154.681L158.517 154.717L158.646 154.736L158.719 154.625V154.625ZM159.29 153.192V153.284L159.234 153.412L159.326 153.467L159.382 153.486L159.492 153.412L159.529 153.32L159.51 153.265L159.455 153.21L159.4 153.192L159.382 153.21L159.29 153.192V153.192ZM158.112 152.732L157.928 152.714L157.817 152.677H157.799V152.732L157.873 152.879L157.909 152.787L157.946 152.769L158.093 152.806L158.167 152.787L158.149 152.769L158.112 152.732V152.732ZM159.345 152.695L159.326 152.603V152.475H159.29L159.234 152.511L159.253 152.64L159.271 152.659L159.308 152.75L159.345 152.695V152.695ZM157.302 152.511V152.475L157.247 152.383L157.192 152.401L157.118 152.438L157.1 152.493L157.173 152.53H157.21L157.302 152.511V152.511ZM157.026 152.346L157.173 152.236L157.21 152.181L157.173 152.089L157.081 152.07L156.861 152.181L156.842 152.217L156.861 152.273L156.879 152.364L156.916 152.383L157.026 152.346Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M99.968 149.552L99.9496 149.497L99.9312 149.515V149.625H100.023H100.06L100.115 149.589H100.226L100.207 149.552L100.06 149.534L100.042 149.552L100.005 149.57L99.968 149.552V149.552ZM101.44 149.129L101.422 149.111H101.403L101.348 149.129H101.33H101.311L101.293 149.148L101.274 149.166H101.311L101.385 149.129H101.422H101.44V149.129ZM101.587 149.111L101.679 149.074L101.661 149.056H101.642L101.624 149.074H101.606L101.514 149.129H101.55L101.587 149.111Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119.987 154.331L120.042 154.202L120.024 154.018L119.987 153.945L119.84 153.89V153.926L119.822 154.018L119.877 154.165L119.895 154.368L119.987 154.331V154.331Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M130.015 232.931L129.997 232.876L129.923 232.839L129.886 232.821L129.905 232.857L129.923 232.912L129.942 232.949L129.978 232.968L130.015 232.931V232.931ZM131.027 232.692L131.009 232.674H130.972L130.954 232.71L130.99 232.765L131.064 232.784L131.027 232.692V232.692ZM128.654 232.435L128.635 232.471L128.562 232.49L128.598 232.545L128.709 232.618H128.782L128.801 232.563L128.782 232.453H128.727L128.654 232.435V232.435ZM129.169 232.067L129.003 232.012L128.93 231.957H128.874L128.948 232.03L128.966 232.067L128.985 232.104L129.095 232.159L129.206 232.214L129.279 232.269L129.261 232.288L129.114 232.343H129.058L129.022 232.361L129.095 232.398L129.206 232.379L129.242 232.361H129.279L129.334 232.379V232.416L129.316 232.453L129.279 232.49L129.206 232.545L129.095 232.618H128.948L128.819 232.747L128.985 232.839L129.114 232.894H129.279V232.876L129.316 232.857H129.371L129.39 232.839L129.426 232.765V232.655H129.463L129.518 232.674L129.647 232.655L129.702 232.637L129.813 232.471L129.886 232.324L129.923 232.251L129.978 232.214L129.997 232.177L130.015 232.122L130.07 232.085V232.03L129.997 231.993L129.942 231.957L129.886 232.012L129.85 231.993L129.684 232.049H129.61L129.555 232.012L129.482 231.993L129.408 232.012L129.316 232.104L129.169 232.067V232.067ZM129.298 231.993L129.316 231.938L129.298 231.902L129.206 231.865H129.114L129.15 231.957L129.187 231.993H129.298V231.993ZM130.383 231.865H130.31L130.383 231.957L130.236 232.104L130.273 232.214L130.328 232.288L130.346 232.324L130.328 232.343L130.254 232.361L130.199 232.379L130.162 232.435L129.997 232.6L130.034 232.637L129.978 232.765L130.015 232.821L130.162 232.949L130.31 233.023V232.894L130.383 232.876L130.457 232.912L130.53 232.876L130.365 232.692H130.42L130.88 232.784L130.862 232.71L130.843 232.674L130.788 232.6L131.064 232.526L131.156 232.471L131.193 232.416L131.303 232.398L131.45 232.343L131.432 232.324L131.45 232.269L131.377 232.232L131.285 232.214L131.303 232.159L131.395 232.14L131.248 232.012L131.193 231.993L131.009 232.012L130.954 232.03V232.067L130.972 232.122L131.027 232.177L131.046 232.214L131.009 232.196L130.806 232.122L130.77 232.104L130.733 232.03L130.77 232.012L130.825 232.03L130.843 231.975L130.77 231.92L130.696 231.902L130.53 231.92L130.383 231.865V231.865Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M177.248 101.355V101.3L177.23 101.245V101.208H177.211L177.119 101.19L177.101 101.153H177.082V101.19L177.101 101.263L177.193 101.337L177.248 101.373H177.266L177.248 101.355V101.355ZM177.34 100.969V100.951L177.303 100.914L177.211 100.877L177.174 100.859L177.138 100.877V100.914L177.156 100.932L177.23 100.951L177.303 101.006H177.322L177.34 100.969V100.969ZM176.898 100.62L176.862 100.601L176.77 100.62H176.714L176.733 100.675L176.843 100.712H176.898H176.954L176.99 100.693L176.972 100.657L176.898 100.62V100.62ZM177.358 100.528L177.211 100.491L177.101 100.436L176.917 100.454L177.046 100.657L177.193 100.785L177.266 100.822V100.804V100.767L177.193 100.675L177.174 100.657V100.638L177.193 100.62H177.23L177.285 100.657H177.322L177.358 100.528V100.528ZM177.542 100.491L177.487 100.454L177.414 100.381V100.473V100.528V100.546H177.432L177.487 100.565L177.542 100.491Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119.306 158.118L119.398 158.081L119.435 157.879L119.38 157.86L119.325 157.915L119.27 158.007V158.081L119.233 158.136L119.306 158.118V158.118Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M298.302 146.206V146.17V146.133L298.228 146.096H298.173L298.191 146.133L298.265 146.225L298.302 146.206ZM298.062 146.206L298.044 146.115L298.081 146.059L297.915 146.115L297.897 146.17V146.188L297.934 146.206H298.062V146.206ZM298.357 145.986L298.338 145.931L298.302 145.912L298.283 145.857L298.265 145.82L298.21 145.802L298.173 145.784H298.099L298.081 145.802H298.044L298.007 145.839V145.876L297.915 145.949V145.986L297.97 146.023L298.062 146.004L298.173 146.041L298.32 146.096V146.059V146.004L298.357 145.986V145.986Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M118.902 152.144V152.089L118.865 152.052H118.81V152.144L118.846 152.181L118.902 152.144ZM118.81 152.015L118.791 151.978L118.773 151.96L118.736 151.887L118.662 151.813L118.626 151.831L118.607 151.868V151.887L118.662 151.942L118.736 151.96L118.773 152.034L118.81 152.015V152.015Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M120.282 156.004L120.3 155.783L120.282 155.691L120.245 155.71L120.19 155.783L120.116 155.894L120.098 155.949V156.059L120.208 156.133L120.282 156.004V156.004Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M191.49 117.292V117.255L191.508 117.218L191.49 117.2L191.471 117.163L191.453 117.145V117.108L191.434 117.09V117.053L191.416 117.035L191.379 117.145V117.237L191.398 117.274H191.416L191.49 117.292V117.292Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M258.594 168.393L258.613 168.375V168.338L258.594 168.32H258.576L258.558 168.356V168.375V168.393H258.594V168.393ZM258.65 167.309L258.668 167.272V167.253V167.235V167.217V167.198L258.65 167.217L258.631 167.253V167.272L258.613 167.29V167.309H258.631H258.65Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M196.862 130.233L196.826 130.196L196.734 130.104L196.642 130.086L196.66 130.196L196.734 130.27H196.826L196.862 130.233ZM196.605 130.012V129.975L196.55 129.957L196.476 129.975L196.494 129.994L196.55 130.031L196.605 130.012V130.012Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119.251 152.603L119.232 152.511H119.214L119.177 152.584V152.639L119.232 152.657L119.251 152.603V152.603Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M241.225 196.131L241.28 196.076L241.317 196.003L241.372 195.947L241.391 195.819L241.354 195.672L241.28 195.543L241.188 195.561L241.133 195.635L241.096 195.727L241.004 195.782L240.986 195.837L240.949 195.966L240.931 196.039L240.894 196.058V196.094L240.949 196.15L241.096 196.168L241.225 196.131V196.131Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M352.103 198.631V198.576L352.03 198.539L351.993 198.631V198.649L352.03 198.668H352.066L352.103 198.631ZM352.95 197.234L352.931 197.215V197.16L352.95 197.124L352.876 197.16L352.766 197.197L352.784 197.344L352.766 197.418L352.821 197.436L352.839 197.491H352.876L353.005 197.454L353.06 197.252H352.986L352.95 197.234V197.234ZM352.398 196.921L352.453 196.829L352.471 196.793L352.434 196.664L352.379 196.609L352.434 196.425L352.416 196.388L352.342 196.352L352.177 196.407L352.158 196.443L352.25 196.462L352.287 196.499L352.195 196.627L352.103 196.646L352.122 196.738L352.158 196.811L352.287 196.848L352.342 196.921H352.398V196.921ZM351.68 196.388L351.735 196.333L351.79 196.26L351.772 196.241V196.186L351.809 196.113L351.864 196.094L351.827 196.057L351.79 196.039V196.094L351.735 196.223L351.717 196.278L351.625 196.388H351.68ZM349.417 195.855L349.306 195.727L349.288 195.763L349.27 195.837V195.892L349.325 195.929L349.343 195.965L349.325 196.057V196.131L349.435 196.296L349.454 196.425L349.509 196.535L349.601 196.627L349.674 196.719L349.822 196.976L349.858 197.068L349.932 197.124L350.116 197.344L350.19 197.418L350.263 197.454L350.429 197.583L350.539 197.638L350.594 197.73L350.705 197.785L350.852 197.859L350.87 197.896V197.951L350.889 198.006L350.981 198.079L351.091 198.135L351.11 198.171L351.128 198.208L351.183 198.19L351.238 198.208L351.404 198.337L351.478 198.318H351.533L351.625 198.282L351.68 198.208L351.662 198.006L351.57 197.914L351.441 197.84L351.367 197.749L351.294 197.657L351.146 197.473L350.944 197.289L350.852 197.252L350.797 197.179L350.742 197.16L350.705 197.105L350.613 197.05L350.558 196.94L350.447 196.829L350.429 196.774L350.447 196.719L350.429 196.664L350.355 196.609L350.318 196.517L350.282 196.462L350.208 196.425L350.079 196.352L349.785 196.002L349.656 195.892L349.527 195.929L349.417 195.855V195.855ZM345.369 194.752L345.406 194.679L345.424 194.532L345.387 194.605L345.35 194.789L345.369 194.752V194.752Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M355.359 172.786V172.75H355.341H355.323L355.305 172.786L355.323 172.804L355.341 172.822L355.359 172.786Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M53.4524 200.708V200.671L53.4341 200.634L53.3975 200.616L53.3792 200.634L53.3975 200.671L53.4341 200.708L53.4524 200.726V200.708Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M113.547 151.059V151.041H113.566V151.023L113.584 151.004V150.986H113.566H113.51H113.492V151.004V151.023L113.529 151.041V151.059H113.547V151.059ZM116.05 151.004L116.178 150.967V150.949L116.105 150.931H115.994L115.902 150.967L115.921 151.004H115.958H116.05V151.004ZM115.369 150.6L115.35 150.563H115.314L114.67 150.545L114.43 150.508L114.375 150.526L114.32 150.545L114.302 150.618L114.265 150.655L114.21 150.692L114.228 150.747L114.246 150.784L114.283 150.857L114.265 150.949L114.228 151.133L114.283 151.17L114.412 151.151L114.467 151.17L114.522 151.188L114.596 151.17L114.67 151.133L114.835 151.151L114.927 151.133L115.038 151.188L115.111 151.17L115.148 151.188H115.203H115.314L115.479 151.151L115.626 151.059L115.682 150.967L115.755 150.912L115.866 150.839V150.673L115.737 150.655L115.626 150.6L115.424 150.581H115.406L115.424 150.618H115.406L115.369 150.6V150.6Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M42.2288 196.572L42.2104 196.517L42.1736 196.462L42.1552 196.48L42.1736 196.498L42.2104 196.554V196.59L42.2288 196.572V196.572ZM43.94 193.87L43.9032 193.833L43.8296 193.796L43.7928 193.778L43.756 193.76L43.7376 193.778L43.756 193.796H43.7744L43.8296 193.833L43.8848 193.851L43.9216 193.87V193.888L43.94 193.87V193.87ZM39.432 193.668L39.3216 193.613L39.34 193.649L39.4136 193.686L39.4504 193.704L39.432 193.668V193.668ZM43.204 193.631L43.1304 193.539H43.0752L43.204 193.649V193.631V193.631ZM39.2296 193.447L39.156 193.374L39.1192 193.318L39.064 193.3L39.0824 193.318L39.156 193.392L39.2112 193.465L39.248 193.484L39.2296 193.447ZM39.1744 193.061L39.156 193.043V192.988L39.1928 192.932L39.3032 192.859V192.84L39.2664 192.859L39.1928 192.896L39.156 192.932L39.1376 192.969L39.1192 193.024L39.1376 193.061L39.156 193.079H39.1928L39.1744 193.061V193.061ZM30.4528 192.859L30.416 192.749L30.3608 192.657L30.2136 192.638L30.1216 192.675L30.1032 192.712L30.1216 192.785L30.2136 192.914L30.3056 192.932L30.4528 192.914L30.5264 193.024L30.5632 193.043L30.6368 193.061L30.6552 193.006L30.6184 192.914L30.4528 192.859V192.859ZM29.9192 192.693L29.9376 192.62L29.9008 192.602H29.8088V192.638L29.8272 192.675L29.8456 192.693L29.9008 192.73L29.9192 192.693V192.693ZM28.1344 191.903H28.1712L28.0976 191.793L28.0424 191.756V191.774V191.903L28.0976 191.921L28.1344 191.903V191.903ZM36.212 191.609H36.1752H36.12H36.1016L36.1936 191.627L36.2672 191.664L36.212 191.609V191.609ZM36.0832 191.627L36.028 191.609L35.9728 191.572H35.9176L36.0464 191.627H36.0832V191.627ZM28.024 191.646L28.0424 191.609L28.024 191.591L27.9504 191.554L27.9688 191.609V191.646L28.0056 191.664L28.024 191.646V191.646ZM34.0592 191.278L34.004 191.205L33.9672 191.149L33.9304 191.076L33.8568 190.984L33.8752 191.039L33.8936 191.076L33.9304 191.113L33.9672 191.186L33.9856 191.223L34.0408 191.296H34.0592V191.278V191.278ZM37.04 191.002L37.0584 190.91H37.0216V191.002H37.04ZM34.3904 190.708L34.28 190.598H34.2616L34.28 190.635L34.372 190.727L34.3904 190.763V190.708V190.708ZM40.0576 184.477L40.076 184.44V184.403L40.0576 184.385L40.0024 184.367L40.0208 184.495L40.0576 184.477V184.477ZM39.5608 183.797L39.5424 183.76H39.5056L39.4872 183.778V183.87L39.5608 183.797V183.797ZM39.5792 183.503L39.432 183.595L39.4688 183.668L39.5424 183.686L39.5792 183.65L39.7264 183.631L39.7816 183.558L39.7264 183.576L39.5792 183.503V183.503ZM38.4568 183.19L38.4936 183.098L38.4568 183.08L38.3832 183.117V183.153L38.4384 183.227L38.4568 183.19ZM38.9352 182.62L38.9904 182.602V182.584L38.9536 182.547L38.8984 182.528L38.88 182.547L38.8616 182.584L38.88 182.639L38.9352 182.62V182.62ZM38.4016 182.602L38.42 182.547V182.51L38.4016 182.473L38.236 182.437L38.2176 182.455V182.528L38.2544 182.62H38.3096L38.4016 182.602V182.602Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M290.224 170.617L290.242 170.58L290.206 170.543L290.15 170.525L290.058 170.488L289.948 170.507L289.893 170.617L290.058 170.69L290.224 170.617V170.617Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M354.275 185.818L354.238 185.782L354.219 185.708H354.164L354.109 185.726L354.146 185.837H354.183L354.275 185.818V185.818ZM347.724 185.965L347.706 185.929L347.614 185.855L347.264 185.616L347.191 185.598L347.172 185.616L347.154 185.671L347.172 185.708L347.264 185.726V185.745L347.319 185.782L347.448 185.818L347.522 185.873L347.54 185.965L347.595 185.984L347.651 186.002L347.724 185.965V185.965ZM353.612 184.752V184.734L353.649 184.679L353.612 184.66L353.52 184.642L353.391 184.66L353.336 184.697L353.299 184.752H353.263V184.789L353.281 184.862L353.318 184.844L353.355 184.862L353.447 184.771H353.502H353.52L353.612 184.752V184.752ZM349.123 184.329L349.104 184.293L349.067 184.274L348.902 184.146L348.81 184.109H348.718L348.699 184.201V184.256H348.81L348.883 184.293V184.403L348.92 184.44V184.532L349.141 184.697L349.27 184.771L349.399 184.789L349.472 184.826L349.564 184.807L349.656 184.844L349.73 184.826L349.656 184.771V184.697L349.564 184.458L349.509 184.403L349.417 184.421L349.325 184.385H349.251L349.123 184.329V184.329ZM349.049 183.429L348.939 183.135L348.902 183.116L348.92 183.226L348.939 183.3L348.92 183.392L348.902 183.502L348.939 183.539L348.975 183.502L349.049 183.594V183.557V183.429V183.429ZM347.246 183.024L347.191 183.006L347.117 183.061L347.099 183.116L347.08 183.245V183.318L347.135 183.447L347.191 183.539L347.246 183.594L347.283 183.631L347.448 183.649L347.761 183.668L347.927 183.741L348.092 183.778L348.166 183.76L348.258 183.723L348.276 183.704L348.258 183.594L348.221 183.539L348.147 183.502L348.111 183.392L348.019 183.318L347.853 183.19H347.559L347.448 183.208L347.246 183.024V183.024ZM347.724 182.693L347.632 182.73V182.785L347.706 182.804L347.779 182.84L347.798 182.896L347.835 182.877L347.908 182.914L347.945 182.859L347.871 182.767L347.798 182.712H347.779L347.724 182.693V182.693ZM346.694 182.84L346.749 182.804V182.73H346.694L346.675 182.693H346.639L346.583 182.73L346.547 182.785L346.565 182.822H346.639L346.675 182.84H346.694ZM345.148 182.418L345.13 182.381L345.075 182.344H345.038L344.946 182.363L344.964 182.381L345.075 182.436L345.13 182.454L345.148 182.418V182.418ZM345.719 182.491L345.774 182.454L345.755 182.418L345.737 182.326L345.663 182.454L345.682 182.491H345.719ZM345.627 182.326V182.289V182.252L345.59 182.234L345.663 182.179L345.645 182.16L345.535 182.124L345.498 182.16L345.461 182.179L345.443 182.197L345.424 182.215L345.406 182.307L345.443 182.381L345.516 182.418L345.627 182.326V182.326ZM344.891 182.363L344.835 182.289L344.854 182.197L344.891 182.179L344.927 182.087L344.909 182.013L344.872 182.032L344.743 182.142L344.725 182.197L344.835 182.344L344.891 182.381V182.363ZM347.283 182.124L347.246 182.05V182.013L347.191 181.977L347.154 181.995L347.135 182.05L347.154 182.087L347.227 182.142L347.283 182.124V182.124ZM348.387 181.903H348.35L348.331 181.921H348.295H348.239L348.221 181.958L348.331 182.16L348.276 182.252L348.35 182.657L348.423 182.877L348.571 183.024V183.061L348.718 183.153L348.828 183.392L348.865 183.41L348.883 183.374V183.263L348.791 183.061L348.81 182.914L348.773 182.859V182.804L348.736 182.657L348.626 182.528L348.571 182.51L348.534 182.454L348.571 182.344L348.607 182.307L348.626 182.252L348.387 181.903V181.903ZM345.332 181.811L345.222 181.774L345.185 181.719V181.535L345.075 181.48L345.019 181.517L344.909 181.646L344.872 181.719L344.78 181.774L344.762 181.829V181.903L344.835 181.921L344.891 181.848L345.056 181.829L345.111 181.848V181.921L345.13 182.05L345.185 182.105L345.277 182.142L345.351 182.252L345.369 182.197H345.406L345.443 182.124L345.387 181.903L345.332 181.811V181.811ZM344.136 181.738L344.155 181.646L344.136 181.48L344.099 181.499V181.535L344.081 181.609L344.118 181.756L344.136 181.738ZM344.725 181.664L344.762 181.627V181.554V181.462L344.725 181.388L344.688 181.352L344.596 181.37L344.523 181.462V181.554L344.596 181.664H344.707H344.725V181.664ZM344.247 181.443L344.283 181.388L344.375 181.26L344.394 181.205L344.302 181.168L344.228 181.076L344.155 181.039L344.099 181.113V181.186L344.191 181.296L344.173 181.37L344.21 181.388L344.228 181.462L344.247 181.443V181.443ZM347.467 182.16L347.448 182.068L347.393 181.995L347.467 181.903L347.062 181.554L347.007 181.517L346.933 181.499L346.841 181.425L346.749 181.407L346.657 181.333L346.62 181.278L346.51 181.205L346.399 181.057L346.123 181.002L346.142 181.039L346.215 181.113L346.234 181.241L346.326 181.315L346.418 181.425L346.455 181.443L346.491 181.48L346.565 181.572L346.712 181.646L346.859 181.756L346.915 181.774L346.97 181.829L347.246 181.958L347.338 182.087L347.467 182.179V182.16V182.16ZM343.455 180.469L343.492 180.414L343.363 180.322L343.327 180.377L343.29 180.469L343.363 180.506L343.455 180.469ZM345.13 180.745L345.111 180.727H345.056L344.983 180.69L344.854 180.543L344.817 180.488L344.78 180.304L344.707 180.23L344.449 180.083L344.302 179.936L344.173 179.899L344.136 179.936V180.028L344.173 180.083L344.357 180.249L344.559 180.561L344.743 180.745L344.891 180.763H344.964V180.782L344.983 180.818L345.075 180.855L345.167 180.782L345.13 180.745V180.745Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M189.594 172.033L189.686 171.885V171.794L189.631 171.702H189.558L189.466 171.775L189.41 171.849V171.904L189.429 172.033L189.447 172.088L189.502 172.124L189.594 172.033V172.033ZM190.386 170.341L190.422 170.268V170.231L190.404 170.213L190.386 170.194L190.349 170.213L190.294 170.305L190.312 170.341L190.349 170.378L190.386 170.341V170.341Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M118.386 151.041L118.423 151.077L118.478 151.095L118.496 151.077V151.041H118.386Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M240.084 177.657L239.992 177.51L239.918 177.565L239.955 177.62L240.01 177.657L240.029 177.73L240.084 177.767V177.657V177.657Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M109.481 146.611L109.462 146.684V146.721L109.499 146.739L109.61 146.721L109.628 146.703L109.665 146.684V146.666L109.591 146.684L109.481 146.611V146.611ZM110.143 146.721L110.18 146.684L110.143 146.648L110.014 146.611L109.978 146.629V146.684H110.088L110.143 146.739V146.721V146.721ZM109.941 146.629L109.922 146.611L109.904 146.5H109.812V146.537L109.83 146.574H109.849L109.867 146.611L109.922 146.648L109.941 146.629V146.629Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.44708 197.087L5.41028 197.142V197.179L5.48388 197.252L5.44708 197.087V197.087ZM5.15268 196.922H5.11588L5.15268 196.903L5.07908 196.866H5.00548L4.96868 196.848V196.811L4.93188 196.866L4.96868 196.922L5.13428 196.995L5.18948 197.032L5.22628 196.922V196.885L5.17108 196.903V196.922H5.15268V196.922ZM5.61268 193.981L5.63108 193.944V193.907L5.57588 193.889H5.55748L5.50228 193.981L5.52068 193.999L5.57588 194.036H5.59428L5.61268 193.981V193.981Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119.914 160.323L119.932 160.286V160.176L119.969 160.103L119.932 160.029L119.914 159.919L119.932 159.827V159.698L119.969 159.643L120.061 159.496H119.895L119.785 159.533L119.582 159.551L119.49 159.588L119.362 159.606L119.288 159.643L119.306 159.662L119.398 159.698L119.435 159.735L119.454 159.772L119.472 159.845L119.417 160.158L119.398 160.176L119.288 160.195L119.251 160.25L118.994 160.397L119.141 160.378L119.306 160.397L119.748 160.378L119.914 160.323ZM120.245 159.092L120.466 159L120.484 158.926H120.447L120.3 158.981L120.19 159.073V159.11L120.245 159.092Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M119.748 157.327V157.309H119.766V157.29V157.272H119.748V157.29V157.309H119.729V157.327H119.748ZM119.877 156.978L119.895 156.941L119.913 156.923L119.895 156.904V156.923L119.858 156.941V156.96V156.978H119.84H119.821H119.84L119.858 156.996L119.877 156.978V156.978ZM119.932 156.776L119.987 156.739L120.005 156.629L119.987 156.555H119.95L119.895 156.574L119.858 156.629L119.84 156.721L119.913 156.794L119.932 156.776V156.776Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M116.933 150.655L116.988 150.618L116.951 150.6H116.878L116.823 150.637L116.841 150.655H116.933ZM117.135 150.581L117.209 150.508L117.117 150.526L117.08 150.563L117.099 150.581H117.117H117.135V150.581ZM117.283 150.25H117.246H117.154L117.172 150.269H117.227L117.283 150.287V150.25V150.25Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M116.694 151.353L116.565 151.39L116.546 151.463H116.749L116.878 151.408H116.767L116.694 151.353V151.353ZM116.859 150.71L116.767 150.691L116.73 150.728L116.786 150.746L116.859 150.71V150.71ZM116.657 150.728L116.62 150.691L116.565 150.673L116.491 150.691L116.583 150.746L116.657 150.728Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M214.582 131.041L214.526 131.023L214.434 131.06L214.361 131.133L214.287 131.188L214.195 131.133L214.232 131.299L214.342 131.501L214.379 131.556L214.434 131.593L214.637 131.648H214.692H214.802L214.839 131.666L214.876 131.74H214.95V131.721V131.666L214.986 131.63L215.042 131.593H215.097L215.207 131.574L215.318 131.538L215.41 131.464L215.575 131.28H215.63H215.686H215.796L215.906 131.262L215.87 131.188L215.851 131.17L215.778 131.078L215.741 131.005L215.759 130.894L216.219 130.545L216.311 130.453L216.164 130.49L216.054 130.563L215.98 130.6L215.851 130.674L215.428 130.821L215.281 130.839H215.134L214.95 130.821L214.784 130.784V130.913L214.747 131.023L214.637 131.06L214.582 131.041V131.041Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M239.256 197.124L239.293 197.05L239.311 196.903L239.238 196.756L239.164 196.627L239.091 196.591L238.943 196.572L238.814 196.627L238.741 196.738L238.704 196.793L238.778 196.995L238.814 197.05L239.017 197.16H239.109L239.256 197.124V197.124Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M229.081 187.344V187.289L229.118 187.197V187.179L229.136 187.087L229.081 187.032H229.044L229.007 186.977L228.952 187.032L229.007 187.124L228.989 187.179L228.971 187.252L228.989 187.326L229.026 187.363L229.081 187.344Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M120.392 155.213L120.355 155.084L120.337 155.048L120.3 154.993L120.318 154.937V154.919H120.282L120.226 154.827L120.116 154.772H120.061L120.024 154.809V154.864L120.079 155.029L120.116 155.066L120.208 155.103L120.134 155.176V155.195L120.153 155.25H120.318L120.355 155.305L120.374 155.287L120.392 155.213V155.213Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M120.098 153.596L120.134 153.559V153.504L120.098 153.449L120.061 153.467L120.024 153.522V153.577L120.042 153.596H120.098V153.596ZM119.748 153.449L119.785 153.412V153.191L119.803 153.136L119.766 153.118L119.73 153.081L119.619 153.044L119.601 153.063L119.564 153.118L119.582 153.393L119.619 153.485L119.656 153.504L119.748 153.449V153.449ZM120.042 153.191L120.19 153.154L120.024 153.044L119.987 152.971V152.915L119.914 152.86L119.877 152.897L119.858 152.952L119.877 153.044L119.822 153.118L119.84 153.191L119.914 153.21L120.042 153.191V153.191Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M112.646 157.971V157.861L112.48 157.787V157.842L112.498 157.879L112.554 157.897L112.572 157.934L112.554 158.044L112.59 158.1L112.646 157.971V157.971Z"
      fill="#2D2D2D"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M164.846 139.644L164.81 139.607L164.681 139.699H164.57L164.589 139.736L164.607 139.773L164.736 139.846L164.846 139.644V139.644ZM167.33 139.258V139.24H167.312L167.294 139.258L167.054 139.24L167.018 139.35L166.926 139.423V139.552L167.018 139.681L167.073 139.699L167.165 139.717L167.294 139.644L167.33 139.57L167.349 139.423L167.33 139.35V139.258V139.258ZM165.546 139.405L165.638 139.331V139.295L165.619 139.24L165.527 139.184H165.49L165.454 139.221L165.417 139.295L165.472 139.387L165.509 139.405H165.546V139.405ZM166.41 138.982L166.631 138.798V138.743L166.447 138.762L166.245 138.945L166.19 138.964L166.006 138.982H165.914L165.84 139.019L165.877 139.074L165.95 139.258L166.079 139.423L166.19 139.387L166.245 139.35L166.318 139.24L166.41 138.982V138.982ZM168.545 139.221L168.821 139.129L168.876 138.945L168.931 138.743V138.615L168.894 138.559H168.876H168.802L168.747 138.596L168.729 138.706L168.6 138.945L168.508 139.166L168.379 139.276L168.25 139.313L168.269 139.331L168.398 139.35L168.545 139.221V139.221ZM164.92 138.854L165.012 138.762L165.03 138.706L165.012 138.615L165.049 138.578L165.03 138.504L164.975 138.431H164.846L164.773 138.541L164.883 138.762L164.902 138.854H164.92V138.854ZM169.042 138.357L169.207 138.302L169.299 138.247L169.318 138.081L169.354 138.026L169.318 137.971L169.281 138.008L169.244 138.081L169.134 138.118L168.986 138.192L168.95 138.247L168.913 138.412L168.986 138.431L169.042 138.357V138.357Z"
      fill="#2D2D2D"
    />
  </g>
);
