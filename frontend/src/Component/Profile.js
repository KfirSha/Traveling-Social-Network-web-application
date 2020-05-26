import React, { Component } from 'react';

import { Nav, NavItem, NavLink } from 'reactstrap';
import axios from "axios";
import {About} from "./About";
import {Users} from "./Users";

import Button from "react-bootstrap/Button";
import jwt_decode from "jwt-decode";
import Badge from "react-bootstrap/Badge";
import {Link} from "react-router-dom";

export class Profile extends Component{
    state={
        username: '',
        email: '',
        image_file: '',
        postsFlag: 1,
        aboutFlag:0,
        followingFlag:0,
        followersFlag:0,
        isFollowing: false,
        isFollowingMe: false,
        current_user:0,
        followers_amount:0,
        followed_amount:0,
        list_followers:[],
        show_followers: false,
        show_followed: false,
        list_followers_name:[],
        list_followed:[],
        list_followed_name:[],
        list_followers_image:[],
        list_followed_image:[]

    }

    showAbout(){
        if (this.state.aboutFlag) {
            this.setState({
                postsFlag: 0,
                aboutFlag: 0,
                followingFlag: 0,
                followersFlag: 0
            })
        } else {
            this.setState({
                postsFlag: 0,
                aboutFlag: 1,
                followingFlag: 0,
                followersFlag: 0
            })
        }
    }

