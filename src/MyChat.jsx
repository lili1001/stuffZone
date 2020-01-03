import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
let fetchMyChat = async () => {
  console.log("update Chats");
  let response = await fetch("/getmychat", {
    method: "GET",
    credentials: "include"
  });
  let responseBody = await response.text();
  //messages is array of object:{"itemId":"", "sellerId":"", "buyerId":"", chat:{sender: "", msg:""}}}
  //parsed array of object {sender: "", msg:""}
  let parsed = JSON.parse(responseBody);
  console.log("response from messages", parsed);
  return parsed;
};

//getIdFromChats is a function that taks a array of chat, retrurn a array of unique object(itemsId,sellerId,buyerId) from the chats
let getInfoFromChats = chats => {
  console.log("we are in function get info from chat", chats);
  //info will include array of object (itemId,sellerId,buyerId)
  let infos = chats.map(chat => {
    console.log("chat", chat);
    delete chat.chat;
    return chat;
  });
  console.log("infos", infos);
  let infoStrings = [];
  infos.forEach(info =>
    infoStrings.push(info.sellerId + "$" + info.buyerId + "$" + info.itemId)
  );
  console.log("infos...", infoStrings);
  let uniqueInfos = [];
  infoStrings.forEach(info => {
    if (uniqueInfos.indexOf(info) === -1) uniqueInfos.push(info);
  });
  return uniqueInfos;
};
let fetchAllItems = async () => {
  let data = new FormData();
  // data.append("search", this.props.searchQuery)
  let res = await fetch("/items", {
    method: "POST",
    body: data
  });
  let body = await res.text();
  let allItems = JSON.parse(body);
  console.log("all items from backend", allItems);
  return allItems;
};

class MyChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatsAsSeller: [],
      chatsAsBuyer: [],
      infoAsSeller: [],
      infoAsBuyer: []
    };
  }
  componentDidMount = () => {
    let updateState = async () => {
      let parsed = await fetchMyChat();
      console.log("parsed", parsed);
      let chatsAsSeller = parsed.asSeller;
      let chatsAsBuyer = parsed.asBuyer;

      console.log("chatsAsSeller", chatsAsSeller, "chatsAsBuyer", chatsAsBuyer);
      //generate the chat head by unique itemId
      let infoAsBuyer = getInfoFromChats(chatsAsBuyer);
      let infoAsSeller = getInfoFromChats(chatsAsSeller);
      this.setState({
        chatsAsSeller: chatsAsSeller,
        chatsAsBuyer: chatsAsBuyer,
        infoAsBuyer: infoAsBuyer,
        infoAsSeller: infoAsSeller
      });
      console.log("this state", this.state);
    };
    setInterval(updateState, 500);
  };
  //display takes a message, return a styled chat head with the item iamge
  // and item detail

  handleClick = chat => {
    //path="/chat/:sellerId$buyeIdr$itemId"
    console.log("handle click");
    let sellerId = chat.sellerId;
    let itemId = chat.itemId;
    let buyerId = chat.buyerId;
    let path = "/chat/:" + sellerId + "$" + buyerId + "$" + itemId;
    return window.open(path, "_blank", "height=500, width=500");
  };
  render() {
    return (
      <>
        <h3>my chats</h3>
        <div>
          <h5>as seller</h5>
          <div>
            {this.state.infoAsSeller.map(i => (
              <Link to={"/chat/:" + i}>{i}</Link>
            ))}
          </div>
        </div>
        <div>
          <h5>as buyer</h5>
          <div>
            <div>
              {this.state.infoAsBuyer.map(i => (
                <Link to={"/chat/:" + i}>{i}</Link>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default MyChat;
