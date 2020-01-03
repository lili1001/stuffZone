import React, { Component } from "react";
import ReviewForm from "./ReviewForm.jsx";
import { connect } from "react-redux";
import styled from "styled-components";

const Main = styled.div`
  border-top: 1px solid white;
`;

class UnconnectedReview extends Component {
  constructor(props) {
    super(props);
    this.state = { reviewData: undefined, loaded: false };
  }
  loadReview = async () => {
    if (this.props.byItem) {
      console.log("fetching reviews by item");
      let path = "/item-reviews?itemId=" + this.props.itemId;
      let res = await fetch(path, { method: "GET", credentials: "include" });
      let bod = await res.text();
      bod = JSON.parse(bod);
      if (bod.success) {
        console.log("found review");
        this.setState({ reviewData: bod.review });
        return;
      }
      this.setState({ loaded: true });
      return;
    }
    console.log("fetching reviews by seller");
    let path = "/item-reviews?itemId=" + this.props.itemId;
    let res = await fetch(path, { method: "GET", credentials: "include" });
    let bod = await res.text();
    bod = JSON.parse(bod);
    if (bod.success) {
      console.log("found review");
      this.setState({ reviewData: bod.review });
      return;
    }
    this.setState({ loaded: true });
    return;
  };
  refresh = () => {
    setTimeout(this.loadReview, 500);
    //this.loadReview();
  };
  render = () => {
    console.log("reviewREnder");
    console.log(this.state);
    if (this.state.reviewData) {
      return (
        <Main>
          <h3>Your Review:</h3>
          <h4>{this.state.reviewData.title}</h4>
          <p>{this.state.reviewData.review}</p>
        </Main>
      );
    }
    if (this.state.loaded) {
      return (
        <ReviewForm
          itemId={this.props.itemId}
          sellerId={this.props.sellerId}
          orderId={this.props.orderId}
          refresh={this.refresh}
        />
      );
    }
    this.loadReview();
    return <div>Loading...</div>;
  };
}

const Review = connect()(UnconnectedReview);
export default Review;
