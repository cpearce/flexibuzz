import React, { Component } from 'react';
import SortMaybeAsInt from './Util.js'

// Pads a number with "0" so it's 2 digits long.
let fw = (x) => (x +  "").padStart(2, "0");

function today() {
  let d = new Date();
  return d.getFullYear() + "-" + fw(d.getMonth() + 1) + "-" + fw(d.getDate());
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function repetitionsForRange(period, startDate, endDate) {
  if (period === 0) {
    return [];
  }
  let dates = [];
  const end = new Date(endDate);
  for (let date = new Date(startDate);
       date <= end;
       date = addDays(date, 7 * period))
  {
    dates.push(date);
  }
  return dates;
}

function makeDate(date, time, allDay) {
  return date + " " + (allDay ? "00:00:00" : time);
}

function makeShortDateTime(d) {
  return makeShortDate(d) + " " + makeShortTime(d);
}

function makeShortTime(d) {
  return fw(d.getHours()) + ":" + fw(d.getMinutes()) + ":" + fw(d.getSeconds());
}

function makeShortDate(d) {
  return d.getFullYear() + "-" + fw(d.getMonth() + 1) + "-" + fw(d.getDate());
}

function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 8.64e7);
}

class EventForm extends Component {
  constructor(props) {
    super(props);

    // Cache lookup table of box name to box id.
    this.boxNameToId = new Map(
      this.props.boxes.map(b => [b.name, b.id])
    );

    const dupe = this.props.duplicatee;

    let timeOf = (s) => {
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

    let notifications = (dupe && dupe.notifications) ?
      dupe.notifications.map((n) => {
        return {
          time: timeOf(n.toTimeString()),
          dayOffset: daysBetween(new Date(n), new Date(dupe.startDate)),
        }
      }).filter(
        x => x.dayOffset == 0 || x.dayOffset == -1
      )
    : [];

    let selectedBoxes = (dupe && dupe.boxes)
      ? new Set(dupe.boxIds) : new Set();
    this.state = {
      title: dupe ? dupe.title : '',
      description: dupe ? dupe.description : '',
      allDay: dupe ? dupe.allDay : true,
      startDate: dupe ? dupe.startDate : today(),
      startTime: dupe ? dupe.startTime : '09:00',
      endTime: dupe ? dupe.endTime : '',
      location: dupe ? dupe.location : '',
      address: dupe ? dupe.address : '',
      selectedBoxes: selectedBoxes,
      notifications: notifications,
      notificationTime: "09:00",
      notificationDay: -1,
      recurrencePeriod: 0,
      recurrenceEndDate: today(),
      repetitions: [],
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAllDayChange = this.handleAllDayChange.bind(this);
    this.handleAddNotification = this.handleAddNotification.bind(this);
    this.handleUpdateRecurrencePeriod = this.handleUpdateRecurrencePeriod.bind(this);
    this.handleRecurrenceEndChange = this.handleRecurrenceEndChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleAllDayChange(event) {
    this.setState({
      allDay: event.target.checked,
    });
  }

  handleBoxCheckChange(boxId, event) {
    let checked = event.target.checked;
    this.setState((prev) => {
      if (checked) {
        prev.selectedBoxes.add(boxId);
      } else {
        prev.selectedBoxes.delete(boxId);
      }
      return { selectedBoxes: prev.selectedBoxes };
    });
  }

  handleGroupCheckChange(groupName, event) {
    let boxNamesInGroup = this.props.groups[groupName];
    let checked = event.target.checked;
    this.setState((prev) => {
      for (let boxName of boxNamesInGroup) {
        let boxId = this.boxNameToId.get(boxName);
        if (checked) {
          prev.selectedBoxes.add(boxId);
        } else {
          prev.selectedBoxes.delete(boxId);
        }
      }
      return { selectedBoxes: prev.selectedBoxes };
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
    let found = this.state.notifications.find(
      e => e.time === n.time && e.dayOffset === n.dayOffset);
    if (found) {
      return;
    }
    this.setState((prev) => {
      let notifications = prev.notifications.concat(n);
      return { notifications: notifications };
    });
  }

  handleUpdateRecurrencePeriod(event) {
    const recurrencePeriod = parseInt(event.target.value, 10);
    this.setState((prev) => {
      let repetitions =
        repetitionsForRange(recurrencePeriod,
                            prev.startDate,
                            prev.recurrenceEndDate)
      return {
        recurrencePeriod: recurrencePeriod,
        repetitions: repetitions,
      };
    });
  }

  handleRecurrenceEndChange(event) {
    const recurrenceEndDate = event.target.value;
    this.setState((prev) => {
      let repetitions =
        repetitionsForRange(prev.recurrencePeriod,
                            prev.startDate,
                            recurrenceEndDate)
      return {
        recurrenceEndDate: recurrenceEndDate,
        repetitions: repetitions,
      };
    });
  }

  removeNotification(n) {
    let rm = (notifications) => notifications.filter(
      e => e.time !== n.time || e.dayOffset !== n.dayOffset);
    this.setState((prev) => {
      return { notifications: rm(prev.notifications) }
    });
  }

  handleSubmit() {
    let startTime = this.state.startTime + ":00";
    let endTime = undefined;
    if (this.state.endTime.length > 0) {
      endTime = this.state.endTime + ":00";
    }
    let repetitions = this.state.repetitions.length > 0
      ? this.state.repetitions : [new Date(this.state.startDate)];
    let events = repetitions.map(
      (date) => {
        let shortDate = makeShortDate(date);
        let notifications = this.state.notifications.map(
          (n) => {
            let d = makeShortDate(addDays(new Date(date), n.dayOffset));
            return makeDate(d, n.time + ":00", false);
          }
        );

        let event = {
          boxes: Array.from(this.state.selectedBoxes.values()),
          post_type: "calendar",
          title: this.state.title,
          body_markdown: this.state.description,
          start_date: makeDate(shortDate, startTime, this.state.allDay),
          all_day: this.state.allDay,
          published_at: makeShortDateTime(new Date()),
        };

        if (endTime) {
          event.end_date = makeDate(shortDate, endTime, this.state.allDay);
        }

        if (this.state.location.length > 0) {
          event["location"] = this.state.location;
        }
        if (this.state.address.length > 0) {
          event["address"] = this.state.address;
        }
        if (this.state.notifications.length > 0) {
          event["notifications[]"] = notifications;
        }
        return event;
      }
    );
    this.props.onSubmit(events);
  }

  removeRepetition(repetition) {
    this.setState((prev) => {
      let repetitions = prev.repetitions.filter(
        (r) => r.getTime() !== repetition.getTime()
      );
      let period = repetitions.length === 0 ? 0 : prev.recurrencePeriod;
      return {
        repetitions: repetitions,
        recurrencePeriod: period
      }
    });
  }

  render() {
    let boxes = (
      <div id="box-list">
      {
        this.props.boxes.map(
          (box) => {
            var id = "box-list-" + box.id;
            return (
                <label key={id}>
                  {box.name}
                  <input type="checkbox"
                        id={id}
                        checked={this.state.selectedBoxes.has(box.id)}
                        boxid={box.id}
                        onChange={this.handleBoxCheckChange.bind(this, box.id)}
                  />
                </label>
            );
          }
        )
      }
      </div>
    );

    // Get list of selected groups by looking over all selected boxes and seeing
    // which groups' boxes are all selected.
    let selectedGroups = new Set(Object.keys(this.props.groups).filter(
      (groupName) => {
        return Array.from(this.props.groups[groupName]).every(
          (boxName) => this.state.selectedBoxes.has(this.boxNameToId.get(boxName))
        );
      }
    ));

    let groupNames = Object.keys(this.props.groups);
    SortMaybeAsInt(groupNames);
    let groups = (
      <div id="group-list">
      {
        this.props.groups &&
        groupNames.map(
          (groupName) => {
            var id = "group-list-" + groupName;
            return (
                <label key={id}>
                  {groupName}
                  <input type="checkbox"
                        id={id}
                        checked={selectedGroups.has(groupName)}
                        onChange={this.handleGroupCheckChange.bind(this, groupName)}
                  />
                </label>
            );

          }
        )
      }
      </div>
    );

    let notifications = (
      <div id="notificationsList">
      {
        this.state.notifications.map(
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

    let repetitions = (
      <div id="recurrence-event-repetitions">
      {
        this.state.repetitions.map(
          (r) => {
            return (
              <div className="repetition" key={r.toDateString()}>
                {r.toDateString()}
                <button onClick={this.removeRepetition.bind(this, new Date(r))}>
                  Remove
                </button>
              </div>
            );
          }
        )
      }
      </div>
    );

    let repetitionRangeControls = (
      <span>
        from
      { this.state.startDate}
      until
      <input
        type="date"
        id="recurrenceEndDate"
        value={this.state.recurrenceEndDate}
        onChange={this.handleRecurrenceEndChange}
      />
      </span>
    );

    return (
      <div className="eventForm">
        <h3>{this.props.header}</h3>
        <div className="row">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={this.state.title}
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={this.state.description}
            cols="50"
            rows="10"
            onChange={this.handleInputChange}
          />
        </div>
        <div className="row">
          <label htmlFor="allDay">All day:</label>
          <input
            type="checkbox"
            id="allDay"
            checked={this.state.allDay}
            onChange={this.handleAllDayChange}
          />
        </div>
        <div>
          <label htmlFor="startDate">Date:</label>
          <input
            type="date"
            id="startDate"
            value={this.state.startDate}
            onChange={this.handleInputChange}
          />
        </div>
        {!this.state.allDay &&
          <div>
            <label htmlFor="startTime">time:</label>
            <input
              type="time"
              id="startTime"
              value={this.state.startTime}
              onChange={this.handleInputChange}
            />
            <label htmlFor="endTime">until:</label>
            <input
              type="time"
              id="endTime"
              value={this.state.endTime}
              onChange={this.handleInputChange}
            />
          </div>
        }
        <div className="row">
          <label htmlFor="location">Location (name):</label>
          <input
            type="text"
            id="location"
            value={this.state.location}
            onChange={this.handleInputChange}
          />
        </div>
        <div className="row">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            value={this.state.address}
            onChange={this.handleInputChange}
          />
          </div>
        <fieldset>
          <legend>Boxes</legend>
          {boxes}
        </fieldset>
        <fieldset>
          <legend>Groups</legend>
          {groups}
        </fieldset>
        <fieldset>
          <legend>Notifications</legend>
          {notifications}
          Add notification at
          <input
            type="time"
            id="notificationTime"
            value={this.state.notificationTime}
            onChange={this.handleInputChange}
          /> on
          <select
            id="notificationDay"
            value={this.notificationDay}
            onChange={this.handleInputChange}
          >
            <option value="-1">the day before the event</option>
            <option value="0">the day of the event</option>
          </select>
          <button onClick={this.handleAddNotification}>Add notification</button>
        </fieldset>
        <fieldset>
          <legend>Event repetitions</legend>
          <select
            id="recurrenceSelect"
            onChange={this.handleUpdateRecurrencePeriod}
            value={this.state.recurrencePeriod}
          >
            <option value="0">One off event</option>
            <option value="1">Every week</option>
            <option value="2">Every 2 weeks</option>
            <option value="4">Every 4 weeks</option>
          </select>
          { this.state.recurrencePeriod !== 0 && repetitionRangeControls }
          { repetitions }
        </fieldset>
        <button onClick={this.handleSubmit}>Create event</button>
        <button onClick={this.props.cancel}>Cancel</button>
      </div>
    );
  }
}

export default EventForm;
