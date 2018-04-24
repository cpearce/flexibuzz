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
    this.props.login(this.state.username, this.state.password);
  }

  render() {
    if (this.props.authenticated) {
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
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.state = { authenticated: false };
    let token = localStorage.getItem("apiToken");
    if (token) {
      this.authenticate(token);
    }
  }

  authenticate(token) {
    this.props.tiqbiz.authenticate(token).then(
      () => {
        localStorage.setItem("apiToken", token);
        this.setState({authenticated: true});
      }
    );
  }

  async logout() {
    await this.props.tiqbiz.logout();
    localStorage.removeItem("apiToken");
    this.setState({authenticated: false});
  }

  async login(username, password) {
    let token = await this.props.tiqbiz.login(username, password);
    await this.authenticate(token);
  }

  render() {
    return (
      <div className="App">
        <HeaderBox />
        <LoginBox
          login={this.login}
          logout={this.logout}
          authenticated={this.state.authenticated}
        />
      </div>
    );
  }
}

export default App;
