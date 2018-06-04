import React, { Component } from 'react';
import Calendar from './Calendar.js';
import {LoginBox,LogoutBox} from './LoginBox.js';
import EventForm from './EventForm.js';
import './App.css';

class ExpiredEventToggle extends Component {
  render() {
    return (
      <label>
        Show events before today:
        <input
          type="checkbox"
          value={this.props.showExpired}
          onClick={this.props.setShowExpired}
        />
      </label>
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
      businessName: "",
      userFullName: "",
      calendar: null,
      boxes: [],
      showExpired: false,
      showAddEvent: false,
    };
    let token = localStorage.getItem("apiToken");
    if (token) {
      this.authenticate(token);
    }
    this.addEvents = this.addEvents.bind(this);
    this.setShowExpired = this.setShowExpired.bind(this);
  }

  async authenticate(token) {
    await this.props.tiqbiz.authenticate(token);
    localStorage.setItem("apiToken", token);
    this.setState({
      authenticated: true,
      businessName: this.props.tiqbiz.business.name,
      userFullName: this.props.tiqbiz.userFullName,
    });
    let boxes = await this.props.tiqbiz.boxes();
    this.setState({ boxes: boxes });
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

  setShowExpired(event) {
    this.setState({showExpired: event.target.checked});
  }

  filteredEvents() {
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (this.state.calendar == null || this.state.showExpired) {
      return this.state.calendar;
    }
    return this.state.calendar.filter(
        (e) => {
          let start = (new Date(e.startDate));
          let end = e.endDate.length > 0 ? new Date(e.endDate) : start;
          return today <= start || end >= today;
        }
      );
  }

  setShowAddEvent(show, event) {
    this.setState({showAddEvent: show});
  }

  render() {
    if (!this.state.authenticated) {
      return (
        <div className="App">
          <LoginBox
            login={this.login}
            logout={this.logout}
            authenticated={this.state.authenticated}
          />
        </div>
      );
    }

    let main = this.state.showAddEvent ?
    (
      <EventForm
        header="Add new event"
        boxes={this.state.boxes}
        groups={this.props.tiqbiz.groups}
        boxGroups={this.props.tiqbiz.boxGroups}
        onSubmit={this.addEvents}
        cancel={this.setShowAddEvent.bind(this, false)}
      />
    ) : (
      <Calendar
        events={this.filteredEvents()}
      />
    );

    return (
      <div className="App">
        <div id="header">
          <div id="header-title">
            Flexibuzz Notification Schedule: {this.state.businessName}
          </div>
          <LogoutBox
            userFullName={this.state.userFullName}
            logout={this.logout}
          />
        </div>
        <div id="main">
          {main}
        </div>
        <div id="footer">
          <ExpiredEventToggle
            setShowExpired={this.setShowExpired}
          />
          <div id="show-event-button">
            {!this.state.showAddEvent &&
              <button onClick={this.setShowAddEvent.bind(this, true)}>Create new event</button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
