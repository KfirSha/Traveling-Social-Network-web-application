import React, { Component } from "react";
import {Map, TileLayer, Popup, Marker} from "react-leaflet";
const MyMarker = props => {

  const initMarker = ref => {
    if (ref) {
      ref.leafletElement.openPopup()
    }
  }

  return <Marker ref={initMarker} {...props}/>
}

class MapExample extends Component {
  // mapRef = createRef();
  // plugin = createRef();
  constructor(props) {
    super(props);
    this.state = {
      currentPos: null
    };
    this.handleClick = this.handleClick.bind(this);
  }

  updateMarker(pos) {
    this.setState({currentPos: pos})
  }

  handleClick(e){
    console.log(this.state)
    this.setState({ currentPos: e.latlng });
    this.props.updateLngLat(e.latlng)
  }
  render() {
    return (
        <Map center={this.props.center} zoom={this.props.zoom} onClick={this.handleClick} ref={this.mapRef}>

          <TileLayer
              url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          { this.state.currentPos && <MyMarker position={this.state.currentPos}>
            <Popup position={this.state.currentPos}>
              Current location: <pre>{JSON.stringify(this.state.currentPos, null, 2)}</pre>
            </Popup>
          </MyMarker>}
        </Map>
    )
  }
}

export default MapExample;