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
