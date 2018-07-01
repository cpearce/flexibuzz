import React, { Component } from 'react';

export class NotificationSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notificationTime: "09:00",
      notificationDay: -1,
    };
    this.handleAddNotification = this.handleAddNotification.bind(this);
  }

  handleInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleAddNotification(event) {
    const days = {
      "0": 0,
      "-1": -1,
    };
    const offset = days[this.state.notificationDay];
    let n = {
      time: this.state.notificationTime,
      dayOffset: offset,
    };
    this.props.addNotification(n);
  }

  removeNotification(n) {
    this.props.removeNotification(n);
  }

  render() {

    let notifications = (
      <div id="notificationsList">
      {
        this.props.notifications.map(
          (n) => {
            let days = {
              "-1" : "the day before the event",
              "0" : "the day of the event"
            };
            return (
              <div key={n.time+n.dayOffset}>
                {n.time + " on " + days[n.dayOffset]}
                <button onClick={this.removeNotification.bind(this, n)}>Remove</button>
              </div>
            )
          }
        )
      }
      </div>
    );

    return (
      <fieldset>
        <legend>Notifications</legend>
        {notifications}
        Add notification at
        <input
          type="time"
          id="notificationTime"
          value={this.state.notificationTime}
          onChange={this.handleInputChange.bind(this)}
        /> on
        <select
          id="notificationDay"
          value={this.notificationDay}
          onChange={this.handleInputChange.bind(this)}
        >
          <option value="-1">the day before the event</option>
          <option value="0">the day of the event</option>
        </select>
        <button onClick={this.handleAddNotification}>Add notification</button>
      </fieldset>
    );
  }
}
