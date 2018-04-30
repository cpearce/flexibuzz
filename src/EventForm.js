import React, { Component } from 'react';

function today() {
  let d = new Date();
  let w = (x) => x < 10 ? "0" + x : "" + x;
  return d.getFullYear() + "-" + w(d.getMonth() + 1) + "-" + w(d.getDate());
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

function fw(n) {
  if (n < 10) {
    return "0" + n;
  }
  return "" + n;
}

function makeShortDate(d) {
  return d.getFullYear() + "-" + fw(d.getMonth() + 1) + "-" + fw(d.getDate());
}

class EventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      allDay: true,
      startDate: today(),
      startTime: '09:00',
      endTime: '',
      location: '',
      address: '',
      selectedBoxes: new Set(),
      notifications: [],
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
      <div className="EventForm">
        <div>
          <label>Title:
            <input
              type="text"
              id="title"
              value={this.state.title}
              onChange={this.handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>Description:
            <textarea
              id="description"
              value={this.state.description}
              cols="50"
              rows="10"
              onChange={this.handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            All day:
            <input
              type="checkbox"
              id="allDay"
              checked={this.state.allDay}
              onChange={this.handleAllDayChange}
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              id="startDate"
              value={this.state.startDate}
              onChange={this.handleInputChange}
            />
          </label>
          {!this.state.allDay &&
            <div>
              <label>
                time:
                <input
                  type="time"
                  id="startTime"
                  value={this.state.startTime}
                  onChange={this.handleInputChange}
                />
              </label>
              <label>
                until:
                <input
                  type="time"
                  id="endTime"
                  value={this.state.endTime}
                  onChange={this.handleInputChange}
                />
              </label>
            </div>
          }
        </div>
        <div>
          <label>
            Location (name):
            <input
              type="text"
              id="location"
              value={this.state.location}
              onChange={this.handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            Address:
            <input
              type="text"
              id="address"
              value={this.state.address}
              onChange={this.handleInputChange}
            />
            </label>
          </div>
        <fieldset>
          <legend>Boxes</legend>
          {boxes}
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
        <p><button onClick={this.handleSubmit}>Create event</button></p>
      </div>
    );
  }
}

export default EventForm;
