import * as React from 'react';
import { stages } from './constants';
import { markColor } from '../constants';

const markHeight = 22;

export default class Emissions extends React.PureComponent {
  constructor(props) {
    super(props);

    const data = this.props.data;
  }
  render() {
    const data = this.props.data;
    const stage = this.props.stage;

    const filtered = data.filter(d => stages.indexOf(d.stage) <= stages.indexOf(stage));

    return (
      <div style={{
        width: 1000,
        display: 'flex',
        flexDirection: 'horizontal'
      }}>
        {
          filtered.map((d, i) => {
            return <div key={i} style={{
              height: markHeight,
              width: 100,
              boxSizing: 'border-box',
              borderStyle: 'solid',
              borderColor: 'white',
              borderWidth: stage === 'all' ? 0 : 2,
              backgroundColor: markColor,
              transition: 'border-width 700ms ease-in-out'
            }}/>
          })
        }
      </div>
    )
  }
}