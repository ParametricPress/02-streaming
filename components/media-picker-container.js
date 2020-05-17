const React = require('react');

import MediaPickerCarousel from './media-picker-carousel';
import MediaPickerPacketViz from './media-picker-packet-viz';
import MediaPickerSettings from './media-picker-settings';

class MediaPickerContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{backgroundColor:'#333333', padding: '16px'}}>
        <MediaPickerCarousel />
        <MediaPickerSettings />
        <MediaPickerPacketViz />
      </div>
    );
  }
}

export default MediaPickerContainer;