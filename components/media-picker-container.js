import MediaPickerCarousel from './media-picker-carousel';
import MediaPickerPacketViz from './media-picker-packet-viz';
import MediaPickerSettings from './media-picker-settings';

const React = require('react');

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