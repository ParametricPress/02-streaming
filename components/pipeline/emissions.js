import * as React from 'react';
import { stages } from './constants';
import { markColor, backgroundColor } from '../constants';

const markHeight = 22;

const data = [
  {
    stage: 'cdn',  // and also data center
    emissions: 30
  },
  {
    stage: 'internet',
    emissions: 185
  },
  {
    stage: 'residential',
    emissions: 430
  },
  {
    stage: 'cellular',
    emissions: 850
  },
  {
    stage: 'device',
    emissions: 610
  }
];

const total = data.reduce((s, d) => s + d.emissions, 0);

export default class Emissions extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const stage = this.props.stage;
    const hasLabel = ['cdn', 'internet', 'residential', 'cellular', 'device', 'all'].includes(this.props.stage);

    const filteredData = stage === 'all' ?
      [data.reduce((p, d) => {
        p.emissions += d.emissions;
        return p;
      }, {stage: 'all', emissions: 0})]
      : data;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: 16,
        marginLeft: 32,
        marginRight: 32,
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
              if (stages.indexOf(d.stage) === stages.indexOf(stage) || stage === 'all') {
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
                    opacity: opacity === 1 ? 1 : 0,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    marginLeft: stage === 'cdn' ? 2 : 0,
                    textAlign: stage === 'cdn' ? 'left' : 'center'
                  }}>X MtCO2</div>
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
            opacity: hasLabel ? 1 : 0
          }}
        >This is equivalent to X cars</div>
      </div>
    )
  }
}