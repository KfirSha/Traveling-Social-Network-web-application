import React from 'react';
import { Component } from "react"
import jwt_decode from "jwt-decode";
import Alert from "react-bootstrap/Alert";
import {Post} from "./Post"

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};


export class AddPost extends Component{
    constructor(props) {
        super();
        this.state = {
            current_user: -1,
            invalid: false,
        };
        console.log(this.props);
        this.componentDidMount();
        this.newPost = React.createRef();
        this.onSubmit = this.onSubmit.bind(this)
    };
    componentWillReceiveProps(nextProps, nextContext) {
        this.componentDidMount();
    }
    componentDidMount() {
        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            this.setState({current_user: decoded.identity.id});
        }

    }
    onSubmit(e) {
        e.preventDefault();
        this.setState({invalid: false});
        if (validateForm(this.newPost.current.state.errors)) {
            console.log('create post');
            this.newPost.current.onAddPost(this.state.current_user).then( res => {
                if (res == 'Created') {
                    window.location.reload()
                }}).catch(err => {console.log(err)})

        } else {
            this.setState({invalid: true});
        }
    }
    render() {
        return(
            <div className="container">
                <form onSubmit={this.onSubmit}>
                <Post ref={this.newPost}/>
                <button
                    type="submit"
                    className="btn btn-lg btn-primary btn-block"
                >
                    Post
                </button>
                {this.state.invalid &&  <Alert color="danger">
                    Invalid post! please try again
                </Alert> }
                </form>
            </div>
        )
    }
}