    componentDidMount() {
        this.setState({aboutFlag: 0})
         const token = localStorage.usertoken;
          if (token) {
              const decoded = jwt_decode(token);
              this.setState({
                  current_user: decoded.identity.id
              });
          }
        axios.get('http://127.0.0.1:5000/users/' + this.props.match.params.id).then((response) => {
                this.setState({
                   username: response.data.username,
                    image_file: response.data.image_file,
                  email: response.data.email,
                    followers_amount: response.data.followers,
                    followed_amount: response.data.followed,
                    list_followers : response.data.list_followers,
                    list_followed : response.data.list_followed,
                    list_followers_name : response.data.list_followers_name,
                    list_followed_name : response.data.list_followed_name,
                    list_followers_image : response.data.list_followers_image,
                    list_followed_image : response.data.list_followed_image,
                    show_followers: false,
                    show_followed: false,
                })
            }).catch(err => {
                console.log(err)
            });
        axios.defaults.withCredentials = true;
         axios.get('http://127.0.0.1:5000/is_following/' + this.props.match.params.id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   isFollowing: res
                })
            }).catch(err => {
                console.log(err)
            });

         axios.defaults.withCredentials = true;
         axios.get('http://127.0.0.1:5000/is_following_me/' + this.props.match.params.id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   isFollowingMe: res
                })
            }).catch(err => {
                console.log(err)
            });

  }
   componentDidUpdate (prevProps) {
       if (prevProps.location.pathname !== this.props.location.pathname) {
           this.componentDidMount();
       }
   }

   followUser(){
         axios.defaults.withCredentials = true;
         axios.post('http://127.0.0.1:5000/follow/' + this.props.match.params.id).then((response) => {
                this.setState({
                   isFollowing: true
                })
             this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
   }

    unfollowUser(){
        console.log('unfollow')
         axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/follow/' + this.props.match.params.id).then((response) => {
                this.setState({
                   isFollowing: false
                })
             this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
   }

   updateMenuInfo(info){
        this.setState({
              username: info.username,
                email: info.email,
        });

   }
   updateMenuPic(info){
        this.setState({
              image_file: info.image_file,
        });

   }
   alertDelete(){

   }
   toggle_followers = () => this.setState((currentState) => ({show_followers: !currentState.show_followers}));
   toggle_followed = () => this.setState((currentState) => ({show_followed: !currentState.show_followed}));
   deleteUser(){
        if (!window.confirm("Delete your user?")){
            return;
        }
        console.log('delete');
       console.log(this)
        axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/deleteUser/' + this.props.match.params.id).then((response) => {
             console.log('deleted');
             localStorage.removeItem('usertoken')
            this.props.history.push(`/`)
             //this.componentDidMount();
         }).catch(err => {
             console.log(err)
         });
   }
    render(){
          let array_followers = [];
          // let array_followers_image = [];
          for(let i = 0; i < this.state.list_followers_name.length; i++) {
              array_followers.push(

                  <Link key={this.state.list_followers[i]} to={"/users/"+this.state.list_followers[i]} className="nav-link" href="#" data-toggle="tooltip" data-placement="top" title={this.state.list_followers_name[i]}><img alt='' className="center" className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + this.state.list_followers_image[i]}
                                               height="70" width="70"
                  /></Link>
            )
          }
          let array_followed = [];
          for(let i = 0; i < this.state.list_followed_name.length; i++) {
              array_followed.push(
                  <Link key={this.state.list_followed[i]} to={"/users/"+this.state.list_followed[i]}
                        className="nav-link"href="#" data-toggle="tooltip" data-placement="top"
                        title={this.state.list_followed_name[i]}>
                      <img alt='' className="center" className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + this.state.list_followed_image[i]}
                                               height="70" width="70"
                  /></Link>
            )
          }
          var basicInfo;
          if(this.state.isFollowing || (this.state.current_user.toString() === this.props.match.params.id))
          {
              basicInfo=
                        <div>
                            <button className="btn btn-primary btn-lg " onClick={this.toggle_followers}>followers - {this.state.followers_amount}</button>
                            {this.state.show_followers && <div className = "topContainer" > {array_followers}</div>}<br/>
                            <button className="btn btn-primary btn-lg " onClick={this.toggle_followed}>follows  - {this.state.followed_amount}</button>
                            {this.state.show_followed && <div className = "topContainer" > {array_followed}</div>}
                        </div>
          }
          else
              basicInfo="";

        return( <div>
                    <div className="jumbotron-fluid mt-5" >
                      <div className="text-center">
                          <div className="media">
                                      <div className="media-body">
                                          <img alt='' className="center" className="rounded-circle account-img"
                                               // http://127.0.0.1:5000/static/profile_pics/e842e5b4e1208d3b.jpg
                                               src={"http://127.0.0.1:5000"+this.state.image_file}
                                               height="200" width="200"
                                          />
                                          <h1 className="account-heading">{this.state.username}</h1>
                                          <div>{basicInfo}</div>
                                          <h5>{(this.state.current_user != this.props.match.params.id) && this.state.isFollowingMe &&
                                          <Badge pill variant="secondary">Follows you</Badge>}</h5>
                                               {(this.state.current_user != this.props.match.params.id) && <Button
                                                  variant="outline-primary"
                                                  onClick={this.state.isFollowing ? this.unfollowUser.bind(this) : this.followUser.bind(this)}
                                                >
                                                  {this.state.isFollowing ? 'Unfollow' : 'Follow'}
                                                </Button> }
                                                {(this.state.current_user == this.props.match.params.id) && <Button
                                                  variant="outline-danger"
                                                  onClick={this.deleteUser.bind(this)}
                                                >
                                                  Delete yourself
                                                 </Button> }
                                      </div>
                      </div>
                    </div>
                    </div>

                    <Nav tabs>
                          <NavItem>{((this.state.current_user == this.props.match.params.id) || this.state.isFollowing)&&
                            <NavLink
                                href="#"
                                onClick= {this.showAbout.bind(this)}>
                                About Me
                            </NavLink>}
                          </NavItem>
                        </Nav>

            {this.state.aboutFlag ? <About id ={this.props.match.params.id} updateInfo={this.updateMenuInfo.bind(this)}
                    updatePic={this.updateMenuPic.bind(this)} /> : <br/>}
                {this.state.followersFlag  ? <Users id ={this.props.match.params.id} type={1} flag={this.state.isFollowing}/> : <br/>}
                {this.state.followingFlag  ? <Users id ={this.props.match.params.id} type={2} flag={this.state.isFollowing}/> : <br/>}

            </div>

        )
    }
}

export default Profile;
