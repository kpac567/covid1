import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Query, Mutation, Subscriptio, useMutation } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from "react-router-dom";
import Chat from './Chat';
import { Select, MenuItem, Button, Snackbar, InputLabel } from '@material-ui/core';

const USERS_QUERY = gql`
query GetAllUsers {
  allUsers {
        id
        name
        bday
        gender
        city
  }
}
`

const USER_QUERY_ARGS = gql`
query GetUser($id: ID!) {
  getUserByArgs(id: $id)  {       
        name
  }
}
`

const IMAGES_QUERY = gql`
query GetImages($id: ID!) {
  getImagesByArgs(id: $id)  {
        id
        images
  }
}
`

const ALL_LIKES_QUERY = gql`
query AllLikes {
  getAllLikes {
        id
        likes { id }
  }
}
`

const NEW_LIKE = gql`
  mutation NewLike($userId: ID!) {
    newLike(userId: $userId) { 
      id
    }
  }
`

const NEW_CHAT_SUBSCRIPTION = gql`
  subscription NewChat {
    chat { 
      node { 
        fromTo
        date
      }
    }
  }
`

const CHATS = gql`
  query Chats {
    getChats { 
      fromTo
      date
    }
  }
`
const NEW_CHAT = gql`
  mutation NewChat($to: ID!) {
    newChat(to: $to) { 
      fromTo
    }
  }
`

class Users extends Component {


  constructor(props) {
    super(props);

  }

  state = {
    chats: []
    ,filterSex: null,filterAge: null, chatWindows: []
  }

  isMatch(userLikes, otherLikes, userId) {
    let match = false;
    if(userLikes && otherLikes) {
    userLikes.map((likesId)=>{
      otherLikes.map((likedId)=>{
        
        if(localStorage.getItem("USER") &&  userId === likesId && likedId === JSON.parse(localStorage.getItem("USER")).id) match = true;
      })
    })
  }
    return match;
  }

  userLikes(likes, id) {
    if(!likes || !likes.likes) return false;

    if(likes.likes.indexOf(id)!==-1) return true;
    
    return false;
  }

  getAge(bday) {
    let date = new Date(bday);
    let dateNow = new Date();
    return Math.round((dateNow - date)/(1000*3600*24*365));
  }

  getLikesFromId(data,id) {
    let likes = null;
    data.map((m)=>{
      if(m.id === id) {
        likes = m.likes;
      }
    })
    return likes;
  }

  appendChatWindow(u) {
    this.state.chatWindows.push(
      <Chat toId={u.id} to={u.name} closeCb={()=> {
        let index = this.state.chats.indexOf(u.name);
        this.state.chats.splice(index,1)
        this.state.chatWindows.splice(index,1);
        this.setState({toId:u.id, chats:this.state.chats, chatWindows:this.state.chatWindows})}}></Chat>);
    //this.setState({});

  }

  showImg(i) {
    this.setState({showImg:i});
  }

