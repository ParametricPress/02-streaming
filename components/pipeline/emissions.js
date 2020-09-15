import * as React from 'react';
import { stages } from './constants';
import { markColor, backgroundColor } from '../constants';

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
    const hasLabel = ['cdn', 'internet', 'residential', 'cellular', 'device', 'all'].includes(this.props.stage);

    const simplified = stage === 'simple' || stage === 'compare' || stage === 'final';
    const filteredData = stage === 'all' ?
      [data.reduce((p, d) => {
        p.emissions += d.emissions;
        return p;
      }, {stage: 'all', emissions: 0})]
      : data;

    return (
      <div style={{
        ...this.props.style,
        display: 'flex',
        flexDirection: 'column',
        marginTop: 16,
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%'
        }}>
          {
            filteredData.map((d, i) => {
              let opacity;
              if (stage === 'final') {
                opacity = 0.2;
              } else if (stages.indexOf(d.stage) === stageIndex || stageIndex >= stages.indexOf('all')) {
                opacity = 1;
              } else if (stages.indexOf(d.stage) < stages.indexOf(stage)) {
                opacity = 0.2;
              } else {
                opacity = 0;
              }
      
              return (
                <div key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: d.emissions / total * 100 + '%',
                  }}
                >
                  <div style={{
                    opacity: stage === 'final' ? 0.2 : stage === 'beforesimple' ? 0 : opacity === 1 ? 1 : 0,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    marginLeft: stage === 'cdn' ? 2 : 0,
                    textAlign: stage === 'cdn' ? 'left' : 'center',
                    fontSize: simplified ? 11 : undefined
                  }}>{simplified ? d.name : Math.round(d.emissions / total * 10.1 * 10) / 10 + ' MtCO₂*'}</div>
                  <div style={{
                    height: markHeight,
                    width: '100%',
                    opacity: opacity,
                    boxSizing: 'border-box',
                    borderStyle: 'solid',
                    borderColor: backgroundColor,
                    borderWidth: stage === 'all' ? 0 : 2,
                    backgroundColor: 'white',
                    marginTop: 4,
                    transition: 'opacity 200ms linear'
                  }}/>
                  <div style={{
                    opacity: stageIndex <= stages.indexOf('beforesimple') ? 0 : 1,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    marginLeft: stage === 'cdn' ? 2 : 0,
                    textAlign: stage === 'cdn' ? 'left' : 'center',
                    fontSize: stageIndex <= stages.indexOf('beforesimple') ? undefined : 10,
                  }}>{simplified ? d.emissions + '%' : 'placeholder'}</div>
                </div>
              );
            })
          }
        </div>
        <div
          style={{
            marginTop: 8,
            textAlign: 'center',
            color: 'white',
            opacity: hasLabel ? 1 : 0,
            transform: 'translateY(-100%)'
          }}
        >This is equivalent to X cars</div>
      </div>
    )
  }
}