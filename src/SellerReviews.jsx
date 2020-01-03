import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";

const Main = styled.div`
  border-bottom: 1px solid white;
  text-align: left;
  width: 300px;
  .header {
    font-variant: small-caps;
    font-size: 18px;
    font-weight: bold;
  }
  div {
    word-wrap: wrap;
  }
`;

class UnconnectedSellerReview extends Component {
  render = () => {
    console.log("drawing reviews");
    return (
      <Main>
        <div className="header">{this.props.reviewData.title}</div>
        <div>{this.props.reviewData.review}</div>
      </Main>
    );
  };
}

const SellerReview = connect()(UnconnectedSellerReview);
export default SellerReview;
