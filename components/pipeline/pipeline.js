import * as React from 'react';
import Graphic from './graphic';

export default class Pipeline extends React.PureComponent {
  render() {
    const stage = this.props.stage;
    const progress = this.props.progress;

    return (
      <div>
        <Graphic stage={stage} progress={progress}/>
      </div>
    )
  }
}