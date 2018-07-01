import React, { Component } from 'react';
import {NotificationSelector, NotificationList} from './NotificationSelector.js'

async function getGCal(calendarId, startDate, endDate) {
  console.log("getGCal " + startDate + " " + endDate);
  const api = "https://www.googleapis.com/calendar/v3/calendars/"
  let url =
    api + calendarId + "/events?"
    + "key=AIzaSyBqhqI543V2ejZi6B_CniqJ7eQYq-iW0wE"
    + "&timeMin=" + startDate + "T00:00:00.000Z&maxResults=250"
    + "&timeMax=" + endDate + "T00:00:00.000Z"
    + "&singleEvents=true";
    let nextPageToken = undefined;
    let calendar = [];
    while (true) {
      let pageToken = nextPageToken ? "&pageToken=" + nextPageToken : "";
      let response = await fetch(url + pageToken, {
        cache: "no-cache",
      });
      let page = await response.json();
      calendar.push(page);
      if (page.nextPageToken) {
        nextPageToken = page.nextPageToken;
      } else {
        break;
      }
    }

    return calendar;
}

const CONFIG = 0;
const LOADING = 1;

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export class GoogleCalendarImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      screen: CONFIG,
      googleCalendarId: localStorage.getItem("googleCalendarId"),
      startDate: "",
      endDate: "",
      selectedItems: new Set(),
      notifications: new NotificationList(),
    };
  }

  loadGCal() {
    this.setState({
      screen: LOADING,
    });
    getGCal(this.state.googleCalendarId,
            this.state.startDate,
            this.state.endDate)
    .then((data) => {
      console.log(data);
      let items = data.reduce((accumulator, value) => {
        let confirmed = value.items.filter(i => i.status === "confirmed");
        return accumulator.concat(confirmed);
      }, []);
      items.sort((a,b) => a.start.date.localeCompare(b.start.date));
      let selectedItems = new Set();
      for (let item of items) {
        selectedItems.add(item.id);
      }
      this.setState({items: items, selectedItems: selectedItems});
      console.log(items);
    },(err) => {
      console.log(err);
    });
  }

  onStartDateChange(event) {
    this.setState({
      startDate: event.target.value,
    });
  }

  onEndDateChange(event) {
    this.setState({
      endDate: event.target.value,
    });
  }

  onGoogleCalendarIdChange(event) {
    const googleCalendarId = event.target.value;
    this.setState({
      googleCalendarId: googleCalendarId,
    });
    localStorage.setItem("googleCalendarId", googleCalendarId);
  }

  renderConfigScreen() {
    const startDate = new Date(this.state.startDate);
    const endDate = new Date(this.state.endDate);
    const validInput =
      isValidDate(startDate) &&
      isValidDate(endDate) &&
      startDate.getTime() <= endDate.getTime() &&
      this.state.googleCalendarId !== "";
    return (
      <div>
        <h3>Load Google Calendar for import</h3>
        Google calendar ID:
        <input
          type="text"
          value={this.state.googleCalendarId}
          onChange={this.onGoogleCalendarIdChange.bind(this)}
        />
        <br />
        Import events on or after:
        <input
          type="date"
          value={this.state.startDate}
          onChange={this.onStartDateChange.bind(this)}
        />
        <br />
        up until and including
        <input
          type="date"
          value={this.state.endDate}
          onChange={this.onEndDateChange.bind(this)}
        />
        <br />
        <button
          onClick={this.loadGCal.bind(this)}
          disabled={!validInput}
        >
          Load Google Calender Events
        </button>
        <button onClick={this.props.onCancel.bind(this)}>
         Cancel
       </button>
      </div>
    );
  }

  handleItemCheckedChange(itemId, event) {
    let checked = event.target.checked;
    this.setState((prev) => {
      if (checked) {
        prev.selectedItems.add(itemId);
      } else {
        prev.selectedItems.delete(itemId);
      }
      return { selectedItems: prev.selectedItems };
    })
  }

  handleAddNotification(n) {
    this.setState((prev) => {
      return { notifications: prev.notifications.append(n) };
    });
  }

  removeNotification(n) {
    this.setState((prev) => {
      return { notifications: prev.notifications.without(n) };
    });
  }

  renderLoadingScreen() {
    if (this.state.items.length === 0) {
      return (
        <div>
          Loading...
          <button onClick={this.props.onCancel.bind(this)}>
            Cancel
          </button>
        </div>
      );
    }
    let items = this.state.items.map((item) => {
      return (
        <tr key={item.id} className="gcal-item">
          <td>
            <input type="checkbox"
                    onChange={this.handleItemCheckedChange.bind(this, item.id)}
                    checked={this.state.selectedItems.has(item.id)}
            />
          </td>
          <td>
            {item.start.date} - {item.end.date} ; {item.summary}
          </td>
        </tr>
      );
    });

    return (
      <div>
        <table>
          <thead>
            <tr>
              <td>Import</td>
              <td>Item</td>
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </table>
        <NotificationSelector
          notifications={this.state.notifications}
          addNotification={this.handleAddNotification.bind(this)}
          removeNotification={this.removeNotification.bind(this)}
        />
        <button onClick={this.props.onCancel.bind(this)}>
          Cancel
        </button>
      </div>
    );
  }

  render() {
    if (this.state.screen === CONFIG) {
      return this.renderConfigScreen();
    } else if (this.state.screen === LOADING) {
      return this.renderLoadingScreen();
    }
  }
}