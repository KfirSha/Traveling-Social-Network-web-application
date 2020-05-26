import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Navbar from './Component/Navbar'
import Landing from './Component/Landing'
import Login from './Component/Login'
import Register from './Component/Register'
import Profile from './Component/Profile'
import TravelPartners from './Component/TravelPartners'
import {Redirect} from "react-router-dom";
import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

function isLoggedIn() {
  if (localStorage.usertoken) {
    return true
  }
  return false
}

class App extends Component {
  render() {
    // const token = localStorage.usertoken;
    return (
      <Router>
        <div className="App">
          <Navbar />

          <div className="container">
            <ReactNotification/>
            {/*<Route exact path="/" component={Landing} />*/}
            <Route exact path="/" render={(props) => (
                isLoggedIn() ? (
                    <Landing {...props} />) : (<Redirect to={"/login"}/>)
                )}/>
            <Route exact path="/register" render={(props) => (
                !isLoggedIn() ? (
                    <Register {...props} />) : (<Redirect to="/profile"/> )
            )}/>
            <Route exact path="/TravelPartners" render={(props) => (
                isLoggedIn() ? (
                    <TravelPartners {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/login" render={(props) => (
                !isLoggedIn() ? (
                    <Login {...props} />) : (<Redirect to="/profile"/> )
            )}/>
             <Route exact path="/users/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/profile/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>

          </div>
        </div>
      </Router>
    )
  }
}


export default App;
