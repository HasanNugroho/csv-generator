// Normalize array of objects by ensuring all objects have the same keys.
// It will traverse nested objects and add any missing keys with a `null` value.
export function normalizeData(dataArray: any[]): any[] {
  // return as data if the type not array and []
  if (!Array.isArray(dataArray) || dataArray.length === 0) return dataArray;

  // Collect all nested keys as path string
  const allKeys = new Set();
  const collectKeys = (obj, prefix = '') => {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (
        obj[key] &&
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key])
      ) {
        collectKeys(obj[key], fullKey);
      } else {
        allKeys.add(fullKey);
      }
    }
  };
  dataArray.forEach((o) => collectKeys(o));

  // Create complemented array
  const complementedArray = dataArray.map((obj) => {
    // Make cloning of array data
    const clonedObj = JSON.parse(JSON.stringify(obj));

    // Add missing keys with null values
    allKeys.forEach((key) => {
      if (!read(clonedObj, key)) {
        write(clonedObj, key, null);
      }
      return;
    });

    return clonedObj;
  });
  return complementedArray;
}

// read existing data
function read(obj, path): boolean {
  const keys = path.split('.');
  let cur = obj;
  for (let p of keys) {
    if (cur === null || typeof cur !== 'object' || !(p in cur)) {
      return false;
    }
    cur = cur[p];
  }
  return true;
}

// write value to a nested path in an object
// If the path doesn't exist, it will create the necessary nested objects.
function write(obj, path, value): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || current[keys[i]] === null) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  const lastKey = keys[keys.length - 1];
  if (!(lastKey in current)) {
    current[lastKey] = value;
  }
}
