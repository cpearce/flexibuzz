import React, { Component } from 'react';
import SortMaybeAsInt from './Util.js'

export class SelectedBoxList {

  constructor(boxes, groups, boxIds) {
    this.selectedBoxIds = new Set(boxIds);
    this.boxes = boxes;
    this.groups = groups;
    // Cache lookup table of box name to box id.
    this.boxNameToId = new Map(
      this.boxes.map(b => [b.name, b.id])
    );

  }

  add(boxId) {
    this.selectedBoxIds.add(boxId);
  }

  addGroup(groupName) {
    this._forEachBoxIdInGroup(groupName, (boxId) => {
      this.selectedBoxIds.add(boxId);
    });
  }

  remove(boxId) {
    this.selectedBoxIds.delete(boxId);
  }

  removeGroup(groupName) {
    this._forEachBoxIdInGroup(groupName, (boxId) => {
      this.selectedBoxIds.delete(boxId);
    });
  }

  has(boxId) {
    return this.selectedBoxIds.has(boxId);
  }

  values() {
    return Array.from(this.selectedBoxIds.values());
  }

  // Get list of selected groups by looking over all selected boxes and seeing
  // which groups' boxes are all selected.
  selectedGroups() {
    return new Set(Object.keys(this.groups).filter(
      (groupName) => {
        return Array.from(this.groups[groupName]).every(
          (boxName) => this.selectedBoxIds.has(this.boxNameToId.get(boxName))
        );
      }
    ));
  }

  _forEachBoxIdInGroup(groupName, func) {
    let boxNamesInGroup = this.groups[groupName];
    for (let boxName of boxNamesInGroup) {
      func(this.boxNameToId.get(boxName));
    }
  }
}

export class BoxAndGroupSelector extends Component {

  handleGroupCheckChange(groupName, event) {
    if (event.target.checked) {
      this.props.onGroupAdded(groupName);
    } else {
      this.props.onGroupRemoved(groupName);
    }
  }

  handleBoxCheckChange(boxId, event) {
    if (event.target.checked) {
      this.props.onBoxAdded(boxId);
    } else {
      this.props.onBoxRemoved(boxId);
    }
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
                        checked={this.props.selectedBoxes.has(box.id)}
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

    let selectedGroups = this.props.selectedBoxes.selectedGroups();
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
    return (
      <div>
        <fieldset>
          <legend>Boxes</legend>
          {boxes}
        </fieldset>
        <fieldset>
          <legend>Groups</legend>
          {groups}
        </fieldset>
      </div>
    );
  }

}
