const utils = {
  find: function (arr, callback) {
    for (var elem of Array.from(arr)) {
      if (callback(elem)) {
        return elem
      }
    }
    return undefined
  },

  filter: function (arr, callback) {
    const res = []
    for (var elem of Array.from(arr)) {
      if (callback(elem)) {
        res.push(elem)
      }
    }
    return res
  },

  values: function (obj) {
    if (obj == null) {
      obj = {}
    }
    return Object.keys(obj).map((key) => obj[key])
  },

  clone: function (obj) {
    if (obj == null) {
      obj = {}
    }
    const clone = {}
    for (var key in obj) {
      var val = obj[key]
      clone[key] = val
    }
    return clone
  },

  any: (arr, callback) => utils.find(arr, callback) != null,

  // stolen from https://github.com/kriskowal/q
  isPromise: (obj) =>
    obj === Object(obj) && typeof obj.promiseDispatch === 'function' && typeof obj.inspect === 'function',
}

export default utils
