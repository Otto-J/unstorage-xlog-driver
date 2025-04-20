const cached = new Map();

function get(key: string) {
  return cached.get(key);
}

function set(key: string, value: any) {
  cached.set(key, value);
}

function keys() {
  return cached.keys();
}

function size() {
  return cached.size;
}

function remove(key: string) {
  return cached.delete(key);
}

function clear() {
  cached.clear();
}

export default { get, set, keys, size, remove, clear };
