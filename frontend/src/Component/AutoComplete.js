import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from "axios";
import { Component } from "react"

class AutoComplete extends Component{
    constructor() {
        super();
        this.state = {
            users: [],
            tags: '',
            search_msg:'Search for a user'
        };
        this.updateUsers();
    }
    updateUsers()
    {
        var tmpUsers = [];
        axios.get('http://127.0.0.1:5000/usersAll').then((response) => {
            response.data.forEach(function (user) {
                // console.log(user)
                tmpUsers.push({user_name: user})
            })
            this.setState({users: tmpUsers})
        }).catch(err => {

        });
    }
    onTagsChange = (event, values) => {
        this.setState({
            tags: values,
            search_msg: ''
        }, () => {
            if(this.state.tags){
                this.props.updateUserChoise(this.state.tags.user_name);
            }
        });
    }
    render (){
        return(
            <Autocomplete
                onChange={this.onTagsChange}
                id="combo-box-demo"
                autoHighlight
                clearOnEscape={true}
                options={this.state.users}
                getOptionLabel={option => option.user_name}
                style={{ width: 300 }}
                renderInput={params => (
                    <TextField {...params} placeholder={this.state.search_msg} variant="outlined" fullWidth />
                )}
            />
        )
    }
}

export default AutoComplete