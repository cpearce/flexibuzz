import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class HeaderBox extends Component {
  render() {
    return (
      <h1>Flexibuzz Calendar</h1>
    );
  }
}

class LoginBox extends Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleLogout(event) {
    event.preventDefault();
    this.props.logout();
  }

  handleLogin(event) {
    event.preventDefault();
    const username = this.state.username;
    const password = this.state.password;
    this.props.tiqbiz.login(username, password)
    .then(
      () => {
        this.props.authTokenChange();
      }
    );
  }

  render() {
    if (this.props.authToken) {
      return (
        <form className="LoginBox" onSubmit={this.handleLogout}>
          <input type="submit" value="Logout" />
        </form>
      );
    }
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

class App extends Component {
  constructor(props) {
    super(props);
    this.authTokenChange = this.authTokenChange.bind(this);
    this.logout = this.logout.bind(this);
    let token = localStorage.getItem("apiToken");
    this.state = {authToken: token ? token : '' };
  }

  authTokenChange(token) {
    localStorage.setItem("apiToken", token);
    this.setState({authToken: this.props.tiqbiz.apiToken});
  }

  logout() {
    localStorage.removeItem("apiToken");
    this.setState({authToken: "" });
  }

  render() {
    return (
      <div className="App">
        <HeaderBox />
        <LoginBox
          tiqbiz={this.props.tiqbiz}
          authToken={this.state.authToken}
          authTokenChange={this.authTokenChange}
          logout={this.logout}
        />
      </div>
    );
  }
}

export default App;
