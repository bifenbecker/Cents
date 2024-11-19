class LocalStorageMock {
  constructor() {
    this.__store__ = {};
  }

  getItem(key) {
    return this.__store__[key];
  }

  setItem(key, value = "") {
    this.__store__[key] = value + "";
  }

  removeItem(key) {
    delete this.__store__[key];
  }

  clear() {
    this.__store__ = {};
  }
}

export default LocalStorageMock;
