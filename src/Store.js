import { createStore } from "redux";

const INITIAL_STATE = {
  currentUser: "",
  loggedIn: false,
  orders: [],
  cart: [],
  displayModal: "none",
  allItems: [],
  searchQuery: ""
};

let reducer = (state, action) => {
  if (action.type === "login-success") {
    return { ...state, loggedIn: true, currentUser: action.currentUser };
  }
  if (action.type === "signout") {
    return {
      ...state,
      currentUser: "",
      loggedIn: false,
      orders: [],
      cart: []
    };
  }
  if (action.type === "allItems") {
    return { ...state, allItems: action.items };
  }
  if (action.type === "searchQuery") {
    return { ...state, searchQuery: action.search };
  }
  if (action.type === "orders") {
    return { ...state, orders: action.orders };
  }
  if (action.type === "updateCart") {
    return { ...state, cart: action.cart };
  }
  if (action.type === "showModal") {
    return { ...state, displayModal: action.show };
  }

  return state;
};
const store = createStore(
  reducer,
  INITIAL_STATE,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
