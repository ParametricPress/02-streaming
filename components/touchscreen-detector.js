import * as React from 'react';
import { isTouchScreen } from './util';

export default class TouchcreenDetector extends React.Component {
  componentDidMount() {
    this.props.updateProps({
      isTouchScreen: isTouchScreen()
    });
  }
  
  render() {
    return null
  }
}