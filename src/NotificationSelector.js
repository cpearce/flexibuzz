import React, { Component } from 'react';
import {addDays, makeDate, makeShortDate} from './DateUtils.js'

function timeOf(s) {
  if (!s) {
    return "";
  }
  let r = /(\d\d:\d\d):\d\d/;
  let m = s.match(r);
  if (m.length < 2) {
    return s;
  }
  return m[1];
};

function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 8.64e7);
}

// State object containing list of times and day offsets on which to notify.
export class NotificationList {

  constructor(duplicatee) {
    // List of notifications, where each notification is a relative offset
    // from an event date. Format:
    // {
    //    time: String, // time of notification, in HH::MM format.
    //    dayOffset: number, // Days offset, 0 or -1. 0 means "on the day",
    //                       // -1 means, "on the day before".
    // }
    this.notifications = (duplicatee && duplicatee.notifications) ?
    duplicatee.notifications.map((n) => {
        return {
          time: timeOf(n.toTimeString()),
          dayOffset: daysBetween(new Date(n), new Date(duplicatee.startDate)),
        }
      }).filter(
        x => x.dayOffset === 0 || x.dayOffset === -1
      )
    : [];
  }

  append(n) {
    let list = new NotificationList();
    let found = this.notifications.find(
      e => e.time === n.time && e.dayOffset === n.dayOffset);
    list.notifications = this.notifications.concat(found ? [] : [n]);
    return list;
  }

  withou(n) {
    let list = new NotificationList();
    list.notifications = this.notifications.filter(
      e => e.time !== n.time || e.dayOffset !== n.dayOffset);
    return list;
  }

  map(f) {
    return this.notifications.map(f);
  }

  // Returns notifications for a day in TiqBiz format.
  forDay(date) {
    return this.notifications.map(
      (n) => {
        let d = makeShortDate(addDays(new Date(date), n.dayOffset));
        return makeDate(d, n.time + ":00", false);
      }
    );
  }
}

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
