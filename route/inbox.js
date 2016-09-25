const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/inbox', getInbox);
  router.get('/inbox/conversation/:id', getConversation);
  router.get('/inbox/conversation/:conv_id/message/:id', getMessage);

  router.post('/inbox/conversation/new', createNewConversation);
  router.post('/inbox/conversation/:id/message', sendNewMessage);
  router.post('/inbox/conversation/:conv_id/message/:id/read', readMessage);
}

function getInbox (req, res, next) {
  common.conversationModel.getByUser(req.user, function (err, fConversations) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fConversations);
    }
  });
}

function getConversation (req, res, next) {
  common.conversationModel.getByIdAndUser(req.params.id, req.user, function (err, fConversation) {
    if (err) {
      next(err);
    } else if (fConversation == null) {
      httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
    } else {
      httpHelper.sendReply(res, 200, fConversation);
    }
  });
}

function getMessage (req, res, next) {
  common.conversationModel.getByIdAndUser(req.params.conv_id, req.user, function (err, fConversation) {
    if (err) {
      next(err);
    } else if (fConversation == null) {
      httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
    } else {
      common.messageModel.getByConversationAndId(req.params.conv_id, req.params.id, function (err, fMessage) {
        if (err) {
          next(err);
        } else if (fMessage) {
          httpHelper.sendReply(res, httpHelper.error.messageNotFound());
        } else {
          httpHelper.sendReply(res, 200, fMessage);
        }
      });
    }
  });
}

function createNewConversation (req, res, next) {
  if (req.body.object === undefined || req.body.members === undefined || Array.isArray(req.body.members) === false ||
      req.body.content === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.conversationModel.sendNewMessage(req.body.object, req.body.members, true, req.user, req.body.content, function (err, cConversation, cMessage) {
      if (err) {
        httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
      } else {
        httpHelper.sendReply(res, 201, cConversation);
      }
    });
  }
}

function sendNewMessage (req, res, next) {
  if (req.body.content === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.conversationModel.getByIdAndUser(req.params.id, req.user, function (err, fConversation) {
      if (err) {
        next(err);
      } else if (fConversation == null) {
        httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
      } else if (fConversation.canAnswer === false) {
        httpHelper.sendReply(res, httpHelper.error.cannotReply());
      } else {
        fConversation.sendNewMessage(req.user, req.body.content, function (err, cMessage) {
          if (err) {
            next(err);
          } else {
            httpHelper.sendReply(res, 201, cMessage);
          }
        });
      }
    });
  }
}

function readMessage (req, res, next) {
  if (req.body.read === undefined && typeof (req.body.read) !== 'boolean') {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.conversationModel.getByIdAndUser(req.params.conv_id, req.user, function (err, fConversation) {
      if (err) {
        next(err);
      } else if (fConversation == null) {
        httpHelper.sendReply(res, httpHelper.error.conversationNotFound());
      } else {
        common.messageModel.getByUserMessage(req.user, req.params.id, function (err, fMsg) {
          if (err) {
            next(err);
          } else if (fMsg == null) {
            httpHelper.sendReply(res, httpHelper.error.messageNotFound());
          } else {
            common.messageReadModel.updateRead(req.user, req.params.id, req.body.read, function (err) {
              if (err) {
                next(err);
              } else {
                httpHelper.sendReply(res, 201, { result: 'ok' });
              }
            });
          }
        });
      }
    });
  }
}

module.exports.registerRoute = registerRoute;
