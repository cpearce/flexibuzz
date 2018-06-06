import React, { Component } from 'react';

export class GoogleCalendarImport extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <button onClick={this.props.onCancel.bind(this)}>
          Cancel
        </button>
      </div>
    );
  }
}