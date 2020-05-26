import React, {Component} from "react";
import ListGroup from 'react-bootstrap/ListGroup'
import Card from 'react-bootstrap/Card'
import {ListGroupItem} from 'react-bootstrap'
import {Link} from "react-router-dom";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Geocode from "react-geocode";
import DatePicker from "react-datepicker";
import Map from "./leafletCoord";



const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};

const update = updatedPost => {
    axios.defaults.withCredentials = true;
  return axios
    .put('http://127.0.0.1:5000/posts/'+updatedPost.post_id, {
        user_id: updatedPost.user_id,
        title: updatedPost.title,
        content: updatedPost.text,
        start_date: updatedPost.start_date,
        end_date: updatedPost.end_date,
        date_posted: updatedPost.date_posted,
        country: updatedPost.country,
        city: updatedPost.city,
        longitude: updatedPost.longitude,
        latitude: updatedPost.latitude,
    })
    .then(response => {
        return response.data
    }).catch(err =>
      {console.log(err)})

}


function EditPost(props){
    return (
        <div id="post">
            <form noValidate onSubmit={props.onSubmit}>
            <div className="form-group">
                <label htmlFor="name">Title</label>
                <input
                    type="text"
                    className="form-control"
                    name="title"
                    placeholder="Post title"
                    value={props.new_title}
                    onChange={props.onChange}
                    noValidate
                />
                {props.errors.title.length > 0 &&
                <span className='error'>{props.errors.title}</span>}
            </div>
        <div>
            <label htmlFor="name">Start date</label>
            <DatePicker
                name="start_date"
                selected={new Date(props.start_date)}
                onChange={props.startChange}
                dateFormat="yyyy/MM/dd"
                maxDate={new Date(props.end_date) ? new Date(props.end_date) : null}
            />
        </div>
        <div>
            <label htmlFor="name">End date</label><br/>
            <DatePicker name="end_date"
                        selected={new Date(props.end_date)}
                        onChange={props.endChange}
                        dateFormat="yyyy/MM/dd"
                        minDate={new Date(props.start_date)}
                // maxDate={new Date()}
            />
        </div>
        <div className="form-group">
            <label htmlFor="name">Country</label>
            <input
                type="text"
                className="form-control"
                name="country"
                placeholder="Enter country"
                value={props.country}
                onChange={props.onChange}
                noValidate
            />
            {/*{props.errors.country.length > 0 &&*/}
            {/*<span className='error'>{props.errors.country}</span>}*/}
        </div>
        <div className="form-group">
            <label htmlFor="name">City</label>
            <input
                type="text"
                className="form-control"
                name="city"
                placeholder="Enter city"
                value={props.city}
                onChange={props.onChange}
                noValidate
            />
            {/*{props.errors.city.length > 0 &&*/}
            {/*<span className='error'>{props.errors.city}</span>}*/}
        </div>
        <button onClick={props.update_lat_lng}>update-location</button>
        <div className="little_map1">
            <Map
                ref={props.small_map} updateLngLat={props.changePosParam} zoom={2} center={{ lat: 51.5287718, lng: -0.2416804 }}
                name="location"
            />
            {props.errors.location.length > 0 &&
            <span className='error'>{props.errors.location}</span>}
        </div>
        <div style={{marginBottom: '5rem', marginTop: '25px'}}>
            <label htmlFor="content">Content</label>
            <textarea style={{margin: '3px', borderRadius: '4px'}} name="content" cols="40"
                      rows="3"
                      value={props.new_text}
                      onChange={props.onChange}
                        className="content-feed"> </textarea>

            {props.errors.content.length > 0 &&
            <span className='error'>{props.errors.content}</span>}
        </div>
        <button ref={props.button_ref}
            type="submit"
            className="btn btn-lg btn-primary btn-block"
          >
            Update
          </button>
            </form>
    </div>
    );
}


