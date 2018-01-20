import React from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, withGoogleMap, withScriptjs } from 'react-google-maps';
import { MAP } from 'react-google-maps/lib/constants';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../redux/actions/appActions';

import DrawingManager from './drawing-manager';
import { DEFAULT_COORDS } from '../util/constants';

class MyMap extends React.Component {
  static contextTypes = { [MAP]: PropTypes.object };
  constructor(props) {
    super(props);
    this.google = window.google.maps;
  }

  select = (poly) => {
    if (!poly) {
      this.props.deselectPoly();
      return;
    }
    this.props.selectPoly(poly);
  }

  createPoly = (coords) => {
    const latLngs = coords.map(c => new this.google.LatLng(c.lat, c.lng))
    const path = new this.google.MVCArray(latLngs);
    const options = {
      fillColor: '#888',
      paths: new this.google.MVCArray([path]),
      visible: true,
      map: this.context[MAP],
    };
    return new this.google.Polygon(options);
  }

  onPolygonComplete = (poly) => {
    const id = (new Date()).toJSON();
    this.props.selectField(id);
    this.props.enableDrawing(false);
    poly.addListener('click', () => {
      this.select(poly);
      this.props.selectField(id);
    });
    this.select(poly);
  }

  render() {
    return (
      <GoogleMap
        defaultZoom={8} 
        defaultCenter={DEFAULT_COORDS}
      >
        {this.props.drawingEnabled ? <DrawingManager onPolygonComplete={this.onPolygonComplete}/> : null}
      </GoogleMap>
    );
  }
}

const mapStateToProps = state => ({
  selectedPoly: state.app.selectedPoly,
  drawingEnabled: state.app.drawingEnabled,
  selectedField: state.app.selectedField,
});

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withScriptjs(withGoogleMap(MyMap)));