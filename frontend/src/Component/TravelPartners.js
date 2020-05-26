import React, { Component } from 'react'
import axios from "axios";
import ShelterMap from "./mapPosts"
import DatePicker from "react-datepicker";
import jwt_decode from "jwt-decode";
import LocationSearchInput from "./googleAutoComplete";
import Map from "./leafletCoord";
class TravelPartners extends Component {
  constructor() {
    super();
    const token = localStorage.usertoken;
    let id = 0;
    if (token) {
        const decoded = jwt_decode(token);
        id = decoded.identity.id;
    }
    this.state = {
        posts: [],
      current_user: '',
      radius: 0,
      start_date: 0 ,
      end_date : 0,
      logged_in: false,
        user_id: id,
        latitude : 0,
        longitude : 0,
        country : '',
        city : '',

    };
    this.small_map = React.createRef();
    this.big_map = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount() {
      axios.defaults.withCredentials = true;
        axios.post('http://127.0.0.1:5000/land/' + this.state.user_id).then(response => {
            localStorage.setItem('usertoken', response.data.token)
            this.setState({logged_in:true})
        })
        .catch(err => {
            console.log(err)
        })
  }
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    e.preventDefault();
    const { name, value } = e.target;
    this.setState({[name]: value});
  }
      changePosParam = (pos) => {
        this.setState({
            longitude: pos.lng,
            latitude: pos.lat,
        });
          this.small_map.current.updateMarker(pos)
    };
    startChange = date => {
        this.setState({start_date: date})
    };

    endChange = date => {
        this.setState({end_date: date})
    };
  onSubmit(e) {
    e.preventDefault();
    axios
      .post('http://127.0.0.1:5000/posts/travel_partners', {
        radius: this.state.radius,
        start_date : this.state.start_date,
        end_date : this.state.end_date,
        latitude : this.state.latitude ,
        longitude : this.state.longitude
      })
      .then(response => {
        this.setState({posts : response.data});
          this.big_map.current.updateMarkers()
      })
      .catch(err => {
        console.log(err);
        return 'error'
      })
  }

  render() {
      if (this.state.logged_in) {
          return (
              <div className="container">
                      <div className="col-md-6 mt-5 mx-auto">
                          <form noValidate onSubmit={this.onSubmit}>
                              <h1 className="h3 mb-3 font-weight-normal">Search for travel partners</h1>
                              <div className="form-group">
                                  <label htmlFor="radius">radius</label>
                                  <input
                                      type="integer"
                                      name="radius"
                                      placeholder="Enter radius"
                                      value={this.state.radius}
                                      onChange={this.onChange}
                                      noValidate
                                  /><br/>
                                  <label htmlFor="start_date">Start date</label>
                                  <DatePicker name="start_date"
                                              selected={this.state.start_date}
                                              onChange={this.startChange}
                                              dateFormat="dd/MM/yyyy"
                                              maxDate={this.state.end_date ? this.state.end_date : null}
                                  /><br/>
                                  <label htmlFor="end_date">End date</label>
                                  <DatePicker name="end_date"
                                              selected={this.state.end_date}
                                              onChange={this.endChange}
                                              dateFormat="dd/MM/yyyy"
                                              minDate={this.state.start_date}
                                  />
                              </div>
                                <label  htmlFor="location">location</label>
                              <LocationSearchInput updateLngLat={this.changePosParam.bind(this)}/>
                              <div className="little_map2">
                              <Map ref={this.small_map}
                                    updateLngLat={this.changePosParam.bind(this)} zoom={2} center={{ lat: 51.5287718, lng: -0.2416804 }}
                                    name="location"
                                            />
                              </div>
                              <button
                                  type="submit"
                                  className="btn btn-lg btn-primary btn-block"
                              >
                                  Search
                              </button>
                          </form>
                      </div>
                  <div className="big_map">
                  <ShelterMap ref={this.big_map} posts = {this.state.posts}/>
                  </div>
              </div>
          )
      } else{
          return null
      }
  }
}

export default TravelPartners