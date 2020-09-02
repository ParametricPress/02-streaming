import * as React from 'react';

const getMarkType = mark => {
  if (mark.tagName === 'rect') {
    if (mark.getAttribute('fill') === '#FF6CC4') {
      return 'datacenter'
    } else if (mark.getAttribute('fill') === '#7FE8BC') {
      return 'cdn'
    } else if (mark.getAttribute('fill') === 'black') { 
      return 'edge'  // cell tower
    }
  } else if (mark.tagName === 'path') {
    if (mark.getAttribute('stroke-width') === '3') {
      return 'internet'
    } else if (mark.getAttribute('fill') === '#6C7BFF') {
      return 'device'
    } else {
      return 'edge'
    }
  } else if (mark.tagName === 'circle') {
    return 'edge' // radio circles
  }
}

const stages = ['none', 'datacenter', 'cdn', 'internet', 'edge', 'device'];
const datacenterIndex = stages.indexOf('datacenter');
const cdnIndex = stages.indexOf('cdn');
const internetIndex = stages.indexOf('internet');

const edgeIndex = stages.indexOf('edge')
// const residentialIndex = stages.indexOf('residential');
// const cellularIndex = stages.indexOf('cellular');
const deviceIndex = stages.indexOf('device');


export default class Pipeline extends React.PureComponent {
  constructor(props) {
    super(props);

    this.marks = [];
  }

  componentDidMount() {
    const svg = document.getElementById('pipeline');
    for (const e of svg.children) {
      const type = getMarkType(e);
      const ref = {
        element: e,
        type
      };

      if (e.tagName === 'path') {
        const pathLength = e.getTotalLength();
        e.setAttribute('stroke-dasharray', pathLength);
        e.setAttribute('stroke-dashoffset', pathLength);
        ref.pathLength = pathLength;
      }

      this.marks.push(ref);
    };

    this.redraw();
  }

  componentDidUpdate() {
    this.redraw();
  }

  redraw() {
    const stage = this.props.stage;

    const progress = this.props.progress;
    const s = stages.indexOf(stage);

    for (const m of this.marks) {
      const e = m.element;

      e.style.opacity = s < stages.indexOf(m.type) ? 0 : 1
      
      if (['internet', 'edge'].includes(m.type) && s === stages.indexOf(m.type)) {
        e.setAttribute('stroke-dashoffset', m.pathLength - m.pathLength * (progress / 100));
      } else {
        e.setAttribute('stroke-dashoffset', m.patnLength);
      }
    }
  }

  render() {
    return (
      // EXPORTED FROM FIGMA
      <svg id="pipeline" width="600" height="600" viewBox="0 0 330 253" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="151.5" y="140" width="10" height="10" fill="#FF6CC4"/>
        <rect x="65.5" y="115" width="13" height="13" fill="#7FE8BC"/>
        <rect x="89.5" y="188" width="13" height="13" fill="#7FE8BC"/>
        <rect x="92.5" y="84" width="13" height="13" fill="#7FE8BC"/>
        <rect x="150.5" y="71" width="13" height="13" fill="#7FE8BC"/>
        <path d="M249.5 58.5H262.5V71.5H249.5V58.5Z" fill="#7FE8BC"/>
        <rect x="223.5" y="121" width="13" height="13" fill="#7FE8BC"/>
        <rect x="199.5" y="206" width="13" height="13" fill="#7FE8BC"/>
        <rect x="161.5" y="240" width="13" height="13" fill="#7FE8BC"/>
        <path d="M157.5 139.5V108H177V77.5H164.5" stroke="black" stroke-width="3"/>
        <path d="M105.5 89.5H126V116.5H148H152.5V139.5" stroke="black" stroke-width="3"/>
        <path d="M79 122H108V143H151" stroke="black" stroke-width="3"/>
        <path d="M98.5 187.5V166.5H133.5V151V148H151.5" stroke="black" stroke-width="3"/>
        <path d="M161.5 140H202V68H249" stroke="black" stroke-width="3"/>
        <path d="M224.5 128.5H211V145.5H162.5" stroke="black" stroke-width="3"/>
        <path d="M203.5 205V168.5H159V151" stroke="black" stroke-width="3"/>
        <path d="M154.5 150.5C154.5 150.9 154.5 185.667 154.5 203H167.5V239.5" stroke="black" stroke-width="3"/>
        <path d="M72 128.5V147.5H93.5V188" stroke="black" stroke-width="3"/>
        <path d="M229.5 133.5V245.5H175.5" stroke="black" stroke-width="3"/>
        <path d="M150 75.5H99V84" stroke="black" stroke-width="3"/>
        <path d="M237 127.5H310.5V170H329.5" stroke="black" stroke-width="3"/>
        <path d="M161.5 246H114.5V230H39.5" stroke="black" stroke-width="3"/>
        <path d="M157 71V31H99.5V12.5" stroke="black" stroke-width="3"/>
        <path d="M65.5 122H34.5V93.5H11" stroke="black" stroke-width="3"/>
        <path d="M228 68V96H291.5" stroke="black"/>
        <path d="M114.5 32V49.5H49.5V14" stroke="black"/>
        <path d="M44.5 123.5V165.5H12" stroke="black"/>
        <path d="M157.5 39H185.5V14" stroke="black"/>
        <path d="M125.5 167V212.5H18.5" stroke="black"/>
        <path d="M125.5 110H85.5V64.5H19" stroke="black"/>
        <path d="M186 0L194.66 15H177.34L186 0Z" fill="#6C7BFF"/>
        <path d="M50 0L58.6603 15H41.3397L50 0Z" fill="#6C7BFF"/>
        <path d="M9 159L17.6603 174H0.339746L9 159Z" fill="#6C7BFF"/>
        <path d="M297 87L305.66 102H288.34L297 87Z" fill="#6C7BFF"/>
        <path d="M316 203L324.66 218H307.34L316 203Z" fill="#6C7BFF"/>
        <path d="M305 230L313.66 245H296.34L305 230Z" fill="#6C7BFF"/>
        <path d="M273 228L281.66 243H264.34L273 228Z" fill="#6C7BFF"/>
        <path d="M263 130V171.991H289V209" stroke="black"/>
        <rect x="283" y="208" width="13" height="13" fill="black"/>
        <circle cx="289.5" cy="215.5" r="14" stroke="black" stroke-opacity="0.3"/>
        <circle cx="289.5" cy="216.5" r="24" stroke="black" stroke-opacity="0.3"/>
        <circle cx="289.5" cy="216.5" r="33" stroke="black" stroke-opacity="0.3"/>
      </svg>
    )
  }
}