export class PostCard extends Component{
    constructor(props) {
        super(props);
        this.state = {
            current_user: props.current,
            user_name: props.name,
            image_file: props.image,
            poster_id: props.id,
            post_id: props.post_id,
            title: props.post.title,
            new_title: props.post.title,
            text: props.post.content,
            new_text: props.post.text,
            start_date: props.post.start_date,
            end_date: props.post.end_date,
            new_start: props.post.start_date,
            new_end: props.post.end_date,
            date_posted: props.post.date_posted,
            longitude: props.post.longitude,
            new_longitude: props.post.longitude,
            latitude: props.post.latitude,
            new_latitude: props.post.latitude,
            country: props.post.country,
            new_country: props.post.country,
            city: props.post.city,
            new_city: props.post.city,
            errors: {
                title: 'Please enter a title',
                start_date: '',
                end_date: '',
                country: '',
                city: '',
                location: 'Please pick a location',
                content: '',
            },
            is_subscribed: false,
            edit_open: false,
            deleteHandler: props.deleteHandler,
            editHandler: props.editHandler,
            invalid: 0
        }
        this.small_map = React.createRef()
        this.newPost = React.createRef();
        this.editButtonRef = React.createRef();
    }
    componentDidMount() {
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/is_subscribed/' + this.state.post_id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   is_subscribed: res
                })
            }).catch(err => {
                console.log(err)
            });

    }

    startChange = date => {
        console.log('start change');
        this.setState({new_start: date})
    };

    endChange = date => {
        console.log('end change');
        this.setState({new_end: date})
    };

    onSubmit = (e) => {
        console.log('submit');
        e.preventDefault();
    this.setState({invalid: 0});
        console.log(e.target.start_date.value)
    const updatedPost = {
      user_name: this.state.user_name,
      image_file: this.state.image_file,
        poster_id: this.state.poster_id,
        post_id: this.state.post_id,
        title: e.target.title.value,
        text:e.target.content.value,
        start_date: e.target.start_date.value,
        end_date: e.target.end_date.value,
        date_posted: new Date(),
        longitude: this.state.new_longitude, //TODO
        latitude: this.state.new_latitude,
        country: e.target.country.value,
        city: e.target.city.value
    };

     if (validateForm(this.state.errors)) {
         update(updatedPost).then(res => {
             if (res == 'Updated') {
                 console.log(res)
               this.setState({edit_open: false});
                 axios.get('http://127.0.0.1:5000/subscribed/notify/' + this.state.post_id).then((response) => {
                     console.log(response)
                     window.location.reload()
                 // this.componentDidMount();
                 }).catch(err => {
                    console.log(err)
                 });
             }
             else {
                 console.log(res)
             }
         })
     }
     else{
         this.editButtonRef.current.insertAdjacentHTML('beforebegin','<Alert color="danger">\n' +
             '                    Invalid post! please try again\n' +
             '                </Alert>')
         this.setState({invalid: 1});

     }
    };
    changePosParam = (pos) => {
        let errors = this.state.errors;
        errors.location = '';
        this.setState({
            new_longitude: pos.lng,
            new_latitude: pos.lat,
        });
        this.update_city_country_lebel_from_cord(pos.lat,pos.lng)
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
                        city = '';
                    this.setState({city : city,country:state})
                    // console.log(city);
                    // console.log(state);
                }
            }
            else
            {
                this.setState({city : "",country:""})
            }
        },
        error => {
            this.setState({city : "",country:""});
            console.error(error);
        }
    );
    this.render()
}
update_lat_lng(e)
{
    e.preventDefault();
    let errors=this.state.errors;
    errors.location='';
    Geocode.setApiKey("****");
    Geocode.setLanguage("en");
                Geocode.fromAddress(this.state.country+this.state.city).then(
      response => {
                          if (response.status == 'OK') {
              const {lat, lng} = response.results[0].geometry.location;
              this.setState({
                  new_longitude: lng,
                  new_latitude: lat,
              });
              this.small_map.current.updateMarker(response.results[0].geometry.location)
          }
            }).catch(err => {
                console.log(err)
            });
}
    onChange = (e) => {
        // console.log('change')
        let errors = this.state.errors;
        const { name, value } = e.target;
        this.setState({ [e.target.name]: e.target.value });

        switch (name) {
            case 'title':
                // this.setState({title: 0});
                errors.title =
                    value.length < 1
                        ? 'Please enter a title'
                        : '';
                break;
            default:
                break;
        }
        this.setState({errors, [name]: value});
    }

    deletePost(e) {
        console.log(e);
        this.state.deleteHandler(this.state.post_id)
    }
    toggleEdit() {
        this.setState({edit_open: !this.state.edit_open})
    }
    onSubscribe() {
        axios.defaults.withCredentials = true;
         axios.post('http://127.0.0.1:5000/subscribe/' + this.state.post_id).then((response) => {
            this.setState({is_subscribed: true})
             // this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
    }
    onUnsubscribe() {
        axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/subscribe/' + this.state.post_id).then((response) => {
            this.setState({is_subscribed: false})
             // this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
    }
    render() {
        // console.log(this.state)
        // console.log("http://127.0.0.1:5000" + this.state.image_file)
        return(
            <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" src={"http://127.0.0.1:5000" + this.state.image_file} />
                <Card.Body>
                <Card.Title>{this.state.title}</Card.Title>
                <Card.Text>
                    {this.state.text}
                </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>{this.state.city}, {this.state.country}</ListGroupItem>
                    <ListGroupItem>{this.state.start_date} - {this.state.end_date}</ListGroupItem>
                    <ListGroupItem>Posted on: {this.state.date_posted}</ListGroupItem>
                    <ListGroupItem>Map: {this.state.longitude}, {this.state.latitude}</ListGroupItem>
                </ListGroup>
                <Card.Body>
                    <div>Posted by: <Link href="#" to={"/users/" + this.state.poster_id}>{this.state.user_name}</Link></div>
                    {this.state.current_user == this.state.poster_id ?
                        <Button onClick={this.toggleEdit.bind(this)} href="#">Edit</Button>
                        :
                        this.state.is_subscribed ?
                        <Button onClick={this.onUnsubscribe.bind(this)} href="#">Unsubscribe</Button> :
                        <Button onClick={this.onSubscribe.bind(this)} href="#">Subscribe</Button>}
                    {this.state.edit_open && <EditPost
              title={this.state.new_title}
              text={this.state.new_text}
              start_date={this.state.new_start}
              end_date={this.state.new_end}
              date_posted={this.state.date_posted}
              longitude={this.state.new_longitude}
                latitude= {this.state.new_latitude}
                country={this.state.country}
                city={this.state.city}
              errors={this.state.errors}
              small_map = {this.small_map}
              update_lat_lng={this.update_lat_lng.bind(this)}
              changePosParam = {this.changePosParam.bind(this)}
              onChange={this.onChange}
              handlechange={this.handleChange}
              onSubmit={this.onSubmit}
              startChange={this.startChange}
              endChange={this.endChange}
              invalid={0}
              user_taken={this.state.user_taken}
              email_taken={this.state.email_taken}
              flag={this.state.flag}
              toggleUpdate={this.toggleUpdate}
              onchangeimg={this.onChangeImg}
              button_ref={this.editButtonRef}
            />}
                    <div>{this.state.current_user == this.state.poster_id ?
                        <Button onClick={this.deletePost.bind(this)} href="#">Delete</Button> : <br/>}</div>
                    {/*<Link href="#">Subscribe</Link>*/}
                </Card.Body>
            </Card>
        )
    }

}