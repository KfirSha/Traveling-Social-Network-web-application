import React, { Component } from 'react'
import axios from "axios";
import DatePicker from "react-datepicker";
import Map from "./leafletCoord";
import Geocode from "react-geocode";

export const createPost = post => {
    axios.defaults.withCredentials = true;
    return axios
        .post('http://127.0.0.1:5000/post/new', {
            // id: post.id,
            title: post.title,
            date_posted: post.date_posted,
            user_id: post.user_id,
            start_date: post.start_date,
            end_date: post.end_date,
            country: post.country,
            city: post.city,
            latitude: post.latitude,
            longitude: post.longitude,
            content: post.content
        })
        .then(response => {
            return response.data
        })
};

export class Post extends Component{
    constructor() {
        super();
        this.state = {
            // id: -1,
            title: '',
            date_posted: new Date(),
            user_id: -1,
            start_date: new Date(),
            end_date: null,
            country: '',
            city: '',
            latitude: 1,
            longitude: 1,
            content: '',
            errors: {
                title: 'Please enter a title',
                start_date: '',
                end_date: 'Please select an end date',
                country: '',
                city: '',
                location: 'Please pick a location',
                content: '',
            },
            invalid: 0
        };
        this.small_map = React.createRef();
        this.onChange = this.onChange.bind(this);
    }
    startChange = date => {
        this.setState({start_date: date}, );
        let errors = this.state.errors;
        errors.start_date = ''
    };

    endChange = date => {
        this.setState({end_date: date});
        let errors = this.state.errors;
        errors.end_date = ''
    };
    changePosParam = (pos) => {
        let errors = this.state.errors;
        errors.location = '';
        this.setState({
            longitude: pos.lng,
            latitude: pos.lat,
        });
        this.update_city_country_lebel_from_cord(pos.lat,pos.lng)
    };
    onAddPost = id => {
        const new_post = {
            user_id: id,
            title: this.state.title,
            date_posted: this.state.date_posted,
            start_date: this.state.start_date,
            end_date: this.state.end_date,
            country: this.state.country,
            city: this.state.city,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            content: this.state.content
        };
        let result = createPost(new_post).then(res => { return res
        }).catch(
            err => {
                console.log(err);
                throw err;
            });
        return result;
    };
    update_city_country_lebel_from_cord(lat,lan)
{
    Geocode.setApiKey("****");
    Geocode.setLanguage("en");
    Geocode.fromLatLng(lat, lan).then(
        response => {
            if (response.status == 'OK') {
                if (response.results[1]) {
                    var city = false, state = false;
                    for (var i = 0; i < response.results.length; i++) {
                        if ((!city || !state) && response.results[i].types[0] === "locality") {
                            city = response.results[i].address_components[0].short_name;
                            // state = response.results[i].address_components[2].short_name;
                        }
                        if ((!city || !state) && response.results[i].types[0] === "country") {
                            state = response.results[i].address_components[0].long_name;
                        }
                    }
                    if (!city)
                        city = "";
                    this.setState({city : city,country:state})
                }
            }
            else
            {
                this.setState({city : "",country:""})
            }
        },
        error => {
            this.setState({city : "",country:""})
            console.error(error);
        }
    );
}
update_lat_lng(e)
{
    e.preventDefault();
    let errors = this.state.errors;
    errors.location = '';
    Geocode.setApiKey("****");
    Geocode.setLanguage("en");
                Geocode.fromAddress(this.state.country+this.state.city).then(
      response => {
                          if (response.status == 'OK') {
              const {lat, lng} = response.results[0].geometry.location;
              this.setState({
                  longitude: lng,
                  latitude: lat,
              })
              this.small_map.current.updateMarker(response.results[0].geometry.location)
          }
            }).catch(err => {
                console.log(err)
            });
}
    onChange(e) {
         e.preventDefault();
        let errors = this.state.errors;
        const { name, value } = e.target;
        this.setState({ [e.target.name]: e.target.value });
        switch (name) {
            case 'title':
                errors.title =
                    value.length < 1
                        ? 'Please enter a title'
                        : '';
                break;
            default:
                break;
        }
        this.setState({errors, [name]: value});
    };

    render() {
        return (
            <div id="post">
                <div className="form-group">
                    <label htmlFor="name">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        placeholder="Post title"
                        value={this.state.title}
                        onChange={this.onChange}
                        noValidate
                    />
                    {this.state.errors.title.length > 0 &&
                    <span className='error'>{this.state.errors.title}</span>}
                </div>
                <div>
                    <label htmlFor="name">Start date</label><br/>
                    <DatePicker name="start_date"
                     selected={this.state.start_date}
                     onChange={this.startChange}
                     dateFormat="dd/MM/yyyy"
                     maxDate={this.state.end_date ? this.state.end_date : null}
                    />
                    {this.state.errors.start_date.length > 0 &&
                    <span className='error'>{this.state.errors.start_date}</span>}
                </div>
                <div>
                    <label htmlFor="name">End date</label><br/>
                    <DatePicker name="end_date"
                     selected={this.state.end_date}
                     onChange={this.endChange}
                     dateFormat="dd/MM/yyyy"
                     minDate={this.state.start_date}
                    />
                    {this.state.errors.end_date.length > 0 &&
                    <span className='error'>{this.state.errors.end_date}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="name">Country</label>
                    <input
                        type="text"
                        className="form-control"
                        name="country"
                        placeholder="Enter country"
                        value={this.state.country}
                        onChange={this.onChange}
                        noValidate
                    />
                    {this.state.errors.country.length > 0 &&
                    <span className='error'>{this.state.errors.country}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="name">City</label>
                    <input
                        type="text"
                        className="form-control"
                        name="city"
                        placeholder="Enter city"
                        value={this.state.city}
                        onChange={this.onChange}
                        noValidate
                    />
                    {this.state.errors.city.length > 0 &&
                    <span className='error'>{this.state.errors.city}</span>}
                </div>
                <button onClick={this.update_lat_lng.bind(this)}>update-location</button>
                <div className="little_map2">
                    <Map
                        ref={this.small_map} updateLngLat={this.changePosParam.bind(this)} zoom={2} center={{ lat: 51.5287718, lng: -0.2416804 }}
                        name="location"
                    />
                    {this.state.errors.location.length > 0 &&
                    <span className='error'>{this.state.errors.location}</span>}
                </div>
                <div style={{  marginBottom: '5rem', marginTop: '25px'}}>
                    <label htmlFor="content">Content</label>
                    <textarea style={{position: 'absolute',  margin: '3px',   borderRadius: '4px'}} name="content" cols="40" rows="3"
                              value={this.state.content}
                              onChange={this.onChange}> </textarea>
                    {this.state.errors.content.length > 0 &&
                    <span className='error'>{this.state.errors.content}</span>}
                </div>

            </div>
        )
    }

}
