import React from 'react';
import SvgElement from './SvgElement';

export default class SvgScroll extends React.Component {
  render() {
    return (
      <svg>
        {
          this.props.data.map(d => {
            return <SvgElement step={this.props.step} progress={this.props.progress} descriptor={d}/>
          })
        }
      </svg>
    )
  }
}