const context = require.context('./', false, /\.js$/);
const keys = context.keys().filter(item => item !== './index.js');

const stores = {};
keys.forEach((key) => {
  if (context(key).default) {
    const objKey = context(key).default.namespace || key.substring(2, key.lastIndexOf('.'));
    delete context(key).default.namespace;
    Object.assign(stores, { [objKey]: context(key).default });
  }
});

export default stores;
