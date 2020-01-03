import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import styled from "styled-components";

const SaleForm = styled.div`
  display: flex;
  margin-top: 50px;
  justify-content: center;
  #file {
    display: none;
  }
  .label {
    cursor: pointer;
  }
  input {
    box-sizing: border-box;
    &:focus {
      outline: transparent;
    }
  }
  img {
    object-fit: scale-down;
    width: 400px;
    border-radius: 3px;
    background-color: rgb(170, 170, 170);
  }
  .card {
    border: 5px solid #696969;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 4px 4px 0 rgba(0, 0, 0, 0.19);
    background-color: rgba(255, 255, 255, 0.55);
    width: 400px;
  }
  .image-upload {
    text-align: center;
    justify-content: center;
  }
  .form-data {
    justify-content: space-around;
    display: flex;
    flex-direction: column;
  }
  .wrap-horizontal {
    display: flex;
    justify-content: space-around;
  }
  .input-base {
    padding: 5px;
    background-color: inherit;
    border: 2px solid #696969;
    border-radius: 5px;
    margin: 5px;
  }
  .input-multi {
    padding: 5px;
    box-sizing: border-box;
    margin: 5px;
    background-color: inherit;
    border: 2px solid #696969;
    border-radius: 5px;
    min-height: 50px;
  }
  .button-base {
    background-color: #696969;
    border: none;
    border-radius: 7px;
    color: whitesmoke;
    font-weight: bolder;
    padding: 5px;
    margin: 10px;
    text-align: center;
  }
  .button-base:hover {
    background-color: #3b3837;
    color: whitesmoke;
  }
`;
class unconnectedCreateItem extends Component {
  state = {
    title: "",
    description: "",
    image: "./nophoto.png",
    largeImage: "./nophoto.png",
    imgMsg: "Upload an Image of your Product",
    price: "",
    city: ""
  };
  handleChange = event => {
    let { name, type, value } = event.target;
    let val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  sendData = async event => {
    event.preventDefault();
    let data = new FormData();
    let price = this.state.price * 100;
    data.append("title", this.state.title);
    data.append("user", this.props.currentUser);
    data.append("description", this.state.description);
    data.append("image", this.state.image);
    data.append("largeImage", this.state.largeImage);
    data.append("price", price);
    data.append("location", this.state.city);
    let response = await fetch("/additem", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    console.log("responseBody from create itenm", responseBody);
    let body = JSON.parse(responseBody);
    console.log("parsed body", body);
    if (!body.success) {
      alert("item creation failed");
      return;
    }
    this.props.dispatch({
      type: "item-success"
    });
    this.props.history.push("/");
  };

  uploadFile = async e => {
    console.log("uploading file");
    let files = e.target.files;
    let data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "stuffzone");

    let res = await fetch(
      "https://api.cloudinary.com/v1_1/stuffzone/image/upload",
      {
        method: "POST",
        body: data
      }
    );
    let file = await res.json();
    console.log(file);
    if (file.error) {
      this.setState({ imgMsg: file.error.message.split(".").shift() });
      return;
    }
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    });
  };
  render() {
    let me = this.props.currentUser;
    return (
      <SaleForm>
        {!me && <h1>Must be signed in to create items to sell</h1>}
        {me && (
          <div className="upload card">
            <div>
              <div className="image-upload">
                <label className="label">
                  <img src={this.state.image} alt="Preview" />
                  <div>{this.state.imgMsg}</div>
                  <div>
                    <input
                      type="file"
                      id="file"
                      name="file"
                      placeholder="Upload an Image"
                      required
                      onChange={this.uploadFile}
                    ></input>
                  </div>
                </label>
                <div className="form-data">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Title"
                    className="input-base"
                    required
                    maxlength="30"
                    value={this.state.title}
                    onChange={this.handleChange}
                  />

                  <textarea
                    id="description"
                    name="description"
                    placeholder="Please enter a description"
                    className="input-multi"
                    required
                    value={this.state.description}
                    onChange={this.handleChange}
                  />
                  <div className="wrap-horizontal">
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Ships From"
                      className="input-base"
                      required
                      value={this.state.city}
                      onChange={this.handleChange}
                    />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      placeholder="Price"
                      className="input-base"
                      required
                      value={this.state.price}
                      onChange={this.handleChange}
                    />
                  </div>
                  <button onClick={this.sendData} className="button-base">
                    SUBMIT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SaleForm>
    );
  }
}

let mapStateToProps = st => {
  return {
    currentUser: st.currentUser
  };
};

let CreateItem = connect(mapStateToProps)(unconnectedCreateItem);
export default withRouter(CreateItem);
