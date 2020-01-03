import { connect } from "react-redux";
import React, { Component } from "react";
import ItemCart from "./ItemCart.jsx";
import styled from "styled-components";
import StripeCheckout from "react-stripe-checkout";
import formatMoney from "./formatMoney.js";
import { withRouter } from "react-router-dom";

const CartDisplay = styled.div`
  overflow: hidden;
  width: 60vw;
  border: 2px solid;
  background-color: rgba(255, 255, 255, 0.5);

  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  border-radius: 10px;
`;
const Canvas = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  h2 {
    border: 5px solid #696969;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 4px 4px 0 rgba(0, 0, 0, 0.19);
  }
  h3 {
    border: 5px solid #696969;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 4px 4px 0 rgba(0, 0, 0, 0.19);
    background-color: rgba(255, 255, 255, 0.5);
  }
`;
const Price = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;

  div {
    border-radius: 0 0 8px 8px;
    margin-right: 72px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border: 2px solid;
    border-top: 1px;
    padding: 3px;
    background-color: rgba(255, 255, 255, 0.5);
    div {
      margin-right: 0;
      border: 0px;
      box-shadow: none;
    }
    button {
      background-color: rgba(0, 0, 0, 0.4);
      color: rgba(256, 256, 256, 1);
      border: 0;
      border-radius: 5px;
      padding: 5px;
      width: 100%;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      opacity: 1;
      visibility: visible;
      -webkit-transition: all 0.3s ease;

      &:hover {
        transition: all 0.3s ease;
        background-color: #696969;
      }
    }
  }
`;

class UnconnectedCart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let fetchAll = async () => {
      let response = await fetch("/fetch-cart", {
        method: "GET"
      });
      let body = await response.text();
      let returnedCart = JSON.parse(body);
      console.log("returnedCart", returnedCart);
      this.props.dispatch({ type: "updateCart", cart: returnedCart });
      return;
    };
    fetchAll();
  }

  sendData = async (res, event) => {
    let total = 0;
    this.props.cartItems.forEach(item => {
      total = total + item.price;
    });

    let cart = this.props.cartItems.map(item => {
      return item.itemId;
    });
    console.log(cart);

    let stringedCart = JSON.stringify(cart);

    event.preventDefault();
    let data = new FormData();
    data.append("token", res);
    data.append("total", total);
    data.append("cart", stringedCart);

    let response = await fetch("/checkout", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    console.log("responseBody from create itenm", responseBody);
    let body = JSON.parse(responseBody);
    console.log("parsed checkout body", body);
    if (!body.success) {
      alert("checkout failed");
      return;
    }
    // this.props.dispatch({
    //   type: "item-success"
    // });
    this.props.history.push("/orders");
  };

  onToken = res => {
    console.log("On token called");
    console.log(res.id);
    this.sendData(res.id, event);
  };

  render = () => {
    if (this.props.cartItems.length === 0) {
      return (
        <Canvas>
          <h3>Your cart is empty!</h3>
        </Canvas>
      );
    }
    let total = 0;
    this.props.cartItems.forEach(item => {
      total = total + item.price;
    });

    return (
      <Canvas>
        <div>
          <CartDisplay>
            {this.props.cartItems.map(item => {
              //display items
              return (
                <div>
                  <ItemCart item={item} />
                </div>
              );
            })}
          </CartDisplay>
          <Price>
            <div>
              <div>Cart Total: {formatMoney(total)}</div>
              <div className="checkout">
                <StripeCheckout
                  amount={total}
                  name="Stuff Zone"
                  stripeKey="pk_test_EmkxA3zWWzVPX7FbgCtezWBL00JBBqKgtZ"
                  currency="cad"
                  email="no@dice.com"
                  token={res => this.onToken(res)}
                >
                  <button>Checkout</button>
                </StripeCheckout>
              </div>
            </div>
          </Price>
        </div>
      </Canvas>
    );
  };
}

let mapStateToProps = st => {
  return {
    cartItems: st.cart
  };
};

let Cart = connect(mapStateToProps)(UnconnectedCart);
export default withRouter(Cart);
