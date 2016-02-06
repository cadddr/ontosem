var colors = require('colors');

module.exports = {
  port: 3000,
  richLogging: {
    info: function(message) {
      console.log(message);
    },
    attn: function(message) {
      console.log(message.cyan);
    },
    success: function(message) {
      console.log(message.green);
    },
    error: function(message) {
      console.log(message.red);
    },
    warning: function(message) {
      console.log(message.orange);
    }
  }
};
