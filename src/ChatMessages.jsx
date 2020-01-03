import React, { Component } from "react";
import styled from "styled-components";

const StyledChats = styled.div`
  width: 500px;
  background: #f2f5f8;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  color: #434651;

  .chat-history {
    padding: 30px 30px 20px;
    overflow-y: scroll;
    height: 600px;

    .sender-name {
      margin-bottom: 10px;
    }

    .message {
      color: white;
      padding: 5px;
      border-radius: 7px;
      margin-bottom: 5px;
      width: 60%;
      position: relative;

      &:after {
        bottom: 100%;
        left: 8%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        border-bottom-color: #86bb71;
        border-width: 7px;
        margin-left: -10px;
      }
    }

    .my-message {
      background: #86bb71;
    }

    .other-message {
      background: #94c2ed;
      margin-left: auto;
      margin-right: 5px;

      &:after {
        border-bottom-color: #94c2ed;
        left: 95%;
      }
    }
  }
  .align-right {
    text-align: right;
  }

  // .float-right {
  //   float: right;
  // }
`;

//-----------------------------------------------------------------------
class ChatMessages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgs: []
    };
  }
  componentDidMount = () => {
    let updateMessages = async () => {
      console.log("update Message");
      let chatInfo = this.props.chatInfo;
      let sellerId = chatInfo.sellerId;
      let buyerId = chatInfo.buyerId;
      let itemId = chatInfo.itemId;
      let data = new FormData();
      data.append("itemId", itemId);
      data.append("sellerId", sellerId);
      data.append("buyerId", buyerId);
      console.log("data to fetch the message", data);
      let response = await fetch("/messages", {
        method: "POST",
        body: data,
        credentials: "include"
      });
      let responseBody = await response.text();
      //parsed array of object {sender: "", msg:""}
      let parsed = JSON.parse(responseBody);
      console.log("response from messages", parsed);
      this.setState({ msgs: parsed });
    };

    setInterval(updateMessages, 500);
  };
  render = () => {
    return (
      <StyledChats>
        <div class="chat-history con">
          {this.state.msgs.map(msg => {
            if (msg.chaterIsSender) {
              return (
                <div>
                  <div className="sender-name">{msg.sender}</div>
                  <div className="message my-message">{msg.msg}</div>
                </div>
              );
            } else {
              return (
                <div>
                  <div className="sender-name align-right">{msg.sender}</div>
                  <div className="message other-message float-right">
                    {msg.msg}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </StyledChats>
    );
  };
}
export default ChatMessages;
