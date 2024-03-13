// classes
class Bencode {
  // private methods
  static #decodeDictionary(s, start) {
    if (s.length <= start || s[start] !== "d") throw Error("Not a dictionary")
    let answer = {}
    const n = s.length
    let key,
      i = start + 1
    while (i < n) {
      if (s[i] === "e") return { nextPos: i + 1, val: answer }
      if (!key && ["i", "d", "l"].includes(s[i]))
        throw Error("Key of dictionary must be a string")
      const ans = Bencode.#decode(s, i)
      if (key) {
        answer[key] = ans.val
        key = undefined
      } else key = ans.val
      i = ans.nextPos
    }
    throw Error("Wrong dictionary format")
  }

  static #decodeList(s, startPos) {
    const n = s.length
    if (n <= startPos || s[startPos] !== "l") throw Error("Not a list")
    const list = []
    let i = startPos + 1
    while (i < n) {
      if (s[i] === "e") return { nextPos: i + 1, val: list }
      const ans = Bencode.#decode(s, i)
      list.push(ans.val)
      i = ans.nextPos
    }
    throw Error("Wrong list format")
  }

  static #decodeNumber(s, startPos) {
    const n = s.length
    if (n <= startPos || s[startPos] !== "i") throw Error("Not an integer")
    let val = 0,
      i = startPos + 1,
      sign = 1
    if (i >= n) throw Error("Wrong integer format")
    if (s[i] == "-") {
      sign = -1
      i += 1
    }
    while (i < n) {
      if (s[i] === "e") return { nextPos: i + 1, val: val * sign }
      if (s[i] < "0" || s[i] > "9") throw Error("Wrong integer format")
      val = val * 10 + parseInt(s[i])
      i += 1
    }
    throw Error("Wrong integer format")
  }

  static #decodeString(s, startPos) {
    const n = s.length
    if (n <= startPos || s[startPos] < "0" || s[startPos] > "9")
      throw Error("Not a string")
    let i = startPos,
      len = 0
    while (i < n && s[i] >= "0" && s[i] <= "9") {
      len = len * 10 + parseInt(s[i])
      i += 1
    }
    if (n <= i + len + 1 || s[i] !== ":") throw Error("Wrong string format")
    return { nextPos: i + len + 1, val: s.substring(i + 1, i + len + 1) }
  }

  static #decode(s, startPos) {
    switch (s[startPos]) {
      case "d":
        return Bencode.#decodeDictionary(s, startPos)
      case "i":
        return Bencode.#decodeNumber(s, startPos)
      case "l":
        return Bencode.#decodeList(s, startPos)
      default:
        if (s[startPos] >= "0" && s[startPos] <= "9")
          return Bencode.#decodeString(s, startPos)
        throw Error("Unknown type")
    }
  }

  static #encodeDictionary(d) {
    const keys = Object.keys(d)
    if (!keys.every((key) => typeof key === "string"))
      throw new Error("Dictionary keys must be strings")
    keys.sort()
    return `d${keys
      .map((key) => `${Bencode.encode(key)}${Bencode.encode(d[key])}`)
      .join("")}e`
  }

  static #encodeList(l) {
    return `l${l.map((item) => Bencode.encode(item)).join("")}e`
  }

  static #encodeNumber(n) {
    return `i${n}e`
  }

  static #encodeString(s) {
    return `${s.length}:${s}`
  }

  // public methods
  static decode(s) {
    return Bencode.#decode(s, 0).val
  }

  static encode(obj) {
    switch (typeof obj) {
      case "object":
        if (Array.isArray(obj)) return Bencode.#encodeList(obj)
        else return Bencode.#encodeDictionary(obj)
      case "number":
        return Bencode.#encodeNumber(obj)
      case "string":
        return Bencode.#encodeString(obj)
      default:
        throw new Error("Unknown type")
    }
  }
}
// eslint-disable-next-line no-unused-vars
class Torrent {
  static encode(obj) {
    return Bencode.encode(obj);
  }
  static decode(s) {
    if (s[0] !== "d" || s[s.length - 1] !== "e")
      throw new Error(
        "Wrong torrent format. A torrent file must be a dictionary."
      );
    return Bencode.decode(s);
  }
}
// for unit test
// Conditionally export for unit testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Torrent, Bencode
  }
}
