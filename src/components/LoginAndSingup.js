import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from "react-router-dom";
import { Button, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!, $bday: String!, $gender: Sex!, $city: String!) {
    signup(email: $email, password: $password, name: $name, bday: $bday, gender: $gender, city: $city) {
      user { id name }
      token
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user { id name }
      token
    }
  }
`

class Login extends Component {
  

  state = {
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
    date: '',
    gender: 'MALE',
    city: ''
  }

  render() {
    const { login, email, password, name, date, gender, city } = this.state
    const bday = new Date(date);

    return (
      <div style={{backgroundColor:"white",padding:"20px",marginTop:"15px"}}>
        <h4 className="mv3">{login ? 'Login' : 'Sign Up'}</h4>
        <br /><br />
        <div className="flex flex-column">
          {!login && (<div>
            <Select value={gender} onChange={e => this.setState({ gender: e.target.value })}><MenuItem value="MALE">male</MenuItem><MenuItem value="FEMALE">female</MenuItem></Select><br />
            <TextField
              value={name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              label="Your name"
            />
            <TextField
              value={date}
              onChange={e => this.setState({ date: e.target.value })}
              type="text"
              label="Birthdate (mm/dd/yyyy)"
            />
            <TextField
              value={city}
              onChange={e => this.setState({ city: e.target.value })}
              type="text"
              label="City / Location"
            />
            </div>
          )}
          <TextField
            value={email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            label="Your email address"
          />
          <TextField
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            label="Choose a safe password"
          />
        </div><br /><br />
        <div className="flex mt3">
          <Mutation
            mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
            variables={{ email, password, name, bday, gender, city }}
            onCompleted={data => this._confirm(data)}
          >
            {mutation => (
              <Button className="pointer mr2 button" onClick={mutation}>
                {login ? 'login' : 'create account'}
              </Button>
            )}
          </Mutation>          
          <Button
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login ? 'need to create an account?' : 'already have an account?'}
          </Button>
        </div>
      </div>
    )
  }

  _confirm = async data => {
    const { token, user } = this.state.login ? data.login : data.signup
    this._saveUserData(token,user);
   // let history = useHistory();
  // this.props.history.push(`/`)
  document.location.href="/"; 
  }

  _saveUserData = (token,user) => {
    localStorage.setItem(AUTH_TOKEN, token)
    localStorage.setItem("USER", JSON.stringify(user))
  }
}

export default withRouter(Login)
