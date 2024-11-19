import React, { Component } from "react";
import { Button, Form } from "reactstrap";
import PropTypes from "prop-types";
import centsLogo from '../../assets/images/cents-logo.png'
import TextField from '../commons/textField/textField'
import { Link } from 'react-router-dom'

class Login extends Component {
  render() {
    const { email, password, api } = this.props;

    return (
      <React.Fragment>
        <img className="logo-signin" src={centsLogo} alt={"cents"}/>
        <Form
          className="form-signin position-relative"
          onSubmit={this.props.handleLogin}
        >
          <TextField
            className = "text-field-big"
            label = "Email Address"
            onChange={this.props.handleEmailChange}
          />
          
          { email.showError && <span className="error-message">{email.error}</span> }
          { api.showError && <span className="error-message">{api.error}</span> }
          
          <TextField
            className = "text-field-big"
            label = "Password"
            type="password"
            onChange={this.props.handlePasswordChange}
          />
          { password.showError && <span className="error-message">{password.error}</span> }
          <Link className="forgot-password" to="/forgot-password"><span>Forgot your password?</span></Link>

          <Button type="submit" className="btn-theme btn-signin">
            Sign In
          </Button>
          
        </Form>
      </React.Fragment>
    );
  }
}

Login.propTypes = {
  handleLogin: PropTypes.func
};

Login.propTypes = {
  handleLogin: () => {}
};

export default Login;
