import React, {Component} from "react";
import axios from "axios";
import {PostCard} from "./PostCard";
import {store} from "react-notifications-component"


export class Feed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_user: props.id,
            posts_to_show: [],
            notifs: []
        };
    }
    componentDidMount() {
        axios.get('http://127.0.0.1:5000/posts/all/to_show/' + this.state.current_user).then((response) => {
            this.setState({posts_to_show: response.data});
        }).catch(err =>
            {console.log(err)}
        );
        axios.get('http://127.0.0.1:5000/subscribed/get_notif/').then((response) => {
            for (let i in response.data){
                let tmp_notifs = this.state.notifs
                tmp_notifs.push(response.data[i].id)
                this.setState({notifs: tmp_notifs})
                let new_notif = response.data[i].viewed ? '' : 'New '
                store.addNotification({
                    id: response.data[i].id,
                    title: new_notif + "Post Edit!",
                    message: "Post " + response.data[i].title + " has been edited.",
                    type: response.data[i].viewed ? "info" : "default",
                    // content: Notif,
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animated", "fadeIn"],
                    animationOut: ["animated", "fadeOut"],
                    onRemoval: this.onNotifRemoval,
                      dismiss: {
                        duration: 0,
                        click: false,
                        showIcon: true
                        }
                    })
            }
        }).catch(err =>
            console.log(err)
        )

    }
    componentWillUnmount() {
        for (let i in this.state.notifs) {
            store.removeNotification(this.state.notifs[i])
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.onbeforeunload = () => {
            for (let i in this.state.notifs) {
                store.removeNotification(this.state.notifs[i])
            }
        }
    }

    onNotifRemoval = (notif_id, removedBy) => {
        if (removedBy != 'click') {
            return
        }
        axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/notification/remove/' + notif_id).then((response) => {
        }).catch(err => {
            console.log(err)
        });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.componentDidMount();
    }


    editPost = post => {
    }

    deletePost = post_id => {
        if (!window.confirm("Delete your post?")){
            return;
        }
        axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/deletePost/' + post_id).then((response) => {
            window.location.reload()
         }).catch(err => {
             console.log(err)
         });
   }

    render() {
        let posts = [];
        for (let user_id in this.state.posts_to_show) {
            for (let post in this.state.posts_to_show[user_id]['posts']){
                posts.push((<PostCard post={this.state.posts_to_show[user_id]['posts'][post]}
                                      post_id={post}
                                      image={this.state.posts_to_show[user_id]['image_file']}
                                        name={this.state.posts_to_show[user_id]['user_name']}
                                        id={this.state.posts_to_show[user_id]['id']}
                                        current={this.state.current_user}
                                        deleteHandler={this.deletePost}
                                        editHandler={this.editPost}/>))
            }
        }

        return (
            <div className="feed">
                {posts}
            </div>
        );
    }
}