  render() {
    
    const userId =  localStorage.getItem("USER") && JSON.parse(localStorage.getItem("USER")).id;
    const filterSex = this.state.filterSex;
    const filterAge = this.state.filterAge;
    const to = this.state.toId;

    return (

      <div className="users">
        <div className="filter">Filter: <InputLabel id="sexLabel" style={{display:"inline"}}>Sex</InputLabel><Select labelId="sexLabel" style={{marginLeft:"10px"}} onChange={(e)=>{this.setState({filterSex:e.target.value})}}><MenuItem value="MALE">male</MenuItem><MenuItem value="FEMALE">female</MenuItem></Select>
        <InputLabel id="ageLabel" style={{display:"inline"}}>Age</InputLabel><Select labelId="ageLabel" style={{marginLeft:"10px"}} onChange={(e)=>{this.setState({filterAge:e.target.value})}}><MenuItem value="20">&lt; 20</MenuItem><MenuItem value="30">&lt; 30</MenuItem><MenuItem value="40">&lt; 40</MenuItem></Select></div>
        <br />

         <Query query={USERS_QUERY}>
          {({ loading, error, data }) => {
            
            if (loading) return <div>Fetching users..</div>
            if (error) return <div>Error (users)</div> 

            return (
              <div class="container">
                  <div class="row" style={{color:"black", backgroundColor:"transparent", border:"none"}}> 
                          <div class="col-sm">Name </div>
                          <div class="col-sm">Photos</div>   
                          <div class="col-sm">Age (Sex)</div> 
                          <div class="col-sm">Location (City)</div> 
                          <div class="col-sm">Likes / Chat</div>
                  </div>
                {data.allUsers.map((u, index) => {
                  if(u.id===userId) { return; }
                  if(filterSex && u.gender !== filterSex) { return; }
                  if(filterAge && this.getAge(u.bday) > filterAge) { return; }

                  return (    <div>
                    <Query query={ALL_LIKES_QUERY} pollInterval={2000}>
                    {({ loading, error, data }) => {
                      
                      if (loading) return <div>Fetching likes..</div>
                      if (error) return <div>Error (likes)</div> 
                      
                      const userLikes = this.getLikesFromId(data.getAllLikes,userId);
                      const userLikesIds = userLikes && userLikes.map((l)=>{return l.id});
                      const otherLikes = this.getLikesFromId(data.getAllLikes,u.id);
                      const otherLikesIds = otherLikes && otherLikes.map((l)=>{return l.id});   
                      const isMatch = otherLikesIds&&userLikesIds&& this.isMatch(userLikesIds, otherLikesIds, u.id);

                      let youAreLiked = false, isLiked = false;
                      if(!isMatch) {
                          if (otherLikesIds && otherLikesIds.indexOf(userId)!==-1) { youAreLiked = true; }

                          if(!youAreLiked) {
                              if (userLikesIds && userLikesIds.indexOf(u.id) !== -1) { isLiked = true; } 
                          }
                      }
                      let noLikes = false;
                      if(!userLikesIds || (userLikesIds && userLikesIds.indexOf(u.id) === -1)) noLikes = true;

                      return (
                        <div class="row">                                            
                          <div class="col-sm" style={{marginTop: "5px"}}><b>{u.name}</b> </div>  
                          <div class="col-sm" style={{marginTop: "5px"}}><Query query={IMAGES_QUERY} variables={{id:u.id}}>
                    {({ loading, error, data }) => {
                      
                      if (loading) return <div>Fetching images..</div>
                      if (error) return <div>Error (images)</div> 

                      return data.getImagesByArgs && data.getImagesByArgs.images && data.getImagesByArgs.images.map((i,index)=>{
                          return(<img className="userimg" height="40px" src={i} alt={index} onMouseLeave={()=>this.setState({showImg:null})} onMouseEnter={()=>this.showImg(i)}></img>)
                        })}}
                      </Query> </div>  
                          <div class="col-sm" style={{marginTop: "5px"}}><b>{this.getAge(u.bday)} {u.gender[0]}</b></div> 
                          <div class="col-sm" style={{marginTop: "5px"}}><b>{u.city}</b></div> 
                          <div class="col-sm">
                              {isMatch && <span style={{color:"purple"}}><img height="30" src="./heart+arrow.png" alt="match"></img> {this.state.chats.indexOf(u.name) !== -1 ? null : <Button onClick={()=>{this.appendChatWindow(u); this.setState({chats:this.state.chats.concat([u.name])})}}>chat</Button>}</span>}                            
                        
                              {isLiked && <span style={{color:"red"}}>liked</span>}
                              {youAreLiked && <span style={{color:"green"}}>you are liked</span>}
                              {noLikes &&  <Mutation
                                            mutation={NEW_LIKE}
                                            variables={ {userId: u.id} }  
                                            refetchQueries = { [ "GetAllUsers", "GetLikes" ] }
                                          >
                                            {likeMutation => <Button onClick={likeMutation}><img src="./heart.png" height="30"></img></Button>}
                                          </Mutation>}
                          </div>
                        </div>
                        ) } }                      
                    </Query>                    
                     </div>    )
                })}       
              </div>              
            )
          }}
        </Query>   
        <Query query={CHATS}>
          {({ loading, data, subscribeToMore }) => {
            if (loading) {
              return null;
            }

            var that = this;
            
            subscribeToMore({
              document: NEW_CHAT_SUBSCRIPTION,
              updateQuery: (prev, { subscriptionData }) => {
                let chatFromId = subscriptionData.data.chat.node.fromTo.split('-')[0];
                if(chatFromId === userId) return;
                that.setState({fromTo:subscriptionData.data.chat.node.fromTo,chatFromId:chatFromId});
              }
            });

            return null;
          }}
        </Query>  
       {this.state.chatFromId && <Query query={USER_QUERY_ARGS} variables={{id:this.state.chatFromId}}>
        {({ loading, data }) => {
            if (loading) {
              return null;
            }
            let newChat = false, userWantToChat = '';
            if(data) {               
              newChat=true;
              userWantToChat= data.getUserByArgs.name + " wants to chat with you.";
            }
            return <Snackbar open={newChat} autoHideDuration={3000} message={userWantToChat}>
            </Snackbar>
          }}
        </Query>  }     
        {this.state.chatWindows && this.state.chatWindows.map((c)=>{
          return (c);
        })}
        {this.state.showImg && <img className="showImg" src={this.state.showImg} alt="preview"></img>}
      </div>
    )
  }

}

export default withRouter(Users)