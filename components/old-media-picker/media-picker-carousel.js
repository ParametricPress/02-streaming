const React = require('react');

import Carousel from 'react-bootstrap/Carousel'

class MediaPickerCarousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaTypeText: 'Video',
      embeddedMedia: '', // TODO make this a React or DOM element
    };
  }

  render() {
    return (
      <div style={{fontFamily: 'Graphik', color: 'white'}}>
        <Carousel activeIndex={0}>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="../static/images/logo-nav.png"
              alt="First slide"
            />
            <Carousel.Caption>
              <h3>First slide label</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="../static/images/logo-bg-dark.png"
              alt="First slide"
            />
            <Carousel.Caption>
              <h3>First slide label</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>
    );
  }
}

export default MediaPickerCarousel;