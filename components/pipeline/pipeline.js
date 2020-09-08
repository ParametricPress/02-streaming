import * as React from 'react';
import Graphic from './graphic';
import Emissions from './emissions';

export default class Pipeline extends React.PureComponent {
  render() {
    const stage = this.props.stage;
    const progress = this.props.progress;

    return (
      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Graphic stage={stage} progress={progress}/>
        <Emissions stage={stage} progress={progress}/>
      </div>
    )
  }
}