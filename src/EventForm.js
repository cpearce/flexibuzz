import React, { Component } from 'react';
import {NotificationSelector, NotificationList} from './NotificationSelector.js'
import {makeDate, makeShortDateTime, makeShortDate, repetitionsForRange, today} from './DateUtils.js'
import {SelectedBoxList, BoxAndGroupSelector} from './SelectedBoxList.js'

class EventForm extends Component {
  constructor(props) {
    super(props);

    const dupe = this.props.duplicatee;

    this.state = {
      title: dupe ? dupe.title : '',
      description: dupe ? dupe.description : '',
      allDay: dupe ? dupe.allDay : true,
      startDate: dupe ? dupe.startDate : today(),
      startTime: dupe ? dupe.startTime : '09:00',
      endTime: dupe ? dupe.endTime : '',
      location: dupe ? dupe.location : '',
      address: dupe ? dupe.address : '',
      selectedBoxes: new SelectedBoxList(this.props.boxes,
                                         this.props.groups,
                                         dupe ? dupe.boxIds : undefined),
      notifications: new NotificationList(dupe),
      notificationTime: "09:00",
      notificationDay: -1,
      recurrencePeriod: 0,
      recurrenceEndDate: today(),
      repetitions: [],
      submitButtonDisabled: false,
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

  handleBoxAdded(boxId) {
    this.setState((prev) => {
      prev.selectedBoxes.add(boxId);
      return { selectedBoxes: prev.selectedBoxes };
    });
  }

  handleBoxRemoved(boxId) {
    this.setState((prev) => {
      prev.selectedBoxes.remove(boxId);
      return { selectedBoxes: prev.selectedBoxes };
    });
  }

  handleGroupAdded(groupName) {
    this.setState((prev) => {
      prev.selectedBoxes.addGroup(groupName);
      return {
        selectedBoxes: prev.selectedBoxes,
      };
    });
  }

  handleGroupRemoved(groupName) {
    this.setState((prev) => {
      prev.selectedBoxes.removeGroup(groupName);
      return {
        selectedBoxes: prev.selectedBoxes,
      };
    });
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

  handleSubmit() {
    this.setState({ submitButtonDisabled: true });
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
        let notifications = this.state.notifications.forDay(date);
        let event = {
          boxes: this.state.selectedBoxes.values(),
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
        if (notifications.length > 0) {
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
        <BoxAndGroupSelector
          boxes={this.props.boxes}
          groups={this.props.groups}
          selectedBoxes={this.state.selectedBoxes}
          onGroupAdded={this.handleGroupAdded.bind(this)}
          onGroupRemoved={this.handleGroupRemoved.bind(this)}
          onBoxAdded={this.handleBoxAdded.bind(this)}
          onBoxRemoved={this.handleBoxRemoved.bind(this)}
        />
        <NotificationSelector
          notifications={this.state.notifications}
          addNotification={this.handleAddNotification.bind(this)}
          removeNotification={this.removeNotification.bind(this)}
        />
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
        <button
          onClick={this.handleSubmit}
          disabled={this.state.submitButtonDisabled}
        >
          Create event
        </button>
        <button onClick={this.props.cancel}>Cancel</button>
      </div>
    );
  }
}

export default EventForm;
