function SortMaybeAsInt(array, toKey) {
  array.sort((a, b) => {
    a = (toKey ? toKey(a) : a).split(/\s+/);
    b = (toKey ? toKey(b) : b).split(/\s+/);
    let ai = 0;
    let bi = 0;
    while (ai < a.length && bi < b.length) {
      let aint = parseInt(a[ai], 10);
      let bint = parseInt(b[bi], 10);
      let rv;
      if (!isNaN(aint) && !isNaN(bint)) {
        rv = aint - bint;
      } else {
        rv = a[ai].localeCompare(b[bi]);
      }
      if (rv !== 0) {
        return rv;
      }
      ai++;
      bi++;
    }
    return a.length - b.length;
  });
}

export default SortMaybeAsInt;
