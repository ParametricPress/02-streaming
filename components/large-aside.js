import * as React from 'react';

export default class LargeAside extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0
    }
  }

  _handleResize() {
    this.setState({
      width: window.innerWidth,
    })
  }

  componentDidMount() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize.bind(this));
  }

  render() {
    return (
      <div className="large-aside-container" style={{
        width: this.state.width - 50,  // 50 = text margin
        maxWidth: 1440 - 50
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