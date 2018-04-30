import React, { Component } from 'react';
import Calendar from './Calendar.js';
import LoginBox from './LoginBox.js';
import EventForm from './EventForm.js';
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
    this.state = {
      authenticated: false,
      calendar: null,
      boxes: [],
    };
    let token = localStorage.getItem("apiToken");
    if (token) {
      this.authenticate(token);
    }
    this.addEvents = this.addEvents.bind(this);
  }

  async authenticate(token) {
    await this.props.tiqbiz.authenticate(token);
    localStorage.setItem("apiToken", token);
    this.setState({authenticated: true});

    this.props.tiqbiz.boxes().then((boxes => {
      this.setState({ boxes: boxes });
    }));

    this.updateCalendar();
  }

  async updateCalendar() {
    let self = this;
    this.setState({calendar: null});
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

  async addEvents(events) {
    for (let event of events) {
      await this.props.tiqbiz.addEvent(event);
    }
    await this.updateCalendar();
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
        {this.state.authenticated &&
          <Calendar
            events={this.state.calendar}
          />
        }
        {this.state.authenticated &&
          <EventForm
            boxes={this.state.boxes}
            onSubmit={this.addEvents}
          />
        }
      </div>
    );
  }
}

export default App;
