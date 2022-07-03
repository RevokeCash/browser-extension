import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Browser from 'webextension-polyfill';

const Popup = () => {

  return (
    <div style={{ minWidth: 400 }}>
      Hello
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
