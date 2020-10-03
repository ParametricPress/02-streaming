import React from "react";
import * as vega from "vega";
import ReactDOM from 'react-dom';
import { backgroundColor, debounceTimer } from "../constants";
import ParametricGraphic from "parametric-components/dist/cjs/issue-02/parametric-graphic";

export default class PipelineMap extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      startX: null,
      rotate: 0,
      isDragging: false,
      width: null,
      height: null
    };

    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._rotateOne = this._rotateOne.bind(this);

    this.resizeBounce = null;
    this._size = this._size.bind(this);
  }

  _size() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.setState({
      width: rect.width,
      height: rect.height
    });
  }

  _handleResize() {
    if (this.resizeBounce) {
      clearTimeout(this.resizeBounce);
    }

    this.resizeBounce = setTimeout(this._size, debounceTimer);
  }

  _rotateOne() {
    if (!this.state.isDragging && this.props.animate) {
      this.setState({
        rotate: this.state.rotate + 1
      });
    }
  }

  componentDidMount() {
    setTimeout(() => {
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      const runtime = vega.parse(spec(this.props.dataType, rect.width, rect.height));
      this.view = new vega.View(runtime, {
        logLevel: vega.Warn,
        renderer: "canvas",
        container: "#vega-map-" + this.props.dataType,
        background: 'transparent'
      });
  
      this.view.runAsync();

      setInterval(this._rotateOne, 50);

      this._size();
  
      window.addEventListener('resize', this._handleResize)
    }, 100);  // need to wait a split second for size to update for some reason
  }

  componentDidUpdate() {
    this.view.signal("rotate0", this.state.rotate);
    this.view.signal("width", this.state.width);
    this.view.signal("height", this.state.height);
    this.view.runAsync();
  }

  _handleMouseDown(e) {
    this.setState({
      startX: e.clientX,
      isDragging: true,
    });
  }

  _handleMouseMove(e) {
    if (this.state.startX !== null) {
      const currentX = e.clientX;
      const diff = currentX - this.state.startX;
      this.setState({
        startX: currentX,
        rotate: this.state.rotate + diff,
      });
    }
  }

  _handleMouseUp(e) {
    this.setState({ startX: null, isDragging: false });
  }

  render() {
    return (
        <div
          id={"vega-map-" + this.props.dataType}
          style={{
            width: '100%',
            height: '100%',
            cursor: this.state.isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={this._handleMouseDown}
          onMouseMove={this._handleMouseMove}
          onMouseUp={this._handleMouseUp}
          onMouseLeave={this._handleMouseUp}

          onTouchStart={this._handleMouseDown}
          onTouchMove={this._handleMouseMove}
          onTouchEnd={this._handleMouseUp}
        ></div>
    );
  }
}

const pointData = require("../../data/dist/google.json");

const makeData = (dataType) => {
  return {
    type: "FeatureCollection",
    features: pointData[dataType].map(d => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [d[1], d[0]],
        },
        properties: {},
      };
    })
  }
}

const data = {
  datacenters: makeData('datacenters'),
  pops: makeData('pops'),
  ggcs: makeData('ggcs')
}

const getDataDeclaration = (dataType) => {
  return {
    name: dataType,
    values: data[dataType],
    format: {
      type: "json",
      property: "features",
    },
  };
}

const spec = (dataType, initWidth, initHeight) => {
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description: "A configurable map of countries of the world.",
    autosize: { type: "fit", resize: true },
    width: initWidth,
    height: initHeight,

    signals: [
      { name: "scale", value: 240 },
      { name: "rotate0", value: 0 },
      { name: "rotate1", value: 0 },
      { name: "rotate2", value: 0 },
      { name: "center0", value: 0 },
      { name: "center1", value: 0 },
      { name: "translate0", update: "width / 2" },
      { name: "translate1", update: "height / 2" },
      { name: "graticuleDash", value: 0 },
      { name: "borderWidth", value: 1 },
      { name: "invert", value: false }
    ],

    projections: [
      {
        name: "projection",
        type: "orthographic",
        rotate: [
          { signal: "rotate0" },
          { signal: "rotate1" },
          { signal: "rotate2" },
        ],
        center: [{ signal: "center0" }, { signal: "center1" }],
        fit: { signal: "data('graticule')" },
        extent: [[20, 20], {signal: "[width - 20, height - 20]"}]
      },
    ],

    data: [
      {
        name: "world",
        url:
          "https://raw.githubusercontent.com/vega/vega-datasets/master/data/world-110m.json",
        format: {
          type: "topojson",
          feature: "countries",
        },
      },
      {
        name: "graticule",
        transform: [
          { type: "graticule" }
        ],
      },
      {
        name: "sphere",
        values: [
          { type: "Sphere" }
        ]
      },
      getDataDeclaration(dataType)
    ],

    marks: [
      {
        type: "shape",
        from: { data: "sphere" },
        encode: {
          update: {
            fill: { value: '#444444' }
          }
        },
        transform: [
          { type: 'geoshape', projection: "projection" }
        ]
      },
      {
        type: "shape",
        from: { data: "world" },
        encode: {
          update: {
            strokeWidth: { signal: "+borderWidth" },
            stroke: { value: "#222222" },
            fill: { value: "#2D2D2D" },
            zindex: { value: 0 },
          },
        },
        transform: [{ type: "geoshape", projection: "projection" }],
      },
      {
        type: "shape",
        from: { data: dataType },
        encode: {
          update: {
            fill: { value: "#D1FF99" }
          },
        },
        transform: [
          {
            type: "geoshape",
            projection: "projection",
            pointRadius: 1,
          },
        ],
      }
    ],
  };
};
