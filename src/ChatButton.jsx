import React, { Component } from "react";
import { connect } from "react-redux";
let fetchId = async name => {
  console.log("get the Id from back end", "username:", name);
  let data = new FormData();
  data.append("username", name);
  let response = await fetch("/getId", {
    method: "POST",
    body: data,
    credentials: "include"
  });
  let responseBody = await response.text();
  let body = JSON.parse(responseBody);
  console.log("get ID success", body.id);
  return body.id;
};
class UnconnectedChatButton extends Component {
  handleClick = async () => {
    //props of chatroom : chatInfo: {sellerId:"", buyerId:"", itemId:""}
    //path="/chat/:sellerId$buyeIdr$itemId"
    console.log("handle click");
    let sellerId = this.props.item.sellerId;
    let itemId = this.props.item.itemId;
    console.log("fectch Id for ", this.props.buyer);
    let buyerId = await fetchId(this.props.buyer);
    let path = "/chat/:" + sellerId + "$" + buyerId + "$" + itemId;
    return window.open(path, "_blank", "height=500, width=500");
  };
  render() {
    if (this.props.isLoggedIn) {
      return <button onClick={this.handleClick}>chat</button>;
    }
    return <button disabled={true}>chat</button>;
  }
}

let mapStateToProps = st => {
  return {
    isLoggedIn: st.loggedIn,
    buyer: st.currentUser
  };
};

let ChatButton = connect(mapStateToProps)(UnconnectedChatButton);

export default ChatButton;
