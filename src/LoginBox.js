import React, { Component } from 'react';

class RememberToggle extends Component {
  render() {
    return (
      <label>
        Remember username/password:
        <input
          type="checkbox"
          checked={this.props.remember}
          onChange={this.props.onChange}
        />
      </label>
    );
  }
}

export class LoginBox extends Component {
  constructor(props) {
    super(props);
    const remember = localStorage.getItem("rememberUserPass") === "true";
    console.log("LoginBox ctor, remember=" + remember);
    this.state = {
      username: remember ? localStorage.getItem("username") : "",
      password: remember ? localStorage.getItem("password") : "",
      remember: remember,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleLogin(event) {
    event.preventDefault();
    if (this.state.remember) {
      localStorage.setItem("username", this.state.username);
      localStorage.setItem("password", this.state.password);
    }
    this.props.login(this.state.username, this.state.password);
  }

  onRememberToggle(event) {
    const remember = event.target.checked;
    console.log("onRememberToggle remember=" + remember);
    localStorage.setItem("rememberUserPass", remember);
    if (!remember) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
    }
    this.setState({
      remember: remember,
    });
  }

  render() {
    return (
      <form className="LoginBox" onSubmit={this.handleLogin}>
        <label>
          Flexibuzz username:
          <input
            type="text"
            name="username"
            value={this.state.username}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <label>
          Flexibuzz password:
          <input
            type="password"
            name="password"
            value={this.state.password}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <RememberToggle
          onChange={this.onRememberToggle.bind(this)}
          remember={this.state.remember}
        />
        <input type="submit" value="Login" />
      </form>
    );
  }
}

export class LogoutBox extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout(event) {
    event.preventDefault();
    this.props.logout();
  }

  render() {
    return (
      <div className="LogoutBox">
        <form onSubmit={this.handleLogout}>
          Logged in as {this.props.userFullName} <input type="submit" value="Logout" />
        </form>
      </div>
    );
  }
}
