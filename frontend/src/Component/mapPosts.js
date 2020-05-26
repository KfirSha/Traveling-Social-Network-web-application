import React, { Component } from "react"
import { compose } from "recompose"
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps"
import axios from "axios";
import jwt_decode from "jwt-decode";
import {Link} from "react-router-dom";

const MapWithAMarker = compose(withGoogleMap)(props => {

  return (
    <GoogleMap defaultZoom={1.5} defaultCenter={{ lat: 1, lng: 1 }}>
      {props.markers.map(marker => {
        const onClick = props.onClick.bind(this, marker)
        return (
          <Marker
            key={marker.date_posted}
            onClick={onClick}
            position={{ lat: marker.latitude, lng: marker.longitude }}
          >
            {props.selectedMarker === marker &&
              <InfoWindow>
                <div>
                    <label>title:</label>{marker.title}<br/>
                    <label>content:</label>{marker.content}<br/>
                    <label>start date:</label>{marker.start_date}<br/>
                    <label>end date: </label>{marker.end_date}<br/>
                    <label>posted by: </label><Link href="#" to={"/users/" + marker.user_id}>{marker.user_id}</Link><br/>
                </div>
              </InfoWindow>}
          </Marker>
        )
      })}
    </GoogleMap>
  )
})

export default class ShelterMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shelters: [],
      selectedMarker: false,
        current_user: this.props.current_user
    }
  }
  componentDidMount() {
      let id = -1 ;
    const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            id = decoded.identity.id;
        }
    let posts = [];
    let post_to_show={};
        axios.get('http://127.0.0.1:5000/posts/all/to_show/' + id).then((response) => {
            post_to_show = response.data
            for (let user_id in post_to_show) {
            // console.log('posts of' + user_id);
                for (let post in post_to_show[user_id]['posts']){
                    // console.log(this.state.posts_to_show[user_id]['posts'])
                    posts.push(post_to_show[user_id]['posts'][post])
                 }
            }
            this.setState({ shelters: posts })
        }).catch(err =>
            console.log(err)
        )
  }
  updateMarkers () {
      let id = -1 ;
    const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            id = decoded.identity.id;
        }
    let posts = [];
    let post_to_show={};
        axios.get('http://127.0.0.1:5000/posts/all/to_show/' + id).then((response) => {
            post_to_show = response.data
            for (let user_id in post_to_show) {
            // console.log('posts of' + user_id);
                for (let post in post_to_show[user_id]['posts']){
                    // console.log(this.state.posts_to_show[user_id]['posts'])
                    posts.push(post_to_show[user_id]['posts'][post])
                 }
            }
            this.setState({ shelters: posts })
                  let tmpposts = {};
      if (Object.keys(this.props.posts).length>0) {
        tmpposts = this.props.posts
      if(tmpposts!=undefined)
      {
          let selt = this.state.shelters
          Object.keys(tmpposts).forEach(function(key) {
            selt.push(tmpposts[key]);
        });
          this.setState({shelters: selt})
      }
  }
        }).catch(err =>
            console.log(err)
        )
  }

  handleClick = (marker,event) => {
    this.setState({ selectedMarker: marker })
  };
  render() {
    return (
      <MapWithAMarker
        selectedMarker={this.state.selectedMarker}
        markers={this.state.shelters}
        onClick={this.handleClick}
        onChange={this.handleChange}
        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,placing"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `500px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    )
  }
}