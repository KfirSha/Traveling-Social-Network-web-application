import React, { Component } from 'react'
import {Nav, NavItem, NavLink} from "reactstrap";
import {AddPost} from "./AddPost"
import Button from "reactstrap/es/Button";
import {Feed} from "./Feed";
import jwt_decode from "jwt-decode";
import axios from "axios";




class Landing extends Component {
    constructor(props){
        super(props);
        // console.log(this.props)
        const token = localStorage.usertoken;
        let id = 0;
        if (token) {
            const decoded = jwt_decode(token);
            id = decoded.identity.id;
        }
        this.state= {
            users: [],
            add_post: false,
            user_id: id,
            logged_in: false
        };

    }

    componentDidMount() {
        axios.defaults.withCredentials = true;
        axios.post('http://127.0.0.1:5000/land/' + this.state.user_id).then(response => {
            // console.log(response)
            localStorage.setItem('usertoken', response.data.token)
            this.setState({logged_in:true})
        })
        .catch(err => {
            console.log(err)
            // return 'error'
        })
    }

    displayNewPost() {
        this.setState({add_post: !this.state.add_post})
    }





    render() {
        if (this.state.logged_in) {
            // {/*<Link to={"/new_post"}></Link>*/}
            return (
                <div className="container">
                    <div className="jumbotron mt-4">
                        <div className="col-sm-8 mx-auto">
                            <Nav tabs>
                                <NavItem>
                                    <NavLink>
                                        <Button

                                            onClick={this.displayNewPost.bind(this)}>
                                            New Post</Button>
                                        {this.state.add_post ? <AddPost history={this.props.history}/> : <br/>}

                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <h1 className="text-center">Posts</h1>
                            <Feed id={this.state.user_id}/>

                        </div>
                    </div>
                </div>

            )
        } else {
            return null
        }
    }
}

export default Landing