import React, {Component} from "react";
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {createNamespacer} from "../../utils/reducers";
import actionTypes from "../../actionTypes";

const sessionNamespacer = createNamespacer("SESSION");

export default (WrappedComponent, reverseMode = false) => {
  const mapStateToProps = (state) => ({
    session: state.session,
  });

  const mapDispatchToProps = (dispatch) => ({
    setSession: (session) => {
      const storageToken = localStorage.getItem("token");
      const storageUserId = localStorage.getItem("userId");
      const storageRoleId = localStorage.getItem("roleId");

      const isLoggedIn = session.isLoggedIn;

      if (isLoggedIn) {
        if (storageToken == null && storageUserId == null && storageRoleId == null) {
          localStorage.setItem("token", session.token);
          localStorage.setItem("userId", session.userId);
          localStorage.setItem("roleId", session.roleId);
          localStorage.setItem("firstName", session.firstName);
          localStorage.setItem("lastName", session.lastName);
          localStorage.setItem("email", session.email);
          localStorage.setItem("business", session.business);
        }
      }

      dispatch({
        type: sessionNamespacer(actionTypes.session.SET_SESSION),
        payload: {
          isLoggedIn,
          ...session,
        },
      });
    },
  });

  class WrapperComponent extends Component {
    componentDidMount() {
      let storageToken = localStorage.getItem("token");
      let session = {};
      session.isLoggedIn = storageToken !== null ? true : this.props.session.isLoggedIn;

      if (storageToken !== null) {
        session.token = localStorage.getItem("token");
        session.userId = localStorage.getItem("userId");
        session.roleId = localStorage.getItem("roleId");
        session.firstName = localStorage.getItem("firstName");
        session.lastName = localStorage.getItem("lastName");
        session.email = localStorage.getItem("email");
        session.business = localStorage.getItem("business");
      }
      this.props.setSession(session);
    }

    render() {
      const {isLoggedIn} = this.props.session;

      if (!reverseMode) {
        // for protected routes
        if (isLoggedIn) {
          return <WrappedComponent />;
        } else {
          return <Redirect to={"/login"} />;
        }
      } else {
        // for guest routes
        if (!isLoggedIn) {
          return <WrappedComponent />;
        } else {
          return <Redirect to={"/"} />;
        }
      }
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(WrapperComponent);
};
