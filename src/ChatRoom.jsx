import React, { Component } from "react";
import ChatMessages from "./ChatMessages.jsx";
import ChatForm from "./ChatForm.jsx";
import styled from "styled-components";
import MyChat from "./MyChat.jsx";
const StyledTop = styled.div`
  position: fixed;
  background: white;
  top: 0px;
  width: 100%;
  z-index: 99;
`;
const StyledBottom = styled.div`
  position: fixed;
  background: white;
  bottom: 0px;
  width: 100%;
  z-index: 99;
`;
class ChatRoom extends Component {
  //props of chatroom : chatInfo: {sellerId:"", buyerId:"", itemId:""}

  render = () => {
    console.log("in chat room, chat room props", this.props.chatInfo);
    let chatInfo = this.props.chatInfo;

    return (
      <div>
        <StyledTop>
          <button
            onClick={() =>
              window.open("/mychat", "_blank", "height=540, width=500")
            }
          >
            {" "}
            my chats
          </button>
        </StyledTop>
        <ChatMessages chatInfo={chatInfo} />
        <StyledBottom>
          <ChatForm chatInfo={chatInfo} />
        </StyledBottom>
      </div>
    );
  };
}

export default ChatRoom;
