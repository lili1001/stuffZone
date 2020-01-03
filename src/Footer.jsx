import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const FooterLink = styled.a`
  text-decoration: none;
  color: whitesmoke;
  padding: 5px;
  :focus {
    color: lightgrey;
  }
  :hover {
    text-decoration: underline;
  }
`;
const FooterWrap = styled.div`
  background-color: #696969;
  color: whitesmoke;
  display: flex;
  justify-content: left;
  padding-top: 75px;
  padding-bottom: 75px;
  margin-top: 75px;
  .category-wrapper {
    margin-left: 100px;
  }
  .link-wrapper {
    display: flex;
    flex-direction: column;
  }
  .link-header {
    font-size: 18px;
    font-variant: small-caps;
    margin-bottom: 10px;
    color: lightgrey;
  }
  .link-style {
    text-decoration: none;
    color: whitesmoke;
    padding: 5px;
    :focus {
      color: lightgrey;
    }
    :hover {
      text-decoration: underline;
    }
  }
`;

class Footer extends Component {
  render = () => {
    return (
      <FooterWrap>
        <div className="category-wrapper">
          <div className="link-header">Site Info</div>
          <div className="link-wrapper">
            <FooterLink href="/">Seller Agreement</FooterLink>
            <FooterLink href="/">About Stuff Zone</FooterLink>
            <FooterLink href="/">Contact Us</FooterLink>
            <FooterLink href="/">Privacy Policy</FooterLink>
          </div>
        </div>
        <div className="category-wrapper">
          <div className="link-header">Quick Links</div>
          <div className="link-wrapper">
            <Link to="/account" className="link-style">
              Account Management
            </Link>
            <Link to="/sell" className="link-style">
              Sell an Item
            </Link>
            <Link to="/orders" className="link-style">
              Order History
            </Link>
          </div>
        </div>
      </FooterWrap>
    );
  };
}

export default Footer;
