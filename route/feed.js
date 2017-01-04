const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/feed/home', getConversations);
  router.get('/feed/tendance', getUnreadMessageCount);
  router.get('/feed/subscription', getConversation);
}

function get

module.exports.registerRoute = registerRoute;