import React, { Component } from 'react';
import Calendar from './Calendar.js';
import {LoginBox,LogoutBox} from './LoginBox.js';
import EventForm from './EventForm.js';
import {GoogleCalendarImport} from './GoogleCalendarImport.js'
import './App.css';

const CalendarScreen = 1;
const CreateNewEventScreen = 2;
const DuplicateEventScreen = 3;
const ImportGoogleCalendarScreen = 4;

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
      screen: CalendarScreen,
      duplicateEventId: null,
    };
    let token = localStorage.getItem("apiToken");
    if (token) {
      this.authenticate(token);
    }
    this.onAddEvents = this.onAddEvents.bind(this);
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

  async onAddEvents(events) {
    for (let event of events) {
      await this.props.tiqbiz.addEvent(event);
    }
    this.setScreen(CalendarScreen);
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

  setScreen(screen, event) {
    this.setState({screen: screen});
  }

  duplicateCalendarEvent(eventId) {
    console.log("Duplicate " + eventId);
    this.setState({
      duplicateEventId: eventId,
      screen: DuplicateEventScreen,
    });
  }

  renderMain() {
    switch (this.state.screen) {
      case CreateNewEventScreen: {
        return (
          <EventForm
            header="Add new event"
            boxes={this.state.boxes}
            groups={this.props.tiqbiz.groups}
            boxGroups={this.props.tiqbiz.boxGroups}
            onSubmit={this.onAddEvents}
            cancel={this.setScreen.bind(this, CalendarScreen)}
          />
        );
      }
      case DuplicateEventScreen: {
        let duplicatee = this.state.calendar.find(
          (e) => e.id === this.state.duplicateEventId
        );
        return (
          <EventForm
            header="Duplicate existing event"
            boxes={this.state.boxes}
            groups={this.props.tiqbiz.groups}
            boxGroups={this.props.tiqbiz.boxGroups}
            duplicatee={duplicatee}
            onSubmit={this.onAddEvents}
            cancel={this.setScreen.bind(this, CalendarScreen)}
          />
        );
      }
      case ImportGoogleCalendarScreen: {
        return (
          <GoogleCalendarImport
            boxes={this.state.boxes}
            groups={this.props.tiqbiz.groups}
            onCancel={this.setScreen.bind(this, CalendarScreen)}
            onSubmit={this.onAddEvents}
          />
        );
      }
      case CalendarScreen:
      default: {
        return (
          <Calendar
            events={this.filteredEvents()}
            onDuplicateCalendarEvent={this.duplicateCalendarEvent.bind(this)}
          />
        );
      }
    }
  }

  render() {
    if (!this.state.authenticated) {
      return (
        <div className="App">
          <div id="login-title">
            Flexibuzz Notification Scheduler
          </div>
          <LoginBox
            login={this.login}
            logout={this.logout}
            authenticated={this.state.authenticated}
          />
          <div class="small">
            <p>By <a href="http://pearce.org.nz">Chris Pearce</a></p>
            <p>All implied warranties disclaimed.</p>
            <p><a href="https://github.com/cpearce/flexibuzz/">Fork it on GitHub.</a></p>
            <p>Icons by Gregor Cresnar from the Noun Project.</p>
            <p>Favicon by <a href="http://www.iconarchive.com/artist/dakirby309.html">dAKirby309</a>,
            licensed under <a href="http://creativecommons.org/licenses/by-nc/4.0/">CC Attribution-Noncommercial 4.0</a>.</p>
          </div>
        </div>
      );
    }

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
          {this.renderMain()}
        </div>
        <div id="footer">
          {this.state.screen === CalendarScreen &&
            <div>
              <ExpiredEventToggle
                setShowExpired={this.setShowExpired}
              />
              <button onClick={this.setScreen.bind(this, CreateNewEventScreen)}>
                Create new event
              </button>
              <button onClick={this.setScreen.bind(this, ImportGoogleCalendarScreen)}>
                Import Google Calendar
              </button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
