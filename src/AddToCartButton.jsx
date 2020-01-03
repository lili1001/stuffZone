import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

const AddButton = styled.div`
  border: none;
  display: flex;
  align-items: center;
  padding: 13px;
  color: white;
  background-color: #696969;
  cursor: pointer;
  border: 1px solid #696969;
  &:hover {
    border-style: inset;
  }
  &:focus {
    outline: transparent;
  }
  #check,
  #cross {
    stroke-dasharray: 180;
    stroke-dashoffset: 180;
    animation: draw 0.7s linear forwards;
  }
  @keyframes draw {
    100% {
      stroke-dashoffset: 0;
    }
  }
  .icon {
    margin: 10px;
    width: 20px;
    height: 20px;
  }
`;

class UnconnectedAddToCart extends Component {
  constructor(props) {
    super(props);
    this.state = { status: "none" };
  }
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

  addToCart = async () => {
    console.log("attempting to add to cart");
    this.setState({ status: "loading" }, async () => {
      const cartCheck = this.props.cart.filter(item => {
        return item.itemId === this.props.itemId;
      });
      if (cartCheck.length > 0) {
        console.log("item already in cart");
        this.setState({ status: "loading" }, () => {
          setTimeout(() => {
            this.setState({ status: "fail" });
          }, 1000);
        });
        return;
      }
      let data = new FormData();
      data.append("adding", true);
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
        this.setState({ status: "fail" });
        return;
      }
      setTimeout(() => {
        this.setState({ status: "success" }, () => {
          this.updateCart();
        });
      }, 700);
    });
  };
  renderIcon = () => {
    console.log("rendering icon");
    switch (this.state.status) {
      case "none": {
        return <div className="icon" />;
      }
      case "loading": {
        console.log("renderload");
        return (
          <svg className="icon">
            <circle
              cx="10"
              cy="10"
              r="10"
              stroke="whitesmoke"
              strokeWidth="4"
              strokeDasharray="180"
              fill="transparent"
            />
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="1s"
              repeatCount="indefinite"
            />
          </svg>
        );
      }
      case "success": {
        console.log("rendercheck");
        return (
          <svg className="icon" id="check" viewBox="0 0 99 73" fill="none">
            <path
              d="M1 27L39 71L98 1"
              stroke="whitesmoke"
              strokeWidth="15px"
            ></path>
          </svg>
        ); //this will be the checkmark
      }
      case "fail":
        {
          return (
            <svg className="icon" id="cross" viewBox="0 0 61 79" fill="none">
              <path
                d="M1 77.5L60 1M1 1L60 77.5"
                stroke="whitesmoke"
                strokeWidth="15px"
              ></path>
            </svg>
          );
        }
        return;
    }
  };
  login = () => {
    this.props.dispatch({
      type: "showModal",
      show: "login"
    });
  };
  renderButton = () => {
    if (this.props.isLoggedIn) {
      return (
        <AddButton onClick={this.addToCart}>
          Add to Cart {this.renderIcon()}
        </AddButton>
      );
    }
    return <AddButton onClick={this.login}>Sign in to buy</AddButton>;
  };
  render = () => {
    return this.renderButton();
  };
}
let mapStateToProps = st => {
  return {
    isLoggedIn: st.loggedIn,
    cart: st.cart
  };
};

let AddToCart = connect(mapStateToProps)(UnconnectedAddToCart);

export default withRouter(AddToCart);
