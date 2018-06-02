import React, { Component } from 'react';

export class LoginBox extends Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
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
    this.props.login(this.state.username, this.state.password);
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
      <div class="LogoutBox">
        <form className="LoginBox" onSubmit={this.handleLogout}>
          Logged in as {this.props.userFullName} <input type="submit" value="Logout" />
        </form>
      </div>
    );
  }
}
