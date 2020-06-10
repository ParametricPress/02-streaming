const React = require('react');

import MediaPickerGrid from './media-picker-grid';

class MediaPickerContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{border:'5px solid #333333', padding: '16px'}}>
        <div id="mediaPickerGrid" style={{height: '600px'}}>
          <MediaPickerGrid {...this.props} />
        </div>
      </div>
    );
  }
}

export default MediaPickerContainer;