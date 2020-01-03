import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";

const DeleteButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: #696969;
    cursor: pointer;
  }
`;

class UnconnectedRemoveFromCart extends Component {
  updateCart = async () => {
    console.log("updating cart...");
    let response = await fetch("/fetch-cart", {
      method: "GET"
    });
    let body = await response.text();
    let returnedCart = JSON.parse(body);
    console.log("returnedCart", returnedCart);
    this.props.dispatch({ type: "updateCart", cart: returnedCart });
  };
  remove = async () => {
    console.log("attempting remove from cart");
    let data = new FormData();
    data.append("adding", false);
    data.append("itemId", this.props.itemId);
    console.log("itemId: ", this.props.itemId);
    let res = await fetch("/cart", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let body = await res.text();
    let response = JSON.parse(body);
    if (!response.success) {
      console.log("remove from cart failed");
      return;
    }
    console.log("item removed from cart");
    this.updateCart();
  };

  render() {
    return <DeleteButton onClick={this.remove}>&times;</DeleteButton>;
  }
}

let RemoveFromCart = connect()(UnconnectedRemoveFromCart);

export default RemoveFromCart;
