import * as React from 'react';
import { debounceTimer } from './constants';

export default class LargeAside extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0
    }

    this.resizeBounce = null;
    this._size = this._size.bind(this);
  }

  _handleResize() {
    if (this.resizeBounce) {
      clearTimeout(this.resizeBounce);
    }

    this.resizeBounce = setTimeout(this._size, debounceTimer);
  }

  _size() {
    this.setState({
      width: Math.min(window.innerWidth, 1440),
    })
  }

  componentDidMount() {
    this._size();
    window.addEventListener('resize', this._handleResize.bind(this));
  }

  render() {
    return (
      <div className="large-aside-container" style={{
        width: this.state.width - 100,  // 50 = text margin
        maxWidth: this.state.width - 100
      }}>
        <div className="large-aside-wrapper">
          <div className="large-aside">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}