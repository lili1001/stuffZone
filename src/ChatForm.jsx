import React, { Component } from "react";

class ChatForm extends Component {
  constructor(props) {
    super(props);
    this.state = { message: "" };
  }
  handleMessageChange = event => {
    console.log("new message", event.target.value);
    this.setState({ message: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    console.log("form submitted");
    console.log(this.props);
    this.setState({ message: "" });
    let chatInfo = this.props.chatInfo;
    let sellerId = chatInfo.sellerId;
    let buyerId = chatInfo.buyerId;
    let itemId = chatInfo.itemId;
    let data = new FormData();
    data.append("itemId", itemId);
    data.append("sellerId", sellerId);
    data.append("buyerId", buyerId);
    data.append("msg", this.state.message);
    //data:{"itemId":"", "sellerId":"", "buyer":"", "msg":""}
    console.log("data for backend newMessage", data);
    fetch("/newMessage", {
      method: "POST",
      body: data,
      credentials: "include"
    });
  };
  render = () => {
    //props of ChatForm : chatInfo: {sellerId:"", buyer:"", itemId:""}
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            onChange={this.handleMessageChange}
            type="text"
            value={this.state.message}
          />
          <input type="submit" value="send" />
        </form>
      </div>
    );
  };
}
export default ChatForm;
