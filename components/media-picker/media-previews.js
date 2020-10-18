import * as React from 'react';
import { titleToPreview } from '../constants';

export default class MediaPreviews extends React.PureComponent {

  render() {
    const previews = Object.keys(titleToPreview)
        .map((title) => {
          const item = titleToPreview[title];

          const style = {
            position: "absolute",
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            opacity: 0,
          };

          if (item.type === "video") {
            return (
              <video
                key={title + "-preload"}
                style={style}
                preload="auto"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={`./static/images/${item.url}`} type="video/mp4" />
              </video>
            );
          }
        });

    return <div id="media-previews" style={{position: 'fixed', top: 0, left: 0}}>
      {previews}
    </div>
  }
}