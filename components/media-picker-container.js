const React = require('react');

import MediaPickerGrid from './media-picker-grid';

class MediaPickerContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{backgroundColor:'#333333', padding: '16px'}}>
        <div id="mediaPickerGrid" style={{height: '450px'}}>
          <MediaPickerGrid {...this.props} />
        </div>
      </div>
    );
  }
}

export default MediaPickerContainer;