import React, { Component } from 'react';

async function getGCal(calendarId) {
  const api = "https://www.googleapis.com/calendar/v3/calendars/"
  let url =
    api + calendarId + "/events?"
    + "key=AIzaSyBqhqI543V2ejZi6B_CniqJ7eQYq-iW0wE"
    + "&timeMin=2018-01-01T00:00:00.000Z&maxResults=250"
    + "&timeMax=2019-01-01T00:00:00.000Z";
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

export class GoogleCalendarImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
    };
    getGCal('office%40kohimarama.school.nz')
    .then((data) => {
      console.log(data);
      let items = data.reduce((accumulator, value) => {
        let confirmed = value.items.filter(i => i.status === "confirmed");
        return accumulator.concat(confirmed);
      }, []);
      items.sort((a,b) => a.start.date.localeCompare(b.start.date));
      this.setState({items: items});
      console.log(items);
    },(err) => {
      console.log(err);
    });
  }
  render() {
    let items = this.state.items.map((item) => {
      return (
        <div key={item.id} className="gcal-item">
          {item.start.date} - {item.end.date} ; {item.summary}
        </div>
      );
    });
    return (
      <div>
        <p>office@kohimarama.school.nz public Google calendar for 2018</p>
        {items}
        <button onClick={this.props.onCancel.bind(this)}>
          Cancel
        </button>
      </div>
    );
  }
}