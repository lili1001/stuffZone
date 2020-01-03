import ReactDOM from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import Store from "./Store.js";
import App from "./App.jsx";
import "./main.css";

import reloadMagic from "./reload-magic-client.js"; // automatic reload
reloadMagic(); // automatic reload

ReactDOM.render(
  <Provider store={Store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
