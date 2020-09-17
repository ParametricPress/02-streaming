/// app.js
import React, { Component } from 'react';
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL, { GeoJsonLayer, TextLayer } from 'deck.gl';


// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibWF0aGlzb25pYW4iLCJhIjoiY2l5bTA5aWlnMDAwMDN1cGZ6Y3d4dGl6MSJ9.JZaRAfZOZfAnU2EAuybfsg';

let initialViewport;

export default class SuperfundMap extends Component {
  constructor(props) {
    super(props);

    this.getViewport = v => {
      let vp = Object.assign({}, asiaVP);
      if (this.props.isMobile) {
        vp.zoom = vp.zoom - 1;
      }
      return vp;
    };

    initialViewport = Object.assign({
      latitude: 0,
      longitude: 0,
      zoom: 1,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
      transitionDuration: 5000,
      transitionInterpolator: new FlyToInterpolator()
    }, this.props.initialViewport);

    this.state = {
      viewport: initialViewport,
      initialized: false,
      transitioning: false
    };
  }

  _resize() {
    this._onChangeViewport({
      width: Math.min(window.innerWidth, 1440),
      height: window.innerHeight * (2/3)
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: Object.assign({}, this.state.viewport, viewport)
    });
  }

  componentDidMount() {
    if (!this.ref) {
      return;
    }
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _renderTooltip() {
    const { hoveredObject, pointerX, pointerY } = this.state || {};
    return hoveredObject && (
      <div style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', left: pointerX, top: pointerY }}>
        {hoveredObject.message}
      </div>
    );
  }

  getLayers() {
    const pointsApts = new GeoJsonLayer({
      id: 'geo-json',
      getLineWidth: 14,
      opacity: 0.7,
      stroked: true,
      filled: true,
      data: this.props.geoJSON,
      pickable: true,
      getLineColor: d => [238, 152, 139],
      getFillColor: d => [238, 152, 139],
      // radiusScale: 10000,
      getRadius: 5,
      radiusMinPixels: 5,
      pointRadiusMinPixels: 5,
      // onHover: ({object}) => alert(`${object.venue}`)
      onHover: (info) => {
        this.setState({
          hoveredObject: info.object,
          pointerX: info.x,
          pointerY: info.y
        })
      }
    });

    return [pointsApts];
  }

  _initialize(gl) {
    this.props.updateProps({ isLoaded: true });
  }

  handleRef(_ref) {
    if (!_ref) {
      return;
    }
    this.ref = _ref;
  }

  render() {
    const { viewport, initialized, transitioning, hoveredObject, pointerX, pointerY } = this.state;

    return (
      <div key={'map'} ref={this.handleRef.bind(this)} style={{position: 'relative', width: 'calc(100% - 50px)', maxWidth: 1440}}>
        <MapGL
          {...viewport}
          onClick={() => this.props.updateProps({ zoomEnabled: !this.props.zoomEnabled })}
          mapStyle="mapbox://styles/mathisonian/cjv2tiyabes041fnuap89nfrt"
          dragRotate={this.props.zoomEnabled}
          scrollZoom={this.props.zoomEnabled}
          dragPan={this.props.zoomEnabled}
          doubleClickZoom={this.props.zoomEnabled}
          onViewportChange={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          getCursor={({isDragging, isHovering}) => 'default'}
        >
          <DeckGL
            viewState={viewport}
            layers={this.getLayers()}
            onWebGLInitialized={this._initialize.bind(this)}
            getCursor={() => "inherit"}
          />
        </MapGL>
        {
          hoveredObject ? <div className="map-tooltip"
            style={{position: 'absolute', zIndex: 1000, top: pointerY + 15, left: pointerX + 15, maxWidth: 350, pointerEvents: 'none', paddingLeft: 12, paddingRight: 12}}>
            <div><h3 style={{marginTop: 4}}>{hoveredObject.properties.name}</h3></div>
            <div><b>Hazard Ranking System Score:</b> {hoveredObject.properties.hazardScore}</div>
            <div><b>Year Listed:</b> {hoveredObject.properties.listed}</div>
            <div style={{marginBottom: 4}}><b>Status:</b> {hoveredObject.properties.status}</div>
          </div>: null
        }
      </div>
    );
  }
}
