import React, { Component } from 'react';
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

class Calendar extends Component {
  extractDate(e) {
    let startDate = e.startDate;
    let startTime = e.allDay ? "(all day)" : e.startTime;
    let endDate = e.startDate === e.endDate ? "" : e.endDate;
    let endTime = (e.allDay || (e.startTime === e.endTime))
                ? "" : e.endTime;
    let rhs = startDate + " " + startTime;
    if (endDate.length === 0 && endTime.length === 0) {
      return rhs;
    }
    let s = rhs + " -";
    if (endDate.length > 0) {
      s += " " + endDate;
    }
    if (endTime.length > 0) {
      s += " " + endTime;
    }
    return s;
  }

  render() {
    if (!this.props.authenticated) {
      return (
        <div />
      );
    }
    if (this.props.events == null) {
      return <p>Loading calendar...</p>
    }
    let tbody = this.props.events.map(
      (e) => {
        return (
        <tr key={e.id}>
          <td>{e.title}</td>
          <td>{this.extractDate(e)}</td>
          <td>{e.boxes.join(", ")}</td>
          <td>{e.notifications.join(", ")}</td>
        </tr>
        );
      }
    );
    return (
      <table id="calendar">
        <thead>
          <tr>
            <td>Title</td>
            <td>Date</td>
            <td>Boxes</td>
            <td>Notifications</td>
          </tr>
        </thead>
        <tbody>
          {tbody}
        </tbody>
      </table>
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
