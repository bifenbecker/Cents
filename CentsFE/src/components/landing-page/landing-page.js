import React, { Component } from "react";
import Login from "../login";

class LandingPage extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="landing-page-container layout-main">
          <div className="landing-page-left d-flex">
            <h1 className="title-project">Cents</h1>
          </div>
          <div className="signin-container flex-item-centered">
            <Login />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default LandingPage;
