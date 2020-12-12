import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from "react-router-dom";

import { Button, Snackbar } from '@material-ui/core';

const UPLOAD_MUTATION = gql`
  mutation UploadMutation($image: String!) {
    uploadImage(image: $image) {
      id
    }
  }
`

class ImageUploader extends Component {

  state = {
    imageBase64Url: ""
  }

  handleLoadAvatar(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (e) => {
      var img = document.createElement("img");
      img.onload = () => {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
  
        var MAX_WIDTH = 150;
        var MAX_HEIGHT = 150;
        var width = img.width;
        var height = img.height;
  
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        var dataurl = canvas.toDataURL("image/png");
        this.setState({imageBase64Url: dataurl});
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

  handleChangeImage(evt) {
    var reader = new FileReader();
    var file = evt.target.files[0];
    var that = this;
    reader.onload = function (upload) {
      that.setState({imageBase64Url: upload.target.result});
    };
    reader.readAsDataURL(file);
  }

  render() {

    const userId = localStorage.getItem("USER_ID");
    const image = this.state.imageBase64Url;
    const open = this.state.open;

    return (
      <div>
        <input ref="file" type="file" name="file"
          className="upload-file"
          id="file"
          onChange={this.handleLoadAvatar.bind(this)}
          encType="multipart/form-data"
        />
         <Mutation
            mutation={UPLOAD_MUTATION}
            variables={{ image }}
            onCompleted={data => this._confirm(data)}
            refetchQueries = { ["GetMyImages"] }
          >
            {mutation => (
              <Button className="pointer mr2 button" onClick={mutation}>
                upload
              </Button>
            )}
          </Mutation>
          <Snackbar open={open} autoHideDuration={3000} message="Picture uploaded!">
          </Snackbar>
      </div>
    )
  }

  _confirm(data) {
    this.setState({open:true});
  }

}

export default withRouter(ImageUploader)
