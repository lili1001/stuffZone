import React, { Component } from "react";
import styled from "styled-components";
import formatMoney from "./formatMoney.js";
import RemoveFromCart from "./RemoveFromCartButton.jsx";

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 75px 1fr auto 75px;
  border-bottom: 1px solid;
  height: 75px;
  div,
  img {
    width: 100%;
    height: 75px;
    object-fit: cover;
  }
  .name {
    padding-left: 15px;
    display: flex;
    align-items: center;
    div {
      height: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .price {
    display: flex;
    align-items: center;
    text-align: right;
    div {
      height: auto;
    }
  }
`;

class ItemCart extends Component {
  render() {
    let item = this.props.item;
    return (
      <CartItem>
        <div>
          <img src={item.smallImage} />
        </div>
        <div className="name">
          <div>{item.title}</div>
        </div>
        <div className="price">
          <div>{formatMoney(item.price)}</div>
        </div>
        <RemoveFromCart itemId={item.itemId} />
      </CartItem>
    );
  }
}

export default ItemCart;
