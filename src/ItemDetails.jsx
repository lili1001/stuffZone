import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import formatMoney from "./formatMoney.js";
import AddToCart from "./AddToCartButton.jsx";
import SellerReview from "./SellerReviews.jsx";
import ChatButton from "./ChatButton.jsx";

// STYLED COMPONENTS

const Title = styled.div`
  margin: 5px;
  font-size: 24px;
  font-variant: small-caps;
  height: min-content;
  margin-right: 10px;
  margin-left: 10px;
`;
const ContentCard = styled.div`
  width: 33%;
  background-color: #ebebeb;
  display: grid;
  grid-template-rows: auto auto 1fr;
  border-radius: 5px;
  margin-left: 15px;
  border: 2px solid;
  overflow: hidden;
  overflow-y: auto;
`;
const Nav = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  button {
    padding: 5px;
    font-variant: small-caps;
    border-style: none;
    border-top: 2px solid;
    &:focus {
      outline: transparent;
    }
  }
  .selected {
    background-color: inherit;
  }
  .unselected {
    background-color: #696969;
    border-color: black;
    color: whitesmoke;
    &:hover {
      background-color: #606060;
      cursor: pointer;
    }
  }
`;
const PurchaseDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  border-top: 1px solid;
`;
const Canvas = styled.div`
  display: flex;
  margin: 20px;
  padding: 15px;
  max-width: 100vw;
  height: 80vh;
  .image-main {
    background-color: rgb(170, 170, 170);
    width: 66%;
    object-fit: cover;
    border-radius: 5px;
  }
  .text-detail {
    max-height: 80%;
    text-align: center;
    margin: 10px;
    overflow: hidden;
    overflow-y: auto;
    ::-webkit-scrollbar {
      display: hidden;
    }
  }
  .price {
    display: flex;
    margin: 15px;
    font-size: 25px;
    justify-content: flex-end;
    align-items: center;
  }
`;

class UnconnectedItemDetails extends Component {
  constructor(props) {
    super(props);
    this.state = { display: "details", reviews: undefined };
  }

  displayContent = () => {
    switch (this.state.display) {
      case "details": {
        return <div>{this.props.item.description}</div>;
      }
      case "seller info": {
        return <div>{this.renderSellerInfo()}</div>;
      }
    }
  };
  clickHandler = ev => {
    this.setState({ display: ev.target.id });
  };
  renderSellerInfo = () => {
    const fetchReviews = async sellerId => {
      console.log("fetching seller reviews");
      const res = await fetch("/seller-reviews?itemId=" + sellerId);
      let bod = await res.text();
      bod = JSON.parse(bod);
      if (bod.success) {
        console.log(bod);
        this.setState({ reviews: bod.reviews });
        return;
      }
      console.log("review fetch failed");
      this.setState({ reviews: [] });
      return;
    };
    if (this.state.reviews) {
      if (this.state.reviews.length > 0) {
        return this.state.reviews.map(review => {
          return <SellerReview reviewData={review} />;
        });
      }
      return (
        <div>
          <div>This seller has no reviewed products.</div> <div>Good Luck!</div>
        </div>
      );
    }
    fetchReviews(this.props.item.sellerId);
    return <div>Loading Reviews...</div>;

    return; //<Link to={"/" + this.item.seller}>{this.item.seller}</Link>;
  };
  renderNavButtons = () => {
    let buttons = ["details", "seller info"];
    return buttons.map(button => {
      if (button === this.state.display) {
        return (
          <button className="selected" id={button} onClick={this.clickHandler}>
            {button}
          </button>
        );
      }
      return (
        <button className="unselected" id={button} onClick={this.clickHandler}>
          {button}
        </button>
      );
    });
  };
  fetchItems = async () => {
    let data = new FormData();
    // data.append("search", this.props.searchQuery)
    let response = await fetch("/items", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    let allItems = JSON.parse(body);
    this.props.dispatch({ type: "allItems", items: allItems });
  };
  render() {
    if (this.props.item === undefined) {
      this.fetchItems();
      return <div>Loading Item Details....</div>;
    }
    return (
      <Canvas>
        <img src={this.props.item.largeImage} className="image-main" />
        <ContentCard>
          <Title>{this.props.item.title}</Title>
          <Nav>{this.renderNavButtons()}</Nav>
          <div>
            <div className="text-detail">{this.displayContent()}</div>
          </div>
          <PurchaseDiv>
            <div className="price">{formatMoney(this.props.item.price)}</div>
            <AddToCart itemId={this.props.item.itemId} />
          </PurchaseDiv>
        </ContentCard>
      </Canvas>
    );
  }
}

let ItemDetails = connect()(UnconnectedItemDetails);

export default ItemDetails;
