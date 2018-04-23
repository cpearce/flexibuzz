"use strict";

const API_URL = "https://api.tiqbiz.com/v6/";

class TiqBizAPI {

  login(username, password) {
    this.username = username;
    this.password = password;
    return new Promise(async (resolve, reject) => {
      this.postData("users/login", {
        email: this.username,
        password: this.password,
      })
      .then((json) => this.authenticate(json.token))
      .then(resolve, reject);
    });
  }

  async authenticate(token) {
    this.apiToken = token;
    let response = await this.getData("users/auth", {});
    console.log(response);
    this.business = response.admin_of[0];
  }

  calendar() {
    if (!this.apiToken || !this.business) {
      return Promise.reject("Not logged in");
    }

    let self = this;
    return new Promise(async function(resolve, reject) {
      let extractBoxes = (boxes) => {
        let b = [];
        for (var box of boxes) {
          b.push(box.name);
        }
        return b;
      };

      let response = await self.getData("businesses/" + self.business.id + "/posts", {
        post_type: "calendar", orderBy: "start_date|desc", page: 1, limit: 15,
      });

      let responses = [response];
      for (var page = 2; page <= response.meta.pagination.total_pages; page++) {
        responses.push(await self.getData("businesses/" + self.business.id + "/posts", {
          post_type: "calendar", orderBy: "start_date|desc", page: page, limit: 15,
        }));
      }

      let timeOf = (s) => {
        let r = /(\d\d:\d\d):\d\d/;
        let m = s.match(r);
        if (m.length < 2) {
          // log("Failed to extract time from '" + s + "'");
          return s;
        }
        return m[1];
      };

      let dateOf = (s) => {
        let r = /(\d\d\d\d-\d\d-\d\d)/;
        let m = s.match(r);
        if (m == null || m.length < 2) {
          // log("Failed to extract date from '" + s + "'");
          return s;
        }
        return m[0];
      };

      var posts = [];
      for (var r of responses) {
        for (var post of r.data) {
          posts.push({
            title: post.title,
            startDate: dateOf(post.start_date),
            startTime: timeOf(post.start_date),
            endDate: dateOf(post.end_date),
            endTime: timeOf(post.start_date),
            allDay: post.all_day,
            boxes: extractBoxes(post.boxes),
          });
        }
      }

      resolve(posts);
    });
  }

  boxes() {
    if (!this.apiToken || !this.business) {
      return Promise.reject("Not logged in");
    }
    return this.getData("businesses/" + this.business.id + "/boxes", {limit: 999})
    .then((response) => {
      var boxes = [];
      for (var box of response.data) {
        boxes.push({
          id: box.id,
          name: box.box_name,
          description: box.box_description,
          group: box.box_group,
        });
      }
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
