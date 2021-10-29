import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { QueryClient } from "react-query";
import "@fortawesome/fontawesome-free/css/all.css";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <App queryClient={queryClient} />
  </React.StrictMode>,
  document.getElementById("root")
);
