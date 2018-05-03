import React, { Component } from 'react';

const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const month = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function prettyDate(d) {
  let fw = (x) => (x +  "").padStart(2, "0");
  return dayOfWeek[d.getDay()] + " " + d.getDate() + " " + month[d.getMonth()] + " " +
    d.getFullYear() + " " + fw(d.getHours() + ":" + fw(d.getMinutes()));
}

function prettyShortDate(d) {
  if (d === "") {
    return "";
  }
  d = new Date(d);
  return dayOfWeek[d.getDay()] + " " + d.getDate() + " " + month[d.getMonth()] + " " +
    d.getFullYear();
}

class Calendar extends Component {
  extractDate(e) {
    let startDate = prettyShortDate(e.startDate);
    let startTime = e.allDay ? "(all day)" : e.startTime;
    let endDate = e.startDate === e.endDate ? "" : prettyShortDate(e.endDate);
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
          <td>{e.notifications.map(prettyDate).join(", ")}</td>
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

export default Calendar;