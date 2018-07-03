// Pads a number with "0" so it's 2 digits long.
let fw = (x) => (x +  "").padStart(2, "0");

export function today() {
  let d = new Date();
  return d.getFullYear() + "-" + fw(d.getMonth() + 1) + "-" + fw(d.getDate());
}

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function repetitionsForRange(period, startDate, endDate) {
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

export function makeDate(date, time, allDay) {
  return date + " " + (allDay ? "00:00:00" : time);
}

export function makeShortDateTime(d) {
  return makeShortDate(d) + " " + makeShortTime(d);
}

function makeShortTime(d) {
  return fw(d.getHours()) + ":" + fw(d.getMinutes()) + ":" + fw(d.getSeconds());
}

export function makeShortDate(d) {
  return d.getFullYear() + "-" + fw(d.getMonth() + 1) + "-" + fw(d.getDate());
}

export function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 8.64e7);
}
