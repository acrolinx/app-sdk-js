const appSdk = require('./dist/src/index')

function noop() {
}

const dummyWindow = {
  addEventListener: noop,
  parent: {
    postMessage: noop
  }
};

global.window = dummyWindow;

module.exports = {
  require: {
    '@acrolinx/app-sdk': appSdk,
  },
  globals: {
    window: dummyWindow
  }
};
