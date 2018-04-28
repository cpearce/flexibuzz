import React, { Component } from 'react';
import Calendar from './Calendar.js';
import LoginBox from './LoginBox.js';
import './App.css';

class HeaderBox extends Component {
  render() {
    return (
      <h1>Flexibuzz Calendar</h1>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.state = { authenticated: false, calendar: null };
    let token = localStorage.getItem("apiToken");
    if (token) {
      this.authenticate(token);
    }
  }

  async authenticate(token) {
    await this.props.tiqbiz.authenticate(token);
    localStorage.setItem("apiToken", token);
    this.setState({authenticated: true});

    let self = this;
    let appendToCalendar = (entries) => {
      self.setState((prev) => {
        let calendar = prev.calendar == null ? entries
          : prev.calendar.concat(entries);
        return {calendar: calendar }
      });
    };
    await this.props.tiqbiz.calendar(appendToCalendar);
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
        <Calendar
          authenticated={this.state.authenticated}
          events={this.state.calendar}
        />
      </div>
    );
  }
}

export default App;
