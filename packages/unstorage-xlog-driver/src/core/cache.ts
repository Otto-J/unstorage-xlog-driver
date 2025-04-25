const cached = new Map()

function get<T>(key: string) {
  return cached.get(key) as T
}

function set<T>(key: string, value: T) {
  cached.set(key, value)
}

function keys() {
  return cached.keys()
}

function size() {
  return cached.size
}

function remove(key: string) {
  return cached.delete(key)
}

function clear() {
  cached.clear()
}

export default { get, set, keys, size, remove, clear }
