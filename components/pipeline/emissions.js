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
  

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'horizontal',
        marginTop: 16,
        marginLeft: 32,
        marginRight: 32,
        width: '100%'
      }}>
        {
          data.map((d, i) => {
            let opacity;
            if (stages.indexOf(d.stage) === stages.indexOf(stage) || stage === 'all') {
              opacity = 1;
            } else if (stages.indexOf(d.stage) < stages.indexOf(stage)) {
              opacity = 0.2;
            } else {
              opacity = 0;
            }
    
            return <div key={i} style={{
              height: markHeight,
              width: d.emissions / total * 100 + '%',
              opacity: opacity,
              boxSizing: 'border-box',
              borderStyle: 'solid',
              borderColor: backgroundColor,
              borderWidth: stage === 'all' ? 0 : 2,
              backgroundColor: 'white',
              transition: 'opacity 200ms linear'
            }}/>
          })
        }
      </div>
    )
  }
}