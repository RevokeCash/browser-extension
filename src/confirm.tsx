import React from "react";
import ReactDOM from "react-dom";
import Browser from 'webextension-polyfill';

const Confirm = () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));

  const respond = async (data: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id, data })
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  return (
    <>
      <div>Current ID: {id}</div>
      <button onClick={confirm}>Confirm</button>
      <button onClick={reject}>Reject</button>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Confirm />
  </React.StrictMode>,
  document.getElementById("root")
);
