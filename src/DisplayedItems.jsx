import { connect } from "react-redux";
import React, { Component } from "react";
import ItemSearch from "./ItemSearch.jsx";
import styled from "styled-components";

const SearchDisplay = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

class UnconnecteDisplayedItems extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (this.props.isLoggedIn) {
      let fetchCart = async () => {
        let response = await fetch("/fetch-cart");
        let body = await response.text();
        let cart = JSON.parse(body);
        this.props.dispatch({ type: "updateCart", cart });
      };
      fetchCart();
    }
    let fetchAll = async () => {
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
    fetchAll();
  }
  search = (query, string) => {
    let reg = new RegExp(query);
    return reg.test(string);
  };
  renderItems = () => {
    let displayItems = this.props.allItems.filter(item => {
      let query = this.props.searchQuery.toLowerCase();
      let title = item.title.toLowerCase();
      let desc = item.description.toLowerCase();
      return this.search(query, title) || this.search(query, desc);
    });
    return displayItems.map(item => {
      //display items
      return (
        <div key={item.itemId}>
          <ItemSearch item={item} />
        </div>
      );
    });
  };
  render = () => {
    return <SearchDisplay>{this.renderItems()}</SearchDisplay>;
  };
}
let mapStateToProps = st => {
  return {
    allItems: st.allItems,
    searchQuery: st.searchQuery,
    isLoggedIn: st.loggedIn
  };
};
let DisplayedItems = connect(mapStateToProps)(UnconnecteDisplayedItems);
export default DisplayedItems;
