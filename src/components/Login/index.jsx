import React from "react";
import "./index.scss";
import api from "../../services/api";

export default function Login({ onRecive }) {
  async function handleGitHubLogin() {
    let result = await api.GhPopUp();
    if (result) {
      console.log(result.user.multiFactor.user);
      onRecive(result.user.multiFactor.user);
    } else {
      alert("Login Error");
    }
  }

  return (
    <div className="login">
      <button onClick={handleGitHubLogin}>Login com GitHub</button>
    </div>
  );
}
