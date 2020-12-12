import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Query, Mutation, useMutation, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from "react-router-dom";
import ChatConnector from './ChatConnector';

import { subscribeToNewMessage, sendNewMessage, login } from './api';

const NEW_CHAT = gql`
  mutation NewChat($to: ID!) {
    newChat(to: $to) { 
      fromTo
    }
  }
`

class Chat extends Component {

  constructor(props){
    super(props);

    this.state.counterpart = props.to;
    this.state.username = localStorage.getItem("USER") && JSON.parse(localStorage.getItem("USER")).name
    login(this.state.username,this.state.counterpart);
    subscribeToNewMessage((err, msg) => { this.setState({ msgs: this.state.msgs.concat([{from:msg.username, msg:msg.message}])}) });
    this.state.initialize = true;


    
  }

  state = {
    username: '',
    counterpart: '',
    msgs: [],
    msg: ''
  };


  sendMsg() {
    sendNewMessage(this.state.msg);
    this.setState({ msgs: this.state.msgs.concat([{from:this.state.username, msg:this.state.msg}]), msg: ''})
  }

  keyDown(e) {
    if(e.keyCode===13) {
      this.sendMsg();
    }
  }

  render() {

    const userId =  localStorage.getItem("USER") && JSON.parse(localStorage.getItem("USER")).id;
    const msg = this.state.msg;
    const to = this.props.toId;
   
    return (
      <div className="chat"> 
        <ChatConnector toId={to} />
        <button className="close" onClick={()=>{this.props.closeCb()}}>X</button>
        {this.state.msgs.map((m)=>{
          return (<span><b>{m.from}</b> {m.msg}<br /></span>)
        })}
                                      <div><input  value={msg} onKeyDown={e => this.keyDown(e) }
                                                                  onChange={e => this.setState({ msg: e.target.value })}
                                                                  type="text"></input></div>
                                    
                                        </div>
    )
  }

}

export default Chat
