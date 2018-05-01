const API_URL = "https://api.tiqbiz.com/v6/";

class TiqBizAPI {

  async login(username, password) {
    this.username = username;
    this.password = password;
    let json = await this.postData("users/login", {
      email: this.username,
      password: this.password,
    });
    return json.token;
  }

  async logout() {
    if (!this.apiToken) {
      return;
    }
    await this.getData("users/logout", {});
    this.apiToken = undefined;
    this.business = undefined;
  }

  async authenticate(token) {
    this.apiToken = token;
    let response = await this.getData("users/auth", {});
    this.business = response.admin_of[0];
  }

  async calendar(sink) {
    if (!this.apiToken || !this.business || !this.boxes) {
      return Promise.reject("Not logged in");
    }

    let extractBoxes = (boxes) => {
      // Find which groups' boxes are included in the list of boxes
      // being notified. Remove the groups' boxes, and add the groups'
      // names. This gives us a list of groups, rather than boxes,
      // leaving behind boxes which aren't part of a complete group.
      let b = new Set();
      let groupNames = new Set();
      for (var box of boxes) {
        b.add(box.name);
        groupNames.add(this.boxGroup[box.name]);
      }
      groupNames = Array.from(groupNames).filter(
        (g) => Array.from(this.groups[g]).every((box) => b.has(box))
      );
      for (let g of groupNames) {
        for (let box of this.groups[g]) {
          b.delete(box);
        }
        b.add(g);
      }
      let a = Array.from(b);
      a.sort();
      return a;
    };

    let timeOf = (s) => {
      let r = /(\d\d:\d\d):\d\d/;
      let m = s.match(r);
      if (m.length < 2) {
        return s;
      }
      return m[1];
    };

    let dateOf = (s) => {
      let r = /(\d\d\d\d-\d\d-\d\d)/;
      let m = s.match(r);
      if (m == null || m.length < 2) {
        return s;
      }
      return m[0];
    };

    let UTCtoLocal = (s) => {
      let r = /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
      let m = s.match(r);
      if (m == null || m.length < 7) {
        console.log("failed to match utc date")
        return s;
      }
      return new Date(Date.UTC(m[1], parseInt(m[2], 10) - 1, m[3], m[4], m[5], m[6]));
    };

    let returnEntries = (sink, posts) => {
      var entries = [];
      for (var post of posts) {
        entries.push({
          id: post.id,
          title: post.title,
          startDate: dateOf(post.start_date),
          startTime: timeOf(post.start_date),
          endDate: dateOf(post.end_date),
          endTime: timeOf(post.start_date),
          allDay: post.all_day,
          boxes: extractBoxes(post.boxes),
          notifications: post.notifications.map(UTCtoLocal),
        });
      }
      sink(entries);
    };

    const bid = this.business.id;
    let response = await this.getData("businesses/" + bid + "/posts", {
      post_type: "calendar", orderBy: "start_date|asc", page: 1, limit: 15,
    });
    returnEntries(sink, response.data);

    for (var page = 2; page <= response.meta.pagination.total_pages; page++) {
      response = await this.getData("businesses/" + bid + "/posts", {
        post_type: "calendar", orderBy: "start_date|asc", page: page, limit: 15,
      });
      returnEntries(sink, response.data);
    }
  }

  boxes() {
    if (!this.apiToken || !this.business) {
      return Promise.reject("Not logged in");
    }
    return this.getData("businesses/" + this.business.id + "/boxes", {limit: 999})
    .then((response) => {
      var boxes = [];
      this.groups = {};
      this.boxGroup = {};
      for (var box of response.data) {
        boxes.push({
          id: box.id,
          name: box.box_name,
          description: box.box_description,
          group: box.box_group,
        });
        if (this.groups[box.box_group] === undefined) {
          this.groups[box.box_group] = new Set();
        }
        this.groups[box.box_group].add(box.box_name);
        this.boxGroup[box.box_name] = box.box_group;
      }
      this.boxes = boxes;
      return boxes;
    });
  }

  addEvent(data) {
    var formData = new FormData();
    for (var name in data) {
      if (name.endsWith("[]")) {
        for (var value of data[name]) {
          formData.append(name, value);
        }
      } else {
        formData.append(name, data[name]);
      }
    }

    return this.postFormData("businesses/" + this.business.id + "/posts", formData);
  }

  postFormData(action, formData) {
    var headers = {};
    if (this.apiToken) {
      headers['Authorization'] = 'Bearer ' + this.apiToken;
    }
    return fetch(API_URL + action, {
      body: formData, // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: new Headers(headers),
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
    })
    .then(response => response.json()) // parses response to JSON
  }

  postData(action, data) {
    data._method = "POST";
    var payload = this.buildPayload(data);
    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (this.apiToken) {
      headers['Authorization'] = 'Bearer ' + this.apiToken;
    }
    return fetch(API_URL + action, {
      body: payload, // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: new Headers(headers),
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
    })
    .then(response => response.json()) // parses response to JSON
  }

  getData(action, data) {
    data._method = "GET";
    var payload = this.buildPayload(data);
    var headers = {};
    if (this.apiToken && this.apiToken.length > 0) {
      headers['Authorization'] = 'Bearer ' + this.apiToken;
    }
    return fetch(API_URL + action + "?" + payload, {
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: new Headers(headers),
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    })
    .then(response => response.json()) // parses response to JSON
  }

  buildPayload(data) {
    var query = "";
    for (var name in data) {
      if (query.length > 0) {
        query += "&";
      }
      query += encodeURI(name) + "=" + encodeURI(data[name]);
    }
    return query;
  }
}

export default TiqBizAPI;
