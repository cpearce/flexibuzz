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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
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
        <form className="LoginBox" onSubmit={this.handleSubmit}>
          <input type="submit" value="Logout" />
        </form>
      );
    }
    return (
      <form className="LoginBox" onSubmit={this.handleSubmit}>
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
    let token = localStorage.getItem("apiToken");
    this.state = {authToken: token ? token : '' };
  }

  authTokenChange(token) {
    localStorage.setItem("apiToken", token);
    this.setState({authToken: this.props.tiqbiz.apiToken});
  }

  render() {
    return (
      <div className="App">
        <HeaderBox />
        <LoginBox
          tiqbiz={this.props.tiqbiz}
          authToken={this.state.authToken}
          authTokenChange={this.authTokenChange}
        />
      </div>
    );
  }
}

export default App;
