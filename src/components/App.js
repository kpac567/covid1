import React,{ Component } from 'react';
import logo from '../logo.svg';
import '../styles/App.css';
import Login from './LoginAndSingup';
import { AUTH_TOKEN } from '../constants' 
import { withRouter } from "react-router-dom";
import Users from './Users';
import ImageUploader from './ImageUploader';
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {Helmet} from 'react-helmet'
import { Button } from '@material-ui/core';


const IMAGES_QUERY = gql`
query GetMyImages($id: ID!) {
  getImagesByArgs(id: $id)  {
        id
        images
  }
}
`


class App extends Component {

  state = { showPictures: false }

  logout() {
    localStorage.removeItem(AUTH_TOKEN)
    this.props.history.push(`/`)   
  }

  render() {
  const authToken = localStorage.getItem(AUTH_TOKEN)
  let user = ""
  let id = null
  if(authToken) {
    user = localStorage.getItem("USER") && JSON.parse(localStorage.getItem("USER")).name    
    id =  localStorage.getItem("USER") && JSON.parse(localStorage.getItem("USER")).id
  }
  
    return (

    <div className="App">  
      <h1 className="headingText">WWW Dating</h1>    
        <div style={{height:"150px"}}></div>
        {!authToken ? <Login /> : <p style={{color:"black",background:"white",padding:"20px",marginTop:"15px"}}>
          <p style={{textAlign:"right"}}>Hello, {user}! You are logged in.  <Button onClick={()=>this.logout()}>logout</Button> </p>
        <div>          
          <Users />
        </div>
        <div>
        <p>
          <br />Your images: <Button onClick={()=>{this.setState({showPictures:!this.state.showPictures})}}>{!this.state.showPictures ? "view" : "hide"}</Button></p>
       {this.state.showPictures && <Query query={IMAGES_QUERY} variables={{id:id}}>
                    {({ loading, error, data }) => {
                      
                      if (loading) return <div>Fetching images..</div>
                      if (error) return <div>Error (images)</div> 

                      return (
                        <div class="row" style={{marginLeft:"auto",marginRight:"auto",width:"300px",backgroundColor:"transparent",border:"none"}}>                       
                          <div class="col-sm">
                        {data.getImagesByArgs && data.getImagesByArgs.images && data.getImagesByArgs.images.map((i,index)=>{
                          return(<img height="100px" src={i} alt={index}></img>)
                        })}</div></div>
                      ) }}
                      </Query>}

          <ImageUploader />
        </div>
        </p>}
    </div>)
  }
}

export default withRouter(App);
