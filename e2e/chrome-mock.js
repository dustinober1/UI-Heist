// Mock Chrome APIs
window.chrome = {
  runtime: {
    listeners: [],
    onMessage: {
      addListener: (callback) => {
        window.chrome.runtime.listeners.push(callback);
      }
    },
    sendMessage: (msg) => {
      console.log('Mock sendMessage:', msg);
    }
  },
  storage: {
    local: {
      data: {},
      set: (obj, callback) => {
        Object.assign(window.chrome.storage.local.data, obj);
        if (callback) callback();
      },
      get: (keys, callback) => {
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach(k => result[k] = window.chrome.storage.local.data[k]);
        }
        callback(result);
      }
    }
  }
};

// Helper to trigger inspection from outside
window.startInspection = () => {
  window.chrome.runtime.listeners.forEach(cb =>
    cb({ action: "toggle_inspect" }, {}, () => {})
  );
};
