import { connect } from "react-redux";
import React, { Component } from "react";
import styled from "styled-components";

const SearchWrapper = styled.div`
  margin-top: 15px;
  padding: 5px;
  display: flex;
  justify-self: stretch;
  justify-content: space-around;
  .search-input {
    background-color: inherit;
    width: 90%;
    font-size: 24px;
    font-variant: small-caps;
    padding: 10px;
    border: 2px solid grey;
    border-radius: 7px;
  }
  .search-input:focus {
    background-color: whitesmoke;
    outline-color: transparent;
  }
`;

class UnconnectedSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { query: "" };
  }
  handleQuery = evt => {
    this.setState({ query: evt.target.value }, () => {
      this.props.dispatch({ type: "searchQuery", search: this.state.query });
    });
  };
  render = () => {
    return (
      <SearchWrapper>
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          onChange={this.handleQuery}
          value={this.state.query}
        />
      </SearchWrapper>
    );
  };
}

let mapStateToProps = st => {
  return {
    allItems: st.allItems
  };
};
let Search = connect(mapStateToProps)(UnconnectedSearch);
export default Search;
