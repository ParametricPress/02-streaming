/// app.js
import React, { Component } from 'react';
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL, { GeoJsonLayer, TextLayer } from 'deck.gl';
import { accentColor, backgroundColor, debounceTimer } from './constants';
import { scaleLinear } from '@vx/scale';


// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibWF0aGlzb25pYW4iLCJhIjoiY2l5bTA5aWlnMDAwMDN1cGZ6Y3d4dGl6MSJ9.JZaRAfZOZfAnU2EAuybfsg';

let initialViewport;

export default class SuperfundMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewport: {},
      initialized: false,
      transitioning: false
    };

    this.zoomScale =  scaleLinear({ range: [9, 10.5], domain: [300, 1440], clamp: true});
    this.latitudeScale = scaleLinear({ range: [37.222117, 37.322117], domain: [300, 1440], clamp: true });
    this.longitudeScale = scaleLinear({ range: [-121.955563, -121.955563], domain: [300, 1440], clamp: true });

    this.resizeBounce = null;
    this._size = this._size.bind(this);
  }

  _size() {
    this._onChangeViewport({
      width: '100%',
      height: window.innerHeight * (2/3),
      zoom: this.zoomScale(window.innerWidth),
      latitude: this.latitudeScale(window.innerWidth),
      longitude: this.longitudeScale(window.innerWidth)
    });
  }

  _resize() {
    if (this.resizeBounce) {
      clearTimeout(this.resizeBounce);
    }

    this.resizeBounce = setTimeout(this._size, debounceTimer);
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: Object.assign({}, this.state.viewport, viewport)
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._size();
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
      getRadius: 4,
      radiusMinPixels: 4,
      pointRadiusMinPixels: 4,
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

  render() {
    const { viewport, initialized, transitioning, hoveredObject, pointerX, pointerY } = this.state;

    let tooltipPos;
    if (viewport.width < 800) {
      tooltipPos = {
        left: 0,
        bottom: 0,
        width: viewport.width,
        borderBottom: 'solid 4px #D8FFA2'
      }
    } else {
      if (hoveredObject && hoveredObject.properties.name === "Fairchild Semiconductor Corp. (South San Jose Plant)") {
        tooltipPos = {
          top: pointerY + 15,
          left: pointerX - 350 - 15,
          width: 350
        }
      } else {
        tooltipPos = {
          top: pointerY + 15,
          left: pointerX + 15,
          maxWidth: 350
        }
      }
    }

    return (
      <div key={'map'} style={{position: 'relative', width: '100%'}}>
        <button
          onClick={() => this.props.updateProps({ zoomEnabled: !this.props.zoomEnabled })}
          style={{
            position: 'absolute', 
            fontSize: '0.7em',
            bottom: '1em',
            left: '50%',
            transform: 'translateX(-50%)',
            // pointerEvents: 'none',
            zIndex: 4
        }}>
          Click to {this.props.zoomEnabled ? 'disable' : 'enable'} pan / zoom
        </button>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: this.props.zoomEnabled ? 0 : 0.2,
            pointerEvents: 'none',
            zIndex: 3
          }}
        />
        <MapGL
          {...viewport}
          onClick={() => this.props.updateProps({ zoomEnabled: !this.props.zoomEnabled })}
          mapStyle="mapbox://styles/mathisonian/cjv2tiyabes041fnuap89nfrt"
          dragPan={this.props.zoomEnabled}
          dragRotate={this.props.zoomEnabled}
          scrollZoom={this.props.zoomEnabled}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          getCursor={({isDragging, isHovering}) => {
            return !this.props.zoomEnabled ? 'default' :
            isDragging ? 'grabbing' : 'grab'
          }}
          onViewportChange={this._onChangeViewport.bind(this)}
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
            style={{
              position: 'absolute',
              zIndex: 1000,
              ...tooltipPos,
              pointerEvents: 'none',
              paddingLeft: 12,
              paddingRight: 12,
              backgroundColor: backgroundColor
            }}>
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
