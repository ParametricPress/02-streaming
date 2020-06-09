const React = require('react');

import MediaPickerGrid from './media-picker-grid';

class MediaPickerContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{backgroundColor:'#333333', padding: '16px'}}>
        <div id="mediaPickerGrid"><MediaPickerGrid /></div>
      </div>
    );
  }
}

export default MediaPickerContainer;