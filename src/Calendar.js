import React, { Component } from 'react';

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

export default Calendar;