import * as React from 'react';
import { Group } from '@vx/group';

/** Props:
type: 'timeline' | 'bar',
data:
  [
    {
      size: number,
      time: number
    },
    ...
  ],
rectHeight: d => number,
rectX: d => number,
rectWidth: d => number,
*/

const x = d => d.time

export default class MediaStrip extends React.Component {
  render() {
    return (
      <Group>
        {
          this.props.data.map((d, i) => {
            return (
              <rect
                key={i}
                x={this.props.rectX(d)} 
                width={this.props.rectWidth(d) + (this.props.type === 'timeline' ? 0 : 0.5) }
                height={this.props.rectHeight(d)}
                fill="#7FE8BC"
                opacity={this.props.type === 'timeline' ? '70%' : '100%'}
                style={{
                  transition: "x 200ms linear, width 200ms linear"
                }}
              />
            )
          })
        }
      </Group>
    );
  }